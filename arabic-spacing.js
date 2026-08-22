const ARABIC_MARK = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/u;
const ARABIC_LETTER = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3\u06FA-\u06FF]/u;
const ARABIC_TOKEN = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3\u06FA-\u06FF\u0640\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]+/gu;

/**
 * كلمات شائعة تساعد على اكتشاف حدود الكلمات الملتصقة.
 * أضف إلى options.vocabulary كلمات المجال الخاص بك لتحسين الدقة.
 */
const DEFAULT_VOCABULARY = [
  // كلمات من النص النموذجي
  "فإذا", "تعارضت", "محبة", "الدنيا", "مع", "أمر", "الله", "ظهر",
  "صدق", "الإيمان", "فالمؤمن", "لا", "يترك", "طاعة", "من", "أجل",
  "مال", "مالٍ", "أهل", "أو", "تجارة", "بل", "يقدم", "يقدّم",
  "رضا", "كل", "محبوب", "قال", "تعالى", "إِن", "إن", "كان",
  "آباؤكم", "أبناؤكم", "إخوانكم", "وأزواجكم", "أزواجكم", "عشيرتكم", "وعشيرتكم",
  "وأموال", "أموال", "اقترفتموها", "وتجارة", "تجارة", "تخشون",
  "كسادها", "ومساكن", "مساكن", "ترضونها", "أحب", "أحبّ", "إليكم",
  "ورسوله", "رسوله", "وجهاد", "جهاد", "في", "سبيله", "فترَبَّصوا",
  "فتربصوا", "حتى", "يأتي", "يأتِي", "بأمره", "والله", "يهدي",
  "القوم", "الفاسقين", "فليس", "المذموم", "أن", "تحب", "أهلك", "ومالك",
  "وإنما", "الخطر", "تتسلل", "تتسلّل", "إلى", "القلب", "تصبح", "طاعتها",
  "مقدمة", "مقدّمة", "الصادقة", "تظهر", "حين", "تتوافق", "الرغبات",
  "يقع", "التعارض", "هناك", "يختبر", "يُختبر", "ويظهر", "ما", "الذي",
  "يقدمه", "يقدّمه", "العبد", "حقا", "حقًا", "أم", "هوى", "النفس",

  // كلمات وظيفية عامة
  "هذا", "هذه", "ذلك", "تلك", "الذي", "التي", "وهو", "وهي", "ثم",
  "قد", "كان", "كانت", "يكون", "تكون", "إنما", "لكن", "بل", "حتى",
  "عن", "على", "إلى", "في", "من", "ما", "ماذا", "كيف", "كل", "بعض",
  "أو", "أم", "يا", "لم", "لن", "ليس", "ليست", "هو", "هي"
];

function normalizeArabicKey(value) {
  return value
    .normalize("NFC")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .replace(/\u0640/gu, "")
    // توحيد صور الألف لأغراض المطابقة فقط، مع إبقاء النص الأصلي كما هو.
    .replace(/[أإآٱ]/gu, "ا")
    .replace(/ى/gu, "ي")
    .replace(/ؤ/gu, "و")
    .replace(/ئ/gu, "ي");
}

function makeVocabulary(words) {
  const vocabulary = new Set();
  for (const word of words) {
    const key = normalizeArabicKey(word);
    if (key.length > 0) vocabulary.add(key);
  }
  return vocabulary;
}

/**
 * يحول الكلمة العربية إلى وحدات أساسية مع الاحتفاظ بمواقعها الأصلية.
 * هذا يسمح بإضافة المسافة دون فصل التشكيل عن الحرف السابق.
 */
function toArabicUnits(token) {
  const units = [];
  for (let i = 0; i < token.length;) {
    const codePoint = token.codePointAt(i);
    const char = String.fromCodePoint(codePoint);
    const width = char.length;

    if (ARABIC_MARK.test(char) || char === "ـ") {
      if (units.length > 0) units[units.length - 1].end = i + width;
      i += width;
      continue;
    }

    units.push({
      key: normalizeArabicKey(char),
      start: i,
      end: i + width
    });
    i += width;
  }
  return units;
}

/**
 * يحاول تقسيم كلمة عربية ملتصقة اعتمادًا على معجم معروف.
 * إذا لم يجد تقسيمًا مؤكدًا، يعيد الكلمة كما هي لتجنب التخمين الخاطئ.
 */
function splitGluedArabicToken(token, vocabulary) {
  const units = toArabicUnits(token);
  if (units.length < 2 || !units.some(unit => ARABIC_LETTER.test(unit.key))) {
    return token;
  }

  const skeleton = units.map(unit => unit.key).join("");
  if (vocabulary.has(skeleton)) {
    return token;
  }

  const best = Array(units.length + 1).fill(null);
  best[0] = { score: 0, parts: [] };

  for (let start = 0; start < units.length; start++) {
    if (!best[start]) continue;

    for (let end = start + 1; end <= units.length; end++) {
      const candidate = units.slice(start, end).map(unit => unit.key).join("");
      // لا نفصل حروف العطف المفردة داخل كلمة؛ «وعشيرتكم» كلمة واحدة هنا.
      if (candidate.length < 2 || !vocabulary.has(candidate)) continue;

      const partLength = end - start;
      const next = {
        // تفضيل الكلمات الأطول وتقليل عدد التقسيمات.
        score: best[start].score + partLength * partLength,
        parts: [...best[start].parts, { start, end }]
      };

      if (!best[end] || next.score > best[end].score) {
        best[end] = next;
      }
    }
  }

  const solution = best[units.length];
  if (!solution || solution.parts.length < 2) return token;

  return solution.parts
    .map(({ start, end }) => token.slice(units[start].start, units[end - 1].end))
    .join(" ");
}

/**
 * إصلاح محافظ للمسافات المفقودة في نص عربي منسوخ.
 *
 * @param {string} text النص العربي المراد إصلاحه.
 * @param {{vocabulary?: string[], removeZeroWidth?: boolean}} options خيارات الدالة.
 * @returns {string} النص بعد إصلاح المسافات المؤكدة فقط.
 */
function repairArabicSpacing(text, options = {}) {
  if (typeof text !== "string" || text.length === 0) return text;

  const vocabulary = makeVocabulary([
    ...DEFAULT_VOCABULARY,
    ...(Array.isArray(options.vocabulary) ? options.vocabulary : [])
  ]);

  // Preserve the user's original grapheme/mark order. NFC is used only for
  // dictionary comparison; applying it to the full output can reorder Arabic
  // combining marks such as shadda and fatha.
  let result = text;

  if (options.removeZeroWidth !== false) {
    // محارف تركتها بعض أدوات حماية النص القديمة.
    result = result.replace(/[\u200B\u200C\u200D\u2060]/gu, "");
  }

  // إصلاح المسافة بعد النقطتين والفاصلة المنقوطة إذا التصقت بها كلمة عربية.
  result = result.replace(/([:؛])(?=[\u0600-\u06FF])/gu, "$1 ");

  // تقسيم الكلمات الملتصقة التي يمكن إثبات حدودها بالمعجم.
  return result.replace(ARABIC_TOKEN, token =>
    splitGluedArabicToken(token, vocabulary)
  );
}

// مثال مباشر:
const sample = "@karar:فإذا تعارضت محبة الدنيا مع أمر الله، ظهر صدق الإيمان؛" +
  " إخوانكموأزواجكم وعشيرتكموأموالٌ أَحَبّإِلَيْكُمْمِنَ اللّهِ،" +
  " واللّهُلَا يَهْدِي الْقَوْمَالْفَاسِقِينَ";

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    repairArabicSpacing,
    splitGluedArabicToken,
    normalizeArabicKey
  };
}

if (typeof window !== "undefined") {
  window.repairArabicSpacing = repairArabicSpacing;
}

// في المتصفح يمكن تجربة:
// console.log(window.repairArabicSpacing(sample));
