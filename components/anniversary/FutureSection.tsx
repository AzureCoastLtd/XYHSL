"use client";

import Link from "next/link";
import { ArrowUpRight, Gem, Heart, House, Plane, RotateCcw } from "lucide-react";
import type { FutureEntry } from "./data";
import "./future.css";

const wishIcons = {
  "next-trip": Plane,
  "our-place": House,
  proposal: Gem,
  someday: Heart,
};

export default function FutureSection({ reducedMotion, entries }: { reducedMotion: boolean; entries: FutureEntry[] }) {
  return (
    <section id="future" className="ann-future-section" aria-labelledby="ann-future-title">
      <div className="ann-future-inner">
        <header className="ann-future-heading">
          <div>
            <p className="ann-future-label">留给以后的信 <span>LETTERS TO OUR FUTURE</span></p>
            <h2 id="ann-future-title">下一页，<br />留给我们。</h2>
          </div>
          <div className="ann-future-preface">
            <span className="ann-future-unwritten" aria-hidden="true" />
            <p>这些还没有发生，所以先留白。<br />不急着写下日期，想慢慢和你一起实现。</p>
          </div>
        </header>

        <ol className="ann-future-wishes" aria-label="还没有发生的四个愿望">
          {entries.map((entry) => {
            const WishIcon = wishIcons[entry.id as keyof typeof wishIcons] ?? Heart;

            return (
              <li className="ann-future-wish" key={entry.id}>
                <article className="ann-wish-envelope" aria-labelledby={`wish-${entry.id}`}>
                  <div className="ann-wish-letter">
                    <div className="ann-wish-letter-top">
                      <span className="ann-wish-index">{entry.index} <span>/ 尚未发生</span></span>
                      <span className="ann-wish-illustration" aria-hidden="true">
                        <WishIcon size={42} strokeWidth={1.1} />
                      </span>
                    </div>
                    <h3 id={`wish-${entry.id}`}>{entry.title}</h3>
                    <p>{entry.description}</p>
                  </div>
                  <div className="ann-wish-pocket" aria-hidden="true">
                    <span>写给未来的我们</span>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        <footer className="ann-future-closing">
          <span className="ann-ending-thread" aria-hidden="true" />
          <p className="ann-ending-address">宝宝，</p>
          <h3>下一页，还想和你一起。</h3>
          <p className="ann-ending-postscript">把今天收好，也把以后留给我们。</p>
          <div className="ann-ending-actions">
            <button
              type="button"
              className="ann-ending-replay"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })
              }
            >
              <RotateCcw size={15} strokeWidth={1.5} aria-hidden="true" />
              再读一遍
            </button>
            <Link
              href="/christmas"
              className="ann-ending-old-gift"
              aria-label="打开旧礼物：那一年的圣诞树"
            >
              那一年的圣诞树
              <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
          <span className="ann-ending-colophon">未完待续。</span>
        </footer>
      </div>
    </section>
  );
}
