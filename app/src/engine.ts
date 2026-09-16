export type Tone = "صمیمی" | "حرفه‌ای" | "هیجانی" | "لوکس" | "طنز"
export type Goal = "فروش مستقیم" | "جذب فالوور" | "معرفی محصول جدید" | "اعتمادسازی" | "بازگشت مشتری"
export type Platform = "اینستاگرام" | "تلگرام"

export interface Brief {
  business: string
  product: string
  description: string
  audience: string
  price: string
  offer: string
  city: string
  tone: Tone
  goal: Goal
  emoji: boolean
  hashtags: boolean
  length: "کوتاه" | "متوسط" | "بلند"
  variants: number
}

export interface Output {
  captions: { platform: Platform; title: string; body: string }[]
  stories: { day: string; frames: { label: string; text: string }[] }[]
  ctas: string[]
  replies: { q: string; a: string }[]
  plan: { day: string; theme: string; format: string; idea: string; cta: string }[]
  hashtags: string[]
}

const pick = <T,>(arr: T[], i: number): T => arr[i % arr.length]
const E = (b: Brief, e: string) => (b.emoji ? e + " " : "")

const hooksByGoal: Record<Goal, string[]> = {
  "فروش مستقیم": [
    "اگر دنبال {product} با کیفیت می‌گردی، این پست را تا آخر بخوان.",
    "چرا مشتری‌های {business} دوباره برمی‌گردند؟ جواب ساده است.",
    "فقط یک تصمیم کوچک بین تو و {product} فاصله است.",
  ],
  "جذب فالوور": [
    "سه نکته‌ای که قبل از خرید {product} باید بدانی.",
    "این صفحه را ذخیره کن؛ هر هفته درباره‌ی {product} می‌نویسیم.",
    "بیشتر آدم‌ها این اشتباه را درباره‌ی {product} می‌کنند.",
  ],
  "معرفی محصول جدید": [
    "بالاخره رسید! {product} جدید {business} از امروز موجود است.",
    "چیزی که خیلی‌هایتان درخواست داده بودید، آماده شد.",
    "رونمایی می‌کنیم: {product} با یک تفاوت مهم.",
  ],
  "اعتمادسازی": [
    "پشت {product} چه کسانی هستند؟ بگذارید شفاف بگوییم.",
    "قبل از اینکه از ما بخری، این را بدان.",
    "کیفیت را با حرف ثابت نمی‌کنیم؛ با جزئیات نشان می‌دهیم.",
  ],
  "بازگشت مشتری": [
    "خیلی وقت است سر نزده‌ای؛ یک پیشنهاد کوچک برایت داریم.",
    "مشتری قدیمی {business} هستی؟ این پست مخصوص توست.",
    "دفعه‌ی قبل {product} را امتحان کردی؛ حالا نسخه‌ی بهترش رسیده.",
  ],
}

const toneSpice: Record<Tone, string[]> = {
  "صمیمی": ["راحت پیام بده، مثل دوست جواب می‌دهیم.", "بدون تعارف بپرس، راهنمایی‌ات می‌کنیم."],
  "حرفه‌ای": ["مشاوره‌ی تخصصی رایگان پیش از خرید ارائه می‌شود.", "تمام مراحل با ضمانت و فاکتور رسمی انجام می‌شود."],
  "هیجانی": ["این فرصت زود تمام می‌شود!", "همین حالا؛ فردا دیر است."],
  "لوکس": ["ساخته‌شده برای کسانی که به جزئیات اهمیت می‌دهند.", "تجربه‌ای متفاوت، در سکوت کیفیت."],
  "طنز": ["قول می‌دهیم بعد از خرید، به همه پز بدهی.", "کیف پولت ناراحت نمی‌شود، قول می‌دهیم."],
}

const ctaBank = (b: Brief) => [
  `${E(b, "🛒")}برای سفارش ${b.product} همین حالا دایرکت بده.`,
  `${E(b, "📩")}کلمه‌ی «قیمت» را برایمان بفرست تا لیست کامل را بگیری.`,
  `${E(b, "🔗")}لینک خرید در بایو — موجودی محدود است.`,
  `${E(b, "📞")}شماره‌ات را بفرست، خودمان تماس می‌گیریم.`,
  `${E(b, "💬")}سؤالت را زیر همین پست کامنت کن، همه را جواب می‌دهیم.`,
  `${E(b, "⭐")}این پست را برای کسی بفرست که به ${b.product} نیاز دارد.`,
  b.offer ? `${E(b, "🎁")}${b.offer} — فقط تا پایان همین هفته.` : `${E(b, "🎁")}برای مشتری‌های جدید یک هدیه‌ی کوچک داریم.`,
]

const hashtagBank = (b: Brief) => {
  const base = [b.product, b.business, b.city, "خرید_آنلاین", "کسب_و_کار_ایرانی", b.audience]
  return base
    .filter(Boolean)
    .map((t) => "#" + String(t).trim().replace(/\s+/g, "_"))
    .concat(["#فروش_ویژه", "#ارسال_به_سراسر_کشور", "#کیفیت_تضمینی"])
}

function body(b: Brief, i: number): string {
  const hook = pick(hooksByGoal[b.goal], i).replaceAll("{product}", b.product).replaceAll("{business}", b.business)
  const value = `${b.description.trim() || `${b.product} با کیفیت و قیمت منصفانه`}`
  const who = b.audience ? `مناسب برای ${b.audience}.` : ""
  const price = b.price ? `${E(b, "💰")}قیمت: ${b.price}` : ""
  const offer = b.offer ? `${E(b, "🎁")}${b.offer}` : ""
  const spice = pick(toneSpice[b.tone], i)
  const cta = pick(ctaBank(b), i)
  const lines =
    b.length === "کوتاه"
      ? [hook, value, cta]
      : b.length === "متوسط"
      ? [hook, "", value, who, "", price, offer, "", spice, cta]
      : [
          hook,
          "",
          value,
          who,
          "",
          `${E(b, "✅")}چرا ما؟`,
          `${E(b, "•")}کیفیت ثابت و بررسی‌شده`,
          `${E(b, "•")}پشتیبانی واقعی بعد از خرید`,
          `${E(b, "•")}ارسال سریع${b.city ? ` در ${b.city} و سراسر ایران` : ""}`,
          "",
          price,
          offer,
          "",
          spice,
          cta,
        ]
  const text = lines.filter((l) => l !== undefined && l !== null).join("\n").replace(/\n{3,}/g, "\n\n").trim()
  return b.hashtags ? `${text}\n\n${hashtagBank(b).slice(0, 7).join(" ")}` : text
}

export function generate(b: Brief): Output {
  const n = Math.max(1, Math.min(6, b.variants))
  const captions: Output["captions"] = []
  for (let i = 0; i < n; i++) {
    captions.push({ platform: "اینستاگرام", title: `کپشن اینستاگرام #${i + 1}`, body: body(b, i) })
  }
  for (let i = 0; i < Math.max(1, Math.round(n / 2)); i++) {
    const t = body({ ...b, hashtags: false, length: b.length === "بلند" ? "متوسط" : b.length }, i + 1)
    captions.push({
      platform: "تلگرام",
      title: `پیام تلگرام #${i + 1}`,
      body: `**${b.business} | ${b.product}**\n\n${t}\n\n${E(b, "👇")}سفارش: @${b.business.replace(/\s+/g, "_")}`,
    })
  }

  const stories: Output["stories"] = [
    {
      day: "روز اول — معرفی",
      frames: [
        { label: "فریم ۱ (قلاب)", text: `${E(b, "👀")}${b.product} را ندیده‌ای؟ سه ثانیه وقت بده.` },
        { label: "فریم ۲ (مشکل)", text: `${b.audience || "مشتری‌ها"} معمولاً سر انتخاب اشتباه ضرر می‌کنند.` },
        { label: "فریم ۳ (راه‌حل)", text: `${b.description || b.product} دقیقاً همین را حل می‌کند.` },
        { label: "فریم ۴ (اثبات)", text: `${E(b, "⭐")}نظر مشتری‌ها را در هایلایت ببین.` },
        { label: "فریم ۵ (اقدام)", text: pick(ctaBank(b), 0) },
      ],
    },
    {
      day: "روز دوم — پیشنهاد",
      frames: [
        { label: "فریم ۱", text: `${E(b, "🎁")}${b.offer || "تخفیف ویژه‌ی این هفته"}` },
        { label: "فریم ۲ (نظرسنجی)", text: "کدام را بیشتر دوست داری؟ (استیکر نظرسنجی بگذار)" },
        { label: "فریم ۳ (فوریت)", text: `${E(b, "⏳")}تا ساعت ۲۴ امشب فعال است.` },
        { label: "فریم ۴", text: pick(ctaBank(b), 1) },
      ],
    },
  ]

  const replies: Output["replies"] = [
    { q: "قیمتش چنده؟", a: `سلام و وقت بخیر ${E(b, "🌹")}\n${b.product}: ${b.price || "قیمت را در دایرکت خدمتتان می‌فرستیم"}.\n${b.offer || "برای سفارش امروز هم یک تخفیف کوچک داریم."} چه تعدادی لازم دارید؟` },
    { q: "ارسال دارید؟", a: `بله حتماً ${E(b, "🚚")} ارسال به${b.city ? ` ${b.city} همان‌روز و` : ""} سراسر ایران انجام می‌شود. آدرس و کد پستی را بفرستید تا هزینه‌ی دقیق را بگویم.` },
    { q: "گرونه، تخفیف نداری؟", a: `کاملاً درک می‌کنم ${E(b, "🙏")} قیمت ${b.product} به‌خاطر کیفیت و پشتیبانی بعد از خریدش است. با این حال ${b.offer || "برای خرید امروز یک تخفیف مخصوص"} برایتان فعال می‌کنم.` },
    { q: "کیفیتش تضمین داره؟", a: `بله ${E(b, "✅")} ${b.business} روی ${b.product} ضمانت بازگشت وجه دارد. اگر مطابق توضیحات نبود، بدون سؤال مرجوع می‌کنیم.` },
    { q: "چطور سفارش بدم؟", a: `خیلی ساده ${E(b, "📝")}\n۱) مدل و تعداد را بفرست\n۲) آدرس و شماره تماس\n۳) پرداخت و ثبت سفارش\nبعدش کد رهگیری را همین‌جا برایتان می‌فرستم.` },
    { q: "چند روزه می‌رسه؟", a: `سفارش‌های ثبت‌شده تا ساعت ۱۴ همان روز ارسال می‌شود${b.city ? ` و در ${b.city} معمولاً ۲۴ ساعته` : ""}؛ شهرستان ۲ تا ۳ روز کاری ${E(b, "📦")}` },
  ]

  const themes = [
    ["شنبه", "معرفی و قلاب", "پست تک‌عکسی", `معرفی ${b.product} و مشکلی که حل می‌کند`],
    ["یکشنبه", "آموزش کوتاه", "ریلز ۳۰ ثانیه", `۳ نکته برای انتخاب درست ${b.product}`],
    ["دوشنبه", "اعتمادسازی", "کاروسل", "نظر مشتری‌ها + قبل و بعد"],
    ["سه‌شنبه", "پشت‌صحنه", "استوری سری", `یک روز کاری در ${b.business}`],
    ["چهارشنبه", "پیشنهاد فروش", "پست + استوری", b.offer || "پیشنهاد محدود هفتگی"],
    ["پنجشنبه", "تعامل", "نظرسنجی و پرسش", `سؤال از مخاطب: بزرگ‌ترین دغدغه‌ات درباره‌ی ${b.product} چیست؟`],
    ["جمعه", "جمع‌بندی و یادآوری", "ریلز یا پست", "پرتکرارترین سؤال‌ها و پاسخ کوتاه"],
  ]
  const plan = themes.map(([day, theme, format, idea], i) => ({
    day: day as string,
    theme: theme as string,
    format: format as string,
    idea: idea as string,
    cta: pick(ctaBank(b), i),
  }))

  return { captions, stories, ctas: ctaBank(b), replies, plan, hashtags: hashtagBank(b) }
}

export const sampleBriefs: Brief[] = [
  {
    business: "قنادی ماهک",
    product: "کیک تولد سفارشی",
    description: "کیک‌های خانگی با خامه‌ی طبیعی و طراحی سفارشی، بدون مواد نگهدارنده، تحویل در همان روز.",
    audience: "خانواده‌ها و مشتریان جشن‌های خانگی",
    price: "از ۴۸۰ هزار تومان",
    offer: "ارسال رایگان برای سفارش‌های بالای یک میلیون تومان",
    city: "تهران",
    tone: "صمیمی",
    goal: "فروش مستقیم",
    emoji: true,
    hashtags: true,
    length: "متوسط",
    variants: 3,
  },
  {
    business: "استودیو آرمان",
    product: "دوره‌ی آنلاین عکاسی با موبایل",
    description: "۱۲ جلسه ویدیویی + تمرین هفتگی + بازخورد شخصی روی عکس‌های شما.",
    audience: "فروشندگان اینستاگرامی و تولیدکنندگان محتوا",
    price: "۱٫۹۰۰٫۰۰۰ تومان",
    offer: "۳۰٪ تخفیف ثبت‌نام زودهنگام",
    city: "آنلاین",
    tone: "حرفه‌ای",
    goal: "معرفی محصول جدید",
    emoji: true,
    hashtags: true,
    length: "بلند",
    variants: 3,
  },
  {
    business: "چرم رها",
    product: "کیف چرم طبیعی دست‌دوز",
    description: "چرم گاوی درجه‌یک، دوخت دستی، ضمانت ۲ ساله، قابل سفارشی‌سازی با حکاکی نام.",
    audience: "خریداران هدیه و مشتریان لوکس",
    price: "۲٫۴۵۰٫۰۰۰ تومان",
    offer: "حکاکی نام رایگان",
    city: "اصفهان",
    tone: "لوکس",
    goal: "اعتمادسازی",
    emoji: false,
    hashtags: true,
    length: "متوسط",
    variants: 3,
  },
]
