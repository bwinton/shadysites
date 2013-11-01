var {Cc, Ci} = require('chrome');
var data = require('self').data;
var pageMod = require('page-mod');
var pageWorkers = require('page-worker');

var eTLDService = Cc['@mozilla.org/network/effective-tld-service;1'].getService(Ci.nsIEffectiveTLDService);
var ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
var perms = Cc['@mozilla.org/permissionmanager;1'].getService(Ci.nsIPermissionManager);
/*
// Create a page worker that loads Wikipedia:
pageWorkers.Page({
  contentURL: 'http://en.wikipedia.org/wiki/Internet',
  contentScriptFile: data.url('contentScript.js'),
  contentScriptWhen: 'ready',
  onMessage: function(message) {
    console.log(message);
  }
});
*/

function log(message) {
  //console.log(message);
}

pageMod.PageMod({
  include: '*',
  contentScriptWhen: 'ready',
  contentScriptFile: data.url('contentScript.js'),
  onAttach: function(worker) {
    worker.port.on('message', function(elementContent) {
      log(elementContent);
    });
    worker.port.on('basedomain', function(domain) {
      log('Got domain of ' + domain);
      var basedomain = eTLDService.getBaseDomainFromHost(domain); // this includes the TLD
      log('Returning basedomain of ' + basedomain);
      worker.port.emit('basedomain', basedomain);
    });
    worker.port.on('addPerm', function(domain) {
      var uri = ios.newURI(domain, null, null);
      perms.add(uri, 'install', perms.ALLOW_ACTION);
      worker.port.emit('addPerm', true);
    });
    worker.port.on('delPerm', function(domain) {
      perms.remove(domain, 'install');
    });
  }
});