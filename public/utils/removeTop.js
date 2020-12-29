function removeTop(chatDiv) {
  console.log(chatDiv);
  let display = chatDiv.getBoundingClientRect();
  if (display.y + display.height > window.innerHeight - 10) {
    console.log('off screen');
    document.querySelector('#chatbox').remove();
    removeTop(chatDiv);
  }
}

module.exports = {
  removeTop,
};
