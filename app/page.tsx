import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, TreePine } from "lucide-react";
import "./home.css";

export const metadata: Metadata = {
  title: "XYHSL · 小小收藏夹",
  description: "两份小小的心意，等你亲手打开。",
};

export default function Home() {
  return (
    <main className="home-page">
      <header className="home-header">
        <span className="home-brand"><span aria-hidden="true">∞</span>小小收藏夹</span>
        <span className="home-header-note">把心意，好好收着</span>
      </header>

      <section className="home-content" aria-labelledby="home-title">
        <p className="home-eyebrow">留一点温柔在这里</p>
        <h1 id="home-title">把美好，<br />轻轻收藏。</h1>
        <p className="home-intro">两份小小的心意，等你亲手打开。</p>

        <nav className="home-entries" aria-label="选择一份心意">
          <Link href="/1000" className="home-entry">
            <span className="home-stamp" aria-hidden="true"><Mail size={36} strokeWidth={1.2} /></span>
            <h2>1000天情书</h2>
            <p>一封慢慢读的信。</p>
            <span className="home-entry-action">打开情书<ArrowUpRight size={20} aria-hidden="true" /></span>
          </Link>
          <Link href="/christmas" className="home-entry">
            <span className="home-stamp" aria-hidden="true"><TreePine size={38} strokeWidth={1.2} /></span>
            <h2>圣诞树</h2>
            <p>一棵亮着灯的树。</p>
            <span className="home-entry-action">看看圣诞树<ArrowUpRight size={20} aria-hidden="true" /></span>
          </Link>
        </nav>
      </section>

      <footer className="home-footer">每一份心意，都值得被珍藏。</footer>
    </main>
  );
}
