document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const inputCount = document.getElementById('inputCount');
    const outputCount = document.getElementById('outputCount');
    const joinerRadios = document.getElementsByName('joinerType');

    // تحديث عداد الأحرف عند الكتابة
    inputText.addEventListener('input', () => {
        inputCount.textContent = inputText.value.length;
    });

    // وظيفة التحويل
    convertBtn.addEventListener('click', () => {
        const text = inputText.value;
        if (!text) {
            alert('الرجاء إدخال نص أولاً');
            return;
        }

        let joiner = '';
        const selectedType = Array.from(joinerRadios).find(r => r.checked).value;

        switch (selectedType) {
            case 'U+2060': joiner = '\u2060'; break;
            case 'U+200D': joiner = '\u200D'; break;
            case 'U+200C': joiner = '\u200C'; break;
            case 'U+2009': joiner = '\u2009'; break;
            default: joiner = '\u2060';
        }

        // تقسيم النص إلى كلمات وإعادة دمجها باستخدام المحرف المختار
        // نستخدم regex للحفاظ على المسافات وعلامات التشكيل
        // الفكرة هي وضع المحرف بين كل حرفين في الكلمات العربية لمنع التعرف عليها ككلمة واحدة قابلة للدمج
        // أو ببساطة وضعه بعد كل حرف
        
        let processedText = '';
        for (let i = 0; i < text.length; i++) {
            processedText += text[i];
            // إضافة المحرف إذا كان الحرف الحالي ليس مسافة والحرف التالي ليس مسافة وليس نهاية النص
            if (text[i] !== ' ' && text[i] !== '\n' && i < text.length - 1 && text[i+1] !== ' ' && text[i+1] !== '\n') {
                processedText += joiner;
            }
        }

        outputText.value = processedText;
        outputCount.textContent = processedText.length;
    });

    // وظيفة المسح
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
        inputCount.textContent = '0';
        outputCount.textContent = '0';
    });

    // وظيفة النسخ
    copyBtn.addEventListener('click', () => {
        if (!outputText.value) return;

        // طريقة متوافقة مع iOS و Android
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(outputText.value).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'تم النسخ!';
                copyBtn.style.backgroundColor = '#4bb543';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.backgroundColor = '';
                }, 2000);
            }).catch(err => {
                console.error('فشل النسخ: ', err);
                fallbackCopy(outputText);
            });
        } else {
            fallbackCopy(outputText);
        }
    });

    function fallbackCopy(element) {
        element.select();
        element.setSelectionRange(0, 99999); // للهواتف
        try {
            document.execCommand('copy');
            alert('تم نسخ النص بنجاح');
        } catch (err) {
            alert('عذراً، فشل النسخ التلقائي');
        }
    }
});
