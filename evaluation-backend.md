# ربط نموذج التقييم بـ Google Sheets

يجعل تقييم المشرفة يُحفظ في جدول Google ويظهر تلقائيًا للمعلمة من أي جهاز.

## الخطوات

1. أنشئي جدول Google جديد ([sheets.new](https://sheets.new)).
2. انسخي **معرّف الجدول** من الرابط — الجزء بين `/d/` و `/edit`:
   `docs.google.com/spreadsheets/d/`**`1AbCd...XyZ`**`/edit`
3. من الجدول: **الإضافات ← Apps Script** (Extensions → Apps Script).
4. تأكدي أن فيه **ملف واحد فقط** (`Code.gs`). احذفي أي ملف إضافي.
5. امسحي كل الكود الموجود، والصقي كود Code.gs أدناه — **بدون** أي علامات ` ``` `.
6. في السطر `var SHEET_ID = '...'` ضعي معرّف الجدول من خطوة 2.
7. احفظي (Ctrl+S).
8. **Deploy ← New deployment ← Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy ← وافقي على الأذونات.
9. انسخي **Web app URL** (ينتهي بـ `/exec`).
10. اختبري: افتحي رابط `/exec` في تبويب جديد ← لازم يظهر `{}` فقط.
11. في `js/main.js` داخل `evalu()`:
    ```js
    const ENDPOINT = "https://script.google.com/macros/s/XXXXX/exec";
    ```
12. جرّبي التقييم من الموقع ← يظهر صف في الجدول.

> أي تعديل لاحق على الكود: **Deploy ← Manage deployments ← ✏️ ← Version: New version ← Deploy**.

---

## Code.gs

```javascript
/** نموذج تقييم أداء المعلم — تخزين في Google Sheets */

function getSheet_() {
  var SHEET_ID = 'ضعي_معرّف_الجدول_هنا';   // بين /d/ و /edit من رابط الجدول
  var TAB = 'التقييمات';
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.appendRow(['الوقت', 'المشرفة', 'النسبة %', 'التقدير', 'التفاصيل', 'التاريخ']);
  }
  return sh;
}

function gradeText_(p) {
  if (p >= 90) return 'ممتاز';
  if (p >= 80) return 'جيد جدًا';
  if (p >= 70) return 'جيد';
  if (p >= 60) return 'مقبول';
  return 'يحتاج تحسين';
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var pct = Number(d.pct) || 0;
    getSheet_().appendRow([new Date(), d.reviewer || '', pct, gradeText_(pct),
      JSON.stringify(d.ratings || []), d.date || '']);
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, error: String(err) });
  }
}

function doGet() {
  try {
    var sh = getSheet_();
    var n = sh.getLastRow();
    if (n < 2) return reply_({});
    var row = sh.getRange(n, 1, 1, 6).getValues()[0];
    var ratings = [];
    try { ratings = JSON.parse(row[4]); } catch (e) {}
    return reply_({
      pct: Number(row[2]) || 0,
      ratings: ratings,
      reviewer: row[1] || '',
      date: row[5] || ''
    });
  } catch (err) {
    return reply_({ ok: false, error: String(err) });
  }
}
```
