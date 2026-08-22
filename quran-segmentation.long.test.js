const assert = require('node:assert/strict');
const {
    segmentArabicText,
    removeInvisibleControls,
    hasConfirmedAyah
} = require('./quran-segmentation.js');

const articleParagraphs = [
    'تتناول هذه الفقرة أثر العمل الصالح في بناء الإنسان، وتشرح كيف يمكن للنص الديني أن يحافظ على معناه عند نقله بين التطبيقات المختلفة.',
    'قال الله تعالى: ﴿وَقُلْ رَبِّ زِدْنِي عِلْمًا﴾ ثم يتابع الكاتب شرح أهمية العلم، وضرورة التثبت من النص قبل نشره.',
    'لا يكفي أن يكون النص طويلًا؛ بل ينبغي أن تبقى فواصل الأسطر والعناوين والاقتباسات والهوامش كما هي دون دمج أو فقدان.',
    'ومن المعاني التي يذكرها المقال أن المحبة الصادقة تظهر حين يقع التعارض، وأن رضا الله مقدم على هوى النفس.',
    'قال الله تعالى: ﴿وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا﴾ ثم يوضح المقال أن الاعتدال لا يعني ترك المسؤوليات، بل وضع كل أمر في موضعه.',
    'وفي فقرة أخرى يشرح الكاتب الفرق بين النص المؤكد والنص المرشح، ويؤكد أن علامات الآية تساعد على تقليل الالتباس.',
    'قال الله تعالى: ﴿وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ﴾ ويستخلص الكاتب أن الانتفاع بالدنيا لا ينبغي أن يتحول إلى غاية نهائية.',
    'تتضمن المقالة أمثلة متعددة، وأرقامًا مثل 2026، وعلامات ترقيم، وأسطرًا فارغة، ونصوصًا بين قوسين حتى نختبر عدم إفساد المحتوى المحيط.',
    'قال الله تعالى: ﴿قُلْ إِنْ كَانَ آبَاؤُكُمْ وَأَبْنَاؤُكُمْ وَإِخْوَانُكُمْ وَأَزْوَاجُكُمْ وَعَشِيرَتُكُمْ وَأَمْوَالٌ اقْتَرَفْتُمُوهَا أَحَبَّ إِلَيْكُمْ مِنَ اللَّهِ وَرَسُولِهِ﴾ ثم يعود المقال إلى الشرح والتحليل.',
    'الخلاصة أن سلامة الاستخراج لا تقاس بعدد الآيات المكتشفة فقط، بل بقدرة المحرك على إعادة النص كاملًا وبالترتيب نفسه.'
];

const baseArticle = articleParagraphs.join('\n\n');
const longArticle = Array.from({ length: 80 }, (_, index) => `## الفقرة ${index + 1}\n${baseArticle}`).join('\n\n');
const expectedMarkedAyat = articleParagraphs.filter(paragraph => paragraph.includes('﴿')).length * 80;

assert.ok(longArticle.length > 100_000, `fixture should be very long, got ${longArticle.length} characters`);

const startedAt = process.hrtime.bigint();
const segments = segmentArabicText(longArticle);
const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
const ayahs = segments.filter(segment => segment.type === 'ayah');
const reconstructed = segments.map(segment => segment.value).join('');

assert.equal(ayahs.length, expectedMarkedAyat);
assert.equal(ayahs.every(segment => segment.confidence === 1 && segment.source === 'quran-marker' && segment.confirmed), true);
assert.equal(hasConfirmedAyah(segments), true);
assert.equal(reconstructed, removeInvisibleControls(longArticle));
assert.equal((reconstructed.match(/\n/gu) || []).length, (longArticle.match(/\n/gu) || []).length);
assert.equal(segments.every((segment, index) => index === 0 || segment.start === undefined || segment.start >= 0), true);
assert.ok(elapsedMs < 1500, `long article segmentation took ${elapsedMs.toFixed(2)}ms`);

const markerStarts = ayahs.map(segment => segment.start);
assert.equal(markerStarts.every((start, index) => index === 0 || start > markerStarts[index - 1]), true);

const ordinaryLongText = Array.from({ length: 160 }, (_, index) => `هذه فقرة تحريرية عادية رقم ${index + 1} تتحدث عن القراءة والكتابة وتنظيم المعلومات دون اقتباس قرآني.`).join('\n\n');
const ordinarySegments = segmentArabicText(ordinaryLongText);
assert.equal(ordinarySegments.some(segment => segment.type === 'ayah'), false);
assert.equal(ordinarySegments.map(segment => segment.value).join(''), ordinaryLongText);

const contextualArticle = 'قال الله تعالى:\nوَقُلْ رَبِّي أَعْلَمُ بِمَا تَعْمَلُونَ\nثم يبدأ الشرح في فقرة جديدة.';
const contextualSegments = segmentArabicText(contextualArticle);
const contextualAyah = contextualSegments.find(segment => segment.type === 'ayah');
assert.equal(contextualAyah?.source, 'context-clue');
assert.equal(contextualAyah?.confirmed, false);
assert.equal(contextualSegments.map(segment => segment.value).join(''), contextualArticle);

const protectedArticle = longArticle.replace(/﴿/gu, '﴿\u2060').replace(/﴾/gu, '\u2060﴾');
const protectedSegments = segmentArabicText(protectedArticle);
assert.equal(protectedSegments.filter(segment => segment.type === 'ayah').length, expectedMarkedAyat);
assert.equal(protectedSegments.map(segment => segment.value).join(''), removeInvisibleControls(protectedArticle));

console.log(JSON.stringify({
    test: 'quran-segmentation.long',
    characters: longArticle.length,
    paragraphs: longArticle.split(/\n\n/gu).length,
    detectedAyat: ayahs.length,
    ordinaryFalsePositives: ordinarySegments.filter(segment => segment.type === 'ayah').length,
    contextualConfidence: contextualAyah?.confidence,
    elapsedMs: Number(elapsedMs.toFixed(2)),
    status: 'passed'
}, null, 2));
