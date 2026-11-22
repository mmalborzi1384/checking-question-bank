# راهنمای انتشار روی GitHub Pages، نصب آفلاین PWA و ساخت Android APK

این پروژه برای هر سه حالت زیر به‌صورت کامل و بدون نیاز به تغییر کد پیکربندی شده است:

---

## روش ۱: انتشار سایت روی GitHub Pages و نصب مستقیم آفلاین روی گوشی (PWA)

1. کد پروژه را در یک مخزن GitHub (عمومی یا خصوصی با Pages فعال) قرار دهید (`main` یا `master`).
2. در مخزن گیت‌هاب به مسیر **`Settings → Pages`** بروید.
3. در بخش **Build and deployment**، گزینهٔ **Source** را روی **`GitHub Actions`** قرار دهید.
4. workflow آمادهٔ `.github/workflows/deploy-pages.yml` به‌صورت خودکار مسیر زیرپوشهٔ مخزن (`/<repo-name>/`) را تشخیص می‌دهد، فایل‌های PWA و Service Worker را بیلد می‌کند و سایت را منتشر می‌کند.
5. پس از انتشار، لینک GitHub Pages را در Chrome گوشی (یا Safari روی آیفون) باز کنید و دکمهٔ **«نصب اپ آفلاین (PWA)»** (یا Add to Home Screen) را بزنید تا اپ با تمام ۵ فایل JSON و فرمول‌های KaTeX کاملاً آفلاین روی گوشی اجرا شود.

---

## روش ۲: ساخت خودکار فایل Android APK بدون نصب Android Studio (با GitHub Actions)

1. پس از آپلود کد روی GitHub، به تب **`Actions`** مخزن بروید.
2. از ستون سمت چپ، workflow به نام **`Build Android APK`** (فایل `.github/workflows/build-android-apk.yml`) را انتخاب کنید.
3. آخرین اجرای موفق را باز کنید (یا دکمهٔ **`Run workflow`** را بزنید).
4. از بخش **Artifacts** در پایین صفحه، فایل **`graph-theory-review-android-apk`** را دانلود کرده، از حالت ZIP خارج کنید و فایل `graph-theory-review-debug.apk` را روی گوشی اندرویدی نصب نمایید.

---

## روش ۳: ساخت محلی Android APK روی کامپیوتر (با Capacitor)

### پیش‌نیازها
- Node.js 20+
- JDK 21 (مورد نیاز Capacitor 8 / Android Gradle)
- Android SDK یا Android Studio

### دستورات ترمینال

```bash
# ۱. نصب وابستگی‌ها
npm install

# ۲. بیلد نسخهٔ وب آفلاین
npm run build

# ۳. افزودن پلتفرم اندروید (فقط بار اول)
npm run cap:add

# ۴. همگام‌سازی فایل‌های بیلدشده با پروژه اندروید
npm run cap:sync

# ۵-الف. ساخت مستقیم Debug APK
npm run cap:apk
# مسیر خروجی:
# android/app/build/outputs/apk/debug/app-debug.apk

# ۵-ب. یا باز کردن پروژه در Android Studio برای ساخت Signed Release APK
npm run cap:open
```
