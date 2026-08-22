/* WordJoiner DOCX export — client-side, no upload or server required. */
(() => {
    const encoder = new TextEncoder();

    function xmlEscape(value = '') {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
    }

    function crc32(bytes) {
        let crc = 0xffffffff;
        for (const byte of bytes) {
            crc ^= byte;
            for (let bit = 0; bit < 8; bit += 1) {
                crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
            }
        }
        return (crc ^ 0xffffffff) >>> 0;
    }

    function dosDateTime(date = new Date()) {
        const year = Math.max(1980, date.getFullYear());
        return {
            time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
            date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
        };
    }

    function pushUint16(target, value) {
        target.push(value & 0xff, (value >>> 8) & 0xff);
    }

    function pushUint32(target, value) {
        target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
    }

    function createZip(entries) {
        const localParts = [];
        const centralParts = [];
        let offset = 0;
        const stamp = dosDateTime();

        for (const entry of entries) {
            const name = encoder.encode(entry.name);
            const data = encoder.encode(entry.data);
            const checksum = crc32(data);
            const localHeader = [];
            pushUint32(localHeader, 0x04034b50);
            pushUint16(localHeader, 20);
            pushUint16(localHeader, 0);
            pushUint16(localHeader, 0);
            pushUint16(localHeader, stamp.time);
            pushUint16(localHeader, stamp.date);
            pushUint32(localHeader, checksum);
            pushUint32(localHeader, data.length);
            pushUint32(localHeader, data.length);
            pushUint16(localHeader, name.length);
            pushUint16(localHeader, 0);
            localParts.push(new Uint8Array([...localHeader, ...name, ...data]));

            const centralHeader = [];
            pushUint32(centralHeader, 0x02014b50);
            pushUint16(centralHeader, 20);
            pushUint16(centralHeader, 20);
            pushUint16(centralHeader, 0);
            pushUint16(centralHeader, 0);
            pushUint16(centralHeader, stamp.time);
            pushUint16(centralHeader, stamp.date);
            pushUint32(centralHeader, checksum);
            pushUint32(centralHeader, data.length);
            pushUint32(centralHeader, data.length);
            pushUint16(centralHeader, name.length);
            pushUint16(centralHeader, 0);
            pushUint16(centralHeader, 0);
            pushUint16(centralHeader, 0);
            pushUint16(centralHeader, 0);
            pushUint32(centralHeader, 0);
            pushUint32(centralHeader, offset);
            centralParts.push(new Uint8Array([...centralHeader, ...name]));
            offset += localHeader.length + name.length + data.length;
        }

        const centralDirectory = new Blob(centralParts);
        const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
        const end = [];
        pushUint32(end, 0x06054b50);
        pushUint16(end, 0);
        pushUint16(end, 0);
        pushUint16(end, entries.length);
        pushUint16(end, entries.length);
        pushUint32(end, centralSize);
        pushUint32(end, offset);
        pushUint16(end, 0);

        return new Blob([...localParts, centralDirectory, new Uint8Array(end)], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
    }

    function normalizeSegments(text, options = {}) {
        const fallback = String(text || '').replace(/\u2060/gu, '');
        if (!Array.isArray(options.segments) || options.segments.length === 0) {
            return [{ type: 'text', value: fallback }];
        }
        return options.segments
            .filter(segment => segment && typeof segment.value === 'string')
            .map(segment => ({
                type: segment.type === 'ayah' ? 'ayah' : 'text',
                value: String(segment.value).replace(/\u2060/gu, ''),
                confidence: Number(segment.confidence) || 0,
                source: segment.source || ''
            }));
    }

    function normalizeHexColor(value, fallback = '2E7D32') {
        const color = String(value || '').replace('#', '').trim();
        return /^[0-9a-f]{6}$/iu.test(color) ? color.toUpperCase() : fallback;
    }

    function makeRunXml(segment, style) {
        const isAyah = segment.type === 'ayah' && Number(segment.confidence) >= 0.95;
        const value = segment.type === 'ayah' && style.keepMarkers === false
            ? segment.value.replace(/[﴿﴾]/gu, '')
            : segment.value;
        const font = isAyah ? style.fontFamily : style.baseFontFamily;
        const size = isAyah ? style.fontSize : style.baseFontSize;
        const color = isAyah ? `<w:color w:val="${normalizeHexColor(style.color)}"/>` : '';
        const bold = isAyah && style.bold ? '<w:b/><w:bCs/>' : '';
        const safeValue = xmlEscape(value || ' ');
        return `<w:r><w:rPr><w:rtl/><w:lang w:val="ar-SA"/><w:rFonts w:ascii="${xmlEscape(font)}" w:hAnsi="${xmlEscape(font)}" w:cs="${xmlEscape(font)}"/>${color}${bold}<w:sz w:val="${Math.round(size * 2)}"/><w:szCs w:val="${Math.round(size * 2)}"/></w:rPr><w:t xml:space="preserve">${safeValue}</w:t></w:r>`;
    }

    function splitSegmentsIntoLines(segments) {
        const lines = [[]];
        for (const segment of segments) {
            const parts = String(segment.value || '').replace(/\r\n?/gu, '\n').split('\n');
            parts.forEach((part, index) => {
                if (part) lines[lines.length - 1].push({ ...segment, value: part });
                if (index < parts.length - 1) lines.push([]);
            });
        }
        return lines;
    }

    function makeDocumentXml(text, options = {}) {
        const style = {
            fontFamily: options.quranStyle?.fontFamily || 'Amiri',
            color: options.quranStyle?.color || '#2E7D32',
            fontSize: Number(options.quranStyle?.fontSize) || 22,
            keepMarkers: options.quranStyle?.keepMarkers !== false,
            bold: options.quranStyle?.bold !== false,
            baseFontFamily: options.baseFontFamily || 'Arial',
            baseFontSize: Number(options.baseFontSize) || 14
        };
        const segments = normalizeSegments(text, options);
        const paragraphs = splitSegmentsIntoLines(segments).map(line => {
            const runs = line.length
                ? line.map(segment => makeRunXml(segment, style)).join('')
                : makeRunXml({ type: 'text', value: ' ' }, style);
            return `<w:p><w:pPr><w:bidi/><w:jc w:val="right"/><w:spacing w:after="160" w:line="360" w:lineRule="auto"/></w:pPr>${runs}</w:p>`;
        }).join('');

        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/><w:bidi/></w:sectPr></w:body></w:document>`;
    }

    function createDocx(text, options = {}) {
        const entries = [
            {
                name: '[Content_Types].xml',
                data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'
            },
            {
                name: '_rels/.rels',
                data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
            },
            {
                name: 'word/document.xml',
                data: makeDocumentXml(text, options)
            },
            {
                name: 'word/_rels/document.xml.rels',
                data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="../styles.xml"/></Relationships>'
            },
            {
                name: 'word/styles.xml',
                data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:sz w:val="28"/><w:szCs w:val="28"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:bidi/><w:spacing w:after="160" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>'
            }
        ];
        return createZip(entries);
    }

    function downloadDocx(text, filename = `WordJoiner-${new Date().toISOString().slice(0, 10)}.docx`, options = {}) {
        if (!String(text || '').trim()) return false;
        const blob = createDocx(text, options);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        return true;
    }

    window.downloadDocx = downloadDocx;
    window.createWordJoinerDocx = createDocx;
})();
