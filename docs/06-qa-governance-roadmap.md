# ۶) QA، حاکمیت داده، و نقشه‌ی راه اجرا

## ۶.۱ چرا این سند از خودِ تگ‌ها مهم‌تر است

در ۹ پروژه از ۱۰ پروژه‌ی ایرانی، داده در هفته‌ی چهارم «باورناپذیر» می‌شود — نه به‌خاطر تگ غلط، به‌خاطر نبودِ تعریفِ تست و نبودِ مالک. پس: **تگ بدون QA، بدهی است.**

## ۶.۲ آزمون‌های الزامی (هر تگ قبل از Publish)

| ID | سنجه | روش | قبول |
|---|---|---|---|
| T-01 | GTM فقط یک‌بار اجرا شود | `view-source` → یک `gtm.js?id=GTM-…`؛ در Preview «Tags Fired» تکراری نباشد | ۱ اجرا/صفحه |
| T-02 | dataLayer قبل از `gtm.js` باشد | ترتیب در `<head>`؛ `dataLayer.push`های اولیه قبل از loader | ✅ |
| T-03 | نبودِ `gtag.js` موازی | جست‌وجوی `gtag/js?id=` در سورس؛ اگر بود یا حذف شود یا به GTM منتقل | ۰ |
| T-04 | dedupe خرید | باز/بسته‌کردن تب در صفحه‌ی تأیید، back button، رفرش | ≤۱ `purchase` per `order_id` |
| T-05 | صحت مبلغ | مقایسه‌ی ۲۰ سفارش واقعی پنل با GA4 DebugView | اختلاف <۰٫۵٪ (ریال) |
| T-06 | قیمت صفر | PDP یک پکیج «۰ تومان» → `value` ارسال نشود/`undisclosed=true` | ۰ purchase با 0 |
| T-07 | اعداد فارسی | پارس «۲٬۷۶۰٬۰۰۰٬۰۰۰ تومان» و «345 واحد در انبار» | عدد درست |
| T-08 | مودال تنوع | باز/بسته‌کردن ۳ بار → یک `variant_index_view`، هر `variant_select` فقط هنگام تغییر | ✅ |
| T-09 | افزودن از صفحات محتوا | ATC از `/implant-review/` و `/order` → `source_page_type` درست | ✅ |
| T-10 | قیف هویت | ورود با موبایل/OTP اشتباه/درست، سه حالت: `otp_result{fail,ok}` + `login_gate_hit` | ۳ رویداد مجزا |
| T-11 | Cross-domain | از سایت به `club.titana.ir` → `?_gl=` و یکسان‌بودن `client_id` | ✅ |
| T-12 | Internal traffic | با فیلتر روشن، گزارش `internal_traffic` داشته باشد ولی funnel نه | ✅ |
| T-13 | Consent | رد کردن بنر → هیچ تگ تبلیغاتی fire نشود (در Tag Inspector) | ✅ |
| T-14 | لینک خراب | کلیک «اقساطی» → `broken_link_click{target:"/leasing-404/"}` | ✅ |
| T-15 | ریسپانسیو/موبایل | همان سنجه‌ها روی Chrome Android + Safari iOS (پیکسل‌های third-party در iOS متفاوت‌اند) | ✅ |
| T-16 | سنجش حجم | hit/session < ۱۲؛ ratio `impression:event` < ۳ | ✅ |
| T-17 | نبود PII | جست‌وجوی regex موبایل/ایمیل در DebugView و Network payload | ۰ مورد |
| T-18 | BigQuery match | شمارش رویداد در GA4 UI vs `events_YYYYMMDD` (تأخیر ۲۴–۴۸h را لحاظ کنید) | <۲٪ اختلاف |

**ابزار:** GTM Preview → GA4 DebugView → Tag Inspector (Chrome) → Analytics Inspector → `gql`/BigQuery sandbox → برای رگرسیون خودکار: اسکریپت Puppeteer که ۱۲ مسیر سایت را پیمایش می‌کند و `dataLayer` را با fixture مقایسه می‌کند (بک‌لاگ فاز ۶؛ نمونه در `snippets/qa-runner.js`).

## ۶.۳ حاکمیت (Governance)

| قاعده | جزئیات |
|---|---|
| Versioning | هر Publish: `v<yy.mm>-<n>` + لینک Task. یک `CHANGELOG.md` در همین ریپو (الزامی) |
| Changelog format | تاریخ، تغییر، رویداد/تگ متأثر، عدد «قبل/بعد» در تست، تأییدکننده |
| محیط | Staging با `env:"staging"` در dataLayer → در GA4 یک data filter جدا؛ هرگز publish بدون تست staging برای `purchase` |
| مالکیت | یک «Data Owner» برای هر family: هویت/قیف (Product)، کمپین (Growth)، پس‌ازفروش (Support)، مالی (Finance) |
| تغییر schema | فقط با افزایش (additive). حذف/تغییر نام = Major + ۲ هفته deprecation window با هر دو فیلد |
| بک‌اپ | خروجی هفتگی BigQuery → نه‌تنها GA4؛ GA4 داده را نگه نمی‌دارد اگر export قطع شود |
| مرزها | تیم مارکتینگ اجازه‌ی ویرایش Triggerهای `purchase`/`signup` را ندارد (فقط درخواست) |
| تقویم بازبینی | ۳۰ روز پس از فاز ۱، سپس فصلی (حذف تگ مرده، review دقت) |

## ۶.۴ نقشه‌ی راه ۸ هفته‌ای (قابل تحویل، نه آرزو)

| هفته | تحویل | وابستگی | معیار موفقیت |
|---|---|---|---|
| 1 | تأیید وضعیت موجود (GA4/GTM/تگ‌های دستی)، ساخت GA4 property + stream + تنظیمات ۵.۱، نصب GTM، dataLayer **page-level** (مسیر A؛ اگر ممکن نبود مسیر B) | دسترسی فنی به قالب | T-01..T-03 سبز؛ `dl_ver=1.0.0` در DebugView |
| 2 | قیف هویت (T-10) + `login_gate_hit` + `signup/profile_complete` + Key events + ابعاد 1–3 | فرم OTP | ≥۹۵٪ سشن‌های لاگین، uid_hash داشته باشند |
| 3 | Commerce: `view_item`,`select_item`,`view_cart`,`add_to_cart`,`remove_from_cart`, variant events | shim selectors | تطابق ATC با سرور ±۵٪ |
| 4 | `purchase`+`refund` **با dedupe** + BigQuery export فعال‌سازی (فقط در روز اولِ GA4؛ اگر تأخیر بیفتد داده از دست می‌رود) ⚑ | پنل سفارش | match-rate >۹۷٪ |
| 5 | Leads: quote/callback/form/tool_*(quick/smart/custom package)/compare + فایل‌دانلودها + چت/تلفن | — | ۱۰۰٪ فرم‌ها `form_id` داشته باشند |
| 6 | Promo/Media/UX: `view_promo`,`select_promo`,`video_progress`,`scroll`,`web_vitals`,`rage/dead click`, PWA, share, broken-link | Clarity install | hit/session < ۱۲ |
| 7 | مخاطب‌ها + user properties + fیلترها + Looker Studio پنل ۱ و ۲ + alertها | دسترسی BI | پنل با عددِ تطبیق‌شده منتشر شود |
| 8 | Import آفلاین (A/B/C) + sGTM (اگر زیرساخت هست) + بازبینی دقت + مستندسازی و آموزش تیم | CRM export | گزارش هفتگی کانال×CAC×LTV با داده‌ی واقعی |

⚑ **تأخیرناپذیر:** فعال‌سازی BigQuery export در هفته‌ی اول. اگر GA4 را ساختید و export را ماه بعد باز کردید، آن ماه برای همیشه در warehouse شما خالی است.

## ۶.۵ ریسک‌ها و پیش‌بینی

| ریسک | احتمال×اثر | پیش‌گیرانه |
|---|---|---|
| فنی وقت نمی‌دهد (فروشگاه‌ساز قالب باز نمی‌کند) | بالا×بالا | مسیر B (shim) + درخواست ۳ تگ `<script type="application/json" id="titana-data">` در header — کوچک‌ترین درخواست ممکن |
| داده‌ی پولی از DOM غلط می‌شود | متوسط×بالا | `purchase` فقط از سرور/پنل؛ DOM با flag `source:"dom"` و exclude از گزارش درآمد |
| اختلال شبکه/فیلترینگ → افت GA4 در موبایل ایران | متوسط×بالا | sGTM first-party + مقصد داخلی برای مقایسه‌ی حجم؛ در گزارش، «افت غیرقابل‌توجیه» را اعلام کنید نه پنهان |
| کاربر پراکنده: فروش در واتساپ بسته می‌شود | بالا×متوسط | `chat_click` + import CRM + گزارش «attributed vs self-reported»؛ به مدیر بگویید مدل، مدل است |
| ریزش با تغییر UI | متوسط×متوسط | shim با selectorهای مقاوم (`[data-*]` در اولویت، classهای CSS در آخر) + T-08/T-09 در CI |
| تورم GA4 custom dims | متوسط×متوسط | سند ۰۵ لیست قطعی؛ درخواست جدید = حذف یک مورد قدیمی |
| باگ‌های پلتفرم (`{Balance}`, `Value=28` تکراری، `/leasing-404/`) | بالا×کم | نگه‌داشتن داده‌ی خام، و **اعلام** در گزارش هفته‌های اول؛ اصلاح = مسئول فنی |

## ۶.۶ معیارهای موفقیت خودِ برنامه (نه فقط تگ‌ها)

- روز ۳۰: ≥۹۵٪ سشن‌ها `page_type` معتبر؛ ≥۹۰٪ لاگین‌ها `uid_hash`.
- روز ۶۰: `purchase` match-rate ≥۹۷٪ با پنل؛ قیف A-C-D در Looker زنده.
- روز ۹۰: تصمیمِ واقعیِ بودجه با عددِ CAC-LTV (حداقل یک جابه‌جایی بودجه مستند به داده)؛ Suppressed Demand ماهانه گزارش شود؛ یک A/B تست مبتنی بر داده (مثلاً باز کردن مودال تنوع یا نمایش قیمت پکیج) اجرا و نتیجه‌اش ثبت شود.
