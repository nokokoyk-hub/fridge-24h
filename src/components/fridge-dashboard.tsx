"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { buildNarration } from "@/content/narration";
import {
  createDemoItems,
  daysUntil,
  getUrgency,
  toLocalDateKey,
  urgencyLabel,
} from "@/lib/inventory";
import { CATEGORIES, type Category, type FoodItem, type Urgency } from "@/types/food";
import styles from "./fridge-dashboard.module.css";
import { TypewriterText } from "./typewriter-text";
import { AdBanner } from "./ad-banner";

const STORAGE_KEY = "fridge-24h.inventory.v1";
const VOICE_PREF_KEY = "fridge-24h.voice.v1";
const DEEP_VOICE_NAMES = /ichiro|keita|daichi|naoki|takumi|masaru|hattori|otoya|kyotaro|male|男性/i;
const FILTERS: Array<{ value: "all" | Urgency; label: string }> = [
  { value: "all", label: "全品" },
  { value: "expired", label: "期限超過" },
  { value: "today", label: "本日" },
  { value: "soon", label: "要注意" },
  { value: "safe", label: "安全圏" },
];

function categoryIcon(category: Category) {
  const icons: Record<Category, string> = {
    野菜: "葉",
    "肉・魚": "鮮",
    乳製品: "乳",
    卵: "卵",
    飲み物: "飲",
    作り置き: "備",
    その他: "食",
  };
  return icons[category];
}

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function preferredJapaneseVoice(voices: SpeechSynthesisVoice[]) {
  const japaneseVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("ja"));
  return japaneseVoices.find((voice) => DEEP_VOICE_NAMES.test(voice.name))
    ?? japaneseVoices.find((voice) => voice.default)
    ?? japaneseVoices[0];
}

export function FridgeDashboard() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<"all" | Urgency>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [reportVersion, setReportVersion] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("auto");
  const [deepVoice, setDeepVoice] = useState(true);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("野菜");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("個");
  const [expiresOn, setExpiresOn] = useState(toLocalDateKey());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        setItems(saved ? (JSON.parse(saved) as FoodItem[]) : createDemoItems());
        const savedVoice = window.localStorage.getItem(VOICE_PREF_KEY);
        if (savedVoice) {
          const preference = JSON.parse(savedVoice) as { voiceURI?: string; deepVoice?: boolean };
          setVoiceURI(preference.voiceURI ?? "auto");
          setDeepVoice(preference.deepVoice ?? true);
        }
        setReportVersion(crypto.getRandomValues(new Uint32Array(1))[0]);
      } catch {
        setItems(createDemoItems());
      } finally {
        setReady(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem(VOICE_PREF_KEY, JSON.stringify({ voiceURI, deepVoice }));
    }
  }, [deepVoice, ready, voiceURI]);

  useEffect(() => {
    const synthesizer = window.speechSynthesis;
    const loadVoices = () => {
      setVoices(
        synthesizer.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("ja")),
      );
    };
    const timer = window.setTimeout(loadVoices, 0);
    synthesizer.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.clearTimeout(timer);
      synthesizer.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const counts = useMemo(
    () => ({
      total: items.length,
      danger: items.filter((item) => ["expired", "today"].includes(getUrgency(item))).length,
      soon: items.filter((item) => getUrgency(item) === "soon").length,
      safe: items.filter((item) => getUrgency(item) === "safe").length,
    }),
    [items],
  );

  const visibleItems = useMemo(
    () =>
      [...items]
        .filter((item) => filter === "all" || getUrgency(item) === filter)
        .sort((a, b) => daysUntil(a.expiresOn) - daysUntil(b.expiresOn)),
    [filter, items],
  );

  const narration = useMemo(() => buildNarration(items, reportVersion), [items, reportVersion]);

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const parsedQuantity = Number(quantity);
    if (!cleanName || !expiresOn || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) return;

    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: cleanName.slice(0, 40),
        category,
        quantity: parsedQuantity,
        unit: unit.trim().slice(0, 8) || "個",
        expiresOn,
        addedAt: new Date().toISOString(),
      },
    ]);
    setName("");
    setQuantity("1");
    setFormOpen(false);
    setReportVersion((current) => current + 1);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    setReportVersion((current) => current + 1);
  }

  function refreshReport() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setReportVersion((current) => current + 1);
  }

  function speakReport() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(narration);
    const availableVoices = window.speechSynthesis.getVoices();
    const selectedVoice = voiceURI === "auto"
      ? preferredJapaneseVoice(availableVoices)
      : availableVoices.find((voice) => voice.voiceURI === voiceURI)
        ?? preferredJapaneseVoice(availableVoices);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = "ja-JP";
    utterance.rate = deepVoice ? 0.74 : 0.9;
    utterance.pitch = deepVoice ? 0.52 : 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stopReport() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <main className={styles.shell}>
      <div className={styles.scanline} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>24</span>
          <div>
            <p className={styles.kicker}>REFRIGERATOR SURVEILLANCE</p>
            <h1>冷蔵庫<span>24時</span></h1>
          </div>
        </div>
        <div className={styles.live}><span />監視中</div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroTopline}>
          <span>本日の捜査報告</span>
          <time suppressHydrationWarning>{new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(new Date())}</time>
        </div>
        <blockquote aria-live="polite">
          <TypewriterText
            text={ready ? narration : "冷蔵庫内の状況を確認中……"}
            animate={ready}
          />
        </blockquote>
        <div className={styles.reportActions}>
          <button type="button" onClick={speaking ? stopReport : speakReport} className={styles.playButton}>
            <span aria-hidden="true">{speaking ? "■" : "▶"}</span>
            {speaking ? "報告を停止" : "音声で報告"}
          </button>
          <button type="button" onClick={refreshReport} className={styles.refreshButton} disabled={!ready}>
            <span aria-hidden="true">↻</span>別の報告
          </button>
          <div className={styles.voiceControls}>
            <label>
              <span>ナレーター</span>
              <select
                value={voiceURI}
                onChange={(event) => {
                  stopReport();
                  setVoiceURI(event.target.value);
                }}
                aria-label="ナレーター音声"
              >
                <option value="auto">自動（低音候補を優先）</option>
                {voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name}{voice.default ? "（既定）" : ""}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={`${styles.deepVoiceButton} ${deepVoice ? styles.deepVoiceActive : ""}`}
              onClick={() => {
                stopReport();
                setDeepVoice((current) => !current);
              }}
              aria-pressed={deepVoice}
            >
              重低音 {deepVoice ? "ON" : "OFF"}
            </button>
          </div>
          <span className={styles.reportNote}>利用できる声は端末・ブラウザで異なります</span>
        </div>
      </section>

      <AdBanner />

      <section className={styles.stats} aria-label="在庫概況">
        <div><span>確認総数</span><strong>{counts.total}</strong><small>品</small></div>
        <div className={counts.danger > 0 ? styles.statDanger : ""}><span>緊急対象</span><strong>{counts.danger}</strong><small>品</small></div>
        <div><span>要注意</span><strong>{counts.soon}</strong><small>品</small></div>
        <div><span>安全圏</span><strong>{counts.safe}</strong><small>品</small></div>
      </section>

      <section className={styles.inventory}>
        <div className={styles.sectionHeading}>
          <div>
            <p>CASE FILES</p>
            <h2>庫内リスト</h2>
          </div>
          <button type="button" className={styles.addButton} onClick={() => setFormOpen((open) => !open)}>
            <span>＋</span>{formOpen ? "閉じる" : "食材を登録"}
          </button>
        </div>

        {formOpen && (
          <form className={styles.form} onSubmit={addItem}>
            <label className={styles.wide}>食材名<input autoFocus required maxLength={40} value={name} onChange={(event) => setName(event.target.value)} placeholder="例：鶏もも肉" /></label>
            <label>分類<select value={category} onChange={(event) => setCategory(event.target.value as Category)}>{CATEGORIES.map((option) => <option key={option}>{option}</option>)}</select></label>
            <label>数量<input required min="0.1" step="0.1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
            <label>単位<input required maxLength={8} value={unit} onChange={(event) => setUnit(event.target.value)} /></label>
            <label>期限<input required type="date" value={expiresOn} onChange={(event) => setExpiresOn(event.target.value)} /></label>
            <button type="submit">登録を確定</button>
          </form>
        )}

        <div className={styles.filters} role="group" aria-label="期限で絞り込む">
          {FILTERS.map((option) => (
            <button key={option.value} type="button" className={filter === option.value ? styles.activeFilter : ""} onClick={() => setFilter(option.value)}>
              {option.label}
            </button>
          ))}
        </div>

        <div className={styles.list} aria-live="polite">
          {!ready ? (
            <div className={styles.empty}>庫内を捜索しています……</div>
          ) : visibleItems.length === 0 ? (
            <div className={styles.empty}>該当する食材は確認されなかった。</div>
          ) : visibleItems.map((item) => {
            const urgency = getUrgency(item);
            return (
              <article key={item.id} className={`${styles.card} ${styles[urgency]}`}>
                <div className={styles.categoryIcon}>{categoryIcon(item.category)}</div>
                <div className={styles.foodMain}>
                  <div className={styles.foodTitle}><h3>{item.name}</h3><span>{item.category}</span></div>
                  <p>{item.quantity}{item.unit}を確認</p>
                </div>
                <div className={styles.deadline}>
                  <span>{formatDate(item.expiresOn)}</span>
                  <strong>{urgencyLabel(item)}</strong>
                </div>
                <button type="button" className={styles.consumeButton} onClick={() => removeItem(item.id)} aria-label={`${item.name}を消費済みにする`}>
                  消費済み
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>FRIDGE-24H / LOCAL SURVEILLANCE SYSTEM</p>
        <span>期限表示は目安です。におい・見た目・保存状況を確認し、食品安全を優先してください。</span>
      </footer>
    </main>
  );
}
