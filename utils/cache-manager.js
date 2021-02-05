const NodeCache = require("node-cache");
const { ErrorManager } = require("./error-manager")

class CacheManagerClass {
  constructor (opts) {
    this._cache = new NodeCache(opts);
  }
  get(key) {
    return this._cache.get(key);
  }
  set(key, obj, timeout) {
    const res = this._cache.set(key, obj, timeout);
    if (res === false) {
      ErrorManager.Error("Cache not behaving correctly. Didn't set value");
    } else {
      return true;
    }
  }
}
let CacheManager = new CacheManagerClass({
  checkperiod: 120,
  stdTTL: 1800, // auto expires after 15 mins
});
module.exports = {
  CacheManager,
  CacheManagerClass,
}