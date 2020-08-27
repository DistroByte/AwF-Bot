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
      data = data.slice((data.indexOf(']') + 2)); //black magic fuckery as far as i'm concerned
      if (data.includes('[')) {
        //These all are for Factorio rich text fuckery, in order of https://wiki.factorio.com/Rich_text
        //for now, the discord will show [image], [item], [gps] but that can be removed completely by just
        //replacing the second phrase in the .replace with an empty string, i.e. ''
        if (data.includes('[img=')) {
          message.content = message.content.replace(/\[img=.*\]/g, '[image]');
        }
        if (data.includes('[item=')) {
          message.content = message.content.replace(/\[item=.*\]/g, '[item]');
        }
        if (data.includes('[entity=')) {
          message.content = message.content.replace(/\[entity=.*\]/g, '[entity]');
        }
        if (data.includes('[technology=')) {
          message.content = message.content.replace(/\[technology=.*\]/g, '[research]');
        }
        if (data.includes('[recipe=')) {
          message.content = message.content.replace(/\[recipe=.*\]/g, '[recipe]');
        }
        if (data.includes('[item-group=')) {
          message.content = message.content.replace(/\[item-group=.*\]/g, '[item group]');
        }
        if (data.includes('[fluid=')) {
          message.content = message.content.replace(/\[fluid=.*\]/g, '[fluid]');
        }
        if (data.includes('[tile=')) {
          message.content = message.content.replace(/\[tile=.*\]/g, '[tile]');
        }
        if (data.includes('[virtual-signal=')) {
          message.content = message.content.replace(/\[virutal-signal=.*\]/g, '[signal]');
        }
        if (data.includes('[achievement=')) {
          message.content = message.content.replace(/\[achievement=.*\]/g, '[achievement]');
        }
        if (data.includes('[gps=')) {
          message.content = message.content.replace(/\[gps=.*\]/g, '[gps]');
        }
        if (data.includes('[special-item=')) {
          message.content = message.content.replace(/\[special-item=.*\]/g, '[bp/upgrade/decon]');
        }
        if (data.includes('[armor=')) {
          message.content = message.content.replace(/\[armor=.*\]/g, '[armor]');
        }
        if (data.includes('[train=')) {
          message.content = message.content.replace(/\[train=.*\]/g, '[train]')
        }
        if (data.includes('[train-stop=')) {
          message.content = message.content.replace(/\[train-stop.*\]/g, '[train stop]');
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
  }
}
