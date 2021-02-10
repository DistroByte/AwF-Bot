const Queue = require('queue-fifo');
const { Channel, Message } = require("discord.js")

/**
 * Class to manage errors and send them to Discord if set to do so
 */
class _ErrorManager {
  constructor() {
    this._JammyErrChannel = undefined;
    this._errorQueue = new Queue();
  }
  /**
   * Sets the Jammy error channel so errors can be viewed on Discord
   * @param {Channel} - Discord channel to set as Jammy error channel
   */
  setJammyErrChannel (channel) {
    if (channel.name) this._JammyErrChannel = channel;
    else throw new Error("Incorrect channel!");
  };
  /**
   * Sends a message about an error to Discord and logs it to the console
   * @param {any} error - Anything that can represent an error. An Error class or a string generally
   * @returns {(Message|null)} Discord message that has been sent with the error or null if it has been added to internal queue
   */
  async Error (error) {
    console.error(error);
    if (this._JammyErrChannel && error.description)
      return this._JammyErrChannel
        .send(`Error ${error.name}\nDescription: ${error.description}\nStack trace is available in error logs`);
    else if (this._JammyErrChannel) {
      return this._JammyErrChannel
        .send(`Error: ${error}`);
    }
    if (error.description)
      this._errorQueue.enqueue(`Error ${error.name}\nDescription: ${error.description}\nStack trace is available in error logs`);
    else
      this._errorQueue.enqueue(`Error: ${error}`);
    setTimeout(() => {
      this._trySendErrors()
    }, 5000);
    return
  }
  /**
   * Attempts sending errors to Discord
   */
  async _trySendErrors() {
    const tryConnection = () => {
      setTimeout(() => {
        this._trySendErrors();
        console.warn("Attempting sending errors to Discord again...")
      }, 60000);
    }
    if (this._JammyErrChannel.name)
      this._sendErrors();
    else {
      console.error("JammyErrorChannel not assigned!");
      tryConnection();
    }
  }
  /**
   * Sends errrors to the Jammy channel once the channel is set with {@link setJammyErrChannel}
   */
  async _sendErrors() {
    while (this._errorQueue.isEmpty() === false) {
      const toSend = this._errorQueue.dequeue();
      this._JammyErrChannel.send(toSend);
    }
  }
}

let ErrorManager = new _ErrorManager();
module.exports = {
  ErrorManager,
}