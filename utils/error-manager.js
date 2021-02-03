const Queue = require('queue-fifo');

class _ErrorManager {
  constructor() {
    this._JammyErrChannel = undefined;
    this._errorQueue = new Queue();
  }
  setJammyErrChannel (channel) {
    if (channel.name) this._JammyErrChannel = channel;
    else throw new Error("Incorrect channel!");
  };
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
  }
  async _trySendErrors() {
    const tryConnection = () => {
      setTimeout(() => {
        this._trySendErrors();
      }, 60000);
    }
    if (this._JammyErrChannel.name)
      this._sendErrors();
    else {
      console.error("JammyErrorChannel not assigned!");
      setTimeout(() => {
        tryConnection();
      });
    }
  }
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