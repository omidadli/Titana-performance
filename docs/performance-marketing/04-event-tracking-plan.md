# برنامه جامع ترکینگ و ردیابی رویدادها (Event Tracking Plan)

این سند مرجع استاندارد ردیابی فنی و یکپارچه‌سازی سیگنال‌های رفتاری، خرید و عملیات کسب‌وکار **Titana (شناسه بیزینس: ۱۰۷ — تجهیزات و مواد دندان‌پزشکی)** است. 

این برنامه شامل **دقیقاً 24 رویداد استاندارد و سفارشی** است که به دقت برای پوشش کامل قیف فروش B2B تجهیزات دندان‌پزشکی طراحی شده و کلیه نیازمندی‌های ترکینگ کلاینت‌ساید (Client-Side)، ترکینگ سرورساید (Server-Side GTM)، پروتکل سنجش Google Analytics 4 (Measurement Protocol)، رابط کاربری تبدیل‌های متا (Meta Conversions API - CAPI) و استراتژی‌های جلوگیری از داده‌های تکراری (Deduplication) را تبیین می‌نماید.

---

## جدول خلاصه و موقعیت ۲۴ رویداد در قیف دندان‌پزشکی B2B

| کد رویداد | نام استاندارد رویداد | نام فارسی رویداد | مرحله قیف بازاریابی و فروش | نوع پیاده‌سازی اصلی |
| :---: | :--- | :--- | :--- | :--- |
| **EVT-01** | `page_view` | مشاهده صفحه وب‌سایت | آگاهی و کشف (Top of Funnel) | Client + Server CAPI |
| **EVT-02** | `view_item_list` | مشاهده لیست یا دسته‌بندی کالا | جستجو و مقایسه (Top/Middle of Funnel) | Client + Server CAPI |
| **EVT-03** | `select_item` | کلیک روی کارت محصول در لیست | تعامل با کاتالوگ (Middle of Funnel) | Client + Server CAPI |
| **EVT-04** | `view_item` | مشاهده صفحه جزئیات کالا (PDP) | علاقه‌مندی و بررسی فنی (Middle of Funnel) | Client + Server CAPI |
| **EVT-05** | `download_spec_sheet` | دانلود کاتالوگ و دیتاشیت فنی کالا | بررسی فنی کلینیکال B2B (High Intent) | Client + Server CAPI |
| **EVT-06** | `add_to_wishlist` | افزودن به لیست علاقه‌مندی‌ها | تمایل به خرید آتی (Middle of Funnel) | Client + Server CAPI |
| **EVT-07** | `add_to_cart` | افزودن به سبد خرید | قصد خرید تجاری (Bottom of Funnel) | Client + Server CAPI |
| **EVT-08** | `remove_from_cart` | حذف کالا از سبد خرید | تغییر قصد خرید (Bottom of Funnel) | Client + Server CAPI |
| **EVT-09** | `view_cart` | مشاهده سبد خرید | بررسی نهایی اقلام سفارش (Bottom of Funnel) | Client + Server CAPI |
| **EVT-10** | `begin_checkout` | آغاز فرایند تسویه‌حساب | ورود به قیف قطعی تسویه (Checkout Stage 1) | Client + Server CAPI |
| **EVT-11** | `add_shipping_info` | ثبت اطلاعات آدرس و نحوه ارسال | قیف تسویه حساب (Checkout Stage 2) | Client + Server CAPI |
| **EVT-12** | `add_payment_info` | انتخاب شیوه پرداخت و خزانه‌داری | قیف تسویه حساب (Checkout Stage 3) | Client + Server CAPI |
| **EVT-13** | `purchase` | ثبت قطعی خرید و صدور فاکتور | تبدیل قطعی و درآمد (Conversion) | Client + Server CAPI |
| **EVT-14** | `refund` | مرجوعی کالا یا عودت وجه فاکتور | پشتیبانی پس از فروش و اصلاح درآمد (Post-Purchase Reversal) | Client + Server CAPI |
| **EVT-15** | `repeat_purchase` | خرید مجدد دندان‌پزشک در چرخه وفاداری | حفظ و وفاداری مشتری (Retention & Expansion) | Client + Server CAPI |
| **EVT-16** | `generate_lead` | ثبت لید و فرم تماس اولیه | جذب سرنخ تجاری (Lead Acquisition) | Client + Server CAPI |
| **EVT-17** | `submit_clinic_inquiry` | استعلام رسمی قیمت و پیش‌فاکتور کلینیک | اعتبارسنجی سرنخ و استعلام B2B (MQL to SQL) | Client + Server CAPI |
| **EVT-18** | `request_equipment_demo` | درخواست دمو حضوری تجهیزات بزرگ | مذاکره و ارزیابی فنی (SQL to Demo) | Client + Server CAPI |
| **EVT-19** | `schedule_sales_call` | رزرو زمان تماس مشاوره تلفنی با مهندس فروش | پایپ‌لاین فروش B2B (Pipeline Engagement) | Client + Server CAPI |
| **EVT-20** | `view_promotion` | مشاهده بنر یا پروموشن تبلیغاتی در سایت | تعامل داخلی با کمپین‌ها (On-site Engagement) | Client + Server CAPI |
| **EVT-21** | `select_promotion` | کلیک روی بنر جشنواره و آفر اختصاصی | تعامل داخلی با کمپین‌ها (On-site Engagement) | Client + Server CAPI |
| **EVT-22** | `search` | جستجوی داخلی در محصولات و کاتالوگ | کشف نیاز و جستجوی محصول (Middle of Funnel) | Client + Server CAPI |
| **EVT-23** | `login` | ورود دندان‌پزشک به پنل کاربری | احراز هویت و فعال‌سازی (User Activation) | Client + Server CAPI |
| **EVT-24** | `sign_up` | ثبت‌نام رسمی کلینیک و احراز هویت نظام پزشکی | جذب عضو جدید و اعتبارسنجی صنفی (B2B Onboarding) | Client + Server CAPI |

---

## مشخصات تفصیلی و شناسنامه فنی رویدادها (EVT-01 تا EVT-24)

### EVT-01: رویداد `page_view` (مشاهده صفحه وب‌سایت)

* **نام استاندارد فنی:** `page_view`
* **عنوان فارسی:** مشاهده صفحه وب‌سایت
* **موقعیت در قیف فروش B2B:** آگاهی و کشف (Top of Funnel)
* **شرایط و محرک شلیک (Trigger Condition):** بارگذاری کامل DOM صفحه در مرورگر دندان‌پزشک یا کلاینت
* **پارامترهای اجباری (Required Parameters):** `page_location, page_title, page_referrer, client_id`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `utm_source, utm_medium, utm_campaign, utm_term, utm_content, device_category`
* **نگاشت به اسکیما و رویدادهای GA4:** رویداد پیش‌فرض پیکربندی GA4 به نام page_view همراه با ابعاد سفارشی
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** ارسال رویداد PageView از طریق CAPI و Pixel همگام
* **نیازمندی‌ها و منطق Server-Side GTM:** استخراج Client IP و User-Agent در سرور GTM جهت غنی‌سازی رکوردهای BigQuery
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** تطابق event_id تولیدشده در فرانت‌اند با CAPI Payload برای جلوگیری از دوبار شمردن
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "page_view",
  "event_id": "pv_1774020101_849204",
  "page_location": "https://titana.ir/equipment/dental-units",
  "page_title": "یونیت‌های دندان‌پزشکی پیشرفته | تیتانا",
  "user_pseudo_id": "GA1.2.98402194.1774020100"
}
```

---

### EVT-02: رویداد `view_item_list` (مشاهده لیست یا دسته‌بندی کالا)

* **نام استاندارد فنی:** `view_item_list`
* **عنوان فارسی:** مشاهده لیست یا دسته‌بندی کالا
* **موقعیت در قیف فروش B2B:** جستجو و مقایسه (Top/Middle of Funnel)
* **شرایط و محرک شلیک (Trigger Condition):** رندر شدن لیست اقلام کالایی در صفحات آرشیو، دسته‌بندی یا نتایج فیلتر
* **پارامترهای اجباری (Required Parameters):** `item_list_id, item_list_name, items (array of items with item_id, item_name, price)`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `items.item_brand, items.item_category, items.index`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد تجارت الکترونیک view_item_list با آرایه اقلام
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** رویداد CustomizeViewContent با ارسال آرایه کدهای محتوا (content_ids)
* **نیازمندی‌ها و منطق Server-Side GTM:** ارسال آرایه تا سقف ۲۰ کالا به سرور GTM جهت تحلیل Impression محصولات
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** event_id ترکیبی از session_id و list_id و timestamp
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "view_item_list",
  "item_list_id": "cat_implantology",
  "item_list_name": "ایمپلنتولوژی و تجهیزات جراحی",
  "items": [
    {"item_id": "SKU-IMP-01", "item_name": "کیت جراحی ایمپلنت دنتسپلای", "price": 450000000, "item_brand": "Dentsply"},
    {"item_id": "SKU-IMP-02", "item_name": "موتور جراحی ایمپلنت Bien-Air", "price": 820000000, "item_brand": "Bien-Air"}
  ]
}
```

---

### EVT-03: رویداد `select_item` (کلیک روی کارت محصول در لیست)

* **نام استاندارد فنی:** `select_item`
* **عنوان فارسی:** کلیک روی کارت محصول در لیست
* **موقعیت در قیف فروش B2B:** تعامل با کاتالوگ (Middle of Funnel)
* **شرایط و محرک شلیک (Trigger Condition):** کلیک دندان‌پزشک روی کارت محصول در صفحه دسته‌بندی، سرچ یا صفحه اصلی
* **پارامترهای اجباری (Required Parameters):** `item_list_id, item_list_name, items (single item array)`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `items.index, items.item_category`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد e-commerce: select_item
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** SelectContent همراه با پارامتر content_id کالا
* **نیازمندی‌ها و منطق Server-Side GTM:** ثبت ردیابی رفتار انتخاب کالا جهت بهینه‌سازی چیدمان و الگوریتم رتبه‌بندی سرچ
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** بر اساس event_id یکتا تولیدشده در لحظه کلیک
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "select_item",
  "item_list_id": "search_results",
  "items": [
    {"item_id": "SKU-COMP-3M", "item_name": "کامپوزیت Filtek Z350 XT 3M", "price": 3850000, "index": 1}
  ]
}
```

---

### EVT-04: رویداد `view_item` (مشاهده صفحه جزئیات کالا (PDP))

* **نام استاندارد فنی:** `view_item`
* **عنوان فارسی:** مشاهده صفحه جزئیات کالا (PDP)
* **موقعیت در قیف فروش B2B:** علاقه‌مندی و بررسی فنی (Middle of Funnel)
* **شرایط و محرک شلیک (Trigger Condition):** بارگذاری کامل صفحه اختصاصی محصول (تجهیزات یا مواد)
* **پارامترهای اجباری (Required Parameters):** `currency, value, items (item_id, item_name, price, item_brand, item_category)`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `items.item_category2, items.availability_status`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد e-commerce: view_item
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** ViewContent در Meta CAPI و Pixel با ارسال content_type='product'
* **نیازمندی‌ها و منطق Server-Side GTM:** تطبیق بلادرنگ قیمت و کاتالوگ با انبار و ارسال به ادز برای Dynamic Product Ads
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** تطابق event_id و کاتالوگ آی‌دی کالا بین مرورگر و سرور
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "view_item",
  "currency": "IRR",
  "value": 2450000000,
  "items": [
    {"item_id": "SKU-UNIT-01", "item_name": "یونیت دندانپزشکی فخرسینا ارتو", "price": 2450000000, "item_category": "Equipment"}
  ]
}
```

---

### EVT-05: رویداد `download_spec_sheet` (دانلود کاتالوگ و دیتاشیت فنی کالا)

* **نام استاندارد فنی:** `download_spec_sheet`
* **عنوان فارسی:** دانلود کاتالوگ و دیتاشیت فنی کالا
* **موقعیت در قیف فروش B2B:** بررسی فنی کلینیکال B2B (High Intent)
* **شرایط و محرک شلیک (Trigger Condition):** کلیک روی دکمه دانلود بروشور، برگه MSDS یا دفترچه راهنمای تجهیزات
* **پارامترهای اجباری (Required Parameters):** `item_id, item_name, file_name, file_extension`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `file_url, user_medical_council_id`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت سفارشی file_download / download_spec_sheet با پارامترهای تجهیزاتی
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** Lead (یا CustomizeEvent: TechnicalInterest) در CAPI
* **نیازمندی‌ها و منطق Server-Side GTM:** سیگنال مستقیم به CRM برای بالا بردن امتیاز سرنخ کلینیک (Lead Scoring +15)
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** جلوگیری از ارسال مجدد در صورت کلیک‌های تکراری با ترکینگ دانلود بر پایه کاربر-فایل
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "download_spec_sheet",
  "item_id": "SKU-AUTOCLAVE-01",
  "item_name": "اتوکلاو کلاس B یوروندا ۲۴ لیتری",
  "file_name": "euronda_e9_specs_fa.pdf",
  "file_extension": "pdf"
}
```

---

### EVT-06: رویداد `add_to_wishlist` (افزودن به لیست علاقه‌مندی‌ها)

* **نام استاندارد فنی:** `add_to_wishlist`
* **عنوان فارسی:** افزودن به لیست علاقه‌مندی‌ها
* **موقعیت در قیف فروش B2B:** تمایل به خرید آتی (Middle of Funnel)
* **شرایط و محرک شلیک (Trigger Condition):** کلیک روی آیکون بوکمارک یا افزودن به لیست خواسته‌های مطب
* **پارامترهای اجباری (Required Parameters):** `currency, value, items`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `items.item_brand, user_id`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد e-commerce: add_to_wishlist
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** AddToWishlist در CAPI و Pixel
* **نیازمندی‌ها و منطق Server-Side GTM:** ارسال ایونت به سیستم اتوماسیون برای ارسال آلارم افت قیمت یا جشنواره شارژ موجودی
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** event_id به همراه شناسه کالا و کاربر
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "add_to_wishlist",
  "currency": "IRR",
  "value": 185000000,
  "items": [{"item_id": "SKU-LIGHT-01", "item_name": "لایت کیور وودپیکر LED.H", "price": 185000000}]
}
```

---

### EVT-07: رویداد `add_to_cart` (افزودن به سبد خرید)

* **نام استاندارد فنی:** `add_to_cart`
* **عنوان فارسی:** افزودن به سبد خرید
* **موقعیت در قیف فروش B2B:** قصد خرید تجاری (Bottom of Funnel)
* **شرایط و محرک شلیک (Trigger Condition):** کلیک روی دکمه «افزودن به سفارش مطب» در صفحه محصول یا پاپ‌آپ سفارش سریع
* **پارامترهای اجباری (Required Parameters):** `currency, value, items (item_id, item_name, price, quantity)`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `items.item_category, cart_total_items`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد e-commerce: add_to_cart
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** AddToCart در CAPI و پلتفرم‌های تبلیغاتی
* **نیازمندی‌ها و منطق Server-Side GTM:** ثبت رویداد جهت راه‌اندازی کمپین‌های ریتارگتینگ رهاشدگی و ارسال سبد به سشن دیتابیس
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** تطبیق شناسه سشن + شناسه کالا + هش زمان کلیک
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "add_to_cart",
  "currency": "IRR",
  "value": 11550000,
  "items": [
    {"item_id": "SKU-COMP-3M", "item_name": "کامپوزیت Filtek Z350 XT 3M", "price": 3850000, "quantity": 3}
  ]
}
```

---

### EVT-08: رویداد `remove_from_cart` (حذف کالا از سبد خرید)

* **نام استاندارد فنی:** `remove_from_cart`
* **عنوان فارسی:** حذف کالا از سبد خرید
* **موقعیت در قیف فروش B2B:** تغییر قصد خرید (Bottom of Funnel)
* **شرایط و محرک شلیک (Trigger Condition):** کلیک روی حذف سطر محصول در سبد خرید یا صفر کردن تعداد
* **پارامترهای اجباری (Required Parameters):** `currency, value, items (item_id, quantity)`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `items.item_name, removal_reason`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد e-commerce: remove_from_cart
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** CustomEvent: RemoveFromCart
* **نیازمندی‌ها و منطق Server-Side GTM:** ارزیابی کشش قیمت و دلایل انصراف از خرید اقلام خاص در انبار داده
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** event_id اختصاصی بر اساس رخداد حذف
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "remove_from_cart",
  "currency": "IRR",
  "value": 3850000,
  "items": [{"item_id": "SKU-COMP-3M", "quantity": 1}]
}
```

---

### EVT-09: رویداد `view_cart` (مشاهده سبد خرید)

* **نام استاندارد فنی:** `view_cart`
* **عنوان فارسی:** مشاهده سبد خرید
* **موقعیت در قیف فروش B2B:** بررسی نهایی اقلام سفارش (Bottom of Funnel)
* **شرایط و محرک شلیک (Trigger Condition):** ورود دندان‌پزشک به صفحه اختصاصی مشاهده فاکتور اولیه و اقلام سبد
* **پارامترهای اجباری (Required Parameters):** `currency, value, items`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `cart_total_weight_kg, estimated_freight`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد e-commerce: view_cart
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** CustomEvent: ViewCart
* **نیازمندی‌ها و منطق Server-Side GTM:** محاسبه ارزش کل فاکتور پیش از اعمال تخفیف و بررسی موجودی انبار اقلام
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** تطابق event_id و زمان ورود به سبد
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "view_cart",
  "currency": "IRR",
  "value": 45000000,
  "items": [
    {"item_id": "SKU-BUR-01", "item_name": "فرز توربین دیاسوییس بسته ۵ عددی", "price": 15000000, "quantity": 3}
  ]
}
```

---

### EVT-10: رویداد `begin_checkout` (آغاز فرایند تسویه‌حساب)

* **نام استاندارد فنی:** `begin_checkout`
* **عنوان فارسی:** آغاز فرایند تسویه‌حساب
* **موقعیت در قیف فروش B2B:** ورود به قیف قطعی تسویه (Checkout Stage 1)
* **شرایط و محرک شلیک (Trigger Condition):** کلیک روی دکمه «تکمیل خرید و ثبت نهایی سفارش» در صفحه سبد
* **پارامترهای اجباری (Required Parameters):** `currency, value, items`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `coupon, user_medical_council_id`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد e-commerce: begin_checkout
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** InitiateCheckout در CAPI و Pixel
* **نیازمندی‌ها و منطق Server-Side GTM:** اعتبارسنجی وضعیت احراز هویت دندان‌پزشک و بررسی بدهی معوق در سرور
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** event_id با ساختار `chk_{user_id}_{timestamp}` برای جلوگیری از دوبار ارسال
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "begin_checkout",
  "currency": "IRR",
  "value": 45000000,
  "coupon": "VIP_DENT_10",
  "items": [
    {"item_id": "SKU-BUR-01", "item_name": "فرز توربین دیاسوییس", "price": 15000000, "quantity": 3}
  ]
}
```

---

### EVT-11: رویداد `add_shipping_info` (ثبت اطلاعات آدرس و نحوه ارسال)

* **نام استاندارد فنی:** `add_shipping_info`
* **عنوان فارسی:** ثبت اطلاعات آدرس و نحوه ارسال
* **موقعیت در قیف فروش B2B:** قیف تسویه حساب (Checkout Stage 2)
* **شرایط و محرک شلیک (Trigger Condition):** تایید آدرس پستی مطب/کلینیک و انتخاب نحوه تحویل (پیک اکسپرس، باربری)
* **پارامترهای اجباری (Required Parameters):** `currency, value, shipping_tier, items`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `city, postal_code_first_5, delivery_estimate_days`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد e-commerce: add_shipping_info
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** CustomEvent: AddShippingInfo
* **نیازمندی‌ها و منطق Server-Side GTM:** محاسبه دقیق هزینه لجستیک تجهیزات سنگین و کسر یا اضافه در فاکتور
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** event_id اختصاصی مرحله آدرس
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "add_shipping_info",
  "currency": "IRR",
  "value": 45000000,
  "shipping_tier": "تیپاکس هوایی ویژه مواد فاسدشدنی",
  "city": "تهران",
  "items": [{"item_id": "SKU-BUR-01", "quantity": 3}]
}
```

---

### EVT-12: رویداد `add_payment_info` (انتخاب شیوه پرداخت و خزانه‌داری)

* **نام استاندارد فنی:** `add_payment_info`
* **عنوان فارسی:** انتخاب شیوه پرداخت و خزانه‌داری
* **موقعیت در قیف فروش B2B:** قیف تسویه حساب (Checkout Stage 3)
* **شرایط و محرک شلیک (Trigger Condition):** انتخاب درگاه آنلاین بانکی، خرید اعتباری چکی یا حواله حساب رسمی
* **پارامترهای اجباری (Required Parameters):** `currency, value, payment_type, items`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `installment_months, initial_downpayment_pct`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد e-commerce: add_payment_info
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** AddPaymentInfo در CAPI و ادز
* **نیازمندی‌ها و منطق Server-Side GTM:** بررسی سقف اعتبار مالیاتی و بانکی کلینیک قبل از هدایت به گیت‌وی
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** event_id مرحله پرداخت
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "add_payment_info",
  "currency": "IRR",
  "value": 45000000,
  "payment_type": "درگاه پرداخت اینترنتی سامان",
  "items": [{"item_id": "SKU-BUR-01", "quantity": 3}]
}
```

---

### EVT-13: رویداد `purchase` (ثبت قطعی خرید و صدور فاکتور)

* **نام استاندارد فنی:** `purchase`
* **عنوان فارسی:** ثبت قطعی خرید و صدور فاکتور
* **موقعیت در قیف فروش B2B:** تبدیل قطعی و درآمد (Conversion)
* **شرایط و محرک شلیک (Trigger Condition):** دریافت پاسخ موفقیت‌آمیز از شاپرک یا تایید قطعی حسابداری برای چک/حواله
* **پارامترهای اجباری (Required Parameters):** `transaction_id, currency, value, items (item_id, name, price, quantity, cogs)`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `tax, shipping, coupon, user_data (hashed_phone, hashed_email)`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد e-commerce: purchase با تمامی جزئیات آیتم‌ها و ارزش ریالی
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** Purchase از طریق Server-Side CAPI با تطابق کامل سیگنال‌های هویتی هشت‌گانه
* **نیازمندی‌ها و منطق Server-Side GTM:** ارسال مستقیم و اختصاصی از بک‌اند مالی تیتانا به CAPI و GA4 MP جهت جلوگیری از بلاک ادبلارک‌ها
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** بر پایه شناسه transaction_id پایدار و یکتا در دیتابیس مالی
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "purchase",
  "transaction_id": "ORD-1405-92041",
  "currency": "IRR",
  "value": 45000000,
  "tax": 4050000,
  "shipping": 250000,
  "coupon": "VIP_DENT_10",
  "user_data": {
    "ph": "a823f92b7c61...",
    "external_id": "CUST-107-8841"
  },
  "items": [
    {"item_id": "SKU-BUR-01", "item_name": "فرز توربین دیاسوییس", "price": 15000000, "quantity": 3}
  ]
}
```

---

### EVT-14: رویداد `refund` (مرجوعی کالا یا عودت وجه فاکتور)

* **نام استاندارد فنی:** `refund`
* **عنوان فارسی:** مرجوعی کالا یا عودت وجه فاکتور
* **موقعیت در قیف فروش B2B:** پشتیبانی پس از فروش و اصلاح درآمد (Post-Purchase Reversal)
* **شرایط و محرک شلیک (Trigger Condition):** تایید نهایی قبض مرجوعی کالا در انبار و صدور سند حسابداری عودت وجه به مشتری
* **پارامترهای اجباری (Required Parameters):** `transaction_id, refund_id, currency, value`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `items (item_id, quantity, return_reason), refund_type (full/partial)`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد refund در GA4 با استفاده از Measurement Protocol سروری
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** Custom Server-Side Event: OrderRefunded جهت تنظیم دقیق الگوریتم‌های ارزش‌محور (tROAS)
* **نیازمندی‌ها و منطق Server-Side GTM:** ارسال الزامی از وب‌هوک سیستم حسابداری تیتانا به BigQuery و سرور GTM بدون مداخله مرورگر
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** شناسه سند حسابداری refund_id به همراه شماره فاکتور اصلی transaction_id
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "refund",
  "transaction_id": "ORD-1405-92041",
  "refund_id": "REF-1405-0192",
  "currency": "IRR",
  "value": 15000000,
  "refund_type": "partial",
  "items": [
    {
      "item_id": "SKU-BUR-01",
      "quantity": 1,
      "price": 15000000,
      "return_reason": "عدم تطابق سایز فرز با سفارش کلینیک"
    }
  ]
}
```

---

### EVT-15: رویداد `repeat_purchase` (خرید مجدد دندان‌پزشک در چرخه وفاداری)

* **نام استاندارد فنی:** `repeat_purchase`
* **عنوان فارسی:** خرید مجدد دندان‌پزشک در چرخه وفاداری
* **موقعیت در قیف فروش B2B:** حفظ و وفاداری مشتری (Retention & Expansion)
* **شرایط و محرک شلیک (Trigger Condition):** تکمیل موفق دومین یا چندمین سفارش قطعی توسط یک master_customer_id ثبت‌شده در سیستم
* **پارامترهای اجباری (Required Parameters):** `transaction_id, master_customer_id, purchase_sequence_number, currency, value`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `days_since_prior_order, items, loyalty_tier_level`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت سفارشی repeat_purchase با برچسب‌گذاری بعد سفارشی Customer Lifetime Stage
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** رویداد پیشرفته RepeatPurchase در Meta CAPI جهت سیگنال‌دهی برای ساخت لوک‌الایک وفادار
* **نیازمندی‌ها و منطق Server-Side GTM:** محاسبه آنی فاصله زمانی بین دو خرید (Order Interval Days) و به‌روزرسانی متریک CLV در دیتابیس
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** اتصال قطعی به transaction_id فاکتور جاری با بررسی شمارنده خرید در جدول مشتریان
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "repeat_purchase",
  "transaction_id": "ORD-1405-98310",
  "master_customer_id": "CUST-107-8841",
  "purchase_sequence_number": 3,
  "days_since_prior_order": 28,
  "currency": "IRR",
  "value": 128000000,
  "loyalty_tier_level": "Gold",
  "items": [
    {"item_id": "SKU-BOND-01", "item_name": "باندینگ نسل ۵ توکویاما", "price": 42000000, "quantity": 2}
  ]
}
```

---

### EVT-16: رویداد `generate_lead` (ثبت لید و فرم تماس اولیه)

* **نام استاندارد فنی:** `generate_lead`
* **عنوان فارسی:** ثبت لید و فرم تماس اولیه
* **موقعیت در قیف فروش B2B:** جذب سرنخ تجاری (Lead Acquisition)
* **شرایط و محرک شلیک (Trigger Condition):** ارسال موفق فرم درخواست مشاوره خرید تجهیزات یا تماس در سایت
* **پارامترهای اجباری (Required Parameters):** `lead_id, lead_type, hashed_phone_number`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `clinic_name, dental_specialty, estimated_budget`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد generate_lead
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** Lead در CAPI و فرم‌های لید اینستاگرام
* **نیازمندی‌ها و منطق Server-Side GTM:** ارسال مستقیم و آنی به وب‌هوک CRM جهت ایجاد وظیفه تماس کارشناس ظرف کمتر از ۱۵ دقیقه
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** جلوگیری از ارسال چندباره لید تکراری در بازه ۲۴ ساعته بر پایه شماره تماس هش‌شده
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "generate_lead",
  "lead_id": "LEAD-1405-7721",
  "lead_type": "consultation_request",
  "user_data": {"ph": "c9284fa091b..."},
  "lead_source": "landing_page_endodontics"
}
```

---

### EVT-17: رویداد `submit_clinic_inquiry` (استعلام رسمی قیمت و پیش‌فاکتور کلینیک)

* **نام استاندارد فنی:** `submit_clinic_inquiry`
* **عنوان فارسی:** استعلام رسمی قیمت و پیش‌فاکتور کلینیک
* **موقعیت در قیف فروش B2B:** اعتبارسنجی سرنخ و استعلام B2B (MQL to SQL)
* **شرایط و محرک شلیک (Trigger Condition):** تکمیل و ارسال فرم استعلام اقلام عمده یا استعلام قیمت مناقصات درمانگاهی
* **پارامترهای اجباری (Required Parameters):** `inquiry_id, clinic_tier, total_inquiry_skus_count`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `target_procurement_date, payment_preference`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت سفارشی submit_clinic_inquiry همراه با دسته‌بندی سطح مرکز درمانی
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** Lead با برچسب B2B_HighTicket_Inquiry
* **نیازمندی‌ها و منطق Server-Side GTM:** محاسبه خودکار تخمین ارزش معامله بر اساس لیست اقلام و ارجاع به مدیر فروش کلیدی
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** inquiry_id یکتا در سیستم CRM تیتانا
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "submit_clinic_inquiry",
  "inquiry_id": "INQ-99201",
  "clinic_tier": "کلینیک تخصصی شبانه‌روزی",
  "total_inquiry_skus_count": 8,
  "estimated_value": 3500000000
}
```

---

### EVT-18: رویداد `request_equipment_demo` (درخواست دمو حضوری تجهیزات بزرگ)

* **نام استاندارد فنی:** `request_equipment_demo`
* **عنوان فارسی:** درخواست دمو حضوری تجهیزات بزرگ
* **موقعیت در قیف فروش B2B:** مذاکره و ارزیابی فنی (SQL to Demo)
* **شرایط و محرک شلیک (Trigger Condition):** ثبت تقاضای مشاهده حضوری یونیت یا اسکنر داخل دهانی در شوروم مرکزی یا مطب دندان‌پزشک
* **پارامترهای اجباری (Required Parameters):** `demo_id, equipment_sku, preferred_demo_city`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `clinic_address, doctor_specialty`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت سفارشی request_equipment_demo با پارامتر نوع دستگاه و منطقه
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** Schedule در CAPI با ارزش‌گذاری فرضی بالا
* **نیازمندی‌ها و منطق Server-Side GTM:** ایجاد پرونده رزرو شوروم و تخصیص تکنسین فنی و کارشناس فروش در اتوماسیون
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** demo_id یکتا در جدول هماهنگی جلسات
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "request_equipment_demo",
  "demo_id": "DEMO-8819",
  "equipment_sku": "SKU-UNIT-01",
  "equipment_name": "یونیت فخرسینا مدل ارتو پلاس",
  "preferred_demo_city": "تهران"
}
```

---

### EVT-19: رویداد `schedule_sales_call` (رزرو زمان تماس مشاوره تلفنی با مهندس فروش)

* **نام استاندارد فنی:** `schedule_sales_call`
* **عنوان فارسی:** رزرو زمان تماس مشاوره تلفنی با مهندس فروش
* **موقعیت در قیف فروش B2B:** پایپ‌لاین فروش B2B (Pipeline Engagement)
* **شرایط و محرک شلیک (Trigger Condition):** انتخاب تقویم زمانی آنلاین جهت دریافت تماس کارشناسی تجهیزات
* **پارامترهای اجباری (Required Parameters):** `booking_id, scheduled_time, call_topic`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `doctor_name, clinic_type`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت سفارشی schedule_sales_call
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** Schedule در پلتفرم‌های تبلیغاتی
* **نیازمندی‌ها و منطق Server-Side GTM:** ارسال تقویم iCal به ایمیل کارشناس فروش و پیامک یادآوری به دندان‌پزشک
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** booking_id یکتا در پنل رزرواسیون
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "schedule_sales_call",
  "booking_id": "BK-2026-302",
  "scheduled_time": "2026-09-22T14:00:00Z",
  "call_topic": "مشاوره خرید اتوکلاو و دستگاه آب مقطرگیر"
}
```

---

### EVT-20: رویداد `view_promotion` (مشاهده بنر یا پروموشن تبلیغاتی در سایت)

* **نام استاندارد فنی:** `view_promotion`
* **عنوان فارسی:** مشاهده بنر یا پروموشن تبلیغاتی در سایت
* **موقعیت در قیف فروش B2B:** تعامل داخلی با کمپین‌ها (On-site Engagement)
* **شرایط و محرک شلیک (Trigger Condition):** ظاهر شدن بنر پروموشن ویژه کنگره یا جشنواره در دیدرس کاربر (Impression)
* **پارامترهای اجباری (Required Parameters):** `promotion_id, promotion_name`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `creative_slot, items`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد e-commerce: view_promotion
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** CustomEvent: ViewPromotion
* **نیازمندی‌ها و منطق Server-Side GTM:** ردیابی CTR و ارزیابی بهره‌وری اسلایدرها و بنرهای داخلی سایت تیتانا
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** تطبیق پروموشن آی‌دی و سشن جهت پرهیز از شمردن مکرر در هر اسکرول
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "view_promotion",
  "promotion_id": "PROMO-EXIDA-2026",
  "promotion_name": "جشنواره ویژه کنگره اکسیدا تیتانا",
  "creative_slot": "main_home_hero_banner"
}
```

---

### EVT-21: رویداد `select_promotion` (کلیک روی بنر جشنواره و آفر اختصاصی)

* **نام استاندارد فنی:** `select_promotion`
* **عنوان فارسی:** کلیک روی بنر جشنواره و آفر اختصاصی
* **موقعیت در قیف فروش B2B:** تعامل داخلی با کمپین‌ها (On-site Engagement)
* **شرایط و محرک شلیک (Trigger Condition):** کلیک کاربر روی بنر پروموشن یا کارت پیشنهاد شگفت‌انگیز
* **پارامترهای اجباری (Required Parameters):** `promotion_id, promotion_name`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `creative_slot, destination_url`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد e-commerce: select_promotion
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** CustomEvent: SelectPromotion
* **نیازمندی‌ها و منطق Server-Side GTM:** محاسبه دقیق نرخ کلیک (CTR) بنرهای داخلی فروشگاه
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** event_id در لحظه کلیک
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "select_promotion",
  "promotion_id": "PROMO-EXIDA-2026",
  "promotion_name": "جشنواره ویژه کنگره اکسیدا تیتانا",
  "creative_slot": "main_home_hero_banner"
}
```

---

### EVT-22: رویداد `search` (جستجوی داخلی در محصولات و کاتالوگ)

* **نام استاندارد فنی:** `search`
* **عنوان فارسی:** جستجوی داخلی در محصولات و کاتالوگ
* **موقعیت در قیف فروش B2B:** کشف نیاز و جستجوی محصول (Middle of Funnel)
* **شرایط و محرک شلیک (Trigger Condition):** زدن دکمه اینتر یا کلیک روی آیکون جستجو در نوار سرچ سایت
* **پارامترهای اجباری (Required Parameters):** `search_term`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `search_results_count, applied_filters`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد GA4: search با پارامتر search_term
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** Search در Meta CAPI و Pixel
* **نیازمندی‌ها و منطق Server-Side GTM:** لاگ‌کردن عبارات جستجوی بدون نتیجه (Zero-Result Searches) جهت شارژ اقلام ناموجود
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** search_id یکتا به ازای هر کوئری متمایز
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "search",
  "search_term": "آرتیکائین سپتودنت",
  "search_results_count": 4
}
```

---

### EVT-23: رویداد `login` (ورود دندان‌پزشک به پنل کاربری)

* **نام استاندارد فنی:** `login`
* **عنوان فارسی:** ورود دندان‌پزشک به پنل کاربری
* **موقعیت در قیف فروش B2B:** احراز هویت و فعال‌سازی (User Activation)
* **شرایط و محرک شلیک (Trigger Condition):** ورود موفق کاربر از طریق تایید کد پیامکی OTP یا رمز عبور
* **پارامترهای اجباری (Required Parameters):** `method (otp_sms/password), master_customer_id`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `user_role (dentist/clinic_manager/technician)`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد login به همراه تنظیم شناسه user_id در سشن
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** CustomEvent: UserLogin با سیگنال هویتی CAPI
* **نیازمندی‌ها و منطق Server-Side GTM:** متصل‌کردن مسیرهای ناشناس قبلی کلاینت (Stitching) به هویت واقعی کاربر در DWH
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** event_id اختصاصی سشن لاگین
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "login",
  "method": "otp_sms",
  "user_id": "CUST-107-8841",
  "user_role": "dentist"
}
```

---

### EVT-24: رویداد `sign_up` (ثبت‌نام رسمی کلینیک و احراز هویت نظام پزشکی)

* **نام استاندارد فنی:** `sign_up`
* **عنوان فارسی:** ثبت‌نام رسمی کلینیک و احراز هویت نظام پزشکی
* **موقعیت در قیف فروش B2B:** جذب عضو جدید و اعتبارسنجی صنفی (B2B Onboarding)
* **شرایط و محرک شلیک (Trigger Condition):** تکمیل موفق فرم ثبت‌نام و اعتبارسنجی اولیه شماره نظام پزشکی دندان‌پزشک
* **پارامترهای اجباری (Required Parameters):** `method, master_customer_id, medical_council_id`
* **پارامترهای اختیاری و تکمیلی (Optional Parameters):** `specialty, clinic_city, registration_source`
* **نگاشت به اسکیما و رویدادهای GA4:** ایونت استاندارد sign_up با پارامترهای سفارشی تخصص
* **نگاشت به اسکیما و رویدادهای Meta CAPI:** CompleteRegistration در Meta CAPI با بالاترین درجه تطابق هویتی (Match Quality)
* **نیازمندی‌ها و منطق Server-Side GTM:** ارسال به وب‌سرویس سازمان نظام پزشکی جهت احراز صحت هویت دندان‌پزشک و فعال‌سازی اکانت B2B
* **استراتژی پیشگیری از داده‌های تکراری (Deduplication Strategy):** شماره نظام پزشکی یکتا به همراه master_customer_id در سرور
* **نمونه ساختار Payload استاندارد (DataLayer / JSON):**
```json
{
  "event": "sign_up",
  "method": "medical_council_verification",
  "user_id": "CUST-107-9102",
  "medical_council_id": "184920",
  "specialty": "جراحی دهان، فک و صورت",
  "user_data": {
    "ph": "e1903487c...",
    "external_id": "CUST-107-9102"
  }
}
```

---

