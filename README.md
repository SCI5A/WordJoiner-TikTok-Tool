# WordJoiner TikTok Tool

## أداة منع دمج الكلمات في TikTok

تطبيق ويب تقدمي (PWA) بسيط مصمم لمساعدة المستخدمين على منع دمج الكلمات العربية عند نسخ النصوص إلى تطبيقات مثل TikTok. يتم ذلك عن طريق إدخال أحرف Unicode غير مرئية بين الكلمات، مما يضمن ظهور النص بشكل صحيح ودون دمج غير مقصود.

### الميزات:

*   **منع دمج الكلمات:** يستخدم أحرف Unicode مثل Word Joiner (U+2060) لمنع دمج الأحرف العربية.
*   **خيارات متعددة:** يوفر خيارات مختلفة للأحرف غير المرئية لتوافق أفضل مع التطبيقات المختلفة:
    *   Word Joiner (U+2060)
    *   Zero Width Joiner (U+200D)
    *   Zero Width Non Joiner (U+200C)
    *   Thin Space (U+2009)
*   **الحفاظ على النص:** يحافظ على علامات التشكيل والآيات والنصوص العربية الأصلية دون تغيير.
*   **عداد الأحرف:** يعرض عدد الأحرف لكل من النص الأصلي والنص المعالج.
*   **نسخ سهل:** زر نسخ يعمل بكفاءة على أجهزة Android و iOS.
*   **تصميم متجاوب:** يعمل بسلاسة على الهواتف الذكية وأجهزة الكمبيوتر المكتبية.
*   **تطبيق ويب تقدمي (PWA):** يمكن تثبيته على الشاشة الرئيسية واستخدامه دون اتصال بالإنترنت.

### كيفية الاستخدام:

1.  الصق النص العربي الذي ترغب في معالجته في مربع الإدخال "النص الأصلي".
2.  اختر طريقة المعالجة المفضلة لديك من الخيارات المتاحة (مثل Word Joiner U+2060).
3.  انقر على زر "تحويل النص".
4.  سيظهر النص المعالج في مربع "النص الناتج".
5.  انقر على زر "نسخ النص" لنسخ النص المعدل إلى حافظتك.
6.  يمكنك بعد ذلك لصق هذا النص في TikTok أو أي تطبيق آخر دون القلق بشأن دمج الكلمات.

### التثبيت (PWA):

هذا تطبيق ويب تقدمي (PWA)، مما يعني أنه يمكنك تثبيته مباشرة من متصفحك إلى الشاشة الرئيسية لجهازك للوصول السريع والاستخدام دون اتصال بالإنترنت.

*   **على Android:**
    1.  افتح الموقع في متصفح Chrome.
    2.  انقر على أيقونة القائمة (ثلاث نقاط في الزاوية العلوية اليمنى).
    3.  اختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق".
    4.  اتبع التعليمات التي تظهر على الشاشة.
*   **على iOS (Safari):**
    1.  افتح الموقع في متصفح Safari.
    2.  انقر على زر المشاركة (المربع الذي يحتوي على سهم يشير للأعلى).
    3.  مرر لأسفل وانقر على "إضافة إلى الشاشة الرئيسية".
    4.  انقر على "إضافة" في الزاوية العلوية اليمنى.

### التطوير:

تم بناء هذا المشروع باستخدام:

*   HTML5
*   CSS3
*   JavaScript (Vanilla)
*   PWA (Service Worker, Manifest)

### المساهمة:

لا تتردد في عمل Fork للمستودع، وإجراء تحسينات، وتقديم طلبات سحب (Pull Requests).

### الترخيص:

هذا المشروع مرخص بموجب ترخيص MIT - راجع ملف [LICENSE](LICENSE) لمزيد من التفاصيل.

---

# WordJoiner TikTok Tool

## TikTok Word Joiner Prevention Tool

A simple Progressive Web App (PWA) designed to help users prevent Arabic word merging when copying text into applications like TikTok. It achieves this by inserting invisible Unicode characters between words, ensuring the text appears correctly and without unintended connections.

### Features:

*   **Word Merging Prevention:** Utilizes Unicode characters such as Word Joiner (U+2060) to prevent Arabic letters from merging.
*   **Multiple Options:** Provides various invisible character options for better compatibility with different applications:
    *   Word Joiner (U+2060)
    *   Zero Width Joiner (U+200D)
    *   Zero Width Non Joiner (U+200C)
    *   Thin Space (U+2009)
*   **Text Preservation:** Maintains diacritics, Quranic verses, and original Arabic text without alteration.
*   **Character Counter:** Displays the character count for both the original and processed text.
*   **Easy Copy:** A copy button that works efficiently on Android and iOS devices.
*   **Responsive Design:** Works seamlessly on smartphones and desktop computers.
*   **Progressive Web App (PWA):** Can be installed on the home screen and used offline.

### How to Use:

1.  Paste the Arabic text you wish to process into the "Original Text" input box.
2.  Select your preferred joining method from the available options (e.g., Word Joiner U+2060).
3.  Click the "Convert Text" button.
4.  The processed text will appear in the "Output Text" box.
5.  Click the "Copy Text" button to copy the modified text to your clipboard.
6.  You can then paste this text into TikTok or any other application without worrying about word merging.

### Installation (PWA):

This is a Progressive Web App (PWA), which means you can install it directly from your browser to your device's home screen for quick access and offline use.

*   **On Android:**
    1.  Open the website in Chrome.
    2.  Tap the menu icon (three dots in the top right corner).
    3.  Select "Add to Home screen" or "Install app".
    4.  Follow the on-screen prompts.
*   **On iOS (Safari):**
    1.  Open the website in Safari.
    2.  Tap the Share button (the square with an arrow pointing upwards).
    3.  Scroll down and tap "Add to Home Screen".
    4.  Tap "Add" in the top right corner.

### Development:

This project is built with:

*   HTML5
*   CSS3
*   JavaScript (Vanilla)
*   PWA (Service Worker, Manifest)

### Contributing:

Feel free to fork the repository, make improvements, and submit pull requests.

### License:

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
