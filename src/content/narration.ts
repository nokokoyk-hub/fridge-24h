import { daysUntil, getUrgency, toLocalDateKey } from "@/lib/inventory";
import type { FoodItem } from "@/types/food";

type LineFactory = (context: NarrationContext) => string;

type NarrationContext = {
  count: number;
  target: string;
  names: string;
  daysOver: number;
};

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(choices: readonly T[], seed: string, part: string) {
  return choices[hashText(`${seed}:${part}`) % choices.length];
}

function run(factory: LineFactory, context: NarrationContext) {
  return factory(context);
}

function summarizeNames(items: FoodItem[]) {
  const visible = items.slice(0, 3).map((item) => item.name).join("、");
  const remaining = items.length - 3;
  return remaining > 0 ? `${visible}、ほか${remaining}品` : visible;
}

const openings: LineFactory[] = [
  ({ count }) => `冷蔵庫内、全${count}品を確認。監視班は、期限の迫る食材を追っている。`,
  ({ count }) => `午前の庫内巡回。捜査員は、棚に潜む全${count}品の動向を追った。`,
  ({ count }) => `扉の向こうで、全${count}品がその時を待っている。期限監視班による一斉確認が始まった。`,
  ({ count }) => `冷気に包まれた現場。確認された食材は全${count}品。捜査班は、ひとつの異変も見逃さない。`,
  ({ count }) => `庫内温度、異常なし。収容された全${count}品について、定例の身元確認が始まった。`,
  ({ count }) => `静かなキッチンに、扉の開く音が響く。現場にいたのは全${count}品。捜査員が記録を照合する。`,
  ({ count }) => `本部からの指令を受け、冷蔵庫監視班が出動。全${count}品の期限を一斉に洗い出す。`,
  ({ count }) => `白い扉の奥、低温区域。ここで暮らす全${count}品に、避けられない確認の時が来た。`,
  ({ count }) => `冷蔵庫前に捜査員が集結した。対象は全${count}品。今夜の食卓を左右する巡回が始まる。`,
  ({ count }) => `何気ない日常。その裏で、全${count}品の期限は刻一刻と動いている。監視班は現場へ急行した。`,
  ({ count }) => `扉が開く。灯りがともる。そこに並ぶ全${count}品を前に、捜査員の目つきが変わった。`,
  ({ count }) => `冷蔵庫という名の密室。全${count}品の食材を対象に、期限の聞き込み調査が行われた。`,
];

const emptyReports: LineFactory[] = [
  () => "午前零時。冷蔵庫内に、食材の姿はない。静寂だけが、この場所を支配している。捜査員は補充の時を待つ。",
  () => "監視カメラが捉えたのは、空の棚だった。食材、ゼロ。捜査班は買い出しという名の増援を要請した。",
  () => "冷蔵庫を開けた捜査員に、衝撃が走る。何もない。あるのは冷気と、わずかな希望だけだった。",
  () => "庫内をくまなく捜索。しかし、食材の手掛かりは見つからない。事件は、買い物リストへと引き継がれた。",
  () => "現場は、もぬけの殻だった。昨夜までいたはずの食材たちは、すでに食卓へ移送されたとみられる。",
  () => "棚、ゼロ。野菜室、ゼロ。捜査員は二度見した。だが結果は変わらない。買い出し待ったなし。",
  () => "冷蔵庫内に生命反応なし。残されたのは、いつ買ったか分からない調味料への疑念だけだった。",
  () => "空っぽである。実に見事な空っぽである。捜査班は、この潔さを前に言葉を失った。",
  () => "食材の在庫を確認できず。献立本部は緊急会議を招集。議題は、外食か、買い出しか。",
  () => "扉を開けても、何も起きない。なぜなら何もないからだ。捜査員は静かに扉を閉じた。",
  () => "庫内の平和は保たれている。保たれすぎている。食べるものまで、きれいに消えていた。",
  () => "捜査開始から三秒。対象なし。異例の早さで現場検証は終了し、班はスーパーへ向かった。",
];

const expiredReports: LineFactory[] = [
  ({ target }) => `その時、事態が動いた。${target}、期限超過を確認。現物の状態を確認し、安全を最優先に処分を判断せよ。`,
  ({ target }) => `捜査線上に浮かんだのは${target}。すでに期限を越えている。無理な救出は禁物だ。慎重な現物確認が求められる。`,
  ({ target }) => `緊急事案発生。${target}が期限の境界線を突破した。食べられるという思い込みを捨て、安全第一で判断せよ。`,
  ({ target }) => `赤信号が灯った。対象は${target}。期限超過。捜査員は、においと状態の確認に入る。`,
  ({ target, daysOver }) => `${target}に異変。期限から${daysOver}日が経過している。捜査班は、安易な味見を固く禁じた。`,
  ({ target }) => `容疑者、${target}。期限超過の疑いで、ただちに現物確認へ。冷蔵庫内に緊張が走る。`,
  ({ target }) => `見過ごされていた${target}を発見。期限はすでに過去。ここから先は、勇気ではなく慎重さが必要だ。`,
  ({ target }) => `捜査員の手が止まった。${target}、期限超過。この局面で「たぶん大丈夫」は通用しない。`,
  ({ target }) => `低温区域の奥で、${target}が静かに時を越えていた。安全確認なくして、食卓への復帰はない。`,
  ({ target }) => `期限管理網をすり抜けた${target}。だが逃走はここまで。捜査班がついに、その存在を捉えた。`,
  ({ target }) => `現場から期限超過の${target}を確認。もったいない気持ちと食品安全。捜査員は重い判断を迫られる。`,
  ({ target, daysOver }) => `${target}、期限を${daysOver}日超過。時計の針は戻せない。状態を確かめ、安全側に判断せよ。`,
];

const todayReports: LineFactory[] = [
  ({ target }) => `本日、最重要対象として浮上したのは${target}。猶予は、もうない。今夜の一品に加えられるのか。判断の時が迫る。`,
  ({ target }) => `最前線に立つのは${target}。期限は今日。夕食への投入が、運命を分けることになる。`,
  ({ target }) => `捜査班に緊張が走る。${target}に残された時間は、本日限り。献立本部の決断が待たれる。`,
  ({ target }) => `時計の針は止まらない。${target}、本日が期限。冷蔵庫から食卓へ、今こそ移送の時だ。`,
  ({ target }) => `${target}にタイムリミットが迫る。今日使うのか。それとも見送るのか。決断できるのは、あなたしかいない。`,
  ({ target }) => `今日という日を待っていた${target}。期限最終日。捜査班は、華麗な献立入りを願っている。`,
  ({ target }) => `本日の重要参考食材、${target}。残り時間は一日を切った。フライパン部隊の出動が望まれる。`,
  ({ target }) => `午前、${target}の期限が本日であることが判明。夕食会議は、一気に緊迫した。`,
  ({ target }) => `食卓への最終便が出ようとしている。乗車を待つのは${target}。出発時刻は、今夜だ。`,
  ({ target }) => `${target}、本日が期限。捜査員はレシピ検索班に応援を要請した。現場は慌ただしさを増している。`,
  ({ target }) => `運命の日を迎えた${target}。ここまで保管され続けた食材の、最後の一日に密着する。`,
  ({ target }) => `期限当日。対象、${target}。今夜の献立に空きがあるとの情報を受け、捜査班が調整に入った。`,
];

const soonReports: LineFactory[] = [
  ({ names }) => `要注意対象は${names}。残された時間はわずか。献立への早期投入が望まれる。`,
  ({ names }) => `捜査網に反応あり。${names}の期限が接近している。計画的な消費が、食品ロスを防ぐ鍵となる。`,
  ({ names }) => `監視対象、${names}。今すぐではない。だが、油断できる時間も長くはない。`,
  ({ names }) => `静かに迫る期限。${names}が要注意区域へ入った。捜査班は、次の献立への編入を提案する。`,
  ({ names }) => `黄色信号を確認。${names}が期限三日前の検問を通過した。早めの身柄確保が望ましい。`,
  ({ names }) => `捜査本部のボードに、${names}の名が並ぶ。期限接近。献立担当者は動き始めた。`,
  ({ names }) => `冷蔵庫の奥から届いた小さなサイン。${names}の残り時間が、少しずつ減っている。`,
  ({ names }) => `まだ間に合う。だが先延ばしは危険だ。${names}を使うレシピの捜索が急がれる。`,
  ({ names }) => `要注意区域に入った${names}。今夜か、明日か。捜査班は早期の出番を求めている。`,
  ({ names }) => `期限の足音が聞こえる。対象は${names}。食品ロス対策班が、静かに包囲網を狭める。`,
  ({ names }) => `${names}に動きあり。期限まで、あとわずか。献立への緊急出演が検討されている。`,
  ({ names }) => `捜査員がマークしたのは${names}。まだ安全圏内だが、のんびり構えてはいられない。`,
];

const safeReports: LineFactory[] = [
  () => "現時点で、期限切迫の兆候なし。冷蔵庫内の秩序は保たれている。しかし、監視に終わりはない。",
  () => "異常なし。すべての食材は安全圏を維持している。捜査班は静かに次の巡回へ備える。",
  () => "期限接近を示す反応はない。平穏な庫内。しかし捜査員は知っている。この平和が永遠ではないことを。",
  () => "本日の緊急対象、ゼロ。完璧な管理が、冷蔵庫の秩序を守った。だが扉の向こうで、時間は動き続けている。",
  () => "監視班から異常なしの報告。食材たちは今日も、定められた棚で静かに待機している。",
  () => "期限の乱れは確認されなかった。冷蔵庫内、平和そのもの。捜査員は誇らしげに扉を閉めた。",
  () => "全対象、安全圏。出動要請はない。だが捜査班は、明日の変化を見逃さない。",
  () => "特記事項なし。この言葉ほど頼もしいものはない。冷蔵庫の治安は、今日も守られた。",
  () => "事件は起きなかった。それこそが、日々の管理が生んだ最大の成果なのである。",
  () => "期限監視レーダーに反応なし。食材たちは余裕の表情で、それぞれの持ち場を守っている。",
  () => "庫内は極めて安定。献立本部には、選ぶ時間がまだ残されている。",
  () => "すべて順調。捜査員は何もせずに済むという、最も望ましい任務を完遂した。",
];

const signOffs: LineFactory[] = [
  () => "冷蔵庫の平和を守るため、監視は続く。",
  () => "次に扉が開く、その瞬間まで。",
  () => "食材の運命は、今夜の献立に託された。",
  () => "現場からは以上である。",
  () => "捜査班は、引き続き動向を注視する。",
  () => "小さな確認が、大きな食品ロスを防ぐ。",
  () => "冷気の向こうで、時間だけが静かに進んでいる。",
  () => "そして捜査は、明日へ続く。",
];

export function buildNarration(items: FoodItem[], variation = 0) {
  const seed = `${toLocalDateKey()}:${items.map((item) => item.id).join(":")}:${variation}`;
  const sorted = [...items].sort((a, b) => daysUntil(a.expiresOn) - daysUntil(b.expiresOn));
  const targetItem = sorted[0];
  const context: NarrationContext = {
    count: items.length,
    target: targetItem?.name ?? "対象食材",
    names: "",
    daysOver: targetItem ? Math.abs(daysUntil(targetItem.expiresOn)) : 0,
  };

  if (items.length === 0) {
    return run(pick(emptyReports, seed, "empty"), context);
  }

  const expired = sorted.filter((item) => getUrgency(item) === "expired");
  const today = sorted.filter((item) => getUrgency(item) === "today");
  const soon = sorted.filter((item) => getUrgency(item) === "soon");
  const opening = run(pick(openings, seed, "opening"), context);
  const signOff = run(pick(signOffs, seed, "sign-off"), context);

  if (expired.length > 0) {
    const expiredContext = {
      ...context,
      target: expired[0].name,
      daysOver: Math.abs(daysUntil(expired[0].expiresOn)),
    };
    return `${opening} ${run(pick(expiredReports, seed, "expired"), expiredContext)} ${signOff}`;
  }
  if (today.length > 0) {
    return `${opening} ${run(pick(todayReports, seed, "today"), { ...context, target: today[0].name })} ${signOff}`;
  }
  if (soon.length > 0) {
    return `${opening} ${run(pick(soonReports, seed, "soon"), { ...context, names: summarizeNames(soon) })} ${signOff}`;
  }
  return `${opening} ${run(pick(safeReports, seed, "safe"), context)} ${signOff}`;
}
