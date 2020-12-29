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

module.exports = {
  chatRemove,
};
