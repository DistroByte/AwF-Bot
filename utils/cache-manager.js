const NodeCache = require("node-cache");
const { ErrorManager } = require("./error-manager")

class CacheManagerClass {
  constructor (opts) {
    this._cache = new NodeCache(opts);
  }
  get(key) {
    try {
      return this._cache.get(key);
    } catch (error) {
      ErrorManager.error(error)
    }
  }
  set(key, obj, timeout) {
    try {
      const res = this._cache.set(key, obj, timeout);
      if (res === false) {
        ErrorManager.Error("Cache not behaving correctly. Didn't set value");
      } else {
        return true;
      }
    } catch (error) {
      ErrorManager.Error(error);
    }
  }
  take(key) {
    try {
      return this._cache.take(key);
    } catch (error) {
      ErrorManager.Error(error)
    }
  }
  del(key) {
    try {
      return this._cache.del(key);
    } catch (error) {
      ErrorManager.Error(error)
    }
  }
  has(key) {
    try {
      return this._cache.has(key)
    } catch (error) {
      ErrorManager.Error(error)
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