'use strict';

const DM_GENERAL = (function () {

  function userData(id,key){
    return new Promise(async function (result) {
      if(!id){
        result(null);
        return;
      }
      backendSource.getObject('employee', null, {where:[
          {'key':key??'id','operator':'is','value':id}
        ],
        select:"ph_alt,ph,email,name,type,address,status,id,pic"
      }, function (data) {
        result(data);
      });
    });
  }

  function updateUserBalance(id){
    return new Promise(async function (result) {
      if(!id){
        result(null);
        return;
      }

      backendSource.customRequest('auth', null, {
        user_id: id,
        grant_type: 'updateBalance'
      }, function (data) {
        result(data);
      });
    });
  }

  function changePassword(id,opwd,npwd,cpwd,cb){
    backendSource.customRequest('auth', id, {
      oPwd: opwd,
      nPwd: npwd,
      cPwd: cpwd,
      grant_type: 'changepassword'
    }, function (data) {

      if(cb){
        return cb(data);
      }
    });
  }

  function createTags(d, s, id, url) {
    var js, fjs = d.getElementsByTagName('script')[0]; 
    if (d.getElementById(id)) return;

    js = d.createElement(s);
    js.id = id;
    if (s === 'script') {
      js.src = url;
      js.defer = 'defer';
      js.async = false;
    } else {
      js.href = url;
      js.rel = 'stylesheet';
    }
    fjs.parentNode.insertBefore(js, fjs);
  }

  function generateSubMenu(type) {
    let menu = ``;
    if(type == 'Settings'){
      menu += `<div><a href="#/settings">General Settings</a></div>`;
      menu += `<div><a href="#/profile/changepwd">Password</a></div>`;
      menu += `<div><a id="logoutBTN">Logout</a></div>`;
    }else if(type == 'Master'){
      menu += `<div><a href="#/client">Clients</a></div>`;
      menu += `<div><a href="#/product">Product</a></div>`;
      menu += `<div><a href="#/user">Employee</a></div>`;
      menu += `<div><a href="#/accountmap">Account Map</a></div>`;
    }else if(type == 'Reports'){
      menu += `<div><a href="#/report">Report</a></div>`;
      menu += `<div><a href="#/clientreport">Clients Report</a></div>`;
      menu += `<div><a href="#/paymentreport">Payment Report</a></div>`;
      menu += `<div><a href="#/receivereport">Receive Report</a></div>`;
    }
    // if(auth.config.type == 'admin'){
    //   menu += `<div><a href="#/sports/team">Team</a></div>`;
    //   menu += `<div><a href="#/sports/match">Match</a></div>`;
    // }
    menu += ``;
    $('#subMenu').html(menu);
    $('#subMenuWrapper').show();
  }

  return {
    createTags,
    userData,
    changePassword,
    updateUserBalance,
    // generateSubMenu
  }

})();