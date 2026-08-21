document.addEventListener('DOMContentLoaded', () => {
    // ==================== DOM Elements ====================
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
    
    // Advanced Options
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedOptions = document.getElementById('advancedOptions');
    const preserveDiacritics = document.getElementById('preserveDiacritics');
    const smartSpacing = document.getElementById('smartSpacing');
    const preserveNumbers = document.getElementById('preserveNumbers');
    const autoRepairSpacing = document.getElementById('autoRepairSpacing');
    const applicationRatio = document.getElementById('applicationRatio');
    const ratioValue = document.getElementById('ratioValue');
    
    // Preview
    const previewBtn = document.getElementById('previewBtn');
    const previewCard = document.querySelector('.preview-card');
    const closePreview = document.getElementById('closePreview');
    const previewOriginal = document.getElementById('previewOriginal');
    const previewProcessed = document.getElementById('previewProcessed');
    
    // Save
    const saveBtn = document.getElementById('saveBtn');
    const savedTextsCard = document.querySelector('.saved-texts-card');
    const savedTextsList = document.getElementById('savedTextsList');
    const clearSavedBtn = document.getElementById('clearSavedBtn');
    
    // History & Settings
    const historyBtn = document.getElementById('historyBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const historyModal = document.getElementById('historyModal');
    const settingsModal = document.getElementById('settingsModal');
    const historyList = document.getElementById('historyList');
    const autoSaveSettings = document.getElementById('autoSaveSettings');
    const showNotifications = document.getElementById('showNotifications');
    const enableHistory = document.getElementById('enableHistory');
    const maxHistoryItems = document.getElementById('maxHistoryItems');
    const clearAllData = document.getElementById('clearAllData');

    // ==================== State Management ====================
    let appState = {
        history: {
            previousInput: '',
            previousOutput: ''
        },
        conversions: [],
        savedTexts: [],
        settings: {
            autoSave: true,
            showNotifications: true,
            enableHistory: true,
            autoRepairSpacing: true,
            maxHistoryItems: 20
        }
    };

    // ==================== Initialization ====================
    initializeApp();

    function initializeApp() {
        loadSettings();
        loadSavedTexts();
        loadConversionHistory();
        setupTheme();
        attachEventListeners();
    }

    // ==================== Theme Management ====================
    function setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

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

    // ==================== Event Listeners ====================
    function attachEventListeners() {
        // Input Events
        inputText.addEventListener('input', () => {
            updateStats();
            detectQuranicText();
        });
        inputText.addEventListener('paste', handlePasteEvent);

        // Button Events
        convertBtn.addEventListener('click', () => {
            processText(joinerType.value);
        });

        autoBtn.addEventListener('click', () => {
            processText('U+2060');
            showToast('تم تطبيق أفضل طريقة تلقائيًا', 'success');
        });

        clearBtn.addEventListener('click', clearAllText);
        pasteBtn.addEventListener('click', pasteFromClipboard);
        copyBtn.addEventListener('click', copyToClipboard);
        shareBtn.addEventListener('click', shareText);
        undoBtn.addEventListener('click', undoAction);

        // Advanced Options
        advancedToggle.addEventListener('click', toggleAdvancedOptions);
        applicationRatio.addEventListener('input', updateRatioValue);

        // Preview
        previewBtn.addEventListener('click', showPreview);
        closePreview.addEventListener('click', hidePreview);

        // Save
        saveBtn.addEventListener('click', saveCurrentText);
        clearSavedBtn.addEventListener('click', clearAllSavedTexts);

        // History & Settings
        historyBtn.addEventListener('click', () => openModal('historyModal'));
        settingsBtn.addEventListener('click', () => openModal('settingsModal'));

        // Modal Close Buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.currentTarget.dataset.modal;
                closeModal(modalId);
            });
        });

        // Settings
        autoSaveSettings.addEventListener('change', (e) => {
            appState.settings.autoSave = e.target.checked;
            saveSettings();
        });

        showNotifications.addEventListener('change', (e) => {
            appState.settings.showNotifications = e.target.checked;
            saveSettings();
        });

        enableHistory.addEventListener('change', (e) => {
            appState.settings.enableHistory = e.target.checked;
            saveSettings();
        });

        maxHistoryItems.addEventListener('change', (e) => {
            appState.settings.maxHistoryItems = parseInt(e.target.value);
            saveSettings();
        });

        autoRepairSpacing.addEventListener('change', (e) => {
            appState.settings.autoRepairSpacing = e.target.checked;
            saveSettings();
        });

        clearAllData.addEventListener('click', clearAllAppData);

        // Modal Background Click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });
    }

    // ==================== Text Processing ====================
    const joiners = {
        'U+2060': '\u2060', // Word Joiner
        'U+200D': '\u200D', // Zero Width Joiner
        'U+200C': '\u200C', // Zero Width Non-Joiner
        'U+200A': '\u200A', // Hair Space
        'U+2009': '\u2009', // Thin Space
        'U+00A0': '\u00A0'  // Non Breaking Space
    };

    function processText(type) {
        const rawText = inputText.value;
        const text = repairIncomingText(rawText);
        if (!text) {
            showToast('الرجاء إدخال نص أولاً', 'warning');
            return;
        }

        // Save to history before changing
        appState.history.previousInput = rawText;
        if (text !== rawText) {
            inputText.value = text;
            updateStats();
            detectQuranicText();
            showToast('تم إصلاح المسافات العربية تلقائيًا', 'info');
        }
        appState.history.previousOutput = outputText.value;
        undoBtn.disabled = false;

        const joiner = joiners[type] || joiners['U+2060'];
        const ratio = Math.max(0, Math.min(100, parseInt(applicationRatio.value, 10) || 0)) / 100;
        const result = protectWordBoundaries(text, type, joiner, ratio);

        outputText.value = result;
        outputStats.textContent = `الأحرف بعد التحويل: ${result.length}`;

        // Add to history
        if (appState.settings.enableHistory) {
            addToHistory(text, result, type);
        }

        // Auto save
        if (appState.settings.autoSave) {
            saveCurrentText();
        }
    }

    /**
     * Protect existing word boundaries without inserting controls inside words.
     *
     * The old PRO implementation added a joiner between every pair of Arabic
     * characters. TikTok can expose those controls as visible spacing, producing
     * output such as "ف إ ذ ا". Word-boundary protection must only use the
     * user's existing spaces, so Arabic shaping, diacritics, Quranic marks,
     * punctuation, and line breaks remain unchanged.
     */
    function protectWordBoundaries(text, type, joiner, ratio = 1) {
        // Remove U+2060 controls from an earlier WordJoiner conversion. This
        // also repairs text produced by the cached version of the old algorithm.
        // Other ZWJ/ZWNJ characters are preserved because they may be legitimate
        // parts of user-provided Arabic or emoji text.
        const cleanText = text.replace(/\u2060/gu, '');
        const isSpaceBasedMethod = type === 'U+200A' || type === 'U+2009' || type === 'U+00A0';

        return cleanText.replace(/([ \t]+)/gu, spaces => {
            // The advanced ratio now applies to word boundaries, never to the
            // interior of a word. The default (100%) protects every boundary.
            if (ratio < 1 && Math.random() >= ratio) {
                return spaces;
            }

            // Space-based methods replace the original whitespace; invisible
            // controls keep the original visible spacing after the marker.
            return isSpaceBasedMethod
                ? spaces.replace(/[ \t]/gu, joiner)
                : `${joiner}${spaces}`;
        });
    }

    // ==================== Statistics ====================
    function updateStats() {
        const text = inputText.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        const size = new Blob([text]).size;
        
        inputStats.textContent = `الكلمات: ${words} | الأحرف: ${chars} | الحجم: ${size} B`;
    }

    function detectQuranicText() {
        const quranicMarkers = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/;
        if (quranicMarkers.test(inputText.value)) {
            quranWarning.classList.remove('hidden');
        } else {
            quranWarning.classList.add('hidden');
        }
    }

    // ==================== Actions ====================
    function clearAllText() {
        inputText.value = '';
        outputText.value = '';
        updateStats();
        detectQuranicText();
        outputStats.textContent = 'الأحرف بعد التحويل: 0';
        showToast('تم مسح النص', 'success');
    }

    function repairIncomingText(text) {
        if (!autoRepairSpacing.checked || typeof window.repairArabicSpacing !== 'function') {
            return text;
        }
        return window.repairArabicSpacing(text, { removeZeroWidth: true });
    }

    function insertPastedText(text) {
        const repairedText = repairIncomingText(text);
        const currentText = inputText.value;
        const hasFocus = document.activeElement === inputText;
        const start = hasFocus ? inputText.selectionStart : currentText.length;
        const end = hasFocus ? inputText.selectionEnd : currentText.length;

        inputText.value = currentText.slice(0, start) + repairedText + currentText.slice(end);
        const caret = start + repairedText.length;
        inputText.focus();
        inputText.setSelectionRange(caret, caret);
        updateStats();
        detectQuranicText();
        return repairedText !== text;
    }

    function handlePasteEvent(event) {
        const pastedText = event.clipboardData?.getData('text/plain') || '';
        if (!pastedText) return;

        event.preventDefault();
        const repaired = insertPastedText(pastedText);
        showToast(repaired ? 'تم اللصق وإصلاح المسافات العربية تلقائيًا' : 'تم لصق النص', 'success');
    }

    async function pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            const repaired = insertPastedText(text);
            showToast(repaired ? 'تم اللصق وإصلاح المسافات العربية تلقائيًا' : 'تم لصق النص', 'success');
        } catch (err) {
            showToast('فشل اللصق، يرجى المحاولة يدوياً', 'error');
        }
    }

    function copyToClipboard() {
        if (!outputText.value) {
            showToast('لا يوجد نص للنسخ', 'warning');
            return;
        }
        
        navigator.clipboard.writeText(outputText.value).then(() => {
            showToast('تم نسخ النص المحمي!', 'success');
        }).catch(() => {
            outputText.select();
            document.execCommand('copy');
            showToast('تم النسخ!', 'success');
        });
    }

    async function shareText() {
        if (!outputText.value) {
            showToast('لا يوجد نص للمشاركة', 'warning');
            return;
        }
        
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
            showToast('المشاركة غير مدعومة في هذا المتصفح', 'warning');
        }
    }

    function undoAction() {
        inputText.value = appState.history.previousInput;
        outputText.value = appState.history.previousOutput;
        updateStats();
        detectQuranicText();
        undoBtn.disabled = true;
        showToast('تمت استعادة النص السابق', 'success');
    }

    // ==================== Advanced Options ====================
    function toggleAdvancedOptions() {
        advancedOptions.classList.toggle('hidden');
    }

    function updateRatioValue() {
        ratioValue.textContent = applicationRatio.value + '%';
    }

    // ==================== Preview ====================
    function showPreview() {
        if (!outputText.value) {
            showToast('الرجاء تحويل النص أولاً', 'warning');
            return;
        }

        previewOriginal.textContent = inputText.value || 'لا يوجد نص أصلي';
        previewProcessed.textContent = outputText.value;
        previewCard.classList.remove('hidden');
    }

    function hidePreview() {
        previewCard.classList.add('hidden');
    }

    // ==================== Save Functionality ====================
    function saveCurrentText() {
        if (!outputText.value) {
            showToast('لا يوجد نص للحفظ', 'warning');
            return;
        }

        const savedText = {
            id: Date.now(),
            original: inputText.value,
            processed: outputText.value,
            joinerType: joinerType.value,
            timestamp: new Date().toLocaleString('ar-SA')
        };

        appState.savedTexts.unshift(savedText);
        if (appState.savedTexts.length > 50) {
            appState.savedTexts.pop();
        }

        localStorage.setItem('wordjoiner_saved_texts', JSON.stringify(appState.savedTexts));
        updateSavedTextsList();
        showToast('تم حفظ النص بنجاح', 'success');
    }

    function loadSavedTexts() {
        const saved = localStorage.getItem('wordjoiner_saved_texts');
        if (saved) {
            appState.savedTexts = JSON.parse(saved);
            updateSavedTextsList();
        }
    }

    function updateSavedTextsList() {
        if (appState.savedTexts.length === 0) {
            savedTextsList.innerHTML = '<p class="empty-message">لا توجد نصوص محفوظة</p>';
            savedTextsCard.classList.add('hidden');
            return;
        }

        savedTextsCard.classList.remove('hidden');
        savedTextsList.innerHTML = appState.savedTexts.map(item => `
            <div class="saved-text-item">
                <div class="saved-text-preview">${item.processed.substring(0, 50)}...</div>
                <div class="saved-text-actions">
                    <button onclick="window.loadSavedText('${item.id}')"><i class="fas fa-download"></i> تحميل</button>
                    <button onclick="window.deleteSavedText('${item.id}')"><i class="fas fa-trash-alt"></i> حذف</button>
                </div>
            </div>
        `).join('');
    }

    function clearAllSavedTexts() {
        if (confirm('هل أنت متأكد من حذف جميع النصوص المحفوظة؟')) {
            appState.savedTexts = [];
            localStorage.setItem('wordjoiner_saved_texts', JSON.stringify(appState.savedTexts));
            updateSavedTextsList();
            showToast('تم حذف جميع النصوص المحفوظة', 'success');
        }
    }

    // Global functions for saved texts
    window.loadSavedText = (id) => {
        const item = appState.savedTexts.find(t => t.id == id);
        if (item) {
            inputText.value = item.original;
            outputText.value = item.processed;
            joinerType.value = item.joinerType;
            updateStats();
            showToast('تم تحميل النص المحفوظ', 'success');
        }
    };

    window.deleteSavedText = (id) => {
        appState.savedTexts = appState.savedTexts.filter(t => t.id != id);
        localStorage.setItem('wordjoiner_saved_texts', JSON.stringify(appState.savedTexts));
        updateSavedTextsList();
        showToast('تم حذف النص المحفوظ', 'success');
    };

    // ==================== History ====================
    function addToHistory(input, output, type) {
        const historyItem = {
            id: Date.now(),
            input: input.substring(0, 100),
            output: output.substring(0, 100),
            type: type,
            timestamp: new Date().toLocaleString('ar-SA')
        };

        appState.conversions.unshift(historyItem);
        if (appState.conversions.length > appState.settings.maxHistoryItems) {
            appState.conversions.pop();
        }

        localStorage.setItem('wordjoiner_history', JSON.stringify(appState.conversions));
    }

    function loadConversionHistory() {
        const saved = localStorage.getItem('wordjoiner_history');
        if (saved) {
            appState.conversions = JSON.parse(saved);
        }
    }

    function updateHistoryList() {
        if (appState.conversions.length === 0) {
            historyList.innerHTML = '<p class="empty-message">لا يوجد سجل تحويلات</p>';
            return;
        }

        historyList.innerHTML = appState.conversions.map(item => `
            <div class="history-item">
                <div class="history-item-text"><strong>النوع:</strong> ${item.type}</div>
                <div class="history-item-text"><strong>النص:</strong> ${item.input}...</div>
                <div class="history-item-time">${item.timestamp}</div>
                <div class="history-item-actions">
                    <button onclick="window.loadFromHistory('${item.id}')"><i class="fas fa-redo"></i> استعادة</button>
                    <button onclick="window.copyFromHistory('${item.id}')"><i class="fas fa-copy"></i> نسخ</button>
                </div>
            </div>
        `).join('');
    }

    window.loadFromHistory = (id) => {
        const item = appState.conversions.find(h => h.id == id);
        if (item) {
            outputText.value = item.output;
            showToast('تم استعادة النص من السجل', 'success');
        }
    };

    window.copyFromHistory = (id) => {
        const item = appState.conversions.find(h => h.id == id);
        if (item) {
            navigator.clipboard.writeText(item.output);
            showToast('تم نسخ النص من السجل', 'success');
        }
    };

    // ==================== Settings ====================
    function loadSettings() {
        const saved = localStorage.getItem('wordjoiner_settings');
        if (saved) {
            appState.settings = { ...appState.settings, ...JSON.parse(saved) };
        }

        autoSaveSettings.checked = appState.settings.autoSave;
        autoRepairSpacing.checked = appState.settings.autoRepairSpacing !== false;
        showNotifications.checked = appState.settings.showNotifications;
        enableHistory.checked = appState.settings.enableHistory;
        maxHistoryItems.value = appState.settings.maxHistoryItems;
    }

    function saveSettings() {
        localStorage.setItem('wordjoiner_settings', JSON.stringify(appState.settings));
    }

    function clearAllAppData() {
        if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!')) {
            localStorage.removeItem('wordjoiner_saved_texts');
            localStorage.removeItem('wordjoiner_history');
            localStorage.removeItem('wordjoiner_settings');
            
            appState.savedTexts = [];
            appState.conversions = [];
            
            updateSavedTextsList();
            updateHistoryList();
            showToast('تم حذف جميع البيانات', 'success');
        }
    }

    // ==================== Modal Management ====================
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            if (modalId === 'historyModal') {
                updateHistoryList();
            }
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // ==================== Toast Notifications ====================
    function showToast(message, type = 'info') {
        if (!appState.settings.showNotifications && type === 'info') {
            return;
        }

        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
