const assert = require("assert");
const log = require("why-is-node-running")

const serversJSON = require('../servers.json');
const { bubbleSort, sortModifiedDate, formatChatData, getServerFromChannelInput, getFactorioRoles, giveFactorioRole, removeFactorioRole } = require('../functions')

const { DatabaseConnection } = require('../utils/database-manager')

before(async () => {
  await DatabaseConnection.connect()
})
// after all tests, disconnect from database
after(async () => {
  await DatabaseConnection.disconnect();
})

describe('sortModifiedDate', () => {
  it('should sort a directory properly', async () => {
    const res = await sortModifiedDate(`${process.env.PWD}/test/testDir/randomFiles`)
    const expectedOutput = ['example3', 'ex02.js', 'example01.file']
    assert(res, expectedOutput);
  });
  it('should accept an empty dir', async () => {
    const res = await sortModifiedDate(`${process.env.PWD}/test/testDir/emptyDir`)
    const expected = [];
    assert(res, expected);
  });
})
describe('bubbleSort', () => {
  it('should sort the array correctly', () => {
    const testArr = [0, 9, 4, 6, 15, -3, 0, -3, 0];
    const expected = [-3, -3, 0, 0, 0, 4, 6, 9, 15];
    assert(bubbleSort(testArr), expected);
  });
  it('should accept nothing in the array', () => {
    assert(bubbleSort([]), []);
  });
});
describe('formatChatData', () => {
  it('should remove Factorio rich text', () => {
    const res = formatChatData('2021-02-07 09:31:45 [CHAT] oof2win2: [gps=30,-13] heere');
    const expected = 'oof2win2:  heere';
    assert(res === expected, `Didn't parse correctly`);
  })
  it('should return an empty string if only rich text', () => {
    const res = formatChatData('2021-02-07 09:33:28 [CHAT] oof2win2: [gps=30,-13]')
    assert(res === '', `Didn't return empty string`)
  });
  it('should return an empty string if only spaces and rich text', () => {
    const res = formatChatData('2021-02-07 09:33:28 [CHAT] oof2win2:      [gps=30,-13]     ');
    assert(res === '', `Didn't return empty string`)
  });
});
describe('getServerFromChannelInput', () => {
  it('should correctly get a server', () => {
    const firstElement = Object.keys(serversJSON)[0]
    const expected = serversJSON[firstElement];
    const res = getServerFromChannelInput(expected.discordChannelID);
    assert.deepStrictEqual(res, expected)
  });
});

describe('roles', () => {
  before(() => {
    DatabaseConnection.deleteOneDB("otherData", "playerRoles", { factorioName: 'PleaseDontBeSomePlayer2' })
  });
  it('should get roles of existing player', async () => {
    const res = await getFactorioRoles('oof2win2');
    assert(res.roles.includes('Member'))
  });
  it('shouldn\'t get roles of non-existing player', async () => {
    after(() => {
      DatabaseConnection.deleteOneDB('otherData', 'playerRoles', {factorioName: 'playernames like this cant exist'})
    })
    const res = await getFactorioRoles('playernames like this cant exist');
    assert.deepStrictEqual(res, null);
  });
  it('should assign roles correctly', async () => {
    after(() => {
      DatabaseConnection.deleteOneDB('otherData', 'playerRoles', {factorioName: playername})
    })
    const playername = 'playernames like this cant exist in Factorio either'
    await giveFactorioRole(playername, 'Member');
    const res = await getFactorioRoles(playername);
    assert.deepStrictEqual(res.roles, ['Member']);
  });
  it('should remove roles correctly', async () => {
    after(() => {
      DatabaseConnection.deleteOneDB('otherData', 'playerRoles', {factorioName: playername});
    })
    const playername = 'i hope this playername doesnt exist either'
    await giveFactorioRole(playername, 'n00b');
    const check = await getFactorioRoles(playername);
    if (!check.roles.includes('n00b')) console.error(check);
    await removeFactorioRole(playername, 'n00b');
    const res = await getFactorioRoles(playername);
    assert.deepStrictEqual(res.roles, []);
  });
});

describe('parseJammyLogger', () => {

})