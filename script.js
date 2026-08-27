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
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportDocxBtn = document.getElementById('exportDocxBtn');
    const undoBtn = document.getElementById('undoBtn');
    const themeToggle = document.getElementById('themeToggle');
    const inputStats = document.getElementById('inputStats');
    const outputStats = document.getElementById('outputStats');
    const quranWarning = document.getElementById('quranWarning');
    const quranWarningText = document.getElementById('quranWarningText');
    const autoDetectQuran = document.getElementById('autoDetectQuran');
    const quranFontFamily = document.getElementById('quranFontFamily');
    const quranTextColor = document.getElementById('quranTextColor');
    const quranFontSize = document.getElementById('quranFontSize');
    const quranFontSizeValue = document.getElementById('quranFontSizeValue');
    const quranKeepMarkers = document.getElementById('quranKeepMarkers');
    const quranStyleOptions = document.querySelector('.quran-style-options');
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
    const savedTextsCard = document.querySelector('.saved-card');
    const savedTextsList = document.getElementById('savedTextsList');
    const savedSearch = document.getElementById('savedSearch');
    const savedTypeFilter = document.getElementById('savedTypeFilter');
    const savedDateFilter = document.getElementById('savedDateFilter');
    const savedSort = document.getElementById('savedSort');
    const savedCount = document.getElementById('savedCount');
    const clearSavedBtn = document.getElementById('clearSavedBtn');
    
    // History & Settings
    const historyBtn = document.getElementById('historyBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const historyModal = document.getElementById('historyModal');
    const settingsModal = document.getElementById('settingsModal');
    const historyList = document.getElementById('historyList');
    const historyCount = document.getElementById('historyCount');
    const historySearch = document.getElementById('historySearch');
    const historyTypeFilter = document.getElementById('historyTypeFilter');
    const historyDateFilter = document.getElementById('historyDateFilter');
    const historySort = document.getElementById('historySort');
    const importHistoryBtn = document.getElementById('importHistoryBtn');
    const historyImportInput = document.getElementById('historyImportInput');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const historyDetailsModal = document.getElementById('historyDetailsModal');
    const historyDetailsType = document.getElementById('historyDetailsType');
    const historyDetailsTimestamp = document.getElementById('historyDetailsTimestamp');
    const historyDetailsLength = document.getElementById('historyDetailsLength');
    const historyDetailsInput = document.getElementById('historyDetailsInput');
    const historyDetailsOutput = document.getElementById('historyDetailsOutput');
    const historyDetailsCopyInputBtn = document.getElementById('historyDetailsCopyInputBtn');
    const historyDetailsCopyOutputBtn = document.getElementById('historyDetailsCopyOutputBtn');
    const historyDetailsRestoreBtn = document.getElementById('historyDetailsRestoreBtn');
    const historyDetailsDeleteBtn = document.getElementById('historyDetailsDeleteBtn');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
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
        filteredConversions: [],
        savedTexts: [],
        settings: {
            autoSave: true,
            showNotifications: true,
            enableHistory: true,
            autoRepairSpacing: true,
            smartSpacing: true,
            autoDetectQuran: true,
            quranFontFamily: 'Amiri',
            quranTextColor: '#2E7D32',
            quranFontSize: 22,
            quranKeepMarkers: true,
            maxHistoryItems: 20
        }
    };

    // ==================== Initialization ====================
    const MAX_SAVED_TEXTS = 100;
    // يتم تشغيل التهيئة في نهاية الملف بعد تعريف ثوابت IndexedDB وجميع الدوال.

    async function initializeApp() {
        loadSettings();
        loadSavedTexts();
        setupTheme();
        attachEventListeners();
        await loadConversionHistory();
    }

    // ==================== Theme Management ====================
    function setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme') || 'dark';
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    function applyTheme(theme) {
        const nextTheme = theme === 'light' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', nextTheme);
        document.body.classList.toggle('dark-mode', nextTheme === 'dark');
        document.body.classList.toggle('light-mode', nextTheme === 'light');
        localStorage.setItem('theme', nextTheme);
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#0b1020' : '#f6f7fb');
        themeToggle.title = nextTheme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن';
        themeToggle.setAttribute('aria-label', themeToggle.title);
        updateThemeIcon(nextTheme);
    }

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
        exportPdfBtn.addEventListener('click', exportToPdf);
        exportDocxBtn.addEventListener('click', () => exportDocxFile(outputText.value, inputText.value));
        undoBtn.addEventListener('click', undoAction);

        // Advanced Options
        advancedToggle.addEventListener('click', toggleAdvancedOptions);
        applicationRatio.addEventListener('input', updateRatioValue);

        // Preview
        previewBtn.addEventListener('click', showPreview);
        closePreview.addEventListener('click', hidePreview);

        // Save
        saveBtn.addEventListener('click', saveCurrentText);
        [savedSearch, savedTypeFilter, savedDateFilter, savedSort].forEach(control => {
            control.addEventListener('input', updateSavedTextsList);
            control.addEventListener('change', updateSavedTextsList);
        });
        clearSavedBtn.addEventListener('click', clearAllSavedTexts);

        // History & Settings
        [historySearch, historyTypeFilter, historyDateFilter, historySort].forEach(control => {
            control?.addEventListener('input', updateHistoryList);
            control?.addEventListener('change', updateHistoryList);
        });
        historyList?.addEventListener('click', event => {
            const button = event.target.closest('[data-history-action]');
            if (!button) return;
            handleHistoryAction(button.dataset.historyAction, button.dataset.historyId);
        });
        importHistoryBtn?.addEventListener('click', () => historyImportInput?.click());
        historyImportInput?.addEventListener('change', handleHistoryImport);
        clearHistoryBtn?.addEventListener('click', requestClearHistory);
        historyBtn.addEventListener('click', () => openModal('historyModal'));
        historyDetailsCopyInputBtn?.addEventListener('click', () => copyHistoryDetail('input'));
        historyDetailsCopyOutputBtn?.addEventListener('click', () => copyHistoryDetail('output'));
        historyDetailsRestoreBtn?.addEventListener('click', restoreHistoryDetail);
        historyDetailsDeleteBtn?.addEventListener('click', deleteHistoryDetail);
        confirmActionBtn?.addEventListener('click', confirmPendingAction);
        cancelConfirmBtn?.addEventListener('click', cancelPendingAction);
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

        smartSpacing.addEventListener('change', (e) => {
            appState.settings.smartSpacing = e.target.checked;
            saveSettings();
        });

        autoDetectQuran.addEventListener('change', (e) => {
            appState.settings.autoDetectQuran = e.target.checked;
            updateQuranStyleAvailability();
            detectQuranicText();
            saveSettings();
        });

        quranFontFamily.addEventListener('change', (e) => {
            appState.settings.quranFontFamily = e.target.value;
            saveSettings();
        });
        quranTextColor.addEventListener('input', (e) => {
            appState.settings.quranTextColor = e.target.value;
            saveSettings();
        });
        quranFontSize.addEventListener('input', (e) => {
            appState.settings.quranFontSize = Number(e.target.value);
            updateQuranFontSizeValue();
            saveSettings();
        });
        quranKeepMarkers.addEventListener('change', (e) => {
            appState.settings.quranKeepMarkers = e.target.checked;
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
            saveCurrentText({ silent: true });
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

    function getQuranSegments(text) {
        if (!appState.settings.autoDetectQuran || typeof window.segmentArabicText !== 'function') {
            return [{ type: 'text', value: String(text || '').replace(/\u2060/gu, '') }];
        }
        return window.segmentArabicText(text, { enableContext: true });
    }

    function getQuranStyleOptions() {
        return {
            fontFamily: quranFontFamily.value || appState.settings.quranFontFamily || 'Amiri',
            color: quranTextColor.value || appState.settings.quranTextColor || '#2E7D32',
            fontSize: Number(quranFontSize.value || appState.settings.quranFontSize || 22),
            keepMarkers: quranKeepMarkers.checked
        };
    }

    function renderSegments(container, segments, options = {}) {
        container.replaceChildren();
        const style = { ...getQuranStyleOptions(), ...options };
        for (const segment of segments) {
            const node = document.createElement('span');
            const value = segment.type === 'ayah' && style.keepMarkers === false
                ? segment.value.replace(/[﴿﴾]/gu, '')
                : segment.value;
            node.textContent = value;
            if (segment.type === 'ayah') {
                const isConfirmed = Number(segment.confidence) >= 0.95;
                node.className = isConfirmed ? 'ayah-segment' : 'ayah-segment ayah-uncertain';
                node.dataset.confidence = String(segment.confidence ?? '');
                node.dataset.source = segment.source || '';
                node.title = isConfirmed ? 'آية مؤكدة بعلامات قرآنية' : 'مقطع مرشح للمراجعة وليس آية مؤكدة';
                if (isConfirmed) {
                    node.style.fontFamily = `'${style.fontFamily}', 'Amiri', 'Noto Naskh Arabic', Arial, sans-serif`;
                    node.style.color = style.color;
                    node.style.fontSize = `${style.fontSize}pt`;
                }
            }
            container.appendChild(node);
        }
    }

    function updateQuranFontSizeValue() {
        quranFontSizeValue.textContent = `${quranFontSize.value}pt`;
    }

    function updateQuranStyleAvailability() {
        const disabled = !autoDetectQuran.checked;
        quranStyleOptions?.classList.toggle('is-disabled', disabled);
        [quranFontFamily, quranTextColor, quranFontSize, quranKeepMarkers].forEach(control => {
            if (control) control.disabled = disabled;
        });
    }

    function detectQuranicText() {
        const analysisText = repairIncomingText(inputText.value);
        const segments = getQuranSegments(analysisText);
        const ayahs = segments.filter(segment => segment.type === 'ayah');
        const legacyQuranicMarks = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/u.test(analysisText);
        if (ayahs.length === 0 && !legacyQuranicMarks) {
            quranWarning.classList.add('hidden');
            return;
        }

        quranWarning.classList.remove('hidden');
        if (ayahs.length === 0) {
            quranWarningText.textContent = 'تم العثور على علامات تشكيل أو وقف قد تكون جزءًا من نص قرآني؛ راجع النص قبل التصدير.';
            return;
        }

        const confirmed = ayahs.filter(segment => segment.confirmed).length;
        quranWarningText.textContent = confirmed === ayahs.length
            ? `تم اكتشاف ${ayahs.length} مقطع قرآني مؤكد بعلامات ﴿﴾ وسيُنسّق تلقائيًا عند التصدير.`
            : `تم رصد ${ayahs.length} مقطع قد يكون آية؛ المقطع المؤكد فقط سيُنسّق تلقائيًا، ويمكن مراجعة النص قبل التصدير.`;
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

    function getFormatterOptions() {
        const smart = smartSpacing.checked;
        return {
            removeInvisibleControls: true,
            normalizeWhitespace: true,
            collapseWhitespace: smart,
            fixPunctuationSpacing: smart,
            separateScriptBoundaries: smart,
            joinSpacedArabicLetters: smart,
            repairGluedArabicWords: smart,
            protectQuranMarkers: true
        };
    }

    function repairIncomingText(text) {
        if (!autoRepairSpacing.checked) return text;

        // Smart formatting is deliberately a separate layer from the legacy
        // spacing helper and runs before Quran segmentation and protection.
        if (typeof window.formatArabicText === 'function') {
            return window.formatArabicText(text, getFormatterOptions());
        }

        // Backward-compatible fallback for cached/older deployments.
        return typeof window.repairArabicSpacing === 'function'
            ? window.repairArabicSpacing(text, { removeZeroWidth: true })
            : text;
    }

    function formatExportText(text) {
        const unprotected = String(text || '').replace(/\u2060/gu, '');
        return autoRepairSpacing.checked && typeof window.formatArabicText === 'function'
            ? window.formatArabicText(unprotected, getFormatterOptions())
            : unprotected;
    }

    function insertPastedText(text) {
        const repairedText = repairIncomingText(text);
        const currentText = inputText.value;

        // Keep paste undoable, including the repaired text and the previous output.
        appState.history.previousInput = currentText;
        appState.history.previousOutput = outputText.value;
        undoBtn.disabled = false;
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

    function exportToPdf() {
        if (!outputText.value) {
            showToast('لا يوجد نص لتصديره إلى PDF', 'warning');
            return;
        }

        // Keep the exported version in the local history before printing.
        if (appState.settings.autoSave) saveCurrentText({ silent: true });

        const previousTitle = document.title;
        const printSheet = document.createElement('section');
        printSheet.id = 'pdfPrintSheet';
        printSheet.innerHTML = `
            <div class="pdf-brand">WordJoiner PRO</div>
            <div class="pdf-meta">النص المعالج · ${new Date().toLocaleString('ar-SA')}</div>
            <div class="pdf-content"></div>
        `;
        const exportText = formatExportText(outputText.value);
        renderSegments(printSheet.querySelector('.pdf-content'), getQuranSegments(exportText));
        document.body.appendChild(printSheet);

        const cleanup = () => {
            document.body.classList.remove('pdf-export');
            printSheet.remove();
            document.title = previousTitle;
        };

        document.title = `WordJoiner-${new Date().toISOString().slice(0, 10)}`;
        document.body.classList.add('pdf-export');
        window.addEventListener('afterprint', cleanup, { once: true });
        window.print();
        // Some mobile browsers do not emit afterprint consistently.
        window.setTimeout(cleanup, 1500);
    }

    function exportDocxFile(text, originalText = '') {
        if (!String(text || '').trim()) {
            showToast('لا يوجد نص لتصديره إلى Word', 'warning');
            return false;
        }

        const cleanText = formatExportText(text);
        const filename = `WordJoiner-${new Date().toISOString().slice(0, 10)}.docx`;
        const segments = getQuranSegments(cleanText);
        const downloaded = typeof window.downloadDocx === 'function'
            ? window.downloadDocx(cleanText, filename, { segments, quranStyle: getQuranStyleOptions() })
            : false;

        if (downloaded) {
            showToast('تم إنشاء ملف Word وبدء تنزيله', 'success');
        } else {
            showToast('تعذر إنشاء ملف Word في هذا المتصفح', 'warning');
        }
        return downloaded;
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
        renderSegments(previewProcessed, getQuranSegments(outputText.value));
        previewCard.classList.remove('hidden');
    }

    function hidePreview() {
        previewCard.classList.add('hidden');
    }

    // ==================== Save Functionality ====================
    function persistSavedTexts() {
        try {
            localStorage.setItem('wordjoiner_saved_texts', JSON.stringify(appState.savedTexts));
            return true;
        } catch (error) {
            // Keep the newest records if the browser storage quota is reached.
            appState.savedTexts = appState.savedTexts.slice(0, 25);
            try {
                localStorage.setItem('wordjoiner_saved_texts', JSON.stringify(appState.savedTexts));
            } catch (retryError) {
                console.warn('Unable to persist saved texts:', retryError);
                showToast('تعذر حفظ السجل المحلي بسبب امتلاء التخزين', 'warning');
                return false;
            }
            showToast('تم تقليص السجل تلقائيًا بسبب مساحة التخزين', 'warning');
            return false;
        }
    }

    function saveCurrentText({ silent = false } = {}) {
        if (!outputText.value) {
            if (!silent) showToast('لا يوجد نص للحفظ', 'warning');
            return false;
        }

        const original = inputText.value;
        const processed = outputText.value;
        const now = Date.now();
        const existing = appState.savedTexts.find(item =>
            item.original === original &&
            item.processed === processed &&
            item.joinerType === joinerType.value
        );

        if (existing) {
            existing.timestamp = new Date().toLocaleString('ar-SA');
            existing.updatedAt = now;
            appState.savedTexts = [existing, ...appState.savedTexts.filter(item => item.id !== existing.id)];
        } else {
            appState.savedTexts.unshift({
                id: now,
                original,
                processed,
                joinerType: joinerType.value,
                timestamp: new Date().toLocaleString('ar-SA'),
                createdAt: now,
                updatedAt: now
            });
        }

        appState.savedTexts = appState.savedTexts.slice(0, MAX_SAVED_TEXTS);
        const persisted = persistSavedTexts();
        updateSavedTextsList();
        if (!silent && persisted) showToast('تم حفظ النص في السجل المحلي', 'success');
        return true;
    }

    function loadSavedTexts() {
        const saved = localStorage.getItem('wordjoiner_saved_texts');
        if (!saved) {
            updateSavedTextsList();
            return;
        }

        try {
            const parsed = JSON.parse(saved);
            appState.savedTexts = Array.isArray(parsed)
                ? parsed.filter(item => item && typeof item.processed === 'string').slice(0, MAX_SAVED_TEXTS)
                : [];
        } catch (error) {
            console.warn('Invalid saved texts data; resetting local history:', error);
            appState.savedTexts = [];
            localStorage.removeItem('wordjoiner_saved_texts');
        }
        updateSavedTextsList();
    }

    function escapeHtml(value = '') {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getSavedPreview(item) {
        return (item.original || item.processed || '').replace(/\s+/gu, ' ').trim();
    }

    function getSavedTimestamp(item) {
        const timestamp = Number(item.updatedAt || item.createdAt || item.id);
        return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : 0;
    }

    function matchesSavedDate(item, filter) {
        if (filter === 'all') return true;
        const timestamp = getSavedTimestamp(item);
        if (!timestamp) return true; // Keep legacy records visible until they are re-saved.

        const now = Date.now();
        if (filter === 'today') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            return timestamp >= startOfDay.getTime();
        }
        if (filter === 'week') return timestamp >= now - (7 * 24 * 60 * 60 * 1000);
        if (filter === 'month') return timestamp >= now - (30 * 24 * 60 * 60 * 1000);
        return true;
    }

    function updateSavedTextsList() {
        const query = (savedSearch.value || '').trim().toLocaleLowerCase('ar');
        const typeFilter = savedTypeFilter.value || 'all';
        const dateFilter = savedDateFilter.value || 'all';
        const sortOrder = savedSort.value || 'newest';
        const allItems = appState.savedTexts;
        const items = allItems
            .filter(item => typeFilter === 'all' || (item.joinerType || 'U+2060') === typeFilter)
            .filter(item => matchesSavedDate(item, dateFilter))
            .filter(item => !query || `${item.original || ''} ${item.processed || ''}`.toLocaleLowerCase('ar').includes(query))
            .sort((a, b) => {
                const difference = getSavedTimestamp(a) - getSavedTimestamp(b);
                return sortOrder === 'oldest' ? difference : -difference;
            });

        savedCount.textContent = items.length === allItems.length ? `${allItems.length}` : `${items.length}/${allItems.length}`;
        if (allItems.length === 0) {
            savedTextsList.innerHTML = '<p class="empty-message">لا توجد نصوص محفوظة</p>';
            savedTextsCard?.classList.add('hidden');
            return;
        }

        savedTextsCard?.classList.remove('hidden');
        if (items.length === 0) {
            savedTextsList.innerHTML = '<p class="empty-message">لا توجد نتائج مطابقة للفلاتر الحالية</p>';
            return;
        }

        savedTextsList.innerHTML = items.map(item => `
            <div class="saved-text-item">
                <div class="saved-text-content">
                    <div class="saved-text-preview" title="${escapeHtml(item.original || item.processed)}">${escapeHtml(getSavedPreview(item))}</div>
                    <div class="saved-text-meta">${escapeHtml(item.timestamp || '')} · ${escapeHtml(item.joinerType || 'U+2060')}</div>
                </div>
                <div class="saved-text-actions">
                    <button title="تحميل النص" aria-label="تحميل النص المحفوظ" onclick="window.loadSavedText('${item.id}')"><i class="fas fa-download"></i> تحميل</button>
                    <button title="نسخ الناتج" aria-label="نسخ النص المحفوظ" onclick="window.copySavedText('${item.id}')"><i class="fas fa-copy"></i> نسخ</button>
                    <button title="تصدير Word" aria-label="تصدير النص المحفوظ إلى Word" onclick="window.exportSavedDocx('${item.id}')"><i class="fas fa-file-word"></i> Word</button>
                    <button title="حذف النص" aria-label="حذف النص المحفوظ" onclick="window.deleteSavedText('${item.id}')"><i class="fas fa-trash-alt"></i> حذف</button>
                </div>
            </div>
        `).join('');
    }

    function clearAllSavedTexts() {
        if (confirm('هل أنت متأكد من حذف جميع النصوص المحفوظة؟')) {
            appState.savedTexts = [];
            savedSearch.value = '';
            persistSavedTexts();
            updateSavedTextsList();
            showToast('تم حذف جميع النصوص المحفوظة', 'success');
        }
    }

    // Global functions for saved texts
    window.loadSavedText = (id) => {
        const item = appState.savedTexts.find(t => String(t.id) === String(id));
        if (item) {
            appState.history.previousInput = inputText.value;
            appState.history.previousOutput = outputText.value;
            inputText.value = item.original || '';
            outputText.value = item.processed || '';
            joinerType.value = item.joinerType || 'U+2060';
            undoBtn.disabled = false;
            updateStats();
            detectQuranicText();
            outputStats.textContent = `الأحرف بعد التحويل: ${outputText.value.length}`;
            showToast('تم تحميل النص المحفوظ', 'success');
        }
    };

    window.copySavedText = async (id) => {
        const item = appState.savedTexts.find(t => String(t.id) === String(id));
        if (!item) return;

        try {
            await navigator.clipboard.writeText(item.processed || '');
            showToast('تم نسخ النص من السجل المحلي', 'success');
        } catch (error) {
            showToast('تعذر النسخ من السجل، افتح النص ثم انسخه يدويًا', 'warning');
        }
    };

    window.exportSavedDocx = (id) => {
        const item = appState.savedTexts.find(t => String(t.id) === String(id));
        if (item) exportDocxFile(item.processed || '', item.original || '');
    };

    window.deleteSavedText = (id) => {
        appState.savedTexts = appState.savedTexts.filter(t => String(t.id) !== String(id));
        persistSavedTexts();
        updateSavedTextsList();
        showToast('تم حذف النص من السجل المحلي', 'success');
    };

    // ==================== IndexedDB History ====================
    const HISTORY_DB_NAME = 'wordjoiner-pro-db';
    const HISTORY_DB_VERSION = 2;
    const HISTORY_STORE = 'conversions';
    const HISTORY_MIGRATION_KEY = 'wordjoiner_history_migrated_v1';
    let historyDBPromise;
    let selectedHistoryId = null;
    let pendingHistoryAction = null;

    function openHistoryDB() {
        if (historyDBPromise) return historyDBPromise;

        historyDBPromise = new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                reject(new Error('IndexedDB is not supported'));
                return;
            }

            const request = indexedDB.open(HISTORY_DB_NAME, HISTORY_DB_VERSION);
            request.onupgradeneeded = event => {
                const db = event.target.result;
                const store = db.objectStoreNames.contains(HISTORY_STORE)
                    ? event.target.transaction.objectStore(HISTORY_STORE)
                    : db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });

                if (!store.indexNames.contains('createdAt')) {
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                }
                if (!store.indexNames.contains('type')) {
                    store.createIndex('type', 'type', { unique: false });
                }
            };

            request.onsuccess = () => {
                const db = request.result;
                db.onversionchange = () => db.close();
                resolve(db);
            };
            request.onerror = () => reject(request.error);
        });

        return historyDBPromise;
    }

    async function getAllHistoryFromDB() {
        const db = await openHistoryDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(HISTORY_STORE, 'readonly');
            const request = transaction.objectStore(HISTORY_STORE).getAll();
            request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
            request.onerror = () => reject(request.error);
        });
    }

    async function putHistoryInDB(item) {
        const db = await openHistoryDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(HISTORY_STORE, 'readwrite');
            transaction.objectStore(HISTORY_STORE).put(item);
            transaction.oncomplete = () => resolve(item);
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });
    }

    async function deleteHistoryFromDB(id) {
        const db = await openHistoryDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(HISTORY_STORE, 'readwrite');
            transaction.objectStore(HISTORY_STORE).delete(String(id));
            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });
    }

    async function clearHistoryDB() {
        const db = await openHistoryDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(HISTORY_STORE, 'readwrite');
            transaction.objectStore(HISTORY_STORE).clear();
            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });
    }

    function createHistoryId(createdAt = Date.now()) {
        const suffix = typeof crypto?.randomUUID === 'function'
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2);
        return `${createdAt}-${suffix}`;
    }

    function normalizeHistoryItem(item, index = 0) {
        const createdAt = Number(item?.createdAt) || Number(item?.id) || Date.now() - index;
        return {
            id: String(item?.id || createHistoryId(createdAt)),
            input: String(item?.input || ''),
            output: String(item?.output || ''),
            type: String(item?.type || 'U+2060'),
            timestamp: item?.timestamp || new Date(createdAt).toLocaleString('ar-SA'),
            createdAt
        };
    }

    async function migrateLegacyHistory() {
        if (localStorage.getItem(HISTORY_MIGRATION_KEY) === '1') return [];

        const saved = localStorage.getItem('wordjoiner_history');
        if (!saved) {
            localStorage.setItem(HISTORY_MIGRATION_KEY, '1');
            return [];
        }

        let legacyItems;
        try {
            legacyItems = JSON.parse(saved);
        } catch (error) {
            console.warn('Invalid legacy conversion history:', error);
            localStorage.removeItem('wordjoiner_history');
            localStorage.setItem(HISTORY_MIGRATION_KEY, '1');
            return [];
        }

        const items = Array.isArray(legacyItems)
            ? legacyItems
                .filter(item => item && typeof item.output === 'string')
                .map(normalizeHistoryItem)
            : [];

        for (const item of items) {
            await putHistoryInDB(item);
        }

        // لا نحذف النسخة القديمة قبل اكتمال جميع عمليات الكتابة.
        localStorage.removeItem('wordjoiner_history');
        localStorage.setItem(HISTORY_MIGRATION_KEY, '1');
        return items;
    }

    async function addToHistory(input, output, type) {
        const now = Date.now();
        const historyItem = normalizeHistoryItem({
            id: createHistoryId(now),
            input,
            output,
            type,
            createdAt: now,
            timestamp: new Date(now).toLocaleString('ar-SA')
        });

        const duplicate = appState.conversions.find(item =>
            item.input === historyItem.input &&
            item.output === historyItem.output &&
            item.type === historyItem.type
        );

        appState.conversions = [
            historyItem,
            ...appState.conversions.filter(item => item !== duplicate)
        ].slice(0, Math.max(10, Number(appState.settings.maxHistoryItems) || 30));
        updateHistoryFilters();
        updateHistoryList();

        try {
            if (duplicate?.id) await deleteHistoryFromDB(duplicate.id);
            await putHistoryInDB(historyItem);
            await trimHistoryDB();
        } catch (error) {
            console.warn('Unable to persist conversion history in IndexedDB:', error);
            showToast('تعذر حفظ السجل، لكن التحويل اكتمل', 'warning');
        }

        return historyItem;
    }

    async function trimHistoryDB() {
        const maxItems = Math.max(10, Number(appState.settings.maxHistoryItems) || 30);
        const items = (await getAllHistoryFromDB())
            .sort((a, b) => getHistoryTimestamp(b) - getHistoryTimestamp(a));

        await Promise.all(
            items.slice(maxItems).map(item => deleteHistoryFromDB(item.id))
        );
    }

    async function loadConversionHistory() {
        try {
            await migrateLegacyHistory();
            const items = await getAllHistoryFromDB();
            appState.conversions = items
                .map(normalizeHistoryItem)
                .sort((a, b) => getHistoryTimestamp(b) - getHistoryTimestamp(a));
            updateHistoryFilters();
            updateHistoryList();
        } catch (error) {
            console.warn('Unable to load IndexedDB history:', error);
            appState.conversions = [];
            updateHistoryFilters();
            updateHistoryList();
        }
    }

    function getHistoryTimestamp(item) {
        const value = Number(item?.createdAt || item?.id);
        return Number.isFinite(value) ? value : 0;
    }

    function normalizeHistorySearch(value) {
        return String(value || '').normalize('NFKC').toLocaleLowerCase('ar').trim();
    }

    function matchesHistoryDate(item, filter) {
        if (!filter || filter === 'all') return true;
        const timestamp = getHistoryTimestamp(item);
        if (!timestamp) return false;
        const now = Date.now();
        if (filter === 'today') {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            return timestamp >= start.getTime();
        }
        if (filter === 'week') return timestamp >= now - 7 * 24 * 60 * 60 * 1000;
        if (filter === 'month') return timestamp >= now - 30 * 24 * 60 * 60 * 1000;
        return true;
    }

    function updateHistoryFilters() {
        if (!historyTypeFilter) return;
        const current = historyTypeFilter.value || 'all';
        const types = [...new Set(appState.conversions.map(item => item.type || 'U+2060'))].sort();
        historyTypeFilter.innerHTML = '<option value="all">كل الطرق</option>' +
            types.map(type => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join('');
        historyTypeFilter.value = types.includes(current) ? current : 'all';
    }

    function getFilteredHistoryItems() {
        const query = normalizeHistorySearch(historySearch?.value);
        const type = historyTypeFilter?.value || 'all';
        const date = historyDateFilter?.value || 'all';
        const sort = historySort?.value || 'newest';

        return appState.conversions
            .filter(item => type === 'all' || (item.type || 'U+2060') === type)
            .filter(item => matchesHistoryDate(item, date))
            .filter(item => {
                if (!query) return true;
                const searchable = normalizeHistorySearch(`${item.input} ${item.output} ${item.type}`);
                return searchable.includes(query);
            })
            .sort((a, b) => {
                const difference = getHistoryTimestamp(a) - getHistoryTimestamp(b);
                return sort === 'oldest' ? difference : -difference;
            });
    }

    function updateHistoryList() {
        if (!historyList) return;
        const allItems = appState.conversions;
        const items = getFilteredHistoryItems();
        appState.filteredConversions = items;
        if (historyCount) {
            historyCount.textContent = items.length === allItems.length
                ? String(allItems.length)
                : `${items.length}/${allItems.length}`;
        }

        if (allItems.length === 0) {
            historyList.innerHTML = '<p class="empty-message">لا يوجد سجل تحويلات بعد</p>';
            return;
        }
        if (items.length === 0) {
            historyList.innerHTML = '<p class="empty-message">لا توجد نتائج مطابقة للبحث أو الفلاتر</p>';
            return;
        }

        historyList.innerHTML = items.map(item => {
            const preview = (item.input || item.output || '')
                .replace(/\s+/gu, ' ').trim().slice(0, 140);
            return `
                <div class="history-item">
                    <div class="history-item-text"><strong>النوع:</strong> ${escapeHtml(item.type || 'U+2060')}</div>
                    <div class="history-item-text"><strong>النص:</strong> ${escapeHtml(preview)}${preview.length >= 140 ? '…' : ''}</div>
                    <div class="history-item-time">${escapeHtml(item.timestamp || '')}</div>
                    <div class="history-item-actions">
                        <button type="button" data-history-action="details" data-history-id="${escapeHtml(item.id)}"><i class="fas fa-eye"></i> تفاصيل</button>
                        <button type="button" data-history-action="load" data-history-id="${escapeHtml(item.id)}"><i class="fas fa-redo"></i> استعادة</button>
                        <button type="button" data-history-action="copy" data-history-id="${escapeHtml(item.id)}"><i class="fas fa-copy"></i> نسخ</button>
                        <button type="button" data-history-action="delete" data-history-id="${escapeHtml(item.id)}" aria-label="حذف العنصر"><i class="fas fa-trash-alt"></i> حذف</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function handleHistoryAction(action, id) {
        const item = appState.conversions.find(historyItem => String(historyItem.id) === String(id));
        if (!item) return;

        if (action === 'details') {
            openHistoryDetails(id);
            return;
        }
        if (action === 'load') {
            window.loadFromHistory(id);
            return;
        }
        if (action === 'copy') {
            await window.copyFromHistory(id);
            return;
        }
        if (action === 'delete') {
            requestHistoryDelete(id);
        }
    }

    function getHistoryItem(id) {
        return appState.conversions.find(item => String(item.id) === String(id));
    }

    function openHistoryDetails(id) {
        const item = getHistoryItem(id);
        if (!item || !historyDetailsModal) return;

        selectedHistoryId = String(item.id);
        historyDetailsType.textContent = item.type || 'U+2060';
        historyDetailsTimestamp.textContent = item.timestamp || '—';
        historyDetailsLength.textContent = String((item.output || '').length);
        historyDetailsInput.textContent = item.input || '';
        historyDetailsOutput.textContent = item.output || '';

        closeModal('historyModal');
        openModal('historyDetailsModal');
    }

    async function copyHistoryDetail(field) {
        const item = getHistoryItem(selectedHistoryId);
        if (!item) return;

        const value = field === 'input' ? item.input : item.output;
        if (!value) {
            showToast('لا يوجد نص لنسخه', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(value);
            showToast('تم نسخ النص من التفاصيل', 'success');
        } catch (error) {
            showToast('تعذر النسخ التلقائي من هذا المتصفح', 'warning');
        }
    }

    function restoreHistoryDetail() {
        if (!selectedHistoryId) return;
        window.loadFromHistory(selectedHistoryId);
        closeModal('historyDetailsModal');
    }

    function deleteHistoryDetail() {
        if (!selectedHistoryId) return;
        requestHistoryDelete(selectedHistoryId);
    }

    function openHistoryConfirmation(message, action) {
        if (!confirmModal || !confirmModalMessage || !confirmActionBtn) return;
        pendingHistoryAction = action;
        confirmModalMessage.textContent = message;
        confirmActionBtn.textContent = 'تأكيد الحذف';
        openModal('confirmModal');
    }

    function requestHistoryDelete(id) {
        const item = getHistoryItem(id);
        if (!item) return;

        openHistoryConfirmation(
            'سيتم حذف هذا العنصر نهائيًا من سجل IndexedDB. لا يمكن التراجع عن هذا الإجراء.',
            () => deleteOneHistoryItem(item.id)
        );
    }

    function requestClearHistory() {
        if (!appState.conversions.length) {
            showToast('سجل التحويلات فارغ بالفعل', 'info');
            return;
        }

        openHistoryConfirmation(
            `سيتم حذف ${appState.conversions.length} عنصرًا نهائيًا من سجل IndexedDB.`,
            deleteAllHistoryItems
        );
    }

    async function confirmPendingAction() {
        const action = pendingHistoryAction;
        pendingHistoryAction = null;
        closeModal('confirmModal');
        if (!action) return;

        try {
            await action();
        } catch (error) {
            console.warn('History confirmation action failed:', error);
            showToast('تعذر تنفيذ الإجراء على السجل', 'warning');
        }
    }

    function cancelPendingAction() {
        pendingHistoryAction = null;
        closeModal('confirmModal');
    }

    async function deleteOneHistoryItem(id) {
        await deleteHistoryFromDB(id);
        appState.conversions = appState.conversions.filter(
            item => String(item.id) !== String(id)
        );
        if (String(selectedHistoryId) === String(id)) {
            selectedHistoryId = null;
            closeModal('historyDetailsModal');
        }
        updateHistoryFilters();
        updateHistoryList();
        showToast('تم حذف العنصر من سجل التحويلات', 'success');
    }

    async function deleteAllHistoryItems() {
        await clearHistoryDB();
        appState.conversions = [];
        appState.filteredConversions = [];
        selectedHistoryId = null;
        closeModal('historyDetailsModal');
        updateHistoryFilters();
        updateHistoryList();
        showToast('تم حذف سجل التحويلات بالكامل', 'success');
    }

    function normalizeImportedHistoryItem(raw, index) {
        if (!raw || typeof raw !== 'object') return null;

        const input = raw.input ?? raw.original ?? raw['النص الأصلي'] ?? raw['النص'] ?? '';
        const output = raw.output ?? raw.processed ?? raw['النص المحمي'] ?? raw['الناتج'] ?? '';
        const type = raw.type ?? raw.joinerType ?? raw['طريقة الحماية'] ?? raw['الطريقة'] ?? 'U+2060';

        if (typeof output !== 'string' || !output.trim()) return null;

        const rawCreatedAt = raw.createdAt ?? raw.updatedAt ?? raw['تاريخ التحويل'];
        const parsedDate = typeof rawCreatedAt === 'number'
            ? rawCreatedAt
            : Date.parse(String(rawCreatedAt || ''));
        const createdAt = Number.isFinite(parsedDate) && parsedDate > 0
            ? parsedDate
            : Date.now() - index;

        return normalizeHistoryItem({
            id: createHistoryId(createdAt),
            input: String(input || ''),
            output,
            type: String(type || 'U+2060'),
            createdAt,
            timestamp: raw.timestamp || raw['تاريخ التحويل'] || new Date(createdAt).toLocaleString('ar-SA')
        }, index);
    }

    function getRecordsFromImportedJSON(value) {
        if (Array.isArray(value)) return value;
        if (Array.isArray(value?.items)) return value.items;
        if (Array.isArray(value?.conversions)) return value.conversions;
        if (Array.isArray(value?.history)) return value.history;
        return [];
    }

    async function importHistoryRecords(records) {
        const existingKeys = new Set(
            appState.conversions.map(item => `${item.input}\u0000${item.output}\u0000${item.type}`)
        );
        const importedItems = [];

        records.forEach((raw, index) => {
            const item = normalizeImportedHistoryItem(raw, index);
            if (!item) return;

            const key = `${item.input}\u0000${item.output}\u0000${item.type}`;
            if (existingKeys.has(key)) return;
            existingKeys.add(key);
            importedItems.push(item);
        });

        if (!importedItems.length) {
            showToast('لم يتم العثور على سجلات جديدة صالحة للاستيراد', 'warning');
            return 0;
        }

        await Promise.all(importedItems.map(item => putHistoryInDB(item)));
        await trimHistoryDB();
        await loadConversionHistory();
        showToast(`تم استيراد ${importedItems.length} عنصرًا إلى السجل`, 'success');
        return importedItems.length;
    }

    async function handleHistoryImport(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        try {
            let records;
            const lowerName = file.name.toLocaleLowerCase('en');

            if (lowerName.endsWith('.json') || file.type === 'application/json') {
                const json = JSON.parse(await file.text());
                records = getRecordsFromImportedJSON(json);
            } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
                if (!window.XLSX) {
                    showToast('مكتبة Excel غير متاحة في النسخة الحالية', 'warning');
                    return;
                }

                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                records = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
            } else {
                showToast('اختر ملف JSON أو Excel صالحًا', 'warning');
                return;
            }

            await importHistoryRecords(records);
        } catch (error) {
            console.warn('History import failed:', error);
            showToast('تعذر قراءة الملف؛ تحقق من صيغته ومحتواه', 'error');
        }
    }

    window.loadFromHistory = (id) => {
        const item = appState.conversions.find(h => String(h.id) === String(id));
        if (item) {
            appState.history.previousInput = inputText.value;
            appState.history.previousOutput = outputText.value;
            inputText.value = item.input || '';
            outputText.value = item.output || '';
            joinerType.value = item.type || 'U+2060';
            undoBtn.disabled = false;
            updateStats();
            detectQuranicText();
            outputStats.textContent = `الأحرف بعد التحويل: ${outputText.value.length}`;
            showToast('تم استعادة النص من السجل', 'success');
        }
    };

    window.copyFromHistory = async (id) => {
        const item = appState.conversions.find(h => String(h.id) === String(id));
        if (!item) return;

        try {
            await navigator.clipboard.writeText(item.output || '');
            showToast('تم نسخ النص من السجل', 'success');
        } catch (error) {
            outputText.value = item.output || '';
            outputText.focus();
            outputText.select();
            showToast('تعذر النسخ التلقائي؛ تم تحديد النص لنسخه يدويًا', 'warning');
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
        smartSpacing.checked = appState.settings.smartSpacing !== false;
        autoDetectQuran.checked = appState.settings.autoDetectQuran !== false;
        quranFontFamily.value = appState.settings.quranFontFamily || 'Amiri';
        quranTextColor.value = appState.settings.quranTextColor || '#2E7D32';
        quranFontSize.value = appState.settings.quranFontSize || 22;
        quranKeepMarkers.checked = appState.settings.quranKeepMarkers !== false;
        updateQuranFontSizeValue();
        updateQuranStyleAvailability();
        showNotifications.checked = appState.settings.showNotifications;
        enableHistory.checked = appState.settings.enableHistory;
        maxHistoryItems.value = appState.settings.maxHistoryItems;
    }

    function saveSettings() {
        localStorage.setItem('wordjoiner_settings', JSON.stringify(appState.settings));
    }

    async function clearAllAppData() {
        if (!confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!')) return;

        try {
            await clearHistoryDB();
            localStorage.removeItem('wordjoiner_saved_texts');
            localStorage.removeItem('wordjoiner_history');
            localStorage.removeItem(HISTORY_MIGRATION_KEY);
            localStorage.removeItem('wordjoiner_settings');

            appState.savedTexts = [];
            appState.conversions = [];

            updateSavedTextsList();
            updateHistoryFilters();
            updateHistoryList();
            showToast('تم حذف جميع البيانات', 'success');
        } catch (error) {
            console.warn('Unable to clear all application data:', error);
            showToast('تعذر حذف سجل التحويلات من الجهاز', 'warning');
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

    initializeApp();
});
