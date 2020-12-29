function chatTimer(chatDiv) {
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
var replacementPattern = /\{\{height\}\}/g;
var keyframesTemplate =
  '@keyframes smooth-slide {0%{height:{{height}}; margin: 2.5px 10px 2.5px 10px; padding: 5px 15px 5px 10px; transform: translateY(-1000px) scaleY(2) scaleX(0.2); transform-origin: 50% 0%;}100% {height: 0; margin: 0px 0px 0px 0px; padding: 0px 0px 0px 0px; transform: translateY(-1000px) scaleY(2) scaleX(0.2); transform-origin: 50% 0%;}}';

function insertKeyframes(height) {
  var styleElement = document.createElement('style');
  height = height - 9;
  styleElement.textContent = keyframesTemplate.replace(replacementPattern, height + 'px');
  document.head.appendChild(styleElement);
}

module.exports = {
  chatTimer,
};
