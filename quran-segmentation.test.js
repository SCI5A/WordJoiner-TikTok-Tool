const assert = require('node:assert/strict');
const {
    segmentArabicText,
    normalizeForComparison,
    hasConfirmedAyah
} = require('./quran-segmentation.js');

const marked = 'قال الله تعالى:\n﴿وَقُلْ رَبِّ زِدْنِي عِلْمًا﴾\nوهذه الآية تدل على فضل العلم.';
const markedSegments = segmentArabicText(marked);
assert.equal(markedSegments.filter(segment => segment.type === 'ayah').length, 1);
assert.equal(markedSegments.find(segment => segment.type === 'ayah').confidence, 1);
assert.equal(markedSegments.find(segment => segment.type === 'ayah').source, 'quran-marker');
assert.equal(hasConfirmedAyah(markedSegments), true);
assert.equal(markedSegments.map(segment => segment.value).join(''), marked);

const contextual = 'قال الله تعالى:\nوَقُلْ رَبِّي أَعْلَمُ بِمَا تَعْمَلُونَ';
const contextualSegments = segmentArabicText(contextual);
assert.equal(contextualSegments.filter(segment => segment.type === 'ayah').length, 1);
assert.equal(contextualSegments.find(segment => segment.type === 'ayah').source, 'context-clue');
assert.equal(contextualSegments.find(segment => segment.type === 'ayah').confirmed, false);
assert.equal(contextualSegments.map(segment => segment.value).join(''), contextual);

const ordinary = segmentArabicText('هذا نص عربي عادي بالتشكيل الجزئي.');
assert.equal(ordinary.some(segment => segment.type === 'ayah'), false);
assert.equal(ordinary[0].value, 'هذا نص عربي عادي بالتشكيل الجزئي.');

const protectedText = '﴿وَقُلْ\u2060 رَبِّ زِدْنِي عِلْمًا﴾';
assert.equal(normalizeForComparison(protectedText), 'وقل رب زدني علما');
assert.equal(segmentArabicText(protectedText).map(segment => segment.value).join(''), '﴿وَقُلْ رَبِّ زِدْنِي عِلْمًا﴾');

console.log('Quran segmentation tests passed');
