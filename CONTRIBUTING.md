# دليل المساهمة في WordJoiner PRO

نرحب بمساهماتكم في تطوير WordJoiner PRO! سواء كانت إصلاحات للأخطاء، ميزات جديدة، تحسينات في التوثيق، أو أي شيء آخر، فإن مساعدتكم محل تقدير كبير.

## كيف تساهم؟

1.  **Fork المستودع:** ابدأ بعمل Fork للمستودع على GitHub إلى حسابك الخاص.
2.  **استنسخ المستودع:** استنسخ المستودع الذي قمت بعمل Fork له إلى جهازك المحلي:
    ```bash
    git clone https://github.com/YOUR_USERNAME/WordJoiner-TikTok-Tool.git
    cd WordJoiner-TikTok-Tool
    ```
3.  **أنشئ فرعًا جديدًا:** أنشئ فرعًا جديدًا لعملك. استخدم اسمًا وصفيًا للفرع (مثل `feature/add-dark-mode` أو `fix/typo-in-readme`).
    ```bash
    git checkout -b feature/your-feature-name
    ```
4.  **قم بإجراء التغييرات:** قم بإجراء التغييرات المطلوبة على الكود أو التوثيق.
5.  **اختبر تغييراتك:** تأكد من أن تغييراتك لا تسبب أي أخطاء وأنها تعمل كما هو متوقع.
6.  **قم بتثبيت التغييرات (Commit):** قم بتثبيت تغييراتك برسالة Commit واضحة وموجزة.
    ```bash
    git commit -m "feat: Add new feature X" # أو fix: Fix bug Y
    ```
7.  **ادفع الفرع:** ادفع الفرع الجديد إلى مستودعك على GitHub.
    ```bash
    git push origin feature/your-feature-name
    ```
8.  **افتح طلب سحب (Pull Request):** انتقل إلى مستودعك على GitHub وافتح طلب سحب جديد إلى الفرع الرئيسي (main) للمستودع الأصلي. يرجى وصف تغييراتك بالتفصيل في وصف طلب السحب.

## إرشادات Commit Message

نتبع اصطلاحات رسائل Commit المحددة. يرجى استخدام التنسيق التالي:

```
<type>: <subject>

[optional body]
```

**الأنواع الشائعة:**

*   `feat`: ميزة جديدة
*   `fix`: إصلاح خطأ
*   `docs`: تغييرات في التوثيق فقط
*   `style`: تغييرات لا تؤثر على معنى الكود (مسافات بيضاء، تنسيق، فواصل منقوطة مفقودة، إلخ)
*   `refactor`: تغيير في الكود لا يصلح خطأ ولا يضيف ميزة
*   `perf`: تغيير في الكود يحسن الأداء
*   `test`: إضافة اختبارات مفقودة أو تصحيح اختبارات موجودة
*   `build`: تغييرات تؤثر على نظام البناء أو التبعيات الخارجية (npm, gulp, etc)
*   `ci`: تغييرات لملفات وإعدادات CI
*   `chore`: تحديثات روتينية لا تتعلق بالكود (مثل تحديث ملف .gitignore)
*   `revert`: التراجع عن Commit سابق

**مثال:**

```
feat: Add dark mode toggle to UI

This commit introduces a new dark mode feature, allowing users to switch
between light and dark themes for improved readability in different lighting conditions.
```

## إرشادات الكود

*   حافظ على الكود نظيفًا ومقروءًا.
*   استخدم تعليقات برمجية واضحة عند الضرورة.
*   اتبع اصطلاحات التسمية المتسقة.
*   تأكد من أن الكود الخاص بك متوافق مع المتصفحات الحديثة.

شكرًا لمساهمتك في WordJoiner PRO!
