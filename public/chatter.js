const socket = io('http://localhost:3000');

const { buildBox } = require('./functions/buildBox');
const { chatRemove } = require('./functions/chatRemove');
const { rankAdd } = require('./functions/rankAdd');

const { removeTop } = require('./utils/removeTop');

socket.on('newMsg', msgAdd);
socket.on('rankings', rankAdd);
socket.on('timeout', chatRemove);

function msgAdd(msg, user, style, userBracket, fmtBadges) {
  let chatDiv = document.createElement('div');
  buildBox(chatDiv, msg, user, style, userBracket, fmtBadges);
  removeTop(chatDiv);
  //chatTimer(chatDiv);
}
