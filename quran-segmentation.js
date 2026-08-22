/*
 * Quran-aware text segmentation for WordJoiner.
 * The engine is intentionally conservative: marked passages are confirmed,
 * while contextual matches carry lower confidence and remain distinguishable.
 */
(function attachQuranSegmentation(root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) Object.assign(root, api);
})(typeof window !== 'undefined' ? window : globalThis, () => {
    const INVISIBLE_CONTROLS = /[\u061C\u200B-\u200D\u2060\u2066-\u2069\uFEFF]/gu;
    const ARABIC_LETTER = /[\u0600-\u06FF]/gu;
    const QURANIC_MARK = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/gu;
    const AYAH_MARKER = /﴿[\s\S]*?﴾/gu;
    const CONTEXT_INTRO = /(?:^|[\n.!؟؛:]\s*)(?:قال|ويقول|يقول)\s+(?:الله\s+تعالى|تعالى|ربنا)\s*[:：]?\s*$/u;

    function removeInvisibleControls(value = '') {
        return String(value).replace(INVISIBLE_CONTROLS, '');
    }

    function normalizeForComparison(value = '') {
        return removeInvisibleControls(value)
            .normalize('NFC')
            .replace(/[﴿﴾]/gu, '')
            .replace(/[۝۞]/gu, '')
            .replace(/[إأآٱ]/gu, 'ا')
            .replace(/ى/gu, 'ي')
            .replace(/[ًٌٍَُِّْـٰٕٔ]/gu, '')
            .replace(/[\u0640]/gu, '')
            .replace(/\s+/gu, ' ')
            .trim();
    }

    function countMatches(value, regex) {
        const matches = String(value).match(regex);
        return matches ? matches.length : 0;
    }

    function isLikelyArabicVerse(value) {
        const text = String(value).trim();
        const letters = countMatches(text, ARABIC_LETTER);
        const marks = countMatches(text, QURANIC_MARK);
        const words = text ? text.split(/\s+/u).length : 0;
        return letters >= 8 && words >= 2 && (marks >= 2 || /[ۖۗۚۙۘۛۜ۝]/u.test(text));
    }

    function makeTextSegment(value) {
        return { type: 'text', value };
    }

    function makeAyahSegment(value, confidence, source, start, end) {
        return {
            type: 'ayah',
            value,
            confidence,
            source,
            start,
            end,
            confirmed: confidence >= 0.95,
            normalized: normalizeForComparison(value)
        };
    }

    function mergeTextSegments(segments) {
        const merged = [];
        for (const segment of segments) {
            if (!segment.value) continue;
            const previous = merged[merged.length - 1];
            if (previous && previous.type === 'text' && segment.type === 'text') {
                previous.value += segment.value;
            } else {
                merged.push(segment);
            }
        }
        return merged.length ? merged : [makeTextSegment('')];
    }

    function findMarkerRanges(text) {
        return [...String(text).matchAll(AYAH_MARKER)].map(match => ({
            start: match.index ?? 0,
            end: (match.index ?? 0) + match[0].length,
            value: match[0],
            confidence: 1,
            source: 'quran-marker'
        }));
    }

    function findContextRanges(text, occupiedRanges) {
        const ranges = [];
        const lines = String(text).split(/\n/gu);
        let offset = 0;
        for (let index = 0; index < lines.length; index += 1) {
            const currentLine = lines[index];
            const previousLine = index > 0 ? lines[index - 1].trim() : '';
            const hasContext = CONTEXT_INTRO.test(previousLine);
            const start = offset;
            const end = offset + currentLine.length;
            offset = end + 1;
            if (!hasContext || !isLikelyArabicVerse(currentLine)) continue;
            const overlaps = occupiedRanges.some(range => start < range.end && end > range.start);
            if (!overlaps) {
                ranges.push({
                    start,
                    end,
                    value: currentLine,
                    confidence: 0.72,
                    source: 'context-clue'
                });
            }
        }
        return ranges;
    }

    function findCorpusRanges(text, corpus = []) {
        if (!Array.isArray(corpus) || corpus.length === 0) return [];
        const ranges = [];
        for (const entry of corpus) {
            const candidate = typeof entry === 'string' ? { text: entry } : entry;
            if (!candidate || typeof candidate.text !== 'string' || !candidate.text.trim()) continue;
            const needle = normalizeForComparison(candidate.text);
            if (!needle) continue;
            const normalizedText = normalizeForComparison(text);
            const normalizedIndex = normalizedText.indexOf(needle);
            if (normalizedIndex < 0) continue;
            // Corpus matching is opt-in and only receives a high confidence when
            // the caller supplied a trusted verse corpus and the text is exact
            // after comparison normalization.
            const originalIndex = String(text).toLocaleLowerCase('ar').indexOf(candidate.text.toLocaleLowerCase('ar'));
            if (originalIndex >= 0) {
                ranges.push({
                    start: originalIndex,
                    end: originalIndex + candidate.text.length,
                    value: String(text).slice(originalIndex, originalIndex + candidate.text.length),
                    confidence: Number(candidate.confidence) || 0.98,
                    source: candidate.source || 'trusted-corpus'
                });
            }
        }
        return ranges;
    }

    function rangesDoNotOverlap(ranges) {
        const sorted = [...ranges].sort((a, b) => a.start - b.start || b.end - a.end);
        const accepted = [];
        for (const range of sorted) {
            const previous = accepted[accepted.length - 1];
            if (previous && range.start < previous.end) continue;
            accepted.push(range);
        }
        return accepted;
    }

    function segmentArabicText(input, options = {}) {
        const original = String(input || '');
        const text = removeInvisibleControls(original);
        if (!text) return [makeTextSegment('')];

        const markerRanges = findMarkerRanges(text);
        const corpusRanges = findCorpusRanges(text, options.corpus);
        const contextRanges = options.enableContext !== false
            ? findContextRanges(text, [...markerRanges, ...corpusRanges])
            : [];
        const ranges = rangesDoNotOverlap([
            ...markerRanges,
            ...corpusRanges,
            ...contextRanges
        ]);

        if (ranges.length === 0) return [makeTextSegment(text)];

        const segments = [];
        let cursor = 0;
        for (const range of ranges) {
            if (range.start > cursor) segments.push(makeTextSegment(text.slice(cursor, range.start)));
            segments.push(makeAyahSegment(
                text.slice(range.start, range.end),
                range.confidence,
                range.source,
                range.start,
                range.end
            ));
            cursor = range.end;
        }
        if (cursor < text.length) segments.push(makeTextSegment(text.slice(cursor)));
        return mergeTextSegments(segments);
    }

    function hasConfirmedAyah(segments) {
        return Array.isArray(segments) && segments.some(segment => segment.type === 'ayah' && segment.confirmed);
    }

    return {
        removeInvisibleControls,
        normalizeForComparison,
        isLikelyArabicVerse,
        segmentArabicText,
        hasConfirmedAyah
    };
});
