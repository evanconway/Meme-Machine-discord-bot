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
    console.log('Our bot is ready to go!');
})

client.on('message', msg => {
    if (msg.content === 'boyz boyz boyz') {
        msg.channel.send('@everyone');
    }

    if (msg.content === 'ping') {
        msg.channel.send('pong');
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
