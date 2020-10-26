const { getChan } = require('./formatEmotes');

function formatBadges(channel, user, twitchBadgeCache) {
    let chan = getChan(channel);
    if('badges' in user && user.badges !== null) {
        let badgeGroup = Object.assign({}, twitchBadgeCache.data.global, twitchBadgeCache.data[chan] || {});
        let ele = [];
        let badges = Object.keys(user.badges)
            .forEach(type => {
                let version = user.badges[type];
                let group = badgeGroup[type];
                if(group && version in group.versions) {
                    let url = group.versions[version].image_url_1x;
                    var badgeAry = [url,type];
                    ele.push(badgeAry);
                }
            },
        []);
        return ele;
    }
}

module.exports = {
    formatBadges: formatBadges
};