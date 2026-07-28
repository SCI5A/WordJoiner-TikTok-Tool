document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const joinerType = document.getElementById('joinerType');
    const convertBtn = document.getElementById('convertBtn');
    const autoBtn = document.getElementById('autoBtn');
    const clearBtn = document.getElementById('clearBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const copyBtn = document.getElementById('copyBtn');
    const shareBtn = document.getElementById('shareBtn');
    const undoBtn = document.getElementById('undoBtn');
    const themeToggle = document.getElementById('themeToggle');
    const inputStats = document.getElementById('inputStats');
    const outputStats = document.getElementById('outputStats');
    const quranWarning = document.getElementById('quranWarning');
    const toast = document.getElementById('toast');

    // State
    let history = {
        previousInput: '',
        previousOutput: ''
    };

    // Theme Management
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // Input Stats & Quran Detection
    inputText.addEventListener('input', () => {
        updateStats();
        detectQuranicText();
    });

    function updateStats() {
        const text = inputText.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        const size = new Blob([text]).size;
        
        inputStats.textContent = `الكلمات: ${words} | الأحرف: ${chars} | الحجم: ${size} B`;
    }

    function detectQuranicText() {
        // Simple detection for Quranic markers or common words
        const quranicMarkers = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/;
        if (quranicMarkers.test(inputText.value)) {
            quranWarning.classList.remove('hidden');
        } else {
            quranWarning.classList.add('hidden');
        }
    }

    // Processing Logic
    const joiners = {
        'U+2060': '\u2060', // Word Joiner
        'U+200D': '\u200D', // Zero Width Joiner
        'U+200C': '\u200C', // Zero Width Non-Joiner
        'U+200A': '\u200A', // Hair Space
        'U+2009': '\u2009', // Thin Space
        'U+00A0': '\u00A0'  // Non Breaking Space
    };

    convertBtn.addEventListener('click', () => {
        processText(joinerType.value);
    });

    autoBtn.addEventListener('click', () => {
        // Auto chooses Word Joiner as it's usually the most effective for TikTok
        processText('U+2060');
        showToast('تم تطبيق أفضل طريقة تلقائيًا');
    });

    function processText(type) {
        const text = inputText.value;
        if (!text) {
            showToast('الرجاء إدخال نص أولاً');
            return;
        }

        // Save to history before changing
        history.previousInput = inputText.value;
        history.previousOutput = outputText.value;
        undoBtn.disabled = false;

        const joiner = joiners[type] || joiners['U+2060'];
        let result = '';

        // Regex to identify Arabic characters and diacritics
        // We want to avoid inserting joiners between a character and its diacritic
        const arabicCharRegex = /[\u0600-\u06FF]/;
        const diacriticRegex = /[\u064B-\u065F\u0610-\u061A]/;

        for (let i = 0; i < text.length; i++) {
            result += text[i];
            
            // Conditions for adding joiner:
            // 1. Current char is Arabic
            // 2. Next char exists and is Arabic
            // 3. Next char is not a diacritic (to keep diacritics attached)
            // 4. Current char is not a space/newline
            if (i < text.length - 1) {
                const currentChar = text[i];
                const nextChar = text[i+1];
                
                if (arabicCharRegex.test(currentChar) && 
                    arabicCharRegex.test(nextChar) && 
                    !diacriticRegex.test(nextChar) &&
                    currentChar !== ' ' && currentChar !== '\n') {
                    result += joiner;
                }
            }
        }

        outputText.value = result;
        outputStats.textContent = `الأحرف بعد التحويل: ${result.length}`;
    }

    // Actions
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
        updateStats();
        detectQuranicText();
        outputStats.textContent = 'الأحرف بعد التحويل: 0';
        showToast('تم مسح النص');
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            inputText.value = text;
            updateStats();
            detectQuranicText();
            showToast('تم لصق النص');
        } catch (err) {
            showToast('فشل اللصق، يرجى المحاولة يدوياً');
        }
    });

    copyBtn.addEventListener('click', () => {
        if (!outputText.value) return;
        
        navigator.clipboard.writeText(outputText.value).then(() => {
            showToast('تم نسخ النص المحمي!');
        }).catch(() => {
            // Fallback
            outputText.select();
            document.execCommand('copy');
            showToast('تم النسخ!');
        });
    });

    shareBtn.addEventListener('click', async () => {
        if (!outputText.value) return;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'WordJoiner PRO',
                    text: outputText.value
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            showToast('المشاركة غير مدعومة في هذا المتصفح');
        }
    });

    undoBtn.addEventListener('click', () => {
        inputText.value = history.previousInput;
        outputText.value = history.previousOutput;
        updateStats();
        detectQuranicText();
        undoBtn.disabled = true;
        showToast('تمت استعادة النص السابق');
    });

    // Toast Utility
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
