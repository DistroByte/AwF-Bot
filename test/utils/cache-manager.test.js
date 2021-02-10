const assert = require("assert")
const { CacheManager } = require("../../utils/cache-manager");

describe('CacheManager', () => {
  it('should set cache correctly', () => {
    let res = CacheManager.set('oof2win2', 'developer')
    assert(res === true, `Error setting cache ${res}`)
  });
  it('should read cache properly', () => {
    assert(CacheManager.get('oof2win2') === 'developer', 'Cache not read correctly')
  })
  it('should delete cache properly', () => {
    CacheManager.set('potato', 'ye');
    CacheManager.set('potato2', 'hii');
    assert(CacheManager.del('oof2win2') === 1, 'Deleted multiple items')
    assert(CacheManager.del('potato') === 1, 'Deleted multiple items')
    assert(CacheManager.del('potato2') === 1, 'Deleted multiple items')
  })
  it('should take items properly', () => {
    CacheManager.set('yes', 'true')
    assert.strictEqual(CacheManager.take('yes'), 'true', 'Taken value is not expected value')
    assert.strictEqual(CacheManager.get('yes'), undefined, 'Value still exists')
  })
})