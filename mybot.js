const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

//connect using config token
client.login(config.token);

//Turn on different logging levels to be apendded
client.on('error', (e) => console.error(e));
client.on('warn', (e) => console.warn(e));
client.on('debug', (e) => console.info(e));

//Ready bot and inform how size and servers
client.on('ready', () => {
  console.log(`Ready to server in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
});


// Points system implementation
let points = JSON.parse(fs.readFileSync('./points.json', 'utf8'));


//Log new user and say blank user has joined
client.on('guildMemberAdd', (member) => {
  console.log('New User "${member.user.username}" has joined "${member.guild.name}"');
  member.guild.defaultChannel.send('"${member.user.username}" has joined this server');
});


// Depending on what users type provide different responses
client.on('message', (message) => {

  //Exit and stop if it's is not a command or if a bot is talking
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  //Command to set new prefix
  if (message.content.startsWith(config.prefix + 'prefix')) {
    // Gets the prefix from the command (eg. "!prefix +" it will take the "+" from it)
    let newPrefix = message.content.split(' ').slice(1, 2)[0];
    // change the configuration in memory
    config.prefix = newPrefix;

    // Now we have to save the file.
    fs.writeFile('./config.json', JSON.stringify(config));
  }

  //Help command
  if (message.content.toLowerCase().startsWith(config.prefix + 'help')) {
    message.channel.send('Hello, I am snake squad bot!');
    message.channel.send('If you would like an XD, type the prefix "' + prefix + '", then "can I get an xd"');
    message.channel.send('If you would like me to say "pong!", type the prefix "' + prefix + '" "then ping"');
    message.channel.send('If you would like me to tell you your level and points, type the prefix "' + prefix + '" "then level"');
  }

  //Pong command
  if (message.content.toLowerCase().startsWith(config.prefix + 'ping')) {
    message.channel.send('pong!');
  }

  //XD command
  if (message.content.toLowerCase().includes(config.prefix + 'can i get an xd')) {
    message.channel.send('XD');
  }

//point implementation system - if points doesnt exist for user creates them in file
  if (!points[message.author.id]) points[message.author.id] = {
    points: 0,
    level: 0
  };


  let userData = points[message.author.id];
  userData.points++;

  let curLevel = Math.floor(0.1 * Math.sqrt(userData.points));
  if (curLevel > userData.level) {
    // Level up!
    userData.level = curLevel;
    message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
  }

  if (message.content.startsWith(config.prefix + 'level')) {
    message.reply(`You are currently level ${userData.level}, with ${userData.points} points.`);
  }
  fs.writeFile('./points.json', JSON.stringify(points), (err) => {
    if (err) console.error(err);
  });

});
