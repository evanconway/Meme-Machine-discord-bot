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
const messages_max = 5;
const messages = []; // collection of messages

const BOTID = 

client.on('ready', () => {
    console.log('Meme Machine is ready to go!');
})

client.on('message', msg => {

    // add message to collection, but only if user is not the bot
    if (msg.member.user.tag != 'Meme Machine#9639') {

        // log message for effects
        messages.push(msg);
        if (messages.length > 5) messages.splice(0, 1);
    
        // delete message flag
        let deleteMsg = false;

        let lowerArr = msg.content.toLowerCase().split(' ');

        // single word effects
        if (lowerArr.length === 1 && lowerArr[0] === '^' && messages.length > 1) {
            let prevMsg = messages[messages.length - 2];
            prevMsg.react('⬆️');
            deleteMsg = true;
        }

        // triple word effects
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

        if (lowerArr[0] === 'ping') {
            msg.channel.send('pong');
        }

        // handle delete message flag
        if (deleteMsg) {
            msg.delete();
            messages.pop();
        }
    }
})

client.login(process.env.BOT_TOKEN);
