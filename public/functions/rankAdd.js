const { removeTop } = require('../utils/removeTop');
const { chatTimer } = require('../utils/chatTimer');
var rankArray = [];

function rankAdd(rankArray) {
  let rankBoxExists = document.querySelectorAll('#rankBox');
  if (rankBoxExists.length == 0) {
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
    let boxes = document.querySelectorAll('#chatbox');
    let lastBox = boxes[boxes.length - 1];
    removeTop(lastBox);
    chatTimer(rankDiv);
  } else {
    console.log('Ranking already on screen');
  }
}

module.exports = {
  rankAdd,
};
