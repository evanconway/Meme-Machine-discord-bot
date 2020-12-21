/*
All the boiler plate setup code is taken from this video:
https://www.youtube.com/watch?v=qv24S2L1N0k

Notes:
Roles are based on IDs, not string names. In fact most things in 
Discord are based on IDs instead of string names.
Look up 'parials' to deal with messages/data posted before the bot joined/updated.
*/

require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('Meme Machine is ready to go!');
})

client.on('message', msg => {

    let msgArr = msg.content.split(' ');
    let lowerArr = msg.content.toLowerCase().split(' ');

    /// Triple word effects
    if (lowerArr.length === 3 && lowerArr[0] === lowerArr[1] && lowerArr[1] === lowerArr[2]) {
        console.log('Triple word detected.');

        let pingEveryone = false;
        if (lowerArr[0] === 'boys') pingEveryone = true;
        if (lowerArr[0] === 'bois') pingEveryone = true;
        if (lowerArr[0] === 'boyz') pingEveryone = true;
        if (lowerArr[0] === 'guys') pingEveryone = true;
        if (lowerArr[0] === 'guyz') pingEveryone = true;

        if (pingEveryone) {
            msg.channel.send('@everyone ' + msg.member.user.username + ' has summoned the boys!');
        }
    }

    /*
    if (msg.content === 'mod me') {
        msg.member.roles.add('790370436675928094'); // mod id
        msg.reply(`You've been modded!`);
    }

    if (msg.content === 'unmod me') {
        msg.member.roles.remove('790370436675928094');
        msg.reply(`You've been unmodded.`);
    }
    */

    if (msg.content === 'I love bots.') {
        msg.react('❤️');
    }

    if (msg.content === 'I hate bots.') {
        msg.react('💩');
    }
})

client.login(process.env.BOT_TOKEN);
