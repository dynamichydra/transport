var DM_CORE_CONFIG = {
  // SERVER_URL: 'https://pixapi.dokume.in/',
  // BACKEND_URL: 'https://pixapi.dokume.in/',
  SERVER_URL: 'http://localhost:3005/',
  BACKEND_URL: 'http://localhost:3005/',
  URL_SUFIX: 'task/submit', 
  URL_GAME: 'game', 
  DOKUME_PLATFORM: 'private',
  SUBDOMAIN_WHITELABEL: true, // load a subdomain depending whitelabel
  AUTH_MODE: 'private', // private, landing, public, mix
  LANDING_URL: '#/home',
  AUTH_SUCCESS_URL: '#/home',
  LOGIN_CALLBACK: null,
  LOGOUT_CALLBACK: null,
  VERIFY_EMAIL: true,
  MODE: 'test',
  PLATFORM_NAME: 'Accounts',
  PLATFORM_TEMPLATE: 1,
  VERSION:'0.0000.15'
}

var str = window.location.href;
var arrValue = str.split("//");
var arrSecondValue = arrValue[1].split(".");
var subdomain = arrSecondValue[0];
var INDEXDB = null;
var SERVER_TYPE = 'local';
var DATA_SOURCE = 'mysql';

subdomain = 'game';