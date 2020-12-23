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

const BOTID = 'Meme Machine#9639'

client.on('ready', () => {
    console.log('Meme Machine is ready to go!');
})

client.on('message', msg => {

    // add message to collection
    messages.push(msg);
    if (messages.length > messages_max) messages.splice(0, 1);

    // only react if message was from user
    if (msg.member.user.tag != BOTID) {
    
        // delete message flag
        let deleteMsg = false;

        let words_og = msg.content.split(' ');
        let words = msg.content.toLowerCase().split(' ');

        /* 
        Remove all punctuation from the words. This helps with
        parsing different commands. 
        */
        for (let i = 0; i < words.length; i++) {
            let puncFound = true;
            while (puncFound) {
                puncFound = false;
                if (words[i].endsWith('.')) puncFound = true;
                if (words[i].endsWith(',')) puncFound = true;
                if (words[i].endsWith('?')) puncFound = true;
                if (words[i].endsWith('!')) puncFound = true;
                if (words[i].endsWith(':')) puncFound = true;
                if (words[i].endsWith(';')) puncFound = true;
                if (puncFound) {
                    words[i] = words[i].substr(0, words[i].length - 1);
                }
            }
        }

        // teach the bot!
        /* 
        The bot can be taught simple responses to commands. The
        syntax to teach is as follows:
        Hey bot, when I say "trigger phrase", you say "response".
        We're going to make the commas and punctuation optional. 
        */
        if (words[0] === 'hey' && words.length >= 9) {
            let teach = true;
            if (!words[1] === 'bot') teach = false;
            if (!words[2] === 'when') teach = false;
            if (!words[3] === 'i') teach = false;
            if (!words[4] === 'say') teach = false;

            // gather trigger phrase
            if (!words[5].startsWith('"')) teach = false;
            else {
                /* If the 5th word starts with quote marks, then 
                the learning syntax is valid. We will iterate
                over the words in the sentence until we find a 
                word that ends in quotes. Each iteration, we add
                words to the trigger phrase. 
                */
                let trigger = [];
                for (let i = 5, searching = true; searching; i++) {
                    trigger.push(words[i]);
                    if (words[i].endsWith('"')) searching = false;
                }
            }
        }

        // single word effects (some are teachable!)
        if (words.length === 1 && words[0] === '^' && messages.length > 1) {
            let prevMsg = messages[messages.length - 2];
            prevMsg.react('⬆️');
            deleteMsg = true;
        }

        // triple word effects
        if (words.length === 3 && words[0] === words[1] && words[1] === words[2]) {
            console.log('Triple word detected.');

            let pingEveryone = false;
            if (words[0] === 'boys') pingEveryone = true;
            if (words[0] === 'bois') pingEveryone = true;
            if (words[0] === 'boyz') pingEveryone = true;
            if (words[0] === 'guys') pingEveryone = true;
            if (words[0] === 'guyz') pingEveryone = true;

            if (pingEveryone) {
                msg.channel.send('@everyone ' + msg.member.user.username + ' has summoned the boys!');
            }
        }

        if (msg.content.toLowerCase().startsWith('i love bots')) {
            msg.react('❤️');
        }

        if (msg.content.toLowerCase().startsWith('i hate bots')) {
            msg.react('💩');
        }

        if (msg.content.toLowerCase() === 'good bot') {
            msg.react('👍');
        }

        if (msg.content.toLowerCase() === 'bad bot') {
            msg.react('😦');
        }

        if (words[0] === 'ping') {
            msg.channel.send('pong');
        }

        // handle delete message flag
        if (deleteMsg) {
            msg.delete()
                .catch(() => console.log(`couldn't delete message`));
            messages.pop();
        }
    }
})

client.login(process.env.BOT_TOKEN);
