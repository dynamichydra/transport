'use strict';

(function () {
  
  init();

  function init() {
    $('#userType').html(auth.config.type);
    if(!auth.config.type){
      window.location = '#/login';
    }
    bindEvents();
  }

  function bindEvents() {
    
  }

})();