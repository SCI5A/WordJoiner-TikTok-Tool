const assert = require('node:assert/strict');
const { repairArabicSpacing } = require('./arabic-spacing.js');

const diacritics = 'مُشَكَّلَةٌ مَرْحَبًا';
assert.equal(repairArabicSpacing(diacritics), diacritics);

const mixed = 'مرحبا WordJoiner 2026 😊 — نص عادي.';
assert.equal(repairArabicSpacing(mixed), mixed);

assert.equal(repairArabicSpacing('قال:فإذا بدأ النص'), 'قال: فإذا بدأ النص');
assert.equal(repairArabicSpacing('كلمة\u2060 عربية', { removeZeroWidth: true }), 'كلمة عربية');
assert.equal(repairArabicSpacing('كلمة\u2060 عربية', { removeZeroWidth: false }), 'كلمة\u2060 عربية');

const unknown = 'هذاكلمةنادرةغيرمعروفة تمامًا';
assert.equal(repairArabicSpacing(unknown), unknown);

console.log('Arabic spacing tests passed');
