(function() {
  'use strict';

  var DokuMe_Auth = function(url) {

    this.URL = url;
    this.loggedIn = null;
    this.config = null;
    
    var authConfig = localStorage.getItem('authAdminConfig');
    if (authConfig) {
      try {
        authConfig = JSON.parse(atob(authConfig));
      } catch (e) {

        try {
          authConfig = JSON.parse(authConfig);
        } catch (e2) {
          alert('Der Login ist abgelaufen. Bitte melden Sie sich erneut an.');
        }
      }
    }
    
    this.config = {
      token: (authConfig && authConfig.token) ? authConfig.token : null,
      refresh: (authConfig && authConfig.refresh) ? authConfig.refresh : null,
      id: (authConfig && authConfig.id) ? authConfig.id : null,
      ph: (authConfig && authConfig.ph) ? authConfig.ph : null,
      type: (authConfig && authConfig.type) ? authConfig.type : null,
      status: (authConfig && authConfig.status) ? authConfig.status : null,
      login_time: (authConfig && authConfig.login_time) ? authConfig.login_time : 0,
      user: (authConfig && authConfig.user) ? authConfig.user : null
    };

  };

  DokuMe_Auth.prototype.login = function(alias, pass, callback) {
    var _ = this;
    backendSource.customRequest('auth', null, {
      username: alias,
      password: pass,
      invite: null,
      grant_type: 'password'
    }, function (data) {
      
      if (data.SUCCESS && data.MESSAGE.access_token) {
        _.loggedIn = true;
        
        _.config = {
          token: data.MESSAGE.access_token,
          refresh: data.MESSAGE.access_token,
          id: data.MESSAGE.id,
          type: data.MESSAGE.type,
          ph: data.MESSAGE.ph,
          status: data.MESSAGE.status,
          login_time: data.MESSAGE.login_time,
          user: encodeURIComponent(data.MESSAGE.name)
        };

        localStorage.setItem('authAdminConfig', btoa(JSON.stringify(_.config)));
        
        _.executeCallback(callback, data.MESSAGE, 'login');
      } else {
        _.executeCallback(callback, data.MESSAGE, 'login');
      }
    });

  };

  DokuMe_Auth.prototype.refresh_token = function(callback) {
    return true;
   
  };

  DokuMe_Auth.prototype.logout = function(callback) {
    var _ = this;
    backendSource.customRequest('auth', null, {
      token: _.config.token,
      id:auth.config.id,
      grant_type: 'logout'
    }, function (data) {
      _.loggedIn = null;
      _.config = {
        token: null,
        refresh: null,
        id: null,
        user: null
      };

      localStorage.clear();

      _.executeCallback(callback, data, 'logout');
    });
  };

  /*
   * check if callback is defined, else console info
   */
  DokuMe_Auth.prototype.executeCallback = function(callback, data, name) {
    if (typeof callback === 'function') {
      callback(data);
    } else {
      console.info('Define callback for ' + name);
    }
  };

  //expose DokuMe_Auth to window
  window.DokuMe_Auth = DokuMe_Auth;
})();
