'use strict';

(function() {
  elq('.navbar-brand img').src = 'https://cdn.dokume.net/img/logo/dokume_logo_white_plain.png';

  create('link', 'whitelabel/game/style.css');

  function create(s, url) {
    let head = document.getElementsByTagName('HEAD')[0]; 
    
    let js = document.createElement(s);
    if (s === 'script') {
      js.src = url;
      js.defer = 'defer';
      js.async = false;
    } else {
      js.href = url;
      js.type = 'text/css';
      js.rel = 'stylesheet';
    }
    head.appendChild(js); 
  }
 
})();