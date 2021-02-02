class _ErrorManager {
  constructor() {
    this._JammyErrChannel = undefined;
  }
  setJammyErrChannel (channel) {
    if (channel.name) this._JammyErrChannel = channel;
    else throw new Error("Incorrect channel!");
  };
  async Error (error) {
    console.error(error);
    if (this._JammyErrChannel && error.description)
      this._JammyErrChannel
        .send(`Error ${error.name}\nDescription: ${error.description}\nStack trace is available in error logs`);
    else if (this._JammyErrChannel) {
      this._JammyErrChannel
        .send(`Error: ${error}`);
    }
  }
}

let ErrorManager = new _ErrorManager();
module.exports = {
  ErrorManager,
}