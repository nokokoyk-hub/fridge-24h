"use client";

import { useEffect, useState } from "react";
import styles from "./typewriter-text.module.css";

type TypewriterTextProps = {
  text: string;
  animate?: boolean;
};

const CHARACTER_INTERVAL_MS = 24;

export function TypewriterText({ text, animate = true }: TypewriterTextProps) {
  const report = `「${text}」`;
  const [visibleText, setVisibleText] = useState(() => animate ? "" : report);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!animate || reduceMotion) {
      const showAllTimer = window.setTimeout(() => setVisibleText(report), 0);
      return () => window.clearTimeout(showAllTimer);
    }

    const characters = Array.from(report);
    let visibleCount = 0;
    let timer = 0;

    const showNextCharacter = () => {
      visibleCount += 1;
      setVisibleText(characters.slice(0, visibleCount).join(""));

      if (visibleCount < characters.length) {
        timer = window.setTimeout(showNextCharacter, CHARACTER_INTERVAL_MS);
      }
    };

    const resetTimer = window.setTimeout(() => {
      setVisibleText("");
      timer = window.setTimeout(showNextCharacter, CHARACTER_INTERVAL_MS);
    }, 0);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(timer);
    };
  }, [animate, report]);

  return (
    <span className={styles.typewriter}>
      <span className={styles.screenReaderText}>{report}</span>
      <span className={styles.visualText} aria-hidden="true">
        {visibleText}
        {animate && <span className={styles.cursor} />}
      </span>
    </span>
  );
}
