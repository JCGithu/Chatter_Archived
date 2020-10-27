function htmlEntities(html) {
    function it() {
        return html.map(function(n, i, arr) {
                if(n.length == 1) {
                    return n.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                        return '&#'+i.charCodeAt(0)+';';
                    });
                }
                return n;
            });
    }
    var isArray = Array.isArray(html);
    if(!isArray) {
        html = html.split('');
    }
    html = it(html);
    if(!isArray) html = html.join('');
    return html;
};
function formatEmotes(channel, text, emotes, bttvEmoteCache) {
    let bttvEmotes = bttvEmoteCache.data.global.slice(0);
    let chan = getChan(channel);
    if(chan in bttvEmoteCache.data) {
        bttvEmotes = bttvEmotes.concat(bttvEmoteCache.data[chan]);
    }
    var splitText = text.split('');
    bttvEmotes.forEach(({ code, id, type, imageType }) => {
        let hasEmote = text.indexOf(code);
        if(hasEmote === -1) { return;
        } else { 
            for (let start = text.indexOf(code); start > -1; start = text.indexOf(code, start + 1)) {
                let end = start + code.length;
                let url = bttvEmoteCache.urlTemplate;
                url = url.replace('{{id}}', id).replace('{{image}}', '1x');
                var mote = [parseInt(start), parseInt(end)];
                var length =  mote[1] - mote[0],
                    empty = Array.apply(null, new Array(length + 1)).map(function() { return '' });
                splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                splitText.splice(mote[0], 1, '<img class="emoticon" src="' + url + '">');
                console.log(splitText);
            };
        };
    })
    for(var i in emotes) {
        var e = emotes[i];
        for(var j in e) {
            var mote = e[j];
            if(typeof mote == 'string') {
                mote = mote.split('-');
                mote = [parseInt(mote[0]), parseInt(mote[1])];
                var length =  mote[1] - mote[0],
                    empty = Array.apply(null, new Array(length + 1)).map(function() { return '' });
                splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                splitText.splice(mote[0], 1, '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">');
            }
        }
    }
    return htmlEntities(splitText).join('')
};

function getChan(channel = '') {
	return channel.replace(/^#/, '');
};

module.exports = {
    formatEmotes,
    getChan
};