/*
 * WordJoiner smart Arabic text formatter.
 *
 * This module deliberately formats only high-confidence boundaries. It does
 * not normalize the returned string with NFC, because that can reorder Arabic
 * combining marks. Normalization is used only for dictionary comparison.
 */
(function attachArabicTextFormatter(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) Object.assign(root, api);
})(typeof window !== 'undefined' ? window : globalThis, () => {
  const ARABIC_LETTER = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3\u06FA-\u06FF]/u;
  const ARABIC_MARK = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/u;
  const ARABIC_MARK_GLOBAL = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/gu;
  const INVISIBLE_ARTIFACTS = /[\u200B\u2060\u2066-\u2069\uFEFF]/gu;
  const PROTECTED_SPANS = /(?:`[^`\n]*`|(?:https?:\/\/|www\.)[^\s<>()]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|(?<![\p{L}\p{N}_])[@#][\p{L}\p{N}_\u200C\u200D.-]+|﴿[\s\S]*?﴾)/gu;

  const DEFAULT_VOCABULARY = [
    'فإذا', 'تعارضت', 'محبة', 'الدنيا', 'مع', 'أمر', 'الله', 'ظهر', 'صدق',
    'الإيمان', 'فالمؤمن', 'لا', 'يترك', 'طاعة', 'من', 'أجل', 'مال', 'أهل',
    'أو', 'تجارة', 'بل', 'قال', 'تعالى', 'إن', 'كان', 'آباؤكم', 'أبناؤكم',
    'إخوانكم', 'وأزواجكم', 'أزواجكم', 'عشيرتكم', 'وعشيرتكم', 'وأموال',
    'أموال', 'اقترفتموها', 'وتجارة', 'تخشون', 'كسادها', 'ومساكن', 'مساكن',
    'ترضونها', 'أحب', 'أحبّ', 'إليكم', 'ورسوله', 'رسوله', 'وجهاد', 'جهاد',
    'في', 'سبيله', 'فترَبَّصوا', 'فتربصوا', 'حتى', 'يأتي', 'يأتِي', 'بأمره',
    'والله', 'يهدي', 'القوم', 'الفاسقين', 'فليس', 'المذموم', 'أن', 'تحب',
    'أهلك', 'ومالك', 'وإنما', 'الخطر', 'تتسلل', 'تتسلّل', 'إلى', 'القلب',
    'تصبح', 'طاعتها', 'مقدمة', 'مقدّمة', 'الصادقة', 'تظهر', 'حين', 'تتوافق',
    'الرغبات', 'يقع', 'التعارض', 'هناك', 'يختبر', 'يُختبر', 'ويظهر', 'ما',
    'الذي', 'يقدمه', 'يقدّمه', 'العبد', 'حقا', 'حقًا', 'أم', 'هوى', 'النفس',
    'هذا', 'هذه', 'ذلك', 'تلك', 'الذي', 'التي', 'وهو', 'وهي', 'ثم', 'قد',
    'كان', 'كانت', 'يكون', 'تكون', 'إنما', 'لكن', 'عن', 'على', 'إلى', 'بعض',
    'يا', 'لم', 'لن', 'ليس', 'ليست', 'هو', 'هي', 'نص', 'عربي', 'مرحبا'
  ];

  const DEFAULT_OPTIONS = {
    removeInvisibleControls: true,
    normalizeWhitespace: true,
    collapseWhitespace: false,
    fixPunctuationSpacing: true,
    separateScriptBoundaries: true,
    joinSpacedArabicLetters: true,
    repairGluedArabicWords: true,
    protectQuranMarkers: true,
    minSpacedLetterRun: 2
  };

  function normalizeKey(value) {
    return String(value)
      .normalize('NFC')
      .replace(ARABIC_MARK_GLOBAL, '')
      .replace(/ـ/gu, '')
      .replace(/[أإآٱ]/gu, 'ا')
      .replace(/ى/gu, 'ي')
      .replace(/ؤ/gu, 'و')
      .replace(/ئ/gu, 'ي');
  }

  function makeVocabulary(options = {}) {
    const words = [
      ...DEFAULT_VOCABULARY,
      ...(Array.isArray(options.vocabulary) ? options.vocabulary : [])
    ];
    return new Set(words.map(normalizeKey).filter(Boolean));
  }

  function mapOutsideProtected(text, transform, options = {}) {
    const protectedPattern = options.protectQuranMarkers === false
      ? /(?:`[^`\n]*`|(?:https?:\/\/|www\.)[^\s<>()]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|(?<![\p{L}\p{N}_])[@#][\p{L}\p{N}_\u200C\u200D.-]+)/gu
      : PROTECTED_SPANS;
    let result = '';
    let cursor = 0;
    for (const match of String(text).matchAll(protectedPattern)) {
      const start = match.index ?? cursor;
      result += transform(text.slice(cursor, start));
      result += match[0];
      cursor = start + match[0].length;
    }
    return result + transform(text.slice(cursor));
  }

  function normalizeWhitespaceSegment(segment, options) {
    let result = segment;
    if (options.normalizeWhitespace) {
      result = result.replace(/[\u00A0\u2007\u202F]/gu, ' ');
    }
    if (options.collapseWhitespace) {
      result = result.replace(/[ \t]+/gu, ' ');
    }
    return result;
  }

  function fixPunctuationSegment(segment) {
    let result = segment;
    // Arabic punctuation does not take a visible space before it.
    result = result.replace(/[ \t]+([،؛؟])/gu, '$1');
    // Add a missing post-punctuation space only before Arabic text. This
    // intentionally avoids URLs and numeric forms such as 12:30.
    result = result.replace(/([:؛،؟])(?=[\u0600-\u06FF])/gu, '$1 ');
    return result;
  }

  function separateScriptBoundaries(segment) {
    let result = segment;
    result = result.replace(/([\u0621-\u063A\u0641-\u064A])([A-Za-z0-9])/gu, '$1 $2');
    result = result.replace(/([A-Za-z0-9])([\u0621-\u063A\u0641-\u064A])/gu, '$1 $2');
    return result;
  }

  function isSingleArabicUnit(token) {
    const bare = String(token)
      .replace(ARABIC_MARK_GLOBAL, '')
      .replace(/ـ/gu, '');
    const codePoints = [...bare];
    return codePoints.length === 1 && ARABIC_LETTER.test(bare);
  }

  function parseSingleArabicUnit(token) {
    const match = String(token).match(/^([\u0621-\u063A\u0641-\u064A\u0671-\u06D3\u06FA-\u06FF](?:[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]|ـ)*)([،؛؟:,.!?…]*)$/u);
    if (!match || !isSingleArabicUnit(match[1])) return null;
    return { base: match[1], suffix: match[2] };
  }

  function joinSpacedArabicLetters(segment, vocabulary, minRun = 2) {
    const parts = String(segment).split(/([ \t\n]+)/u);
    let result = '';
    let index = 0;

    while (index < parts.length) {
      const firstUnit = parseSingleArabicUnit(parts[index]);
      if (!firstUnit) {
        result += parts[index];
        index += 1;
        continue;
      }

      const units = [firstUnit.base];
      let trailingPunctuation = firstUnit.suffix;
      let cursor = index + 1;
      while (cursor + 1 < parts.length && /^[ \t]+$/u.test(parts[cursor])) {
        const nextUnit = parseSingleArabicUnit(parts[cursor + 1]);
        if (!nextUnit) break;
        units.push(nextUnit.base);
        trailingPunctuation = nextUnit.suffix;
        cursor += 2;
      }

      const repairedPieces = [];
      let position = 0;
      while (position < units.length) {
        let matchedEnd = -1;
        for (let end = units.length; end >= position + minRun; end -= 1) {
          const candidate = units.slice(position, end).join('');
          if (vocabulary.has(normalizeKey(candidate))) {
            matchedEnd = end;
            break;
          }
        }
        if (matchedEnd < 0) {
          repairedPieces.push(units[position]);
          position += 1;
        } else {
          repairedPieces.push(units.slice(position, matchedEnd).join(''));
          position = matchedEnd;
        }
      }

      const changed = repairedPieces.some((piece, pieceIndex) =>
        piece !== units[pieceIndex]
      ) || repairedPieces.length !== units.length;
      if (changed) {
        result += repairedPieces.join(' ') + trailingPunctuation;
        index = cursor;
      } else {
        // Unknown runs stay byte-for-byte unchanged instead of being guessed.
        result += parts[index];
        index += 1;
      }
    }
    return result;
  }

  function toArabicUnits(token) {
    const units = [];
    for (let index = 0; index < token.length;) {
      const codePoint = token.codePointAt(index);
      const char = String.fromCodePoint(codePoint);
      const width = char.length;
      if (ARABIC_MARK.test(char) || char === 'ـ') {
        if (units.length) units[units.length - 1].end = index + width;
        index += width;
        continue;
      }
      units.push({ key: normalizeKey(char), start: index, end: index + width });
      index += width;
    }
    return units;
  }

  function splitKnownGluedToken(token, vocabulary) {
    const units = toArabicUnits(token);
    if (units.length < 2 || !units.some(unit => ARABIC_LETTER.test(unit.key))) return token;
    const skeleton = units.map(unit => unit.key).join('');
    if (vocabulary.has(skeleton)) return token;

    const best = Array(units.length + 1).fill(null);
    best[0] = { score: 0, parts: [] };
    for (let start = 0; start < units.length; start += 1) {
      if (!best[start]) continue;
      for (let end = start + 1; end <= units.length; end += 1) {
        const candidate = units.slice(start, end).map(unit => unit.key).join('');
        if (candidate.length < 2 || !vocabulary.has(candidate)) continue;
        const next = {
          score: best[start].score + (end - start) ** 2,
          parts: [...best[start].parts, { start, end }]
        };
        if (!best[end] || next.score > best[end].score) best[end] = next;
      }
    }
    const solution = best[units.length];
    if (!solution || solution.parts.length < 2) return token;
    return solution.parts
      .map(({ start, end }) => token.slice(units[start].start, units[end - 1].end))
      .join(' ');
  }

  function repairGluedArabicWords(segment, vocabulary) {
    return segment.replace(/[\u0621-\u063A\u0641-\u064A\u0671-\u06D3\u06FA-\u06FF\u0640\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]+/gu, token =>
      splitKnownGluedToken(token, vocabulary)
    );
  }

  /**
   * Format Arabic text conservatively before Quran detection and protection.
   * The returned string keeps line breaks, Quran marker contents, URLs,
   * mentions, hashtags, code spans, and Arabic combining-mark order intact.
   *
   * @param {string} text
   * @param {object} options
   * @returns {string}
   */
  function formatArabicText(text, options = {}) {
    if (typeof text !== 'string' || text.length === 0) return text;
    const settings = { ...DEFAULT_OPTIONS, ...options };
    let result = text;

    if (settings.removeInvisibleControls) {
      result = result.replace(INVISIBLE_ARTIFACTS, '');
    }
    if (settings.fixPunctuationSpacing) {
      // The Quran marker is outside the Arabic-letter range used above, so
      // handle a punctuation-to-marker boundary before protecting the span.
      result = result.replace(/([:؛،؟])(?=﴿)/gu, '$1 ');
    }

    const vocabulary = makeVocabulary(settings);
    const transform = segment => {
      let next = normalizeWhitespaceSegment(segment, settings);
      if (settings.fixPunctuationSpacing) next = fixPunctuationSegment(next);
      if (settings.separateScriptBoundaries) next = separateScriptBoundaries(next);
      if (settings.joinSpacedArabicLetters) {
        next = joinSpacedArabicLetters(next, vocabulary, Number(settings.minSpacedLetterRun) || 2);
      }
      if (settings.repairGluedArabicWords) {
        next = repairGluedArabicWords(next, vocabulary);
      }
      return next;
    };

    result = mapOutsideProtected(result, transform, settings);
    return result;
  }

  return {
    DEFAULT_FORMATTER_OPTIONS: { ...DEFAULT_OPTIONS },
    formatArabicText,
    normalizeArabicFormatterKey: normalizeKey,
    isSingleArabicUnit
  };
});
