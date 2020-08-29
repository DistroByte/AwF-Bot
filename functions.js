module.exports = {
  formatVersion: function (data) {
    data.trim();
    return data.slice(data.indexOf('Factorio'), data.indexOf('(b')).trim();
  },
  formatDate: function (data) {
    data.trim();
    return data.slice((data.indexOf('0.000') + 6), 25);
  },
  formatChatData: function (data) {
    if (data.includes('[CHAT]') || data.includes('(shout)')) {
      data = data.slice((data.indexOf(']') + 2)); //removing the [CHAT] from sending to Discord
      if (data.includes('[')) {
        //These all are for Factorio rich text magic, in order of https://wiki.factorio.com/Rich_text
        //for now, the discord will show [image], [item], [gps] but that can be removed completely by just
        //replacing the second phrase in the .replace with an empty string, i.e. ''
        if (data.includes('[img=')) {
          data = data.replace(/\[img=.*\]/g, '[image]');
        }
        if (data.includes('[item=')) {
          data = data.replace(/\[item=.*\]/g, '[item]');
        }
        if (data.includes('[entity=')) {
          data = data.replace(/\[entity=.*\]/g, '[entity]');
        }
        if (data.includes('[technology=')) {
          data = data.replace(/\[technology=.*\]/g, '[research]');
        }
        if (data.includes('[recipe=')) {
          data = data.replace(/\[recipe=.*\]/g, '[recipe]');
        }
        if (data.includes('[item-group=')) {
          data = data.replace(/\[item-group=.*\]/g, '[item group]');
        }
        if (data.includes('[fluid=')) {
          data = data.replace(/\[fluid=.*\]/g, '[fluid]');
        }
        if (data.includes('[tile=')) {
          data = data.replace(/\[tile=.*\]/g, '[tile]');
        }
        if (data.includes('[virtual-signal=')) {
          data = data.replace(/\[virutal-signal=.*\]/g, '[signal]');
        }
        if (data.includes('[achievement=')) {
          data = data.replace(/\[achievement=.*\]/g, '[achievement]');
        }
        if (data.includes('[gps=')) {
          data = data.replace(/\[gps=.*\]/g, '[gps]');
        }
        if (data.includes('[special-item=')) {
          data = data.replace(/\[special-item=.*\]/g, '[bp/upgrade/decon]');
        }
        if (data.includes('[armor=')) {
          data = data.replace(/\[armor=.*\]/g, '[armor]');
        }
        if (data.includes('[train=')) {
          data = data.replace(/\[train=.*\]/g, '[train]')
        }
        if (data.includes('[train-stop=')) {
          data = data.replace(/\[train-stop.*\]/g, '[train stop]');
        }
      }
      return data;
    } else {
      return `**${data.slice((data.indexOf(']') + 2))}**`
    }
  },
  arrayRemoveOne: function (arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  },
  formatSaveData: function (data) {
    return data.slice((data.indexOf('_autosave') + 1), (data.indexOf('(') - 1));
  },
  sendToAll: function(message) {
    chronoFifo.write(message, () => { });
    coreFifo.write(message, () => { });
    coronaFifo.write(message, () => { });
    eventFifo.write(message, () => { });
    islandicFifo.write(message, () => { });
    seablockFifo.write(message, () => { });
    testFifo.write(message, () => { });
    krastorioFifo.write(message, () => { });
    spiderFifo.write(message, () => { });
  }
}
