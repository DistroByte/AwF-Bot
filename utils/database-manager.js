const { MongoClient } = require('mongodb');
const { ErrorManager } = require('./error-manager');

const { uri } = require('../botconfig.json')

class DatabaseConnectionClass {
  constructor(connectionString) {
    this.client = new MongoClient(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // before initialization, this is used. it doesn't resolve
    this.clientConnectionPromise = this._randomPromise();
  }

  async _randomPromise() {
    return new Promise((resolve, reject) => {
    })
  }

  async connect() {
    this.clientConnectionPromise = this.client.connect();
  }

  /**
   * @async
   * @description Find one item in the database
   * @param {string} databaseName - Database name
   * @param {string} collectionName - Collection name
   * @param {Object} toSearch - "Key" to search for/with
   * @returns {(Object|null)} Object from database's collection or null if not found
   * @see {@link http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOne MongoCollection#findOne} for how the function works in more detail
   * @example
   * // returns the object with a property factorioName with the value "oof2win2"
   * await findOneDB("otherData", "linkedPlayers", {factorioName: "oof2win2"})
   */
  async findOneDB(databaseName, collectionName, toSearch) {
    await this.clientConnectionPromise; //just wait so the database is connected
    // Returns an object of the thing found or null if not found
    const collection = this.client.db(databaseName).collection(collectionName);
    return collection.findOne(toSearch);
  }

  /**
   * @async
   * @description Inserts an object into a specified database's collection
   * @param {string} databaseName - Database name
   * @param {string} collectionName - Collection name
   * @param {Object} toInsert - Object to insert to the database
   * @returns {Object} Object with return values, e.g. the ID of the object, return status etc
   * @see {@link http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertOne MongoCollection#insertOne} for how the function works
   * @example
   * // inserts {factorioName: "oof2win2", discordID: "6684"} into the database otherData collection linkedPlayers
   * await insertOneDB("otherData", "linkedPlayers", {factorioName: "oof2win2", discordID: "6684"})
   */
  async insertOneDB(databaseName, collectionName, toInsert) {
    await this.clientConnectionPromise; //just wait so the database is connected
    // To check if written in correctly, use: ret.result.ok (1 if correctly, 0 if written falsely)
    const collection = this.client.db(databaseName).collection(collectionName);
    return collection.insertOne(toInsert);
  }

  /**
   * @async
   * @description Finds specified object and replaces it in the database's collection.
   * @see {@link findOneDB} to get the object to search for
   * @param {string} databaseName - Database to find and replace in
   * @param {string} collectionName - Collection of database to find and replace in
   * @param {Object} toFind - Object to find (key)
   * @param {Object} toReplace - Object to replace
   * @returns {Object} The original document (toFind) or the document that it has been replaced with (toReplace)
   * @see {@link http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOneAndReplace MongoCollection#findOneAndReplace} for how the function works
   */
  async findOneAndReplaceDB(databaseName, collectionName, toFind, toReplace) {
    await this.clientConnectionPromise; //just wait so the database is connected
    // To check if written in correctly, use: ret.result.ok (1 if correctly, 0 if written falsely)
    const collection = this.client.db(databaseName).collection(collectionName);
    return collection.findOneAndReplace(toFind, toReplace);
  }

  /**
   * @async
   * @description Finds and deletes the specified object from the database's collection. If parameters is null or an empty object, it will delete the first object found
   * @see {@link findOneDB} to get the object to delete
   * @param {string} databaseName
   * @param {string} collectionName
   * @param {Object} params - The object to delete
   * @returns {Object} Object containing: A boolean acknowledged as true if the operation ran with write concern or false if write concern was disabled; deletedCount containing the number of deleted documents
   * @see {@link http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#deleteOne MongoCollection#deleteOne}
   */
  async deleteOneDB(databaseName, collectionName, toDelete) {
    await this.clientConnectionPromise; //just wait so the database is connected
    // To check if written in correctly, use: ret.acknowledged (1 if correctly, 0 if written falsely)
    const collection = this.client.db(databaseName).collection(collectionName);
    return collection.deleteOne(params);
  }
}

const DatabaseConnection = new DatabaseConnectionClass(uri);

module.exports = {
  DatabaseConnectionClass,
  DatabaseConnection,
}