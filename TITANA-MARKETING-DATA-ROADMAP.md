# TITANA-MARKETING-DATA-ROADMAP
## نقشه‌ی راه جامع داده مارکتینگ تیتانا — از ممیزی تا اتصال به AI Agent

| فیلد | مقدار |
|---|---|
| نسخه | 1.0 |
| تاریخ | 2026-09-20 |
| تهیه‌کننده | Data Lead / MarTech (نقش: مدیر داده + معمار داده + متخصص GA4/GTM + PM) |
| دامنه | titana.ir (وب‌بیت، B2B تجهیزات ایمپلنت) + GA4 + GTM + Clarity + Web Logs + Webbit + یکتانت/تپ‌سول + AI Agent |
| ورودی‌ها | 14 فایل repository (فهرس در بخش 1.1) + مصاحبه ورودی (README) |
| وضعیت اجرا | **فقط مستندسازی و برنامه‌ریزی — هیچ داده یا اتصال واقعی تغییر نکرده است** |

> **قوانین خواندن:** نام eventها، جداول، پارامترها و اصطلاحات فنی به‌صورت انگلیسی استاندارد باقی مانده‌اند. هر ردیف backlog در بخش 8 مستقیماً قابل تبدیل به GitHub issue است. مواردی که به دلیل نبود دسترسی/داده، قابل تأیید نیستند، با برچسب **[نیازمند دسترسی]** یا **[نیازمند تصمیم]** مشخص شده‌اند — هیچ‌کدام حدس زده نشده‌اند.

---

# فهرست

1. [Executive Summary](#1-executive-summary)
2. [بخش 1 — ممیزی وضعیت فعلی (Current State Audit)](#بخش-1--ممیزی-وضعیت-فعلی)
3. [بخش 2 — جدول شکاف: وضعیت فعلی تا وضعیت هدف](#بخش-2--جدول-شکاف-وضعیت-فعلی-تا-وضعیت-هدف)
4. [بخش 3 — داده‌نامه کامل (Data Inventory)](#بخش-3--داده‌نامه-کاملdata-inventory)
5. [بخش 4 — معماری مرجع end-to-end](#بخش-4--معماری-مرجع-end-to-end)
6. [بخش 5 — نقشه‌ی راه فاز 0 تا فاز 6](#بخش-5--نقشه-ی-راهفاز-0-تا-فاز-6)
7. [بخش 6 — Quick Wins: ۷ / ۳۰ / ۰ روزه](#بخش-6--quick-wins-7--30--90-روزه)
8. [بخش 7 — کاتالوگ گزارش‌ها و داشبوردها](#بخش-7--کاتالوگ-گزارش‌ها-و-داشبوردها)
9. [بخش 8 — برنامه تکمیل GA4/GTM (dataLayer, naming, taxonomy, privacy, testing)](#بخش-8--برنامه-تکمیل-ga4gtm)
10. [بخش 9 — قرارداد داده و API برای AI Agent](#بخش-9--قرارداد-داده-و-api-برای-ai-agent)
11. [بخش 10 — امنیت و حریم خصوصی](#بخش-10--امنیت-و-حریم-خصوصی)
12. [بخش 11 — KPIهای موفقیت برنامه](#بخش-11--kpiهای-موفقیت-برنامه)
13. [بخش 12 — 10 اقدام بعدی](#بخش-12--10-اقدام-بعدی)
14. [بخش 13 — سؤالات و تصمیمات مورد نیاز از مدیریت](#بخش-13--سؤالات-و-تصمیمات-مورد-نیاز-از-مدیریت)
15. [بخش 14 — Self-Review نهایی](#بخش-14--self-review-نهایی)
16. [پیوست A — Traceability به فایل‌های repository](#پیوست-a--traceability)
17. [پیوست B — Backlog فنی اولویت‌بندی‌شده (GitHub-ready)](#پیوست-b--backlog-فنی-اولویت‌بندی‌شده)

---

# 1. Executive Summary

**وضعیت:** تیتانا یک برنامه‌ی ۶ فازه و باکیفیت در repository دارد (`strategy/01..06`)، اما **هیچ‌یک از تسک‌ها اجرا نشده** (تمام چک‌باکس‌ها ⬜ هستند) و مهم‌تر از آن، **فایل‌های وضعیت کامل GTM و GA4 که قرار بود به‌عنوان context وجود داشته باشند، در repository و workspace نیستند** — یعنی «وضعیت فعلی» هنوز به‌طور رسمی سنجیده نشده است. منابع Clarity و Web Logs در برنامه‌ی موجود repository **به‌هیچ‌وجه پوشش داده نشده‌اند** و دسترسی به Web Logs روی پلتفرم میزبانی وب‌بیت معلوم نیست. هیچ warehouse، semantic layer، قرارداد AI Agent، سیستم DQ خودکار و alerting وجود ندارد.

**هدف نهایی:** یک platform داده یکپارچه که (الف) 6 event استاندارد + داده رفتار + داده جلسات Clarity + لاگ وب + هزینه/فروش آفلاین را در یک محل (BigQuery) جمع می‌کند، (ب) با قوانین کیفیت و حاکمیت قابل اتکا است، (ج) خروجی آن داشبورد/گزارش‌های استاندارد تیم مارکتینگ است، و (د) **به‌طور امن و با اعلام freshness/lineage به AI Agent تیتانا قابل اتصال است.**

**معماری پیشنهادی (یک خط):** `dataLayer (website) → GTM → GA4 → BigQuery (export رایگان)` + `Clarity (API/CSV)` + `Webbit/شیت‌ها (CSV/Sheets)` → `BigQuery: raw + marts + agent views (masked)` → `Looker Studio (داشبورد)` و `REST API read-only (AI Agent)`. این انتخاب **کم‌هزینه‌ترین مسیر با قابلیت رشد** است: در حجم فعلی B2B، هزینه BigQuery در free tier **صفر** است و همان infrastructure پایه‌ی اتصال امن AI Agent را می‌دهد.

**تغییر مهم نسبت به repository:** قاعده‌ی «خروج از محدوده» repository می‌گفت BigQuery فعلاً نباشد (`strategy/02-phase-1-data.md`، بخش ❌ها). هدف جدید «اتصال به AI Agent» این تصمیم را **از نو برای تصمیم‌گیری باز می‌کند** (تصمیم D-1 در بخش 13): چون GA4→BigQuery export رایگان است و بدون آن، query-based access امن، lineage و masking برای Agent عملاً ممکن نمی‌شود. پیشنهاد ما: **بله، از ماه اول**، فقط در حجم فعلی.

**خط زمانی:** فاز 0 (روز 0–14) ممیزی واقعی ← فاز 1 (روز 14–45) بنیان داده ← فاز 2 (روز 45–75) warehouse v0 + داشبورد ← فاز 3 (روز 75–105) کیفیت/حاکمیت/امنیت ← فاز 4 (روز 105–150) CRO ← فاز 5 (روز 150–200) حلقه آفلاین ← فاز 6 (روز 200+) AI Agent v1 + سیستم مستمر. Quick Winهای ۷/۳۰/۹۰ روزه در بخش 6.

**10 اقدام بعدی** (خلاصه؛ جزئیات در بخش 12): ۱) دریافت فایل‌های وضعیت GTM/GA4 یا اجرای ممیزی ۲) چک دسترسی Web Logs و Clarity ۳) رفع 5 تنظیم فوری GA4 ۴) ممیزی/تمیزکندی کانتینر GTM ۵) ارجاع T1–T7 به تیم فنی ۶) شیت‌های هزینه/آفلاین/لید ۷) بنچمارک ۳ ماهه ۸) لینک GA4→BigQuery ۹) ۳ داشبورد + ریتم هفتگی ۱۰) تعریف 6 view_agent و قرارداد Agent.

---

# بخش 1 — ممیزی وضعیت فعلی

## 1.1 فایل‌های بررسی‌شده (کل repository)

| # | فایل | نقش | وضعیت |
|---|---|---|---|
| 1 | `README.md` | نقشه یک‌صفحه‌ای ۶ فاز + وضعیت مصاحبه ورودی (سپتامبر ۱۴۰۵) | موجود؛ **پیشرفت 0/6 فاز** |
| 2 | `strategy/01-phase-0-audit.md` | 10 تسک ممیزی (GTM، GA4، یکتانت، تپ‌سول، سایت، بنچمارک) | تعریف‌شده، **اجرا نشده** (همه ⬜) |
| 3 | `strategy/02-phase-1-data.md` | معماری داده فاز 1: 6 event، dataLayer، 24 تسک | تعریف‌شده، **اجرا نشده** |
| 4 | `strategy/03-phase-2-dashboard.md` | 3 شیت + 3 داشبورد Looker + ریتم هفتگی | تعریف‌شده، **اجرا نشده** |
| 5 | `strategy/04-phase-3-cro.md` | 8 پروژه CRO + log آزمایش‌ها | تعریف‌شده، **اجرا نشده** |
| 6 | `strategy/05-phase-4-advanced.md` | ایمپورت آفلاین، ریتارژتینگ، LTV | تعریف‌شده، **اجرا نشده** |
| 7 | `strategy/06-phase-5-scale.md` | سیستم مستمر + چک سلامتی فصلی | تعریف‌شده، **اجرا نشده** |
| 8 | `appendix/data-dictionary.md` | 6 event، اسکیم dataLayer، 8 مقدار `lead_method`، استاندارد UTM/user_id | مرجع فنی موجود و خوب |
| 9 | `appendix/dev-tasks.md` | T1–T16 تسک‌های تیم فنی با DoD | آماده ارجاع |
| 10 | `appendix/weekly-rhythm.md` | ریتم روز/هفته/ماه/فصل + قالب گزارش + عیب‌یابی 5 دقیقه‌ای | موجود |
| 11 | `agents/README.md` | مدل 2-Agent (GTM/GA4) + مرزها | موجود |
| 12 | `agents/prompt-gtm-agent.md` | پرامپت Agent GTM (T-G1..T-G6) | موجود و باکیفیت |
| 13 | `agents/prompt-ga4-agent.md` | پرامپت Agent GA4 (T-A1..T-A6) | موجود و باکیفیت |
| 14 | — | **فایل‌های وضعیت کامل GTM و Analytics** | **❌ در repository و workspace وجود ندارند [نیازمند دسترسی]** |

## 1.2 یافته‌های کلیدی ممیزی

| # | یافته | ارجاع | برچسب |
|---|---|---|---|
| F1 | برنامه ۶ فازه کامل و با کیفیت است ولی **هیچ اجرايي صورت نگرفته**؛ بنابراین «وضعیت فنی فعلی» هنوز اندازه‌گیری‌نشده است | `README.md` بخش پیشرفت؛ همه تسک‌ها ⬜ | ✅ تأییدشده |
| F2 | **فایل‌های وضعیت کامل GTM/GA4 که به‌عنوان context معرفی شدند، در دسترس نیستند.** هیچ export از کانتینر GTM، هیچ snapshot از Property GA4 و هیچ خروجی ممیزی در repository نیست. هر ادعایی درباره وضعیت فعلی تگ‌ها/تقارن‌ها بدون اجرای فاز 0 = حدس است | کل workspace | **[نیازمند دسترسی]** — یا فایل‌ها ضمیمه شوند، یا تسک‌های 1–3 فاز 0 اجرا شوند |
| F3 | GA4 + GTM طبق README «فعال» است، اما کیفیت/کامل بودن آن **مجهول** است (خود README صریح می‌گوید «خروجی فاز صفر می‌شود») | `README.md` جدول وضعیت فعلی | **[نیازمند تأیید]** |
| F4 | **Clarity در هیچ فایلی از repository ذکر نشده** — نه نصب، نه خروجی، نه در معماری. یا اصلاً نصب نیست یا نصب شده ولی مدیریت نمی‌شود | جستجوی کل repository: 0 اشاره | **[نیازمند دسترسی]** — چک نصب روی سایت |
| F5 | **Web Logs در هیچ فایلی پوشش داده نشده**؛ سایت روی پلتفرم میزبانی وب‌بیت است، بنابراین دسترسی به access log سرور احتمالاً در اختیار ما نیست و باید از وب‌بیت/هستدینگ درخواست شود | `README.md` (پلتفرم سایت)؛ `appendix/dev-tasks.md` T7 (فقط چک تکراری بودن GTM) | **[نیازمند دسترسی + تصمیم]** |
| F6 | dataLayer استاندارد (T1–T7) **هنوز وجود ندارد** — فرض repository این است که رویدادها یا نمی‌افتند یا ناقص‌اند (مثلاً `view_item` روی `/model/...` «حالا احتمالاً نمی‌افتد») | `strategy/02-phase-1-data.md`؛ `appendix/dev-tasks.md` | **[نیازمند تأیید]** با تَسک 2 فاز 0 |
| F7 | فروش آفلاین (نیمه‌ی درآمد در فانل ترکیبی) فعلی در **جای رسمی ثبت نمی‌شود** — تسک 9 فاز 0 (جمع‌آوری 3 ماهه) اجرا نشده | `strategy/01-phase-0-audit.md` T9 | **[نیازمند دسترسی]** به پنل/اکسل فروش |
| F8 | استاندارد UTM تعریف‌شده است ولی **اجبارشده نشده**؛ احتمال کمپین‌ها بدون UTM = بودجه بدون ردپا | `appendix/data-dictionary.md` بخش 4 | **[نیازمند تأیید]** |
| F9 | `user_id` = شماره موبایل **خام** (11 رقم) قرار است در GA4 برود — تصمیم privacy ریسک دارد و در repository فقط یک خط توضیح دارد | `appendix/data-dictionary.md` بخش 3 | **[نیازمند تصمیم]** D-5 (بخش 13) + بخش 10 این سند |
| F10 | **warehouse / semantic layer / DQ خودکار / alert / قرارداد AI Agent وجود ندارد.** فقط ریتم دستی (شنبه‌ها) و «چک عیب‌یابی 5 دقیقه‌ای» تعریف شده | `appendix/weekly-rhythm.md` | شکاف ساختاری (موضوع این سند) |
| F11 | مدل 2-Agent (GTM + GA4) با پرامپت‌های امن و ساختاریافته موجود است — دارایی ارزشمند برای اجرای فاز 0/1 | `agents/*` | ✅ قابل استفاده فوری |
| F12 | قاعده‌های ضدپیچیدگی repository (نه SS، نه BQ، نه CDP تا ضرورت) با هدف جدید «AI Agent» در **تناقض جزئی** است — نیازمند تصمیم مجدد مستند | `strategy/02-phase-1-data.md` بخش ❌؛ `strategy/05-phase-4-advanced.md` T11-12 | **[نیازمند تصمیم]** D-1 |

## 1.3 ریسک‌های شناسایی‌شده (Current State)

| # | ریسک | اثر | احتمال | امتیاز |
|---|---|---|---|---|
| R1 | اجرا نشدن فاز 0 → فاز 1 روی فرضیات ساخته شود | داده خراب از پایه؛ 2-3 ماه از دست رفته | بالا | **بسیار بالا** |
| R2 | GA4 Data Retention کمتر از 14 ماه → داده‌های تاریخی حذف | بنچمارک و cohort ناقص | متوسط | بالا |
| R3 | ترافیک داخلی فیلتر نشود | KPIها (CVR، bounce) پرشده | بالا | بالا |
| R4 | `purchase` در صفحه گیت‌وی بیفتد (نه success page) | شمرده‌شدن پرداخت‌های شکست‌خورده → ROAS غرورآفرین کاذب | متوسط | بالا |
| R5 | فروش آفلاین نامرئی | ROAS واقع بینانه قابل محاسبه نیست؛ نصف درآمد بی‌ردپ | بالا | **بسیار بالا** |
| R6 | دسترسی تیم به سرویس‌های گوگل از داخل ایران (شبکه/VPN) | توقف پروژه‌ای در میانه | **مجهول** | **[نیازمند تأیید]** |
| R7 | PII خام (موبایل) در GA4/warehouse | ریسک امنیتی و قانونی (حفاظت از اطلاعات شخصی) | متوسط | متوسط-بالا |
| R8 | وابستگی تک‌نفره (performance marketer) + تیم فنی کوچک | گلوگاه ظرفیت در فاز 1 (T1–T7) | بالا | بالا |
| R9 | انضباط ثبت روزانه شیت فروش آفلاین | حلقه آفلاین هر 2 هفته می‌شکند | بالا | بالا |
| R10 | duplicate data (دو نسخه GTM، EM site_search + event سفارسی، conversion مستقیم شبکه + GTM) | اعداد دو-تایی و عدم اعتماد به همه‌چیز | متوسط | بالا |
| R11 | نداشتن Web Logs → کور بودن در برابر bot traffic، خطاهای سرور، ریزش قبل از load صفحه | تشخیص ریشه‌ای مشکلات عمیق ممکن نیست | **مجهول** | **[نیازمند دسترسی]** |
| R12 | Clarity نصب/مدیریت‌نشده → داده session-level و JS errorها دور از دسترس | CRO کورتر؛ خطاهای front-end نامرئی | **مجهول** | **[نیازمند دسترسی]** |

## 1.4 فرضیات (Explicit Assumptions)

| # | فرض | وضعیت |
|---|---|---|
| A1 | Property GA4 و کانتینر GTM فعال‌اند (طبق README) — وجودشان فرض، کیفیتشان مجهول | [نیازمند تأیید] با T-A1/T-G1 |
| A2 | سایت فقط `titana.ir` است و زیردامنه/دامنه دوم (مثلاً bot) ندارد | [نیازمند تأیید] — برای cross-domain |
| A3 | وب‌بیت URL ثابت «موفقیت پرداخت» در اختیار ما دارد (T3 dev-tasks روی این فرض است) | [نیازمند تأیید] از تیم فنی |
| A4 | پنل وب‌بیت خروجی CSV سفارش دارد (T14 روی «اگر نه» تعریف شده) | [نیازمند تأیید] |
| A5 | یکتانت و تپ‌سول Conversion Tracking از قبل فعال است ولی کیفیت value مجهول | [نیازمند تأیید] با تسک 4/5 فاز 0 |
| A6 | تیم فنی ظرفیت حدود 5-6 روزکار در هفته 3-6 دارد | [نیازمند تأیید] |
| A7 | دسترسی Admin به GA4/GTM با performance marketer است | [نیازمند تأیید] |
| A8 | حجم ترافیک «متوسط B2B» است (روزانه چندصد تا چند‌هزار session) — حجم‌های بالا در محاسبات قیمت در نظر گرفته **نمی‌شود** | [نیازمند تأیید] با بنچمارک فاز 0 |

## 1.5 وابستگی‌های خارجی (Dependencies)

| # | وابستگی | چه کسی | چقدر بلوک‌کننده است |
|---|---|---|---|
| D1 | دسترسی به Web Logs (یا API/خروجی) از وب‌بیت/هستدینگ | مدیر فنی + وب‌بیت | **بالا** برای workstream لاگ (بقیه ادامه دارد) |
| D2 | وضعیت/نصب Clarity | تیم فنی | متوسط |
| D3 | GCP project برای BigQuery (مالک، billing/free tier) | [نیازمند تصمیم D-1] | **بالا** برای warehouse و Agent |
| D4 | شبکه/VPN پایدار برای پنل‌های گوگل/مایکروسافت | IT | **بسیار بالا** (اگر نباشد، کل کار از ایران فلج است) |
| D5 | کد Conversion یکتانت/تپ‌سول از پنل‌ها | performance marketer (دستی) | متوسط (فقط 2×30 دقیقه) |
| D6 | API/پست‌بک یکتانت/تپ‌سول برای تبدیل آفلاین | performance marketer + مستندات شبکه | متوسط (فاز 5) |
| D7 | همکاری تیم فروش: 5 دقیقه ثبت روزانه | مدیر فروش | **بالا** برای حلقه آفلاین |
| D8 | دسترسی به پنل فروش وب‌بیت (CSV سفارش، 3 ماه) | performance marketer + مدیریت | بالا برای بنچمارک |
| D9 | هویت فنی AI Agent تیتانا (چند سرویس است، protocol دسترسی) | مالک Agent | **بالا** برای فاز 6 |
| D10 | Google Search Console برای SEO (در ایران دسترسی Google محدود است — GSC هنوز قابل استفاده از طریق اکانت است؟) | [نیازمند تأیید] | پایین-متوسط |

---

# بخش 2 — جدول شکاف: وضعیت فعلی تا وضعیت هدف

> «فعلی» = آنچه از repository قابل تأیید است؛ موارد [?] = نیازمند اجرای فاز 0 (حدس داده نشده).

| # | ناحیه | وضعیت فعلی (تأییدشده) | وضعیت فعلی (مجهول) | وضعیت هدف (Phase N) | شکاف | فاز تکمیل |
|---|---|---|---|---|---|---|
| G1 | dataLayer استاندارد | ❌ موجود نیست (فرض مستند repository) | [?] | 6 event + همه پارامترها روی PDP/model/cart/checkout/success/lead/search | کامل (T1–T7) | 1 |
| G2 | کانتینر GTM | ⚠️ فعال (README) | [?] تعداد/کیفیت تگ‌ها، Configuration چندتایی، تگ بی‌نام | 1 Configuration + 6 Event tag (DL-based) + 2×conversion شبکه + نام‌دهی استاندارد + zero tag بی‌نام | کامل (T-G1..G6) | 1 |
| G3 | GA4 Property | ⚠️ فعال (README) | [?] Retention، Internal filter، EM، Key Events، timezone | Retention=14ماه، Internal filter فعال، EM تنظیم‌شده، 3 Key Event، timezone=Tehran | کامل (T-A1..A6) | 1 |
| G4 | شبکه‌های پولی (YN/TS) | ⚠️ Conversion فعال (فرض) | [?] quality value، UTM coverage | 2 conversion با value داینامیک + 100% UTM standard + تبدیل آفلاین (postback) | کامل | 1 → 5 |
| G5 | Clarity | ❌ در برنامه repository نیست | [?] اصلاً نصب است؟ | نصب + session sampling معقول + JS error + form analytics + خروجی دوره‌ای به warehouse | کامل | 1-2 |
| G6 | Web Logs | ❌ در برنامه نیست | [?] دسترسی وب‌بیت؟ | access log (یا جایگزین client-side) به warehouse + alert روی خطای 5xx/bot | کامل یا مستند‌کردن ناممکنی | 2 (یا حذف با تصمیم) |
| G7 | ثبت فروش آفلاین | ❌ غیررسمی (اکسل/تلگرام/هیچ) | [?] | شیت استاندارد + ثبت روزانه + CSV ماهانه + import GA4 | کامل | 2 → 5 |
| G8 | warehouse | ❌ نیست | — | BigQuery: raw (GA4/Clarity/Sheets/CSV) + marts + views | کامل | 2 |
| G9 | semantic layer | ❌ نیست | — | views مستند + data dictionary یکپارچه + lineage | کامل | 2-3 |
| G10 | DQ/monitoring | ❌ فقط چک دستی 5 دقیقه‌ای | — | قواعد DQ خودکار (5 rule) + freshness SLA + alert (email/Telegram) + چک ماهانه خودکار | کامل | 3 |
| G11 | داشبورد | ❌ (فرض: گزارش‌گیری دستی/اد‌هوک) | [?] | 3 داشبورد هسته + گسترش تا 12 گزارش کاتالوگ (بخش 7) | کامل | 2 → 5 |
| G12 | ریتم گزارش | ❌ تعریف شده ولی اجرا نشده | — | شنبه‌ها 45د + ماهانه 1س + فصلی 2س — روی تقویم تیم قفل | کامل | 2 |
| G13 | حاکمیت داده | ⚠️ فقط «دفتر تغییرات GTM» و data dictionary | — | data dictionary نسخه‌دار + change log + owner هر داده + review فصلی | کامل | 3 |
| G14 | امنیت/privacy | ⚠️ user_id خام موبایل در GA4 (تصمیم فعلی repository) | — | masking در views + access role-based + PII policy مستند | کامل | 3 |
| G15 | AI Agent access | ❌ هیچ قراردادی نیست | [?] هویت Agent | 6 view read-only + REST API + freshness/lineage + guardrail ضد hallucination + audit log | کامل | 3 → 6 |
| G16 | CRO loop | ❌ | — | 4+ پروژه بسته با log قبل/بعد + 2 آزمایش/هفته مستمر | کامل | 4 |
| G17 | آفلاین→GA4 (اتصال) | ❌ | — | import ماهانه روی چرخه + postback شبکه + ریتارژتینگ | کامل | 5 |

---

# بخش 3 — داده‌نامه کامل (Data Inventory)

**راهنمای برچسب‌ها:** 🟢 موجود (طبق repository) · 🟡 ناقص/تأییدنشده · 🔴 پیشنهادی (موجود نیست). **SOT** = Source of Truth. **Tz** = timezone مرجع (هدف: همه در `Asia/Tehran` نرمال می‌شوند؛ GA4 timestampها UTC هستند).

## 3.1 منبع 1 — dataLayer سایت (از طریق GTM)

| داده | نوع | برچسب | SOT | freshness | حساسیت | کاربرد بیزینسی | مقصد |
|---|---|---|---|---|---|---|---|
| `view_item` (+ `items[]`, `page_type`) | event | 🟡 (اسکیم تعریف‌شده، اجرا [?]) | سایت (Webbit) | realtime | کم (نام/برند محصول) | دقت funel، CRO، پرفورمنس محصول | GA4 → BQ |
| `add_to_cart` / `remove_from_cart` (+ `value` کل سبد) | event | 🟡 | سایت | realtime | کم | drop-off سبد | GA4 → BQ |
| `begin_checkout` | event | 🟡 | سایت | realtime | کم | funel | GA4 → BQ |
| `purchase` (+ `transaction_id`, `value`) | event | 🟡 | **Webbit (order)** — GA4 فقط mirror است | realtime | متوسط (order id) | Revenue، ROAS، دی‌دوپلیکیت | GA4 + YN/TS + BQ |
| `generate_lead` (+ `lead_method` 8 مقدار، `lead_item_*`) | event | 🟡 | سایت + (برای status) شیت فروش | realtime | **بالا** (وقتی `user_id` دارد) | LQL، cost per lead، ریتارژتینگ | GA4 + YN/TS + BQ |
| `search` (+ `search_term`, `num_results`) | event | 🟡 | سایت | realtime | کم | SEO داخلی، content gap | GA4 → BQ |
| `user_id` (موبایل 11 رقم) | identifier | 🟡 (تصمیم repository: خام) | فرم/تماس | on-event | **بسیار بالا** (PII) | اتصال online↔offline، cohort | GA4 (raw) → BQ (masked view) |
| Enhanced Measurement events (`page_view`, `scroll`, `outbound_click`, `site_search`*) | event | 🟡 *تداخل با `search` سفارسی — EM site_search باید خاموش شود اگر event سفارسی داریم | GA4 EM | realtime | کم | engagement | GA4 → BQ |
| Session/user/client_id | identifier | 🟢 | GA4 | realtime | کم | identity stitching | GA4 → BQ |
| `engagement_time_msec`, `session_duration` | metric | 🟢 | GA4 | realtime | کم | کیفیت ترافیک | GA4 → BQ |

## 3.2 منبع 2 — GA4 Property (Analytics)

| داده | برچسب | توضیح | SOT | freshness | مقصد |
|---|---|---|---|---|---|
| Events (همه events بالا + `first_visit`) | 🟢/🟡 | کیفیت = تابع G1 | GA4 | realtime (~1-4h تأخیر) | گزارش‌ها، BQ |
| Dimensions: `session_source/medium`, `session_campaign`, `device_category`, `page_location`, `landing_page`, `geo`, `ad_*` | 🟢 | در دسترس | GA4 | realtime | reports |
| Metrics: sessions, users, events, `purchases` (revenue), key events, `engagement_rate` | 🟢 | در دسترس | GA4 | realtime | reports |
| **BigQuery export** (raw `events_*`) | 🔴 پیشنهادی | روزانه، رایگان — **پایه کل معماری target** | BQ | روزانه (~24h) | warehouse |
| Audiences (ریتارژتینگ: price_list 90d، PDP 30d، cart 30d، negative) | 🔴 | تعریف‌شده در `strategy/05` | GA4 | realtime | YN/TS |
| Key Events (`purchase`, `generate_lead`, `begin_checkout`) | 🟡 | هنوز mark نشده [?] | GA4 | realtime | reporting/ads |
| Offline conversion import (`purchase_offline`) | 🔴 | نیازمند user_id | Webbit/شیت | ماهانه | GA4 + BQ |
| Data retention | 🟡 | باید 14 ماه شود | GA4 Admin | — | — |
| Timezone | 🟡 | باید `Asia/Tehran` باشد [نیازمند تأیید] | GA4 Admin | — | reporting |

## 3.3 منبع 3 — کانتینر GTM (config data، نه event data)

| داده | برچسب | کاربرد | مقصد |
|---|---|---|---|
| لیست تگ‌ها/تریگرها/متغیرها (inventory) | 🟡 audit در تَسک 1 فاز 0 | governance: «چه چیزی fire می‌کند» | شیت `gtm-audit.xlsx` → repository |
| Tag history/versions (publish log) | 🟢 (در GTM در دسترس) | lineage فنی: «چه تگی چه زمانی publish شد» | mirror در «دفتر تغییرات GTM» |
| Workspace/Preview state | 🟢 | تست staging | — |
| Container settings (consent API settings اگر فعال) | 🟡 [?] | privacy | — |

## 3.4 منبع 4 — Clarity (Microsoft Clarity)

| داده | برچسب | توضیح | freshness | حساسیت | کاربرد | مقصد |
|---|---|---|---|---|---|---|
| Session recordings (sampled) | 🔴 (احتمالاً اصلاً نیست [نیازمند دسترسی]) | مشاهده مستقیم ریزش | realtime | **متوسط-بالا** (ورودی فرم‌ها داخل ریکاردینگ دیده می‌شود!) | CRO عمیق، دیباگ UX | پنل Clarity (غیرقابل export کامل) |
| Heatmaps (click/scroll/movement) | 🔴 | کجا کلیک/اسکرول | realtime | کم | CRO | Clarity |
| Rage clicks / Dead clicks | 🔴 | سیگنال UX error | realtime | کم | CRO، کیفیت | Clarity → (weekly export) |
| **JS errors** (message, page, count) | 🔴 | **ارزشمندترین برای کیفیت** | realtime | کم | DQ front-end، alert | Clarity API → BQ |
| Form analytics (abandonment, time-to-submit, field errors) | 🔴 | فرم‌های لید | realtime | **متوسط** (values فرم) | CRO فرم | Clarity API/CSV → BQ |
| Page performance (view time, FCP proxy) | 🔴 | مکمل PageSpeed | realtime | کم | CRO | Clarity |
| Clarity account/site ID | 🔴 [نیازمند دسترسی] | — | — | — | — | repository (secret-free reference) |

> **نکته حریم خصوصی Clarity:** masking (redaction) برای فیلدهای فرم موبایل/ایمیل **اجباری** است قبل از فعال‌سازی ریکاردینگ (بخش 10).

## 3.5 منبع 5 — Web Logs

| داده | برچسب | توضیح | freshness | حساسیت | کاربرد | مقصد |
|---|---|---|---|---|---|---|
| Access log (URL, UA, IP, status, latency, bytes) | 🔴 **[نیازمند دسترسی — بلوک‌کننده کل workstream]** | p95 latency، 5xx، bot detection، RUM جایگزین | stream/روزانه | متوسط (IP) | DQ سرور، security، CRO فنی | BQ (table `web_logs`) |
| 404 log | 🔴 | صفحات شکسته/لینک‌های مردگان | روزانه | کم | SEO/CRO | BQ |
| Redirect log | 🔴 | زنجیره‌های redirect (اثر روی GA4 attribution) | روزانه | کم | DQ | BQ |

> **اگر وب‌بیت لاگ ندهد** (احتمال بالایی هست چون hosted platform است): گزینه جایگزین‌ها در تصمیم D-2 (بخس 13): (a) beacon خودکار: ارسال `page_view` با `load_latency`/`navigation_type` از dataLayer به endpoint خودمان (کم‌هزینه، client-side)، (b) Cloudflare در front (اگر از ایران قابل مدیریت باشد) + analytics، (c) صرفاً Clarity JS errors + PageSpeed (حداقل ممکن). **تا تأیید D-2، هیچ pipeline لاگ ساخته نمی‌شود.**

## 3.6 منبع 6 — Webbit (فروشگاه) + پنل‌های شبکه

| داده | برچسب | توضیح | SOT؟ | freshness | حساسیت | مقصد |
|---|---|---|---|---|---|---|
| Orders (id, date, customer phone, items, value, status) | 🟢 در پنل؛ export CSV 🟡 [نیازمند تأیید A4] | **SOT برای فروش آنلاین** | ✅ | realtime (پنل) / CSV ماهانه | بالا (شماره+اسم) | شیت → BQ |
| Catalog (item_id, brand, price, variant, stock) | 🟢 | **SOT برای محصول** — join key `item_id` | ✅ | on-change | کم | reference table (monthly CSV) |
| هزینه/کلیک/ایمپرشن/تبدیل یکتانت (per campaign×creative) | 🟢 | **SOT برای هزینه** | ✅ | روزانه (خروجی پنل → شیت) | کم | شیت → BQ |
| همان برای تپ‌سول | 🟢 | SOT | ✅ | روزانه | کم | شیت → BQ |
| Conversion (YN/TS) با value | 🟡 | کیفیت value مجهول [تسک 4/5 فاز 0] | — | realtime | کم | پنل شبکه |
| Sales آفلاین (date, phone, product, value, source, status) | 🔴 | امروز غیررسمی | ✅ (بعد از ساخت) | روزانه (دستی) | **بالا** | شیت → CSV → GA4 + BQ |

## 3.7 ابعاد و شناسه‌های یکپارچه (Entity Model)

| Entity | Key | از کجا | join به |
|---|---|---|---|
| Product | `item_id` (Webbit) | catalog CSV | GA4 `items.item_id`، orders، leads (`lead_item_id`) |
| Brand | `brand` | catalog | همه product-level |
| Order | `transaction_id` (WB-*) | Webbit | GA4 `purchase`، YN/TS conversion |
| Lead | `user_id` (موبایل نرمال) | lead event + شیت فروش | GA4 `generate_lead`، offline import، orders (customer phone) |
| User | `user_id` (logged) / `client_id` (anonymous) | GA4 | cohort، LTV |
| Campaign | `utm_campaign` (standard pattern) | URL | GA4 sessions، spend sheets |
| Page | `page_location` normalized | GA4/Clarity/logs | همه behavior |

> **قانون join یکپارچه:** موبایل **همیشه** در فرمت 11 رقم بدون پیشوند (استاندارد `appendix/data-dictionary.md` بخش 3) — قبل از join، همه منابع از این normalizer استفاده می‌کنند.

---

# بخش 4 — معماری مرجع end-to-end

## 4.1 دیاگرام target (وضعیت هدف، پایان فاز 6)

```
                        LAYER 0: COLLECTORS
 ┌────────────────────────────────────────────────────────────────────┐
 │ وب‌سایت (Webbit, titana.ir)                                         │
 │  window.dataLayer: 6 event استاندارد + EM + user_id (PII)          │
 │  Clarity.js (masking فعال)                                          │
 │  [?] access log (اگر D-2 = webhook/CSV از وب‌بیت)                   │
 └──────────────┬─────────────────────────────┬───────────────────────┘
                │ یک اسکریپت (GTM فقط)        │
 ┌──────────────▼──────────────┐   ┌──────────▼──────────┐
 │ کانتینر GTM (تنها لایه تگ)   │   │ Clarity collector   │
 │ GA4 Config(1) + 6 Event     │   └──────────┬──────────┘
 │ + YN conv + TS conv (+UTM)  │              │
 └──────┬──────────────┬───────┘              │
        ▼              ▼                      ▼
 LAYER 1: PLATFORMS
 ┌──────────────┐ ┌──────────────┐  ┌──────────────────┐
 │     GA4      │ │ YN + TS      │  │  Clarity backend │
 │ retention 14m│ │ (postback ←  │  │  (API: sessions, │
 │ Key Events   │ │  offline)    │  │   errors, forms) │
 └──────┬───────┘ └──────────────┘  └────────┬─────────┘
        │ GA4→BigQuery export (روزانه، رایگان)│
 LAYER 2: WAREHOUSE (GCP / BigQuery)
 ┌──────────────────────────────────────────────────────────────────┐
 │ Project: titanamart (free tier)                                   │
 │ raw/      : events_* (GA4) · clarity_errors · clarity_forms       │
 │             web_logs (اگر D-2) · sheets_costs · sheets_offline    │
 │             webbit_orders · catalog_ref                           │
 │ marts/    : dwd_events (cleaned, tz=Tehran, dedup)                │
 │             dwd_leads (masked_pii flag) · dwd_spend · dwd_orders  │
 │ marts/    : dws_kpi_daily · dws_funnel_daily · dws_campaign_daily │
 │             dws_product_daily · dws_tracking_health               │
 │ agent/    : v_agent_kpi · v_agent_campaign · v_agent_funnel       │
 │             v_agent_lead (MASKED) · v_agent_product · v_agent_dq  │
 │ meta/     : freshness_table (source, last_success, max_date, rows)│
 └──────────────┬─────────────────────────────────┬──────────────────┘
                ▼                                 ▼
 LAYER 3: CONSUMERS
 ┌────────────────────────────┐  ┌──────────────────────────────────┐
 │ Looker Studio (12 گزارش،  │  │ AI Agent تیتانا                    │
 │ 3 هسته‌ای + گسترش)         │  │ REST/BigQuery API — READ-ONLY SA  │
 │ + ایمیل PDF هفتگی/ماهانه   │  │ فقط روی agent/* views             │
 └────────────────────────────┘  │ guardrail: freshness+lineage+     │
                                 │  "no data" policy + audit log     │
                                 └──────────────────────────────────┘
```

## 4.2 جریان داده (Data Flow) — مسیر هر داده تا مصرف

| جریان | مسیر | تدریج (freshness) | مکان DQ |
|---|---|---|---|
| رفتار آنلاین | dataLayer → GTM → GA4 → BQ `raw.events_*` → `marts.dwd_events` → `dws_*` | روزانه (BQ) + realtime (GA4 UI) | event-loss check (GTM vs GA4)، rule R1-R5 |
| خرید آنلاین | success page → GTM → GA4 `purchase` + YN/TS conv؛ Webbit order → CSV → `raw.webbit_orders` | روزانه/هفتگی | dedup `transaction_id`، value=0 rule |
| لید | 8 مسیر → GTM → GA4 `generate_lead` (+YN/TS) → BQ؛ شیت «لیدها» (status از فروش) | realtime + روزانه | lead_method null rule |
| هزینه | پنل YN/TS → شیت «هزینه‌ها» (هفتگی/روزانه) → `raw.sheets_costs` | 1-7 روز | completeness rule (هر شبکه×هفته) |
| فروش آفلاین | شیت فروش (روزانه دستی) → CSV → (a) GA4 offline import (b) `raw.sheets_offline` | روزانه→ماهانه | join success rate با orders |
| Clarity | Clarity backend → API/CSV (JS errors, forms) → `raw.clarity_*` | هفتگی (بعداً روزانه) | null-rate rules |
| Web Logs | وب‌بیت → (D-2: webhook/CSV) → `raw.web_logs` | روزانه/stream | 5xx rate، p95 latency |
| مصرف | `dws_*` → Looker Studio → PDF/ایمیل | روزانه | freshness alert |
| AI Agent | `agent/*` views (masked) → REST API → Agent | روزانه | guardrail + audit |

## 4.3 مقایسه گزینه‌ها

### گزینه A — «سبک و رایگان» (پیشنهادی)
GA4 + GTM client-side + **BigQuery free tier** (GA4 export + Clarity CSV + Sheets connector) + Looker Studio + REST API با service account.
- هزینه: **≈ 0 تومان** (free tier: 10GB storage + 1TB processing/month — در حجم B2B ما سال‌ها کفایت می‌کند؛ اگر عبور شد، قیمت BQ برای این حجم در حد چند دلار/ماه)
- سرعت راه‌اندازی: 2-3 هفته تا warehouse v0
- مقیاس‌پذیری: تا چند برابر حجم فعلی بدون تغییر
- نقاط ضعف: وابستگی به اکوسیستم GCP/Google (دسترسی از ایران — R6)، بدون orchestration خودکار (Clarity export دستی/شبکه‌ای ساده)
- مناسب: الان.

### گزینه B — «مقیاس‌پذیر/enterprise»
SS Tagging (Data Fusion) + Airbyte/Fivetran + dbt + Metabase/Looker + Dune/Mode.
- هزینه: بالای 500 دلار/ماه + هزینه infra SS + زمان setup 2-3 ماه
- مزیت: governance قوی، lineage خودکار (dbt)، scale بالا
- نقاط ضعف: **برای حجم B2B ما بیش از حد (over-engineered)**؛ با قاعده ضدپیچیدگی repository در تضاد؛ SS tagging هم ریسک R6 را دو تگ می‌کند (دو stack باید زنده بماند)
- مناسب: نه الان — فقط اگر (a) حجم events > 10x فعلی، (b) event loss > 10% با client-side، یا (c) نیاز به real-time streaming باشد (هرکدام در چک فصلی بازبینی — هم‌راستا با `strategy/05-phase-4-advanced.md` T11-12).

### گزینه C — «خود میزبان» (Postgres + Metabase + Airbyte self-hosted)
- مزیت: بدون وابستگی به Google (اگر R6 بحرانی شود)، PII کاملاً در داخل
- ضعف: نیاز به سرور + DevOps مستمر (برای ما گلوشار R8 را بدتر می‌کند)، GA4→Postgres بدون فیدر آماده (دستی/کدری) است، Clarity/logs هم‌سان
- مناسب: **Plan B فقط** اگر دسترسی به GCP از ایران غیرممکن شد (تصمیم D-1 + R6).

### انتخاب پیشنهادی و دلیل
**گزینه A** — چون: (1) GA4→BQ export رایگان و بومی است (بدون pipeline build)، (2) همان BQ هم semantic layer (views) هم masking (column-level) هم access control (SA read-only) هم audit log می‌دهد — یعنی 4 لایه حاکمیت با 0 هزینه اضافه، (3) Looker Studio رایگان و کافی برای 12 گزارش، (4) upgrade path به گزینه B بدون throw-away است (schema BQ با dbt سازگار است). **شرط:** تأیید D-1 (GCP) و R6 (دسترسی شبکه).

---

# بخش 5 — نقشه‌ی راه فاز 0 تا فاز 6

> ساختار هر فاز: هدف / خروجی قابل تحویل / کارهای دقیق (با ارجاع repository) / اولویت / پیش‌نیاز / مسئول پیشنهادی / معیار پذیرش / ریسک / روش اعتبارسنجی.
> روزها نسبت به «روز 0 = شروع فاز 0» است. قاعده repository حفظ می‌شود: **فاز بعد فقط با کامل‌شدن چک‌لیست خروجی فاز قبل**.
> نقش‌ها: **PM** = performance marketer (مالک برنامه) · **DEV** = تیم برنامه‌نویسی · **ADS** = مدیر شبکه/بودجه · **SALES** = تیم فروش · **MGR** = مدیریت.

## فاز 0 — ممیزی واقعی و تأمین دسترسی (روز 0–14) [P0]

**هدف:** «کجاییم» را با **داده** نه حدس بدانیم — خروجی: گزارش وضعیت یک‌صفحه‌ای + لیست شکاف‌ها = ورودی فاز 1 + تصمیمات D-1..D-9 گرفته شوند.

**خروجی‌های قابل تحویل:**
1. `gtm-audit.xlsx` (تگ/تریگر/متغییر × وضعیت)
2. جدول 6×2 اعتبارسنجی زنده رویدادها (DebugView)
3. لیست شکاف Property GA4 (T-A1)
4. `baseline-3m.xlsx` (فروش/هزینه/AOV/10 محصول برتر)
5. `offline-sales` 3 ماه (حتی ناقص)
6. وضعیت Clarity + Web Logs: **مستند** (داریم/نداریم/چگونه)
7. گزارش وضعیت یک‌صفحه‌ای برای MGR

**کارهای دقیق:**

| # | کار | ارجاع | مسئول | زمان |
|---|---|---|---|---|
| 0.1 | دریافت/تأیید **فایل‌های وضعیت GTM و GA4** که به‌عنوان context معرفی شدند — اگر ضمیمه نشدند، خودِ 0.2/0.3 جایگزین آن‌ها می‌شود | F2 | PM | 0.5h |
| 0.2 | ممیزی کانتینر GTM (T-G1) با Agent GTM یا دستی | `strategy/01` T1؛ `agents/prompt-gtm-agent.md` | PM (+Agent GTM) | 2h |
| 0.3 | ممیزی Property GA4 (T-A1) با Agent GA4 | `strategy/01` T3؛ `agents/prompt-ga4-agent.md` | PM (+Agent GA4) | 1.5h |
| 0.4 | اعتبارسنجی زنده 6 رویداد (DebugView + Tag Assistant) | `strategy/01` T2 | PM | 2h |
| 0.5 | ممیزی یکتانت + تپ‌سول (تبدیل‌ها + مقایسه عدد با فروش واقعی) | `strategy/01` T4-5 | PM | 3h |
| 0.6 | تست end-to-end سایت (خرید تست ارزان‌ترین محصول + 8 مسیر لید + فرم‌ها، موبایل+دسکتاپ) | `strategy/01` T6 | PM | 2h |
| 0.7 | PageSpeed 3 صفحه + چک تکراری بودن اسکریپت GTM | `strategy/01` T7 | PM | 1h |
| 0.8 | بنچمارک 3 ماهه: CSV سفارش Webbit + گزارش 3 ماهه YN/TS | `strategy/01` T8 | PM + MGR (دسترسی) | 2h |
| 0.9 | جلسه 30دقیقه‌ای فروش: محل ثبت فعلی آفلاین + 3 ماه داده | `strategy/01` T9 | PM + SALES | 1h |
| 0.10 | **چک Clarity:** آیا `clarity.js` روی سایت هست؟ اگر نه → پیشنهاد نصب در فاز 1؛ اگر هست → account ID + sampling + masking وضعیت | F4 | PM + DEV | 0.5h |
| 0.11 | **درخواست Web Logs از وب‌بیت/هستدینگ:** access log (CSV/webhook/API) — اگر «نه» → تصمیم D-2 (جایگزین) | F5، R11 | PM + DEV lead | 1h + انتظار |
| 0.12 | **تأیید وابستگی‌ها:** A3 (success page URL)، A4 (CSV سفارش)، A7 (دسترسی Admin)، D4 (شبکه/VPN) | 1.4، 1.5 | PM + MGR | 1h |
| 0.13 | برگزاری جلسه تصمیم: D-1..D-9 (بخش 13) با MGR | — | PM + MGR | 1h |
| 0.14 | نگارش گزارش وضعیت + ارسال | `strategy/01` T10 | PM | 2h |

**اولویت:** P0 (کل برنامه روی این می‌چرخد).
**پیش‌نیاز:** دسترسی‌های D4/D8/A7 (قبل از شروع).
**معیار پذیرش (DoD):** همه 7 خروجی تحویل‌شده + چک‌لیست خروجی `strategy/01-phase-0-audit.md` ✅ + حداقل 4 تصمیم (D-1, D-2, D-5, D-9) مستند.
**ریسک‌ها:** R1 (مهم‌ترین)، R6، R8.
**اعتبارسنجی:** مرور 2 نفره (PM + یک نفر مستقل از MGR) گزارش وضعیت با «آیا هر عدد منبع دارد؟» + بازبینی 10 نمونه رویداد در DebugView.

## فاز 1 — بنیان داده: dataLayer + GTM + GA4 + شبکه‌ها (روز 14–45) [P0]

**هدف:** «زیرساخت جمع‌آوری داده ساخته شد» — دقیقاً مطابق `strategy/02-phase-1-data.md` (24 تسک) **به‌علاوه** نصب Clarity.

**خروجی‌های قابل تحویل:** dataLayer 6 event زنده (T1–T7) · کانتینر تمیز (1 Config، 6 Event DL-based، 2 conv شبکه، 0 tag بی‌نام) · GA4 (14m retention، internal filter، EM تنظیم‌شده، 3 Key Events، timezone) · YN/TS با value داینامیک · **Clarity نصب با masking** · ماتریس تست 3× (GA4/YN/TS) سبز.

**کارهای دقیق:** همه تسک‌های A–F فاز 1 repository (ارجاع کامل در `strategy/02` و `appendix/dev-tasks.md` T1–T7) + موارد جدید:

| # | کار جدید (فراتر از repository) | مسئول | زمان |
|---|---|---|---|
| 1.0 | (خارج از repository) **نصب Clarity از طریق GTM** (Custom HTML تگ، account/site ID) + **redaction** فیلدهای phone/email + sampling=10% + JS error tracking فعال | PM (در GTM) | 1h |
| 1.1 | (جدید) اندازه‌گیری **event loss** اولیه: تعداد events در GTM Preview/Debug vs GA4 (فرمول در بخش 8.7) — خروجی: عدد پایه برای تصمیم SS (D-8) | PM | 2h |
| 1.2 | (جدید) ستون `source` در شیت‌ها: هر داده‌ی واردشده برچسب GA4/Sheets/Network/BQ بگیرد (بند پایه lineage) | PM | 1h |

**اولویت:** P0. **پیش‌نیاز:** DoD فاز 0 + ظرفیت DEV (A6) + کد Conversion شبکه‌ها (D5).
**مسئول:** PM (GTM/GA4/شبکه) + DEV (T1–T7) + Agent GTM/GA4 (با پرامپت‌های `agents/`).
**معیار پذیرش:** چک‌لیست خروجی `strategy/02-phase-1-data.md` ✅ + Clarity session/recording اولین session واقعی + event loss عدد پایه ثبت‌شده.
**ریسک‌ها:** R4، R10، R8.
**اعتبارسنجی:** خرید تست سه‌جانبه (GA4+YN+TS = 1 عدد با یک `transaction_id`) + 8/8 لید + ماتریس 10 ردیفی Preview سبز + «یک ماه جمع‌آوری» شروع می‌شود (خاتمه در فاز 3).

## فاز 2 — Warehouse v0 + داشبورد + ریتم (روز 45–75) [P0]

**هدف:** «داده یک‌جا جمع می‌شود و تیم از روی 3 داشبورد تصمیم می‌گیرد» — repository `strategy/03` + **warehouse v0** (بند جدید نسبت به repository که BQ را تعویق زده بود — D-1).

**خروجی‌های قابل تحویل:**
1. GCP project `titanamart` + GA4→BQ link (اولین `events_*` ظاهر شد)
2. Tables raw: `clarity_errors`/`clarity_forms` (هفتگی)، `sheets_costs`، `sheets_offline`، `webbit_orders`، `catalog_ref` (+ `web_logs` اگر D-2 تأیید شد)
3. `marts.dwd_events` (dedup + tz=Tehran) و 3 شیت استاندارد
4. 3 داشبورد Looker (مدیریتی/فانل/CRO) + ایمیل PDF هفتگی شنبه‌ها
5. جدول `kpi-baseline` (7 KPI با مقدار فعلی + هدف 3 ماهه)
6. شیت «هزینه‌ها» + «فروش آفلاین» + «لیدها» فعال

**کارهای دقیق:**

| # | کار | ارجاع | مسئول | زمان |
|---|---|---|---|---|
| 2.1 | ساخت/لینک GCP project + GA4→BigQuery (روز 1 export = proof of concept) | D-1 | PM + MGR | 2h + 24h |
| 2.2 | ساخت 3 شیت (هزینه/آفلاین/لید) + اولین ورودی | `strategy/03` T1-3 | PM + SALES | 5h + هماهنگی |
| 2.3 | Tables raw در BQ: Sheets connector (costs/offline/leads) + import CSV (orders/catalog) + Clarity API→storage→BQ (script ساده، هفتگی) | جدید | PM (+DEV برای script Clarity) | 4h |
| 2.4 | `dwd_events`: query استاندارد (dedup روی `transaction_id`، تبدیل tz، فیلتر internal) | جدید | PM | 3h |
| 2.5 | 3 داشبورد Looker | `strategy/03` T4-6 | PM | 11h |
| 2.6 | ایمیل هفتگی خودکار + جدول KPI | `strategy/03` T7-8 | PM | 3.5h |
| 2.7 | Q1: آیا Clarity API از داخل ایران قابل صدازنی است؟ اگر نه → export دستی CSV (هفتگی، 10 دقیقه) | R6 | PM | 0.5h |

**اولویت:** P0. **پیش‌نیاز:** DoD فاز 1 (داده سالم در جریان باشد) + D-1 تأیید + D4 (دسترسی GCP).
**معیار پذیرش:** چک‌لیست `strategy/03` ✅ + `SELECT COUNT(*) FROM events_YYYYMMDD` = >0 برای 7 روز متوالی + 2 ایمیل هفتگی رسیده.
**ریسک‌ها:** R6، R9، D3.
**اعتبارسنجی:** مقایسه عدد `purchase` در BQ با عدد پنل GA4 و CSV Webbit (3 عدد باید یکی باشند ± 1%)؛ test join `webbit_orders × dwd_events` روی `transaction_id`.

## فاز 3 — کیفیت داده، حاکمیت، امنیت (روز 75–105) [P0→P1]

**هدف:** «داده قابل اتکا است و مصرف‌کننده (انسان و Agent) می‌تواند به آن اعتماد کند» — **بند کاملاً جدید** نسبت به repository.

**خروجی‌های قابل تحویل:**
1. 5 rule DQ خودکار + جدول `meta.freshness_table` + alert (ایمیل، بعداً Telegram)
2. `marts.dws_*` (5 جدول: kpi/funnel/campaign/product/tracking_health)
3. 6 `agent/*` views masked + service account read-only + audit log
4. `LINEAGE.md` + data dictionary نسخه‌دار (v1.1) + RACI داده
5. گزارش «سلامت داده» ماه اول (خاتمه یک‌ماه جمع‌آوری فاز 1 — تسک 24)

**کارهای دقیق:**

| # | کار | جزئیات | مسئول | زمان |
|---|---|---|---|---|
| 3.1 | قواعد DQ (SQL scheduled): R1: %`purchase` با value=0/null <5 · R2: duplicate `transaction_id` = 0 · R3: %`generate_lead` بدون `lead_method` = 0 · R4: freshness GA4→BQ <48h · R5: event loss <10% (GTM fire count vs GA4 count) | نتیجه روزانه در `dws_tracking_health` | PM | 6h |
| 3.2 | Alert: query ساده (scheduled query + email notification در BQ) برای شکستن هر rule | — | PM | 2h |
| 3.3 | `dws_kpi_daily`/`dws_funnel_daily`/`dws_campaign_daily`/`dws_product_daily` (schemaها در بخش 9.2) | join استاندارد بخش 3.7 | PM | 8h |
| 3.4 | 6 `agent/*` views + masking (section 9) + SA + IAM + audit | — | PM | 6h |
| 3.5 | `LINEAGE.md`: source → table → view → report/agent + owner هر منبع + SOT (از بخش 3) | — | PM | 3h |
| 3.6 | Privacy hardening: بررسی دسترسی‌های GA4 (Viewer/Editor/Admin list)، محدود کردن دسترسی BQ، policy موبایل (D-5) | بخش 10 | PM + MGR | 3h |
| 3.7 | گزارش سلامت داده (تسک 24 فاز 1): نرخ خطا + دپلیکیت + یک‌صفحه‌ای | `strategy/02` T24 | PM | 1 روز |

**اولویت:** P0 (برای اعتبارپذیری) — P1 (برای گسترش). **پیش‌نیاز:** DoD فاز 2 + یک ماه داده.
**معیار پذیرش:** 5 rule روی چرخه (2 هفته بدون false-positive) + Agent می‌تواند با SA فقط روی views query بزند (test: query روی `raw/` = denied) + هر KPI در داشبورد یک سطر lineage دارد.
**ریسک‌ها:** R7، R10. **اعتبارسنجی:** «حمله آزمون»: 3 query آگاهانه‌ی بد (PII read، raw read، stale data) باید یا block یا flag شوند.

## فاز 4 — CRO با داده (روز 105–150) [P1]

**هدف:** «همان ترافیک، فروش بیشتر» — مطابق `strategy/04`، اما **ورودی‌ها حالا data-driven واقعی‌اند**: dashboards (فاز 2) + Clarity (rage clicks, form analytics) + search data.

**خروجی‌ها:** 4+ پروژه CRO بسته با قبل/بعد · 6+ سطر log · لندینگ اختصاصی 2 کمپین · 2 محتوای سوالی.
**کارها:** `strategy/04` T1–T5 بدون تغییر + افزودن Clarity به روش کار: هر پروژه CRO یک «پکیت Clarity» می‌گیرد (5 ریکاردینگ + rage click top 5 صفحه هدف قبل/بعد تغییر).
**اولویت:** P1. **پیش‌نیاز:** DoD فاز 2 (داشبورد 2 مقدس) + فاز 3 (DQ) برای اطمینان از اعداد قبل/بعد.
**معیار پذیرش:** چک‌لیست `strategy/04` ✅ + نرخ تبدیل (حداقل یک فانل) بهتر از بنچمارک فاز 2.
**ریسک‌ها:** ریزش آزمون‌ها به‌خاطر ترافیک کم B2B (ریتم قبل/بعد به‌جای A/B — همان repository).
**اعتبارسنجی:** log کامل + مرور فصلی اولین‌بار (پایان فاز).

## فاز 5 — حلقه آفلاین + ریتارژتینگ + LTV (روز 150–200) [P1]

**هدف:** «آخرین تکه معماری» — مطابق `strategy/05`: `purchase_offline` در GA4 روی چرخه ماهانه · postback آفلاین به YN/TS · 3 مخاطب ریتارژتینگ + negative · 100% UTM standard · گزارش LTV/سگمنت v1 · اولین جابجایی بودجه 70/30 با ROAS واقعی.
**افزوده (warehouse):** `sheets_offline` → `dws_kpi_daily` با flag `revenue_type (online/offline)` — یعنی ROAS در همه گزارش‌ها **به‌صورت پیش‌فرض شامل آفلاین** است (نکته کلیدی `strategy/03`).
**پیش‌نیاز:** DoD فاز 4 + user_id در لیدها (فاز 1) + شیت آفلاین پرشده 8+ هفته.
**معیار پذیرش:** چک‌لیست `strategy/05` ✅ + join موفق 3 ماه offline×GA4.
**ریسک‌ها:** R9 (انضباط ثبت)، D6 (postback شبکه‌ها — اگر پشتیبانی نشود، fallback = لیست شماره/CSV طبق مستندات شبکه).

## فاز 6 — AI Agent v1 + سیستم مستمر (روز 200+) [P1→P2]

**هدف:** «Agent هوشمند با داده تمیز و قابل اتکا پاسخ می‌دهد + سیستم هرگز خاموش نمی‌شود».

**خروجی‌ها:**
1. **Agent v1:** 6 view + REST API + guardrail (بخش 9) + «truth test» هفتگی (10 سؤال استاندارد؛ پاسخ Agent باید با داشبورد ±2% یکی باشد)
2. چک سلامتی فصلی خودکار‌شده (60% از چک‌لیست `strategy/06` با query)
3. ریتم هفتگی/ماهانه/فصلی روی تقویم تیم (نه شخصی)
4. بازبینی «خروج از محدوده» (آیا حالا BQ/SS/CRM لازم شد؟ — با داده، نه حدس)

**پیش‌نیاز:** DoD فاز 5 + D-9 (هویت فنی Agent) + 3 ماه داده تمیز.
**معیار پذیرش:** truth test 2 هفته پشت‌سرهم سبز + 0 پاسخ Agent بر اساس داده بدون freshness (audit) + چک‌لیست ورود به «سیستم» `strategy/06` ✅.
**اعتبارسنجی:** audit log BQ (هر query Agent) + بازبینی هفتگی 10 query نمونه توسط PM.

---

# بخش 6 — Quick Wins: ۷ / ۳۰ / ۹۰ روزه

## 7 روز اول (قبل از/هم‌زمان با شروع فاز 0) — «توقف خونریزی»

| # | Quick Win | تلاش | خروجی | بلوک؟ |
|---|---|---|---|---|
| QW1 | Data Retention → 14 ماه | 5 دقیقه | داده تاریخی نپرد | خیر (فوری) |
| QW2 | Internal Traffic Filter (IP دفتر) | 30 دقیقه | KPI تمیزتر | نیاز IPها (MGR) |
| QW3 | timezone → Asia/Tehran (اگر نیست) | 10 دقیقه | گزارش‌های روزانه منطقی | خیر |
| QW4 | Key Events: purchase/begin_checkout (+generate_lead وقتی موجود شد) | 30 دقیقه | reporting/ads درست | خیر |
| QW5 | ممیزی GTM: تعداد GA4 Configuration (باید 1) + لیست تگ بی‌نام | 2 ساعت | لیست تمیزکاری | خیر |
| QW6 | شیت «فروش آفلاین» + اولین 2 هفته history + توافق SALES (5 دقیقه روزانه) | 3 ساعت | نیمه‌ی درآمد دیگر گم نمی‌شود | نیاز MGR |
| QW7 | Clarity: نصب/تأیید + masking (اگر نصب نبود، فقط Custom HTML تگ) | 1 ساعت | session-level دید | خیر |
| QW8 | درخواست رسمی Web Logs از وب‌بیت (ticket) | 30 دقیقه | ticket + پاسخ اولیه | بلوک‌کننده workstream لاگ فقط |

## 30 روز (پایان فاز 0 + شروع فاز 1)

| # | Quick Win | تلاش | خروجی |
|---|---|---|---|
| QW9 | 6/6 event در dataLayer روی PDP + model + cart (T1–T2 حداقل) | DEV 1.5 روز | view_item/add_to_cart سالم |
| QW10 | `purchase` روی success page با `transaction_id` (T3) | DEV 1 روز | revenue قابل دی‌دپلیکیت |
| QW11 | `generate_lead` 8 مسیر (T4) + user_id فرم (T5) | DEV 1.5 روز | لیدها قابل شمارش + قابل اتصال |
| QW12 | GA4→BigQuery link + اولین export | 2 ساعت | warehouse v0 روشن |
| QW13 | 3 شیت (costs/offline/leads) + شیت هزینه‌های 30 روز اول | 5 ساعت | داده هزینه در جریان |
| QW14 | UTM standard روی کمپین‌های **فعال فعلی** (نه فقط جدید) | 2 ساعت + پایش | بودجه دارای ردپا |
| QW15 | بنچمارک 3 ماهه `baseline-3m` تحویل MGR | 2 ساعت | زبان مشترک اعداد |

## 90 روز (پایان فاز 2 + شروع 3)

| # | Quick Win | تلاش | خروجی |
|---|---|---|---|
| QW16 | 3 داشبورد + ایمیل هفتگی شنبه‌ها (2 تا پشت‌سرهم) | 2 روز | تصمیم از روی یک منبع |
| QW17 | `dwd_events` + `dws_kpi_daily` + 5 rule DQ روی چرخه | 2 روز | «داده سالم» از حس → اندازه |
| QW18 | 6 `agent/*` views masked + SA read-only | 2 روز | Agent **امروز** (نه 200 روز دیگر) می‌تواند KPIهای پایه بپرسد |
| QW19 | یک ماه داده: گزارش سلامت داده (error rate <5%؟) | 1 روز | اعداد برای MGR |
| QW20 | Clarity: اولین گزارش «top 5 rage click + top 5 JS error» → ورود به log CRO | 2 ساعت | اولین بینش UX با داده |

> **منطق Quick Winها:** 7 روز = «دیگر چیزی نمی‌دزدیم» (retention/filter/PII) · 30 روز = «داده درست می‌آید» · 90 روز = «دیده می‌شود و قابل اتکا است» — و Agent از روز 90 داده واقعی (هرچند پایه) دارد، نه از روز 200.

---

# بخش 7 — کاتالوگ گزارش‌ها و داشبوردها

> هر گزارش: KPIها / ابعاد / فیلترها / سطح جزئیات / تناوب / منبع / فاز. سه گزارش اول = هسته‌ای (فاز 2، مطابق repository)؛ بقیه گسترش (فاز 3+).

| # | گزارش | KPIها | ابعاد | فیلترها | جزئیات | تناوب | منبع | فاز |
|---|---|---|---|---|---|---|---|---|
| 1 | **مدیریتی (Executive)** | فروش کل (on+off)، ROAS واقعی، AOV، CPA، CPL، LTV متوسط | ماه، شبکه، فانل | دوره، شبکه | کارت KPI + روند ماهانه | هفتگی (PDF شنبه) + ماهانه | BQ dws_kpi + شیت‌ها | 2 |
| 2 | **فانل (Funnel)** | نرخ هر پله + **بزرگ‌ترین افت (خودکار)** | p1: sessions→view_item→cart→checkout→purchase · p2: view_item→lead (8 method) | device، channel، lead_method، brand | جدول پله‌ای + % افت | هفتگی | GA4/BQ | 2 |
| 3 | **سایت/CRO** | top10 view_item، top خروجی، CVR mobile vs desktop، search terms، دانلود لیست قیمت per brand | page، device، search_term | page path، برند | جدول 10 ردیف + trend | هفتگی | GA4 + Clarity (phase 4: rage clicks) | 2 |
| 4 | **Acquisition** | sessions، users، new users، engagement rate per source/medium | source/medium، landing page، device | دوره، geo (ایران-only) | جدول کانال + trend 12h | هفتگی | GA4/BQ | 2-3 |
| 5 | **Traffic** | sessions، bounce (GA4: engagement)، avg session duration، pages/session | page_path، device، channel | مسیر (product/model/cart/...) | جدول top 50 page | هفتگی | GA4/BQ (+Clarity scroll depth) | 3 |
| 6 | **Conversion** | CVR (purchase)، CVR (lead)، cart drop rate، checkout drop rate | device، channel، brand، page | دوره، segment (new/returning) | trend + split | هفتگی | BQ dws_funnel | 3 |
| 7 | **Campaign/UTM** | spend، clicks، CTR، conv، CPA، CPL، **ROAS (شامل آفلاین 8 هفته‌ای)** | network × campaign × creative (utm_content) | شبکه، کمپین، 8 هفته | جدول کمپین + budget allocation 70/30 | هفتگی + تصمیم ماهانه | شیت هزینه + GA4 + آفلاین | 3 (ROAS کامل: 5) |
| 8 | **Landing Page** | CVR per landing، message-match score (دستی)، time-on-page، scroll depth | landing URL، کمپین منبع | دوره | جدول 10 لندینگ برتر | هفتگی | GA4 + Clarity | 3-4 |
| 9 | **SEO (Internal + Organic)** | top20 search_term، % zero-result، CVR از نتایج جستجو، organic sessions/trend | search_term، result page | دوره | جدول سرچ + content gap list | هفتگی | GA4 `search` + (اگر GSC تأیید شد: queries) | 3 |
| 10 | **Retention/Cohort** | بازگشت ماهانه، بازخرید 90d، LTV per cohort، purchase cycle | cohort (اولین visit/اولین purchase)، brand، segment (فردی/عمده) | cohort | جدول cohort + LTV curve | ماهانه | BQ (user_id) + آفلاین | 5 |
| 11 | **User Behavior** | rage clicks، dead clicks، JS error count، form abandonment، scroll depth per page | page، browser، device | صفحه‌ی هدف CRO | top 10 + session sample link | هفتگی | **Clarity** | 3-4 |
| 12 | **Tracking Health (DQ)** | error rate (R1-R5)، event loss %، freshness lag h، network vs actual diff %، duplicate count | rule، source، روز | دوره | تابلو سلامت + alert history | هفتگی (خودکار) | `dws_tracking_health` | 3 |
| 13 | **Cost/Performance** | spend per network/campaign، cost per **customer** (نه lead)، ROAS real (8w)، budget efficiency | network، campaign، creative، week | دوره | جدول + 70/30 allocation | ماهانه | شیت‌ها + BQ | 3 (کامل: 5) |

> **قاعده:** هر گزارش فقط از `marts/agent` views می‌خواند (single semantic layer) — هیچ گزارش مستقیم از `raw/` نمی‌سازد. هر KPI یک فرمول مکتوب در data dictionary دارد (بخش 8.4).

---

# بخش 8 — برنامه تکمیل GA4/GTM

## 8.1 dataLayer Schema (مرجع واحد: `appendix/data-dictionary.md` بخش 2)

اسکیم 6 event **بدون تغییر** همان repository است (view_item، add_to_cart، begin_checkout، purchase، generate_lead، search). دو افزودن تکمیلی (v1.1) که باید در data dictionary ثبت شوند:

```json
// افزودن 1: context هر event (برای lineage و DQ)
{ "event": "view_item",
  "ecommerce": { "...": "same as dictionary" },
  "page_type": "pdp",
  "meta": { "page_version": "v1.1", "sent_at": 1758000000000 } }

// افزودن 2: Clarity session stitching — لازم نیست (Clarity خودش client_id دارد)
// — یعنی هیچ field PII جدیدی به dataLayer اضافه نمی‌شود
```

> `meta.sent_at` (epoch ms) برای اندازه‌گیری latency dataLayer→GA4 در DQ (R5) استفاده می‌شود. `user_id` فقط در `generate_lead` (طبق dictionary بخش 3) — **هرگز** در eventهای e-commerce.

## 8.2 Naming Conventions (یکپارچه، از repository + تکمیل)

| شیء | الگو | نمونه |
|---|---|---|
| GTM Tag (GA4) | `GA4 - {{Page}} - {{Action}}` | `GA4 - PDP - View Item` |
| GTM Tag (شبکه) | `{{YN\|TS}} - {{purchase\|lead}}` | `YN - Purchase (Dynamic Value)` |
| GTM Variable (DL) | `dl_{{field}}` | `dl_lead_method`، `dl_ecommerce_items` |
| GTM Trigger | `DL - {{event}} {{scope}}` | `DL - view_item (PDP+Model)` |
| BQ table (raw) | `{{source}}_{{entity}}` | `clarity_errors`، `sheets_costs` |
| BQ table (mart) | `dwd_{{entity}}` / `dws_{{topic}}_{{freq}}` | `dwd_leads`، `dws_kpi_daily` |
| Agent view | `v_agent_{{topic}}` | `v_agent_funnel` |
| Campaign | `{{ykt\|tsc}}_{{campaign}}_{{creative}}_{{placement}}` | `ykt_tstrong_pkg100_creative-02` (طبق dictionary بخش 4) |
| Event names | فقط 6 نام dictionary + EM defaults — **اختراع نام ممنوع** | — |

## 8.3 Event Taxonomy (نهایی)

| لایه | Events | وضعیت |
|---|---|---|
| **Core 6** (DL-based فقط) | `view_item`، `add_to_cart`، `begin_checkout`، `purchase`، `generate_lead`، `search` | فاز 1 |
| **Optional** (فقط با گلوگاه CRO) | `remove_from_cart`، `add_payment_info` | فاز 4 |
| **Enhanced Measurement** | `page_view`، `scroll`، `outbound_click`، **`site_search` = خاموش** (تداخل با `search` core) | فاز 1 (تنظیم) |
| **Offline** | `purchase_offline` (import فقط) | فاز 5 |
| **حذف/ممنوع** | هر event تکراری از کد مستقیم صفحه، gtag جدا، conversion خارج از GTM | فاز 1 (پاکسازی) |

## 8.4 Trigger/Tag/Variable Matrix

| Event | Trigger | Variable‌های ورودی | Tag مقصد | Key Event |
|---|---|---|---|---|
| view_item | DL `event=view_item` (PDP+model — یک trigger با `dl_page_type in (pdp,model)`) | `dl_ecommerce_*` | GA4 Event + (EM off برای view) | خیر |
| add_to_cart | DL `event=add_to_cart` | `dl_ecommerce_*` | GA4 Event | خیر |
| begin_checkout | DL `event=begin_checkout` | `dl_ecommerce_*` | GA4 Event | ✅ |
| purchase | DL `event=purchase` (فقط success page — trigger با `dl_page_type=success`) | `dl_ecommerce_*` شامل `transaction_id` | GA4 Event + YN conv (value داینامیک) + TS conv | ✅ |
| generate_lead | DL `event=generate_lead` | `dl_lead_method`، `dl_user_id`، `dl_lead_item_*` | GA4 Event + YN conv + TS conv | ✅ |
| search | DL `event=search` | `dl_search_term`، `dl_num_results` | GA4 Event | خیر |

**قاعده‌های تریگر (از repository، بدون استثنا):** برای Core 6 هرگز Click-based trigger؛ هر تریگر یک سطر در شیت ممیزی؛ هر publish یک سطر در «دفتر تغییرات GTM».

## 8.5 Consent و Privacy (trade-off و انتخاب)

| گزینه | وضعیت |
|---|---|
| Google Consent Mode v2 | **لازم نیست** (EU-only mechanism) — اما اگر روزی ترافیک خارجی/پیکسل خارجی اضافه شد، بازبینی |
| Cookie banner سایت | در ایران الزام قانونی قطعی برای این حجم نداریم **[نیازمند تأیید حقوقی — D-6]**؛ پیشنهاد: **notice ساده** روی فرم‌ها («شماره شما فقط برای تماس فروش ثبت می‌شود») — هزینه: 10 دقیقه، اعتماد: بالا |
| PII در dataLayer/GA4 | موبایل فقط در `generate_lead` (تصمیم فعلی) — **تصمیم D-5**: خام vs hash (SHA-256). اگر hash: ایمپورت آفلاین هم hash (GA4 user_id hash قبول می‌کند؟ **باید در فاز 1 تست شود** — test: import کوچک 20 ردیفی) |
| Clarity | **redaction اجباری** برای فیلدهای phone/email (بخش 10) |
| Warehouse | `raw/` محدود (PM only)؛ views agent = masked؛ `dwd_leads.phone_hash` + `phone_last4` فقط |

## 8.6 Cross-Domain

- حالت فعلی: تکی‌دامنه‌ای (`titana.ir`) — **اگر** A2 تأیید شد، کاری لازم نیست.
- اگر bot/پنل زیردامنه جدا داشت (مثلاً `bot.titana.ir`): cross-domain link در GA4 config + user_id stitching (که با Mوبایل داریم) — **در فاز 1 با 30 دقیقه** قابل پیاده‌سازی. **[نیازمند تأیید A2]**

## 8.7 Server-Side vs Client-Side (trade-off مستند)

| معیار | Client-side (فعلی/پیشنهاد) | Server-side (Data Fusion) |
|---|---|---|
| هزینه | 0 | infra + GCP billing + نگهداری |
| ad-block loss | در ایران پایین تخمین می‌شود — **عدد پایه در 1.1 فاز 1 اندازه‌گیری می‌شود** | حذف |
| PII control | PII در مرورگر کاربر می‌ماند | PII در server ما |
| پیچیدگی | کم (همان stack فعلی) | بالا (2 stack: container + server) |
| R6 (دسترسی) | یک stack | دو stack |
| **تصمیم** | **حالا client-side** — gate: اگر event loss >10% (R5) یا نیاز PII server-side → بازبینی رسمی (هم‌راستا با repository T11 فاز 4/5) | — |

## 8.8 تست در Staging/Production + جلوگیری از Duplicate

**Staging:** Webbit staging وجود ندارد [نیازمند تأیید] → **پروتکل جایگزین:**
1. تغییرات کد → روی **محصول تست** (ارزان‌ترین، با برچسب تست) در production تست می‌شود (همان T6/0.6)
2. هر تغییر GTM: Workspace → **Preview** (10 ردیفی `prompt-gtm-agent.md` T-G6) → publish
3. بعد از publish: **DebugView** production + یک خرید/لید تست واقعی
4. **هرگز** publish بدون: ① Preview سبز ② خط در دفتر تغییرات ③ چک «فقط یک Configuration tag»

**Anti-Duplicate checklist (اجباری در هر publish و چک ماهانه):**
- [ ] اسکریپت GTM دقیقاً یک بار در `<head>` (T7 dev-tasks) — در 5 صفحه کل
- [ ] هیچ gtag/فید مستقیم خارج از GTM در HTML نیست
- [ ] `purchase` فقط روی success page (trigger `dl_page_type=success`)
- [ ] dedup روی `transaction_id` در `dwd_events` (R2 = 0)
- [ ] EM `site_search` خاموش (conflict با `search` core)
- [ ] `view_item` در یک page load فقط یک بار (PDP و model صفحات جدا هستند — دو بار در دو صفحه = درست؛ دو بار در یک صفحه = باگ)
- [ ] conversion شبکه فقط از GTM (نه کد مستقیم پنل + GTM هم‌زمان)

---

# بخش 9 — قرارداد داده و API برای AI Agent

## 9.1 معماری دسترسی

```
AI Agent تیتانا
   │  HTTPS + Bearer (Service Account / API key)
   ▼
REST wrapper (فاز 6; فاز 3: مستقیم BigQuery API)
   │  فقط: SELECT از agent/* views
   ▼
BigQuery: titanamart
   ├── agent/v_agent_* (masked, daily, documented)   ✅ permitted
   ├── meta/freshness_table                            ✅ permitted
   ├── marts/*                                          ⛔ (Agent: ممنوع — فقط Looker)
   └── raw/*                                            ⛔ (ممنوع — PII/خام)
```

- **Access:** Service Account read-only (IAM) فقط روی dataset `agent` و `meta`؛ کلیدها در secret store Agent؛ **هرگز** کلید با دسترسی marts/raw.
- **Audit:** BigQuery Data Access logging روشن → هر query Agent ثبت می‌شود؛ بازبینی هفتگی 10 query (فاز 6).
- **Rate limit:** wrapper: حداکثر 60 query/ساعت، 100k row/answer.

## 9.2 Views مجاز (contract v1) — 6 view + schema

| View | سطرها | freshness SLA | استفاده مجاز |
|---|---|---|---|
| `v_agent_kpi` | 1 row/روز: date, revenue_online, revenue_offline, revenue_total, orders, aov, leads, cpl, spend, roas_real, conv_rate | ≤48h | «فروش این ماه چند بود؟» |
| `v_agent_campaign` | 1 row/کمپین/روز: network, campaign, creative, spend, clicks, conv, cpa, roas_8w | ≤48h | «بهترین کمپین کدام است؟» |
| `v_agent_funnel` | 1 row/روز/فانل: step, count, drop_rate, biggest_bottleneck | ≤48h | «کجای فانل ریزش دارد؟» |
| `v_agent_lead` | 1 row/لید (masked): date, lead_method, phone_last4 (+ hash)، brand، status | ≤24h | «کیفیت لیدهای واتساپ؟» — **هرگز موبایل کامل** |
| `v_agent_product` | 1 row/محصول/روز: item_id, brand, views, carts, purchases, revenue, lead_brand | ≤48h | «محصول پرفروش‌ترین برند X؟» |
| `v_agent_dq` | 1 row/rule/روز: rule_id, status(ok/warn/fail), value, threshold | ≤48h | «داده‌ها سالمند؟» |

## 9.3 Freshness و Lineage (اجباری در هر پاسخ Agent)

1. هر view ستون `as_of_date` + `generated_at` دارد.
2. `meta.freshness_table`: `source | last_success_at | max_date | row_count | status`.
3. **System prompt Agent (قاعده 1):** «هر پاسخ عددی باید با `as_of_date` شروع شود. اگر `freshness_table.status != ok` برای منبع مربوطه باشد، پاسخ باید صریح بگوید «داده کامل نیست» و دلیلش را بگوید.»
4. **قاعده 2 (ضد no-data):** اگر query نتیجه خالی داد → «داده‌ای در این بازه وجود ندارد» — **هرگز** extrapolate/تخمین بدون برچسب `estimate`.
5. **قاعده 3 (lineage):** هر KPI در پاسخ، منبعش را می‌گوید (GA4/Sheets/Network) — از `LINEAGE.md` (فاز 3).
6. **Truth test هفتگی** (فاز 6): 10 سؤال استاندارد؛ پاسخ Agent ±2% با داشبورد 1 مقایسه می‌شود؛ شکست = incident + بازبینی view.

## 9.4 جلوگیری از Hallucination و گزارش بر داده ناقص

| مکانیزم | توضیح |
|---|---|
| فقط views (نه free-text table) | Agent نمی‌تواند جدول نامعلوم بسازد — contract بسته است |
| `v_agent_dq` در هر session | Agent قبل از تحلیل، health را می‌پرسد؛ اگر fail → هشدار در هر پاسخ |
| masking | PII در اصلاً در دسترس Agent نیست (بخش 10) |
| answer template | `عدد + as_of + منبع + (a) DQ status + (b) caveat اگر باشد` |
| human-in-the-loop | پاسخ‌های «تصمیم‌ساز» (جابجایی بودجه، توقف کمپین) فقط **پیشنهاد** — تصمیم با انسان (قاعده `agents/README.md` — Golden rule) |
| audit + truth test | ردپای هر query + تست هفتگی (9.3) |

---

# بخش 10 — امنیت و حریم خصوصی

| # | موضوع | سیاست | فاز |
|---|---|---|---|
| S1 | PII inventory | فقط 2 PII: **موبایل** (لید/سفارش) و **IP** (logs/GA4). ایمیل فعلاً جمع نمی‌شود (اگر اضافه شد → این جدول به‌روز شود) | 3 |
| S2 | موبایل در GA4 | تصمیم D-5 (خام vs hash) — تا تصمیم: فقط در `generate_lead` و بدون dashboard نمایش | 1→3 |
| S3 | Moding در warehouse | `phone_hash = SHA256(normalized)` + `phone_last4`؛ raw فقط در `raw.sheets_offline`/`webbit_orders` با access محدود | 3 |
| S4 | Clarity masking | redaction اجباری phone/email + sampling 10% + retention ریکاردینگ: 90 روز (حداقل ممکن در Clarity) | 1 |
| S5 | RBAC — GA4 | Admin: فقط MGR+PM · Editor: PM · Viewer: SALES، ADS | 3 |
| S6 | RBAC — GCP/BQ | Owner: MGR+PM · raw: PM only · marts: PM+Agent-SA(read) · agent views: Agent-SA + PM | 3 |
| S7 | دسترسی‌های پنل شبکه | 2FA اجباری؛ دسترسی‌ها list در repository (بدون credential) | 0 |
| S8 | credential management | هیچ token/password در repository/شات — فقط نام اکانت + نقش؛ secretها در Google Secrets/1Password | 0 |
| S9 | audit | GA4 Admin activity + BQ Data Access log + GTM publish history (دفتر تغییرات) | 3 |
| S10 | retention policy | GA4: 14 ماه · BQ raw: 24 ماه (بعدش archive) · ریکاردینگ Clarity: 90 روز · logs: 12 ماه | 3 |
| S11 | قانونی | قانون حفاظت از اطلاعات (ایران): Mوبایل با هدف «تماس فروش» جمع می‌شود → notice روی فرم (8.5)؛ **[نیازمند تأیید حقوقی D-6]** | 1 |

---

# بخش 11 — KPIهای موفقیت برنامه

> این‌ها KPIهای **خودِ platform داده** هستند (نه KPIهای بیزینسی فاز 2 repository).

| # | KPI | فرمول | هدف | مهلت | منبع |
|---|---|---|---|---|---|
| K1 | Event coverage | events valid از 6 core / 6 | 6/6 | روز 45 | DebugView ماتریس |
| K2 | Event error rate | (purchase value=0 + lead بدون method + dup) / total | <5% | روز 105 | `dws_tracking_health` |
| K3 | Event loss | 1 − (GA4 events / GTM fire events) | <10% | روز 45 (عدد پایه) | 1.1 فاز 1 |
| K4 | Data freshness | lag max_date(BQ) − today | ≤48h (95% روزها) | روز 75 | `meta.freshness_table` |
| K5 | Offline capture rate | orders آفلاین ثبت‌شده in شیت / کل آفلاین (تخمین فروش) | >80% | روز 150 | شیت × فروش |
| K6 | Dashboard adoption | جلسات تصمیم هفتگی که «از روی داشبورد» بودند / کل جلسات | 100% از هفته 2 | روز 75 | گزارش هفتگی |
| K7 | Offline in GA4 | import ماهانه on-time | 12/12 ماه | از روز 180 | GA4 import log |
| K8 | Agent truth score | پاسخ‌های truth-test در بازه ±2% / 10 | ≥9/10، 2 هفته متوالی | روز 230 | truth test |
| K9 | Agent data integrity | پاسخ Agent با داده stale/بدون freshness (audit) | 0 | دائم | BQ audit log |
| K10 | Tracking health | چک سلامتی ماهانه بدون finding | 3 ماه متوالی | از روز 210 | چک `weekly-rhythm` |

---

# بخش 12 — 10 اقدام بعدی

| # | اقدام | مسئول | مهلت | خروجی/DoD |
|---|---|---|---|---|
| 1 | **حل F2:** فایل‌های وضعیت کامل GTM/GA4 را ضمیمه کنید یا تأیید کنید که تسک‌های 0.2/0.3 (ممیزی) جایگزین آن‌ها شود | MGR/PM | 48h | یکی از دو حالت، مستند |
| 2 | QW1–QW4: Retention 14m، Internal filter، timezone، Key Events (مجموع <1h) | PM | 3 روز | screenshot Admin هرکدام |
| 3 | QW5–QW7: ممیزی سریع GTM + شیت آفلاین + Clarity نصب/تأیید | PM + SALES | 7 روز | `gtm-audit.xlsx` v0 + شیت فعال + Clarity سبز |
| 4 | QW8 + 0.11: ticket رسمی Web Logs از وب‌بیت + پاسخ | PM + DEV lead | 7 روز (پاسخ: 2-4 هفته) | ticket + تصمیم D-2 |
| 5 | ارجاع T1–T7 (بخش A `dev-tasks.md`) با data dictionary پیوست + زمان‌بندی | PM → DEV | 7 روز | 7 تسک در backlog DEV با تاریخ |
| 6 | جلسه تصمیم D-1..D-9 (ساعت 1) با MGR — حتماً D-1 (GCP)، D-5 (PII)، D-9 (Agent) | PM + MGR | 10 روز | 9 تصمیم، هرکدام یک سطر: تصمیم/دلیل/مالک |
| 7 | بنچمارک 3 ماهه: CSV سفارش + هزینه YN/TS → `baseline-3m` | PM + MGR (دسترسی پنل) | 14 روز | فایل + 3 سطر executive |
| 8 | GCP: project `titanamart` + GA4→BQ link (فوری‌ترین بعد از D-1) | PM | بعد از D-1: 3 روز | اولین `events_*` جدول |
| 9 | 3 شیت (costs/offline/leads) + اولین ورودی + QW15 UTM روی کمپین‌های فعال | PM + SALES + ADS | 30 روز | شیت‌ها پر + 100% کمپین UTM |
| 10 | شروع فاز 1 کامل: 6 event زنده + 2 conv شبکه + Clarity + ماتریس تست | PM + DEV (+Agents) | 45 روز | چک‌لیست خروجی فاز 1 ✅ |

---

# بخش 13 — سؤالات و تصمیمات مورد نیاز از مدیریت

> هر مورد: [D-x] = تصمیم · [Q-x] = سؤال اطلاعاتی. **تا پاسخ، کارهای وابسته بلوک می‌مانند (با برچسب).**

| # | نوع | سؤال/تصمیم | چرا مهم | بلوک‌کننده |
|---|---|---|---|---|
| D-1 | تصمیم | **BigQuery از ماه اول** (در مقابل قاعده repository «BQ بعداً»): تأیید می‌کنید؟ هزینه = 0 در free tier | کل warehouse + Agent روی آن است | فاز 2، 6 |
| D-2 | تصمیم+دسترسی | **Web Logs:** آیا وب‌بیت access log می‌دهد (CSV/webhook/API)؟ اگر نه: beacon client-side (a) یا Cloudflare (b) یا صرفاً Clarity (c)؟ | workstream لاگ | R11 |
| D-3 | تصمیم | **مالک GCP:** چه کسی Owner project است؟ (پیشنهاد: اکانت MGR یا PM با 2FA) | S6 | فاز 2 |
| D-4 | تأیید | **دسترسی شبکه پایدار** به Google/Microsoft services از محل کار (R6)؟ | همه‌چیز | همه |
| D-5 | تصمیم | **PII موبایل در GA4:** خام (فعلی) یا SHA-256 hash؟ (test 20 ردیفی در فاز 1 تعیین‌کننده است) | S2، legal | فاز 1/3 |
| D-6 | تصمیم+حقوقی | **notice/consent:** notice ساده روی فرم کافی است؟ نیاز به نظر حقوقی برای جمع‌آوری موبایل؟ | S11 | فاز 1 |
| D-7 | تأیید | **Webbit:** (a) URL success page در کنترل ماست؟ (b) CSV سفارش کامل هست؟ (c) staging هست؟ | T3، anti-dup | فاز 1 |
| D-8 | تصمیم | **SS tagging:** تأیید می‌کنید که با gate 10% event loss (R5) موافقید؟ (تصمیم repository = مؤخر) | 8.7 | بازبینی فصلی |
| D-9 | تصمیم | **هویت AI Agent:** «Agent تیتانا» همان chatbot «تینا» سایت است یا Agent داخلی/marketing جدا؟ protocol دسترسی: BigQuery API مستقیم، REST wrapper، یا MCP؟ | بخش 9، فاز 6 | فاز 6 (نظری)، 3 (فنی) |
| D-10 | تأیید | **cross-domain:** آیا دامنه/زیردامنه دیگری داریم (bot، پنل)؟ | 8.6 | فاز 1 (30 دقیقه) |
| Q-1 | اطلاعات | **فایل‌های وضعیت GTM/Analytics:** در کدام محل هستند؟ (در repository/workspace یافت نشدند — F2) | ممیزی | فاز 0 |
| Q-2 | اطلاعات | وضعیت فعلی **Clarity**: اصلاً نصب است؟ account ID با چه کسی است؟ | F4 | 0.10 |
| Q-3 | اطلاعات | دسترسی‌ها: چه کسی Admin GA4/GTM است؟ 2FA فعال است؟ | S5/S7 | 0.12 |
| Q-4 | اطلاعات | ظرفیت تیم فنی هفته‌های 3-6 (A6)؟ | R8 | فاز 1 |
| Q-5 | اطلاعات | آیا Google Search Console برای titana.ir فعال است؟ (SEO report #9) | گزارش 9 | فاز 3 |
| Q-6 | تأیید | **توافق SALES:** آیا تیم فروش می‌تواند 5 دقیقه ثبت روزانه تعهد کند؟ (بهتر: عکس فاکتور در گروه → PM وارد کند) | R9 | فاز 2/5 |
| Q-7 | اطلاعات | 3 IP دفتر/شبکه داخلی برای Internal Traffic Filter | QW2 | 3 روز |

---

# بخش 14 — Self-Review نهایی

| معیار | بررسی | نتیجه |
|---|---|---|
| **Completeness** | 10 وظیفه‌ی خواسته‌شده: ① ممیزی با ارجاع (بخش 1) ② roadmap مرحله‌به‌مرحله (بخش 5) ③ 7×7 سطر هر فاز (بخش 5) ④ inventory کامل (بخش 3) ⑤ معماری مرجع + مقایسه گزینه‌ها (بخش 4) ⑥ کاتالوگ 13 گزارش (بخش 7) ⑦ برنامه GA4/GTM شامل dataLayer/naming/taxonomy/trigger/consent/cross-domain/SS-tradeoff/testing/anti-dup (بخش 8) ⑧ قرارداد Agent + anti-hallucination (بخش 9) ⑨ backlog+سؤالات (بخش 13 + بخش 5 به‌صورت issue-ready) ⑩ exec summary + gap table + architecture + roadmap + KPI + 10 اقدام (بخش 1,2,4,5,11,12) | ✅ همه پوشش‌داده‌شده |
| **Consistency** | نام eventها/پارامترها دقیقاً مطابق `appendix/data-dictionary.md` (6 event، 8 lead_method، IRR/ریال، user_id 11 رقم، UTM pattern)؛ تناقض BQ repository صریح‌شده و به D-1 تبدیل (نه پنهان‌شده)؛ نقش‌های PM/DEV/SALES یکپارچه در همه فازها؛ timeline هفته‌ها هم‌راستا با تقویم `weekly-rhythm.md` | ✅ |
| **Feasibility** | هیچ کاری بدون مسئول/دسترسی تعریف نشده؛ هر بلوک با برچسب [نیازمند دسترسی/تصمیم] علامت خورده (D-1..D-10, Q-1..Q-7)؛ حجم تلاش با A6 (ظرفیت DEV) و R8 (تک‌نفره بودن) سازگار است؛ هزینه ≈ 0 (free tier) — ریسک R6 به‌عنوان plan B (گزینه C) پوشش داده شده | ✅ |
| **Traceability** | هر تسک/فاز به فایل دقیق repository ارجاع دارد (جدول پیوست A)؛ یافته‌ها F1–F12 و شکاف‌ها G1–G17 شماره‌دار و قابل پیگیری در GitHub issue هستند | ✅ |
| **No-guess rule** | هر وضعیت «مجهول» صریح [؟]/[نیازمند...] است؛ هیچ عدد وضعیت فعلی (تعداد تگ، retention فعلی، LCP فعلی و...) **ادعا** نشده — فقط «باید اندازه‌گیری شود» | ✅ |
| **Execution readiness** | 10 اقدام بعدی با مالک+مهلت+DoD (بخش 12)؛ Quick Wins 7/30/90 (بخش 6)؛ هر backlog item قابل تبدیل به issue با فرمت (Epic/Task/Effort/Dep/DoD) در بخش 5+6 است | ✅ |
| **محدودیت‌های باقی‌مانده (صریح)** | ① وضعیت واقعی GTM/GA4/Clarity/logs بدون دسترسی قابل تأیید نیست (F2/F4/F5) ② A1–A8 نیاز به تأیید ③ test hash user_id (D-5) در فاز 1 باید انجام شود ④ دسترسی GCP از ایران (R6/D-4) بزرگ‌ترین ریسک خارجی است و plan B (گزینه C) دارد | ✅ مستند |

**نتیجه self-review:** سند برای اجرا آماده است؛ بلوک‌کننده‌های واقعی فقط 4 موردند: D-1 (GCP)، D-2 (logs)، D-4 (شبکه)، Q-1 (فایل‌های وضعیت).

---

# پیوست A — Traceability

| بخش این سند | منبع/ارجاع repository |
|---|---|
| فاز 0 (0.1–0.14) | `strategy/01-phase-0-audit.md` T1–T10 + `agents/prompt-gtm-agent.md` T-G1 + `agents/prompt-ga4-agent.md` T-A1 |
| فاز 1 (1.0–1.2 + base) | `strategy/02-phase-1-data.md` T1–T24 + `appendix/dev-tasks.md` T1–T7 + `appendix/data-dictionary.md` §2-4 |
| فاز 2 (2.1–2.7) | `strategy/03-phase-2-dashboard.md` T1–T10 + (جدید: BQ) + `appendix/weekly-rhythm.md` §1 |
| فاز 3 (3.1–3.7) | (جدید) + `strategy/02` T24 + `appendix/weekly-rhythm.md` §3 |
| فاز 4 | `strategy/04-phase-3-cro.md` T1–T5 + `appendix/dev-tasks.md` T8–T13 |
| فاز 5 | `strategy/05-phase-4-advanced.md` T1–T10 + `appendix/dev-tasks.md` T14–T15 |
| فاز 6 | `strategy/06-phase-5-scale.md` §1-4 + `agents/README.md` (golden rule) |
| dataLayer/naming | `appendix/data-dictionary.md` §2 (بدون تغییر) + §3-4 |
| Anti-dup | `appendix/dev-tasks.md` T3/T7 + `strategy/02` نکات اجرایی |
| Weekly rhythm/report template | `appendix/weekly-rhythm.md` (بدون تغییر) |
| Agent prompts | `agents/*` (بدون تغییر — برای فاز 0/1 استفاده می‌شوند) |

## فرمت پیشنهادی GitHub issue (برای هر task)

```
[EPIC-E2][T3] dataLayer چک‌اوت و خرید (P0)
Epic: E2 — بنیان داده (فاز 1)
Dependency: D-7 (success page URL) — بلوک تا پاسخ
Effort: 1 روز (DEV)
DoD: خرید تست واقعی → purchase با transaction_id در GTM Preview؛ در صفحه خطا نمی‌افتد
Source: TITANA-MARKETING-DATA-ROADMAP.md §5 فاز 1 / dev-tasks T3
```

---

# پیوست B — Backlog فنی اولویت‌بندی‌شده (GitHub-ready)

> فرمت هر task: `[EPIC][TASK] عنوان | Effort | وابستگی | خروجی/DoD`. همه قابل تبدیل مستقیم به issue (فرمت در پیوست A).

## E0 — ممیزی و دسترسی (P0 | روز 0–14 | ~12 ساعت PM + 1 جلسه)

| Task | Effort | وابستگی | خروجی/DoD |
|---|---|---|---|
| E0-T1 ممیزی کانتینر GTM (T-G1) | 2h | Q-1, Q-3 | `gtm-audit.xlsx` |
| E0-T2 ممیزی Property GA4 (T-A1) | 1.5h | Q-3 | جدول وضعیت قبل |
| E0-T3 اعتبارسنجی زنده 6 event (DebugView) | 2h | E0-T1,T2 | جدول 6×2 + اسکرین‌شات |
| E0-T4 ممیزی YN/TS (تبدیل + مقایسه با فروش واقعی) | 3h | D8 | 3 سطر/شبکه |
| E0-T5 تست E2E سایت (خرید تست + 8 لید) | 2h | — | گزارش باگ 1 صفحه |
| E0-T6 PageSpeed 3 صفحه + GTM dup check | 1h | — | 6 عدد LCP/CLS + 1 خط |
| E0-T7 بنچمارک 3 ماهه | 2h | D8 | `baseline-3m.xlsx` |
| E0-T8 جمع‌آوری فروش آفلاین 3 ماه | 1h + هماهنگی | Q-6 | شیت `offline-sales` |
| E0-T9 چک وضعیت Clarity | 0.5h | Q-2 | مستند: نصب/عدم نصب + account |
| E0-T10 درخواست Web Logs از وب‌بیت | 1h | D-2 | ticket ثبت‌شده |
| E0-T11 جلسه تصمیم D-1..D-9 | 1h | MGR | 9 تصمیم مستند |
| E0-T12 گزارش وضعیت 1 صفحه‌ای | 2h | همه | ارسال به MGR + بازخورد |

## E1 — بنیان داده: dataLayer/GTM/GA4/شبکه (P0 | روز 14–45)

| Task | Effort | وابستگی | خروجی/DoD |
|---|---|---|---|
| E1-T1 dataLayer PDP+model (`view_item`) [T1] | DEV 1 روز | D-7 | Preview: 2 صفحه با items کامل |
| E1-T2 dataLayer cart [T2] | DEV 0.5 روز | E1-T1 | add/remove با value سبد |
| E1-T3 dataLayer checkout+purchase [T3] | DEV 1 روز | D-7 | purchase با transaction_id روی success |
| E1-T4 dataLayer leads 8 مسیر [T4] | DEV 1 روز | E1-T1 | 8/8 lead_method |
| E1-T5 user_id در لیدها [T5] | DEV 0.5 روز | E1-T4 | فرمت 11 رقم در Preview |
| E1-T6 dataLayer search [T6] | DEV 0.5 روز | — | search_term + num_results |
| E1-T7 چک یکپارچگی GTM script [T7] | DEV 1h | — | لیست صفحه × count |
| E1-T8 GTM: variables+tags+triggers (T-G2..G5) | PM 10h | E1-T1..T6 | 6 Event tag + 2 conv + 0 بی‌نام |
| E1-T9 GA4: retention/filter/EM/key events (T-A2..A5) | PM 2h | Q-7 (IPها) | 4 تنظیم سبز |
| E1-T10 Clarity install + masking (1.0) | PM 1h + DEV 0.5h | Q-2, D-6 | recording + redaction سبز |
| E1-T11 Event loss baseline (1.1) | PM 2h | E1-T8 | عدد پایه R5 |
| E1-T12 اعتبارسنجی سه‌جانبه + 8 لید (T22-T23) | PM 4h | E1-T8..T10 | 3×1 عدد + 8×3 سبز |
| E1-T13 Publish استاندارد + دفتر تغییرات (T6 فاز1) | PM 1.5h | E1-T12 | 1 سطر/تغییر |

## E2 — Warehouse v0 + داشبورد (P0 | روز 45–75)

| Task | Effort | وابستگی | خروجی/DoD |
|---|---|---|---|
| E2-T1 GCP project + GA4→BQ link (2.1) | PM 2h + 24h | **D-1, D-3, D-4** | `events_*` اولین روز |
| E2-T2 3 شیت (costs/offline/leads) (2.2) | PM 5h + SALES | Q-6 | اولین ورودی هر شیت |
| E2-T3 Tables raw: Sheets connector + CSV orders/catalog + Clarity script (2.3) | PM 4h + DEV 2h | E2-T1, Q-2 | 6 table با داده |
| E2-T4 `dwd_events` (dedup+tz) (2.4) | PM 3h | E2-T1 | query استاندارد مستند |
| E2-T5 3 داشبورد Looker (2.5) | PM 11h | E2-T2,T4 | 3 داشبورد کامل |
| E2-T6 ایمیل هفتگی + جدول KPI (2.6) | PM 3.5h | E2-T5 | 2 PDF رسیده + 7 KPI |
| E2-T7 Clarity API دسترسی/فالبک (2.7) | PM 0.5h | D-4 | روش export انتخاب‌شده |

## E3 — کیفیت، حاکمیت، امنیت (P0→P1 | روز 75–105)

| Task | Effort | وابستگی | خروجی/DoD |
|---|---|---|---|
| E3-T1 5 rule DQ scheduled (3.1) | PM 6h | E2-T4 | `dws_tracking_health` پر می‌شود |
| E3-T2 Alert (email) برای ruleها (3.2) | PM 2h | E3-T1 | 1 alert تستی رسیده |
| E3-T3 `dws_*` (kpi/funnel/campaign/product) (3.3) | PM 8h | E2-T3,T4 | 4 جدول روزانه |
| E3-T4 Agent views + SA read-only + IAM + audit (3.4) | PM 6h | **D-9**, E3-T3 | 6 view + attack test رد شده |
| E3-T5 `LINEAGE.md` + data dictionary v1.1 (3.5) | PM 3h | E3-T3 | هر KPI یک سطر lineage |
| E3-T6 RBAC GA4/GCP + PII policy (3.6) | PM 3h | D-5, D-6 | list دسترسی + policy در repo |
| E3-T7 گزارش سلامت داده (T24 فاز 1) | PM 1 روز | 1 ماه داده | error rate <5% مستند |

## E4 — CRO loop (P1 | روز 105–150)

| Task | Effort | وابستگی | خروجی/DoD |
|---|---|---|---|
| E4-T1 انتخاب 3 گلوگاه از داشبورد 2 | PM 0.5 روز | E2-T5 | 3 پروژه با «قبل» عدددار |
| E4-T2..T7 اجرای 4+ پروژه (فرم لیست قیمت، PDP اعتماد، CTA ۰تومان، چک‌اوت، سرعت، لندینگ، جستجو) + پکیت Clarity | PM 2 هفته/پروژه + DEV P1 (T8-T13) | E3-T1 (داده سالم) | 4+ سطر log بسته |
| E4-T8 2 محتوای سوالی (اختیاری) | PM + محتوا | E4-T7 (search data) | 2 صفحه منتشرشده |

## E5 — حلقه آفلاین + ریتارژتینگ + LTV (P1 | روز 150–200)

| Task | Effort | وابستگی | خروجی/DoD |
|---|---|---|---|
| E5-T1 استاندارد CSV آفلاین + تست 20 ردیفی | PM 1.5h | E1-T5, Q-6 | قالب valid در GA4 |
| E5-T2 import ماهانه روی چرخه (+3 ماه history) | PM 3h اول + 30d/ماه | E5-T1 | `purchase_offline` در GA4 |
| E5-T3 postback/لیست آفلاین به YN/TS | PM 2-4h | D-6 (مستندات شبکه) | آفلاین در پنل شبکه |
| E5-T4 3 مخاطب ریتارژتینگ + negative | PM 5h | E2-T1 (BQ audiences) | 4 audience + 1 کمپین |
| E5-T5 اجبار UTM standard 100% کمپین‌ها | PM 2h + 2 هفته پایش | — | 0 کمپین بدون UTM |
| E5-T6 گزارش LTV/سگمنت v1 | PM 4h | 6 ماه داده | 2 صفحه + 3 یافته |
| E5-T7 اولین جابجایی بودجه 70/30 | PM 2h | E5-T5,T6 | تصمیم مستند |

## E6 — AI Agent v1 + سیستم مستمر (P1→P2 | روز 200+)

| Task | Effort | وابستگی | خروجی/DoD |
|---|---|---|---|
| E6-T1 REST wrapper (یا مستقیم BigQuery API) با rate-limit + API key | DEV 2-3 روز | **D-9**, E3-T4 | Agent می‌تواند query بزند |
| E6-T2 guardrail در system prompt (freshness/no-data/lineage) | PM 3h | E3-T5 | 3 قاعده در prompt |
| E6-T3 Truth test هفتگی (10 سؤال) | PM 1h/هفته | E6-T1 | ≥9/10 دو هفته متوالی (K8) |
| E6-T4 چک سلامتی فصلی نیمه-خودکار (query‌ها آماده) | PM 2h | E3-T1 | 60% چک‌لیست `strategy/06` خودکار |
| E6-T5 بازبینی فصلی «خروج از محدوده» (BQ/SS/CRM با داده) | PM 1h/فصل | داده 3 فصل | تصمیم مستند |

**مجموع effort تخمینی (فازهای P0):** PM ≈ 80-90 ساعت + DEV ≈ 7-8 روزکار — با فرض A6 در بازه 75 روز قابل پوشش است؛ در غیر این صورت فاز 3 قابل تعویق به بعد از 2 هفته اجرای فاز 2 است (شکاف: alertهای DQ تا آن زمان دستی از چک 5 دقیقه‌ای `weekly-rhythm.md`).

*پایان سند — نسخه 1.0 — تهیه‌شده برای تبدیل به backlog اجرایی تیم تیتانا. هیچ داده، تگ یا اتالی واقعی در این مرحله تغییر نکرده است.*
