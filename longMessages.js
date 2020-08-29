//to edit these messages, go to a site such as https://markdownlivepreview.com/, paste them in and add an enter after the \n
//for a newline in the Discord message, have a \n at the end of a coreLineData
//you can use Markdown to format messages

const messageHelp = new Discord.MessageEmbed()
  .setColor('#0099ff')
  .setTitle('Help Commands')
  .setAuthor('made by oof2win2')
  .setDescription('These are all of the help commands programmed into JammyBot that are included in this message')
  .addFields(
    { name: '* +fcommandall', value: 'send a command to all Factorio servers' },
    { name: '* +fcommand', value: 'send a command to the current Factorio server'},
    { name: '* +sendall', value: 'send a message to all Factorio servers, prefixed with the username of the user on Discord' },
  )
  .setTimestamp()
