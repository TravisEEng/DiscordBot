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
  console.log(`New User '${member.user.username}' has joined '${member.guild.name}'`);
  member.guild.defaultChannel.send(`${member.user.username}' has joined this server'`);
});


// Depending on what users type provide different responses
client.on('message', (message) => {
  let userData = points[message.author.id];


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
    message.channel.send('If you would like an XD, type the prefix "' + config.prefix + '", then "can I get an xd"');
    message.channel.send('If you would like me to say "pong!", type the prefix "' + config.prefix + '" then "ping"');
    message.channel.send('If you would like me to tell you your level and points, type the prefix "' + config.prefix + '" then "level"');
    message.channel.send('If you would like me to roll a number from 1 - 1000 type the prefix "' + config.prefix + '" then "roll".\nAdditionally, if you state a min and max like "!roll 1 - 10" I will follow it');

  }

  //Pong command
  if (message.content.toLowerCase().startsWith(config.prefix + 'ping')) {
    message.channel.send('pong!');
  }

  //roll command
  if (message.content.toLowerCase().startsWith(config.prefix + "roll")) {
    let rollNums = message.content.match(/\d* - \d*/g);
    console.log("The min and max given is " + rollNums);
    if (rollNums === null) {
      let randomNum = Math.floor(Math.random() * 100);
      message.channel.send(randomNum);

      //implement points into rollNums

      if (randomNum > 10 || randomNum < -10) {
        let numString = randomNum.toString();
        let j = 0;


        for (i = 0; i < numString.length; i++) {

          let numString = randomNum.toString();
          let comparAtor = numString.charAt(0);
          let iteratorV = numString.charAt(i);
          if (comparAtor == iteratorV) {

            j++;
          }
          console.log(j);
          console.log(numString.length);
          if (j == numString.length) {
            message.channel.send("You got a point for rolling a " + numString + "!");
            userData.points++;
          }
        }

      }

    } else {
      tester = JSON.stringify(rollNums);
      tester = tester.split(" - ");
      rollMin = (tester[0].toString());
      rollMax = (tester[1].toString());
      console.log("roll min " + rollMin);
      console.log("roll max " + rollMax);

      rollMin = rollMin.match(/\d*/g);
      rollMax = rollMax.match(/\d*/g);

      rollMin = rollMin.filter(function(a) {
        return a !== '';
      });
      rollMax = rollMax.filter(function(a) {
        return a !== '';
      });

      rollMin = parseInt(rollMin[0]);
      rollMax = parseInt(rollMax[0]);

      console.log(typeof(rollMin));
      console.log(rollMax);

      let randomNum = 0;
      randomNum = Math.floor(Math.random() * (rollMax - rollMin + 1)) + rollMin;
      console.log(randomNum);
      message.channel.send(randomNum);
    }
    //if(message.content.toLowerCase().includes().match(/^[0-9]+$/)){
    //let randomNum = Math.floor(Math.random() * 100);
    //}
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


  //let userData = points[message.author.id];
  //userData.points++;

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

  //webhook implementation
  let args = message.content.split(' ').slice(1);
  if (message.content.startsWith(config.prefix + 'createHook')) {
    const nameAvatar = args.join(' ');
    const linkCheck = /https?:\/\/.+\.(?:png|jpg|jpeg)/gi;
    if (!linkCheck.test(nameAvatar)) return message.reply('You must supply an image link.');
    const avatar = nameAvatar.match(linkCheck)[0];
    const name = nameAvatar.replace(linkCheck, '');
    message.channel.createWebhook(name, avatar)
      .then(webhook => webhook.edit(name, avatar)
        .catch(error => console.log(error)))
      .then(wb => message.author.send(`Here is your webhook https://canary.discordapp.com/api/webhooks/${wb.id}/${wb.token}\n\nPlease keep this safe, as you could be exploited.`)
        .catch(error => console.log(error)))
      .catch(error => console.log(error));
  }

});
