"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import "./password-gate.css";

export default function PasswordGate({ error, returnTo }: {
  error?: "wrong" | "unavailable";
  returnTo: "/" | "/christmas";
}) {
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const message = error === "wrong" ? "暗号还没对上，再想想我们的开始。"
    : error === "unavailable" ? "暂时无法验证暗号，请稍后再试。" : "";

  return (
    <main className="ann-lock-page">
      <noscript><style>{`.ann-lock-visibility { display: none; }`}</style></noscript>
      <header className="ann-lock-header">
        <span className="ann-lock-brand"><span aria-hidden="true">∞</span>一封，只写给你的信</span>
        <span className="ann-lock-private"><LockKeyhole size={13} aria-hidden="true" />私人信件</span>
      </header>

      <div className="ann-lock-layout">
        <section className="ann-lock-intro" aria-labelledby="ann-lock-title">
          <p className="ann-lock-eyebrow"><span aria-hidden="true" />拆信之前</p>
          <h1 id="ann-lock-title">宝宝，<br />先对个暗号。</h1>
          <p className="ann-lock-description">有些话，只想说给你听。<br />这封信，留给知道我们开始的人。</p>
          <p className="ann-lock-handnote">关于我们的故事，只有你知道怎么打开。</p>
        </section>

        <section className="ann-lock-paper" aria-labelledby="ann-lock-paper-title">
          <div className="ann-lock-paper-top" aria-hidden="true">
            <span>ONLY FOR YOU</span>
            <span className="ann-lock-seal">∞</span>
          </div>
          <p className="ann-lock-salutation">致，知道答案的你</p>
          <h2 id="ann-lock-paper-title">把那一天，<br />轻轻写在这里。</h2>
          <form action="/api/unlock" method="post" onSubmit={() => setPending(true)}>
            <input type="hidden" name="returnTo" value={returnTo} />
            <label className="ann-lock-label" htmlFor="letter-password">我们的暗号</label>
            <div className="ann-lock-input-wrap">
              <input
                id="letter-password"
                name="password"
                type={visible ? "text" : "password"}
                inputMode="numeric"
                autoComplete="current-password"
                placeholder="8 位数字"
                minLength={8}
                maxLength={8}
                pattern="[0-9]{8}"
                required
                autoFocus={error === "wrong"}
                aria-invalid={error === "wrong" || undefined}
                aria-describedby={`ann-lock-hint${message ? " ann-lock-error" : ""}`}
              />
              <button
                className="ann-lock-visibility"
                type="button"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? "隐藏暗号" : "显示暗号"}
                aria-pressed={visible}
                aria-controls="letter-password"
              >
                {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
              </button>
            </div>
            <p id="ann-lock-hint" className="ann-lock-hint">提示：我们成为「我们」的那一天。</p>
            <p id="ann-lock-error" className="ann-lock-error" role={message ? "alert" : undefined}>{message}</p>
            <button className="ann-lock-submit" type="submit" disabled={pending}>
              <span>{pending ? "正在为你开信…" : "打开这封信"}</span>
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </form>
          <p className="ann-lock-paper-note">写给你，也只为你打开。</p>
        </section>
      </div>

      <footer className="ann-lock-footer"><span>把小事，写成我们的故事</span><span aria-hidden="true">KEPT BETWEEN US</span></footer>
    </main>
  );
}
