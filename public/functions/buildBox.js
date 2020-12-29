const pointMedals = [
  {
    userBracket: 0,
    badge: '👑',
  },
  {
    userBracket: 1,
    badge: '🥈',
  },
  {
    userBracket: 2,
    badge: '🥉',
  },
];

function buildBox(chatDiv, msg, user, style, userBracket, fmtBadges) {
  chatDiv.id = 'chatbox';
  let chatName = document.createElement('span');
  chatName.classList.add('chat-name');
  for (let i = 0; i < pointMedals.length; i++) {
    if (userBracket == pointMedals[i].userBracket) {
      user = pointMedals[i].badge + user;
    }
  }
  chatName.innerHTML = user;
  let chatChat = document.createElement('span');
  chatChat.classList.add('chat-chat');
  chatChat.innerHTML = ': ' + msg;
  if (style.includes('function')) {
    chatDiv.classList.add('function');
  }
  document.body.appendChild(chatDiv);
  if (fmtBadges) {
    for (badges in fmtBadges) {
      let ele = document.createElement('img');
      ele.setAttribute('src', fmtBadges[badges][0]);
      ele.setAttribute('badgeType', fmtBadges[badges][1]);
      ele.setAttribute('alt', fmtBadges[badges][1]);
      ele.classList.add('badge');
      chatDiv.appendChild(ele);
    }
  }
  chatDiv.appendChild(chatName);
  chatDiv.appendChild(chatChat);
}

module.exports = {
  buildBox,
};
