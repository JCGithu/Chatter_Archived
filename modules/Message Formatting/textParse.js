function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
};

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
};

const chatFilters = [
    // '\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF', // Partial Latin-1 Supplement
    // '\u0100-\u017F', // Latin Extended-A
    // '\u0180-\u024F', // Latin Extended-B
    '\u0250-\u02AF', // IPA Extensions
    '\u02B0-\u02FF', // Spacing Modifier Letters
    '\u0300-\u036F', // Combining Diacritical Marks
    '\u0370-\u03FF', // Greek and Coptic
    '\u0400-\u04FF', // Cyrillic
    '\u0500-\u052F', // Cyrillic Supplement
    '\u0530-\u1FFF', // Bunch of non-English
    '\u2100-\u214F', // Letter Like
    '\u2500-\u257F', // Box Drawing
    '\u2580-\u259F', // Block Elements
    '\u25A0-\u25FF', // Geometric Shapes
    '\u2600-\u26FF', // Miscellaneous Symbols
    // '\u2700-\u27BF', // Dingbats
    '\u2800-\u28FF', // Braille
    // '\u2C60-\u2C7F', // Latin Extended-C
];
const chatFilter = new RegExp(`[${chatFilters.join('')}]`);

module.exports = {
    suffix: ordinal_suffix_of,
    cleave: removeA,
    chatFilter
};
