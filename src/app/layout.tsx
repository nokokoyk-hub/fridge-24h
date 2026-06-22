import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const notoSerif = Noto_Serif_JP({ variable: "--font-noto-serif-jp", subsets: ["latin"], weight: ["700", "800"] });

export const metadata: Metadata = {
  title: "冷蔵庫24時｜食材監視システム",
  description: "冷蔵庫の中身を重厚なドキュメンタリー調で報告する、ちょっと大げさで実用的な食材管理アプリ。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} ${notoSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
