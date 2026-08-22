const assert = require('node:assert/strict');
const {
  formatArabicText,
  normalizeArabicFormatterKey
} = require('./arabic-text-formatter.js');
const { segmentArabicText } = require('./quran-segmentation.js');

const spaced = 'ق ا ل ا ل ل ه ت ع ا ل ى:';
assert.equal(formatArabicText(spaced), 'قال الله تعالى:');
assert.equal(formatArabicText('ف إ ذ ا ت ع ا ر ض ت'), 'فإذا تعارضت');

const glued = 'إخوانكموأزواجكم وعشيرتكم وأموالٌ';
assert.equal(formatArabicText(glued), 'إخوانكم وأزواجكم وعشيرتكم وأموالٌ');

const punctuation = 'قال:فإذا تعارضت محبة الدنيا ،مع أمر الله؛ظهر صدق الإيمان؟نعم';
assert.equal(
  formatArabicText(punctuation),
  'قال: فإذا تعارضت محبة الدنيا، مع أمر الله؛ ظهر صدق الإيمان؟ نعم'
);

const mixed = 'نص عربيEnglish123 و123عربي —🙂';
assert.equal(formatArabicText(mixed),   'نص عربي English123 و 123 عربي —🙂');

const quran = 'قال الله تعالى:﴿مُشَكَّلَةٌ وَقْفٌ﴾ بعد الآية';
assert.equal(formatArabicText(quran), 'قال الله تعالى: ﴿مُشَكَّلَةٌ وَقْفٌ﴾ بعد الآية');
const quranSegments = segmentArabicText(formatArabicText(quran));
assert.equal(quranSegments.filter(segment => segment.type === 'ayah').length, 1);
assert.equal(quranSegments.find(segment => segment.type === 'ayah').value, '﴿مُشَكَّلَةٌ وَقْفٌ﴾');

const social = '@karar:فإذا #نص_عربي https://example.com/a:b?x=1 نص@example.com';
assert.equal(
  formatArabicText(social),
  '@karar: فإذا #نص_عربي https://example.com/a:b?x=1 نص@example.com'
);

const diacritics = 'مُشَكَّلَةٌ مَرْحَبًا';
assert.equal(formatArabicText(diacritics), diacritics);

const protectedText = 'كلمة\u2060 عربية 👩‍💻';
assert.equal(formatArabicText(protectedText), 'كلمة عربية 👩‍💻');
assert.equal(formatArabicText(protectedText, { removeInvisibleControls: false }), protectedText);

const multiline = 'السطر  الأول\n\nالسطر\tالثاني';
assert.equal(formatArabicText(multiline), multiline);
assert.equal(formatArabicText(multiline, { collapseWhitespace: true }), 'السطر الأول\n\nالسطر الثاني');

const unknown = 'هذاكلمةنادرةغيرمعروفة';
assert.equal(formatArabicText(unknown), unknown);

assert.equal(normalizeArabicFormatterKey('مُحَمَّد'), normalizeArabicFormatterKey('محمد'));
assert.equal(formatArabicText('A\u00A0B'), 'A B');

console.log('Arabic text formatter tests passed');
