const { deepStrictEqual } = require('assert');
const assert = require('assert')
const { DatabaseConnection } = require("../../utils/database-manager");

const tempData = {
  type: 'test data',
  real: true,
}

describe('insertOneDB', () => {
  it('should insert data into database', async () => {
    const res = await DatabaseConnection.insertOneDB('otherData', 'tmpData', tempData);
    assert(res.result.ok);
  });
})
describe('findOneDB', () => {
  it('should find the correct data', async () => {
    const res = await DatabaseConnection.findOneDB('otherData', 'tmpData', tempData);
    assert.deepStrictEqual(res, tempData);
  })
  it(`shouldn't get non-existent data`, async () => {
    const res = await DatabaseConnection.findOneDB('otherData', 'tmpData', { real: 'nono' });
    assert.deepStrictEqual(res, null);
  });
});

describe('findAndReplaceOneDB', () => {
  it('should replace existing object', async () => {
    const replace = await DatabaseConnection.findOneAndReplaceDB('otherData', 'tmpData',
      { type: 'test data', real: true },
      { type: 'test data', real: false }
    );
    assert.strict(replace.ok, 1, Error(`Result not OK`));
    assert(replace.value !== null, Error(`Didn't replace anything`));
    const found = await DatabaseConnection.findOneDB('otherData', 'tmpData', { type: 'test data', real: false });
    assert(found !== null, Error('New object not found in database'));
  });
  it(`shouldn't replace non-existent object`, async () => {
    const replace = await DatabaseConnection.findOneAndReplaceDB('otherData', 'tmpData',
      { type: 'random data', real: 'definitely not'},
      { type: 'random data', real: 'still definitely not'},
    );
    assert(replace.value === null, Error(`Replaced something`));
  });
})

describe('deleteOneDB', () => {
  it('should delete correctly', async () => {
    const res = await DatabaseConnection.deleteOneDB('otherData', 'tmpData', { type: 'test data', real: false });
    assert.deepStrictEqual(res.result.ok, 1, `Result of deletion not OK`);
    assert.deepStrictEqual(res.deletedCount, 1, `Didn't delete anything`);
  });
});