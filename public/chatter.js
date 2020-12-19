const socket = io('http://localhost:3000');
socket.on('newMsg', msgAdd);
socket.on('rankings', rankAdd);
socket.on('timeout', chatRemove);

var keyframesTemplate =
  '@keyframes smooth-slide {0%{height:{{height}}; margin: 2.5px 10px 2.5px 10px; padding: 5px 15px 5px 10px; transform: translateY(-1000px) scaleY(2) scaleX(0.2); transform-origin: 50% 0%;}100% {height: 0; margin: 0px 0px 0px 0px; padding: 0px 0px 0px 0px; transform: translateY(-1000px) scaleY(2) scaleX(0.2); transform-origin: 50% 0%;}}';
var replacementPattern = /\{\{height\}\}/g;
var rankArray = [];

function insertKeyframes(height) {
  var styleElement = document.createElement('style');
  height = height - 9;
  styleElement.textContent = keyframesTemplate.replace(replacementPattern, height + 'px');
  document.head.appendChild(styleElement);
}

function removeTop(chatDiv) {
  let display = chatDiv.getBoundingClientRect();
  if (display.y + display.height > window.innerHeight - 10) {
    console.log('off screen');
    document.querySelector('#chatbox').remove();
    removeTop(chatDiv);
  }
}

function removeTimer(chatDiv) {
  setTimeout(function () {
    chatDiv.classList.add('fade');
  }, 28900);
  setTimeout(function () {
    insertKeyframes(chatDiv.clientHeight);
    chatDiv.classList.add('wipe');
  }, 29400);
  setTimeout(function () {
    document.body.removeChild(chatDiv);
  }, 31000);
}

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

function msgAdd(msg, user, style, userBracket, fmtBadges) {
  let chatDiv = document.createElement('div');
  buildBox(chatDiv, msg, user, style, userBracket, fmtBadges);
  removeTop(chatDiv);
  //removeTimer(chatDiv);
}

function rankAdd(rankArray) {
  let rankDiv = document.createElement('div');
  rankDiv.id = 'rankBox';
  rankDiv.classList.add('function');
  document.body.prepend(rankDiv);
  var br = document.createElement('br');
  for (let j = 0; j < rankArray.length; j++) {
    let chatNum = document.createElement('span');
    let chatName = document.createElement('span');
    let chatPoints = document.createElement('span');
    chatNum.classList.add('chat-chat');
    chatNum.innerHTML = rankArray[j][0].position + '. ';
    chatName.classList.add('chat-name');
    chatName.innerHTML = rankArray[j][0].name + ' ';
    chatPoints.classList.add('chat-chat');
    chatPoints.innerHTML = rankArray[j][0].points + ' points<br>';
    if (j == rankArray.length - 1) {
      chatPoints.innerHTML = rankArray[j][0].points + ' points';
    }
    rankDiv.appendChild(chatNum);
    rankDiv.appendChild(chatName);
    rankDiv.appendChild(chatPoints);
  }
  removeTop(rankDiv);
  removeTimer(rankDiv);
}

function chatRemove(username) {
  var c = document.querySelectorAll('[id=chatbox]');
  for (let i = 0; i < c.length; i++) {
    const promise = new Promise((res, reject) => {
      let innerText = c[i].innerHTML;
      if (innerText) {
        let chatText = innerText.toLowerCase();
        if (chatText.indexOf(username) >= 0) {
          document.body.removeChild(c[i]);
          res();
        } else {
          console.log(chatText);
          console.log(username);
          res();
        }
      } else {
        console.log(c[i]);
        res();
      }
    });
  }
}
