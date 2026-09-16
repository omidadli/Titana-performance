import { useMemo, useState } from "react"
import { generate, sampleBriefs, type Brief, type Output, type Goal, type Tone } from "./engine"
import "./App.css"

const tones: Tone[] = ["صمیمی", "حرفه‌ای", "هیجانی", "لوکس", "طنز"]
const goals: Goal[] = ["فروش مستقیم", "جذب فالوور", "معرفی محصول جدید", "اعتمادسازی", "بازگشت مشتری"]
const tabs = ["کپشن‌ها", "استوری", "کال‌تواکشن", "پاسخ به مشتری", "پلن ۷ روزه"] as const
type Tab = (typeof tabs)[number]

const FREE_QUOTA = 5

function Copy({ text, label = "کپی" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      className={"copy" + (done ? " done" : "")}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
        } catch {
          const ta = document.createElement("textarea")
          ta.value = text
          document.body.appendChild(ta)
          ta.select()
          document.execCommand("copy")
          ta.remove()
        }
        setDone(true)
        setTimeout(() => setDone(false), 1400)
      }}
    >
      {done ? "کپی شد ✓" : label}
    </button>
  )
}

export default function App() {
  const [brief, setBrief] = useState<Brief>(sampleBriefs[0])
  const [out, setOut] = useState<Output | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>("کپشن‌ها")
  const [used, setUsed] = useState(0)
  const [pro, setPro] = useState(false)
  const [showPay, setShowPay] = useState(false)

  const set = <K extends keyof Brief>(k: K, v: Brief[K]) => setBrief((b) => ({ ...b, [k]: v }))
  const remaining = Math.max(0, FREE_QUOTA - used)

  const run = () => {
    setError(null)
    if (!brief.business.trim() || !brief.product.trim()) {
      setError("نام کسب‌وکار و نام محصول/خدمت را وارد کنید.")
      return
    }
    if (brief.description.trim().length < 15) {
      setError("توضیح محصول خیلی کوتاه است؛ حداقل ۱۵ کاراکتر بنویسید تا خروجی دقیق‌تر شود.")
      return
    }
    if (!pro && remaining === 0) {
      setShowPay(true)
      return
    }
    setLoading(true)
    setOut(null)
    setTimeout(() => {
      try {
        setOut(generate(brief))
        if (!pro) setUsed((u) => u + 1)
      } catch {
        setError("در تولید محتوا خطایی رخ داد. دوباره تلاش کنید.")
      } finally {
        setLoading(false)
      }
    }, 900)
  }

  const allText = useMemo(() => {
    if (!out) return ""
    return [
      "— کپشن‌ها —",
      ...out.captions.map((c) => `[${c.platform}] ${c.title}\n${c.body}`),
      "— استوری —",
      ...out.stories.map((s) => `${s.day}\n` + s.frames.map((f) => `${f.label}: ${f.text}`).join("\n")),
      "— CTA —",
      ...out.ctas,
      "— پاسخ مشتری —",
      ...out.replies.map((r) => `${r.q}\n${r.a}`),
      "— پلن ۷ روزه —",
      ...out.plan.map((p) => `${p.day} | ${p.theme} | ${p.format} | ${p.idea} | ${p.cta}`),
    ].join("\n\n")
  }, [out])

  return (
    <div className="app" dir="rtl">
      <div className="glow a" />
      <div className="glow b" />
      <header className="topbar">
        <div className="brand">
          <span className="logo">ق</span>
          <div>
            <b>قلم‌کار</b>
            <small>کوپایلوت محتوا و فروش برای کسب‌وکارهای فارسی‌زبان</small>
          </div>
        </div>
        <div className="topactions">
          <span className={"quota" + (remaining === 0 && !pro ? " zero" : "")}>
            {pro ? "پلن حرفه‌ای فعال ✦" : `${remaining} تولید رایگان باقی مانده`}
          </span>
          {!pro && (
            <button className="btn ghost" onClick={() => setShowPay(true)}>
              ارتقا به حرفه‌ای
            </button>
          )}
        </div>
      </header>

      <main className="layout">
        <section className="panel form">
          <h2>بریف محصول</h2>
          <div className="samples">
            <span>نمونه:</span>
            {sampleBriefs.map((s, i) => (
              <button key={i} className="chip" onClick={() => { setBrief(s); setOut(null); setError(null) }}>
                {s.business}
              </button>
            ))}
          </div>

          <label>نام کسب‌وکار<input value={brief.business} onChange={(e) => set("business", e.target.value)} placeholder="مثلاً: قنادی ماهک" /></label>
          <label>محصول یا خدمت<input value={brief.product} onChange={(e) => set("product", e.target.value)} placeholder="مثلاً: کیک تولد سفارشی" /></label>
          <label>
            توضیح کوتاه
            <textarea rows={4} value={brief.description} onChange={(e) => set("description", e.target.value)} placeholder="چه چیزی می‌فروشی و چه فرقی با بقیه دارد؟" />
            <span className="hint">{brief.description.trim().length} کاراکتر</span>
          </label>
          <div className="row">
            <label>مخاطب<input value={brief.audience} onChange={(e) => set("audience", e.target.value)} /></label>
            <label>شهر<input value={brief.city} onChange={(e) => set("city", e.target.value)} /></label>
          </div>
          <div className="row">
            <label>قیمت<input value={brief.price} onChange={(e) => set("price", e.target.value)} /></label>
            <label>پیشنهاد ویژه<input value={brief.offer} onChange={(e) => set("offer", e.target.value)} /></label>
          </div>

          <h3>تنظیمات تولید</h3>
          <label>هدف
            <select value={brief.goal} onChange={(e) => set("goal", e.target.value as Goal)}>
              {goals.map((g) => <option key={g}>{g}</option>)}
            </select>
          </label>
          <div className="segment">
            {tones.map((t) => (
              <button key={t} className={brief.tone === t ? "on" : ""} onClick={() => set("tone", t)}>{t}</button>
            ))}
          </div>
          <div className="segment">
            {(["کوتاه", "متوسط", "بلند"] as const).map((l) => (
              <button key={l} className={brief.length === l ? "on" : ""} onClick={() => set("length", l)}>{l}</button>
            ))}
          </div>
          <label className="slider">
            تعداد نسخه‌ها: <b>{brief.variants}</b>
            <input type="range" min={1} max={6} value={brief.variants} onChange={(e) => set("variants", +e.target.value)} />
          </label>
          <div className="toggles">
            <label className="tg"><input type="checkbox" checked={brief.emoji} onChange={(e) => set("emoji", e.target.checked)} /> ایموجی</label>
            <label className="tg"><input type="checkbox" checked={brief.hashtags} onChange={(e) => set("hashtags", e.target.checked)} /> هشتگ</label>
          </div>

          {error && <div className="error">⚠ {error}</div>}
          <button className="btn primary big" onClick={run} disabled={loading}>
            {loading ? "در حال تولید..." : "تولید محتوا ✦"}
          </button>
        </section>

        <section className="panel output">
          <div className="outhead">
            <div className="tabs">
              {tabs.map((t) => (
                <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)} disabled={!out}>{t}</button>
              ))}
            </div>
            {out && <Copy text={allText} label="کپی همه" />}
          </div>

          {loading && (
            <div className="skeletons">{[0, 1, 2].map((i) => <div key={i} className="sk" />)}</div>
          )}

          {!loading && !out && (
            <div className="empty">
              <div className="emoji">✦</div>
              <h3>هنوز چیزی تولید نشده</h3>
              <p>بریف محصولت را کامل کن یا یکی از نمونه‌ها را انتخاب کن، بعد دکمه‌ی «تولید محتوا» را بزن.</p>
            </div>
          )}

          {!loading && out && (
            <div className="results">
              {tab === "کپشن‌ها" && out.captions.map((c, i) => (
                <article key={i} className="card">
                  <header><span className={"tag " + (c.platform === "تلگرام" ? "tg" : "ig")}>{c.platform}</span><b>{c.title}</b><Copy text={c.body} /></header>
                  <pre>{c.body}</pre>
                </article>
              ))}

              {tab === "استوری" && out.stories.map((s, i) => (
                <article key={i} className="card">
                  <header><b>{s.day}</b><Copy text={s.frames.map((f) => `${f.label}: ${f.text}`).join("\n")} /></header>
                  <div className="frames">
                    {s.frames.map((f, j) => (
                      <div key={j} className="frame"><small>{f.label}</small><p>{f.text}</p></div>
                    ))}
                  </div>
                </article>
              ))}

              {tab === "کال‌تواکشن" && (
                <article className="card">
                  <header><b>CTAهای پیشنهادی</b><Copy text={out.ctas.join("\n")} /></header>
                  <ul className="list">{out.ctas.map((c, i) => <li key={i}>{c}<Copy text={c} /></li>)}</ul>
                  <header className="sub"><b>هشتگ‌ها</b><Copy text={out.hashtags.join(" ")} /></header>
                  <div className="tags">{out.hashtags.map((h, i) => <span key={i} className="htag">{h}</span>)}</div>
                </article>
              )}

              {tab === "پاسخ به مشتری" && out.replies.map((r, i) => (
                <article key={i} className="card">
                  <header><span className="tag q">سؤال</span><b>{r.q}</b><Copy text={r.a} /></header>
                  <pre>{r.a}</pre>
                </article>
              ))}

              {tab === "پلن ۷ روزه" && (
                <article className="card">
                  <header><b>تقویم محتوای هفتگی</b><Copy text={out.plan.map((p) => `${p.day} | ${p.theme} | ${p.format} | ${p.idea} | ${p.cta}`).join("\n")} /></header>
                  <div className="planwrap">
                    <table className="plan">
                      <thead><tr><th>روز</th><th>محور</th><th>قالب</th><th>ایده</th><th>CTA</th></tr></thead>
                      <tbody>{out.plan.map((p, i) => (
                        <tr key={i}><td><b>{p.day}</b></td><td>{p.theme}</td><td>{p.format}</td><td>{p.idea}</td><td>{p.cta}</td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                </article>
              )}

              {!pro && (
                <div className="upsell">
                  <b>می‌خواهی خروجی‌ها را ذخیره و زمان‌بندی کنی؟</b>
                  <p>پلن حرفه‌ای: تولید نامحدود، لحن اختصاصی برند، تقویم ۳۰ روزه، خروجی اکسل و اتصال به تلگرام.</p>
                  <button className="btn primary" onClick={() => setShowPay(true)}>ارتقا به حرفه‌ای — ۲۹۰ هزار تومان/ماه</button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {showPay && (
        <div className="modal" onClick={() => setShowPay(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3>پلن‌ها</h3>
            <div className="plans">
              <div className="plancard">
                <h4>رایگان</h4>
                <div className="price">۰</div>
                <ul><li>۵ تولید در ماه</li><li>کپشن و CTA</li><li>پلن ۷ روزه</li></ul>
              </div>
              <div className="plancard best">
                <span className="badge">پیشنهاد ما</span>
                <h4>حرفه‌ای</h4>
                <div className="price">۲۹۰٬۰۰۰ <small>تومان / ماه</small></div>
                <ul><li>تولید نامحدود</li><li>لحن اختصاصی برند</li><li>تقویم ۳۰ روزه</li><li>خروجی اکسل + تلگرام</li></ul>
                <button className="btn primary" onClick={() => { setPro(true); setShowPay(false) }}>فعال‌سازی نسخه‌ی آزمایشی</button>
              </div>
            </div>
            <button className="btn ghost" onClick={() => setShowPay(false)}>بستن</button>
          </div>
        </div>
      )}
      <footer className="foot">ساخته‌شده برای کسب‌وکارهای کوچک فارسی‌زبان • نسخه‌ی MVP</footer>
    </div>
  )
}
