define(["../persistenceStoreManager","./OfflineCache","./logger"],function(a,b,c){"use strict";function d(){this._prefix="offlineCaches-",this._caches={},this._cachesArray=[]}return d.prototype.open=function(d){c.log("Offline Persistence Toolkit OfflineCacheManager: open() with name: "+d);var e=this,f=e._caches[d];return f?Promise.resolve(f):a.openStore(e._prefix+d).then(function(a){return f=new b(d,a),e._caches[d]=f,e._cachesArray.push(f),f})},d.prototype.match=function(a,b){c.log("Offline Persistence Toolkit OfflineCacheManager: match() for Request with url: "+a.url);var d=this,e=function(c,d){return d===c.length?Promise.resolve():c[d].match(a,b).then(function(a){return a?a.clone():e(c,d+1)})};return e(d._cachesArray,0)},d.prototype.has=function(a){return c.log("Offline Persistence Toolkit OfflineCacheManager: has() for name: "+a),this._caches[a]?Promise.resolve(!0):Promise.resolve(!1)},d.prototype.delete=function(a){c.log("Offline Persistence Toolkit OfflineCacheManager: delete() for name: "+a);var b=this,d=b._caches[a];return d?d.delete().then(function(){return b._cachesArray.splice(b._cachesArray.indexOf(a),1),delete b._caches[a],!0}):Promise.resolve(!1)},d.prototype.keys=function(){c.log("Offline Persistence Toolkit OfflineCacheManager: keys()");for(var a=[],b=0;b<this._cachesArray.length;b++)a.push(this._cachesArray[b].getName());return Promise.resolve(a)},new d});
//# sourceMappingURL=offlineCacheManager.js.map