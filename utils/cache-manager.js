/**
 * @file Cache manager
 */

const NodeCache = require("node-cache");
const { ErrorManager } = require("./error-manager")

/**
 * Cache manager. Can be used to manage short-term storage (i.e. cache) for multitudes of purposes
 */
class CacheManagerClass {
  /**
   * Sets up the cache manager
   * @param {Object} opts - Options to set up cache manager with
   * @see {@link https://www.npmjs.com/package/node-cache#initialize-init|node-cache#initialize}
   */
  constructor (opts) {
    this._cache = new NodeCache(opts);
  }
  /**
   * Gets something from cache by key
   * @param {string} key - Key to get something with
   * @returns {(any|undefined)} Whatever has been set as the value for the key. Can be string, object, anything. Undefined if nothing
   */
  get(key) {
    try {
      return this._cache.get(key)
    } catch (error) {
      ErrorManager.error(error)
      return error
    }
  }
  /**
   * Sets something into cache
   * @param {string} key - Key to set into cache. Used with {@link get}
   * @param {any} obj - Value to pair key with
   * @param {number} timeout - Timeout of cached item, in seconds
   * @returns {(boolean|Error)} Returns true on success
   */
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
      return Error
    }
  }
  /**
   * Takes something from cache. Combination of {@link get} and {@link del}
   * @param {string} key - String to fetch from cache with
   * @returns {any} Result from cache {@link get}
   */
  take(key) {
    try {
      return this._cache.take(key);
    } catch (error) {
      ErrorManager.Error(error)
    }
  }
  /**
   * Deletes an entry from the cache
   * @param {string} key - Key to delete with
   * @returns {number} Number of deleted entries
   */
  del(key) {
    try {
      return this._cache.del(key);
    } catch (error) {
      ErrorManager.Error(error)
    }
  }
  /**
   * Check whether something exists in cache at all
   * @param {string} key - Key used to fetch value
   * @returns {boolean} Whether key is cached or not
   */
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