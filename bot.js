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

    if (msg.channel.type === 'dm') {
        console.log('private message received');
    }

    // add message to collection
    messages.push(msg);
    if (messages.length > messages_max) messages.splice(0, 1);

    // only react if message was from user
    // we check if user is null to avoid crashes from private messages
    if (msg.channel.type != 'dm' && msg.member.user.tag != BOTID) {
    
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


        // address the bot!
        if (words.length >= 2 && words[0] === 'hey' && words[1] === 'bot') {

            // say hi back
            if (words.length === 2) {
                msg.channel.send('Hi ' + msg.member.user.username + '!');
            }

            // teach the bot!
            /*
            The bot can be taught simple responses to commands. The
            syntax to teach is as follows:

            Hey bot, when I say "trigger", you say "response".

            Punctuation in the syntax is optional. Notice that the 
            minimum number of words in a teach command is 9. If this
            is true, we need to check if the message is a teach command.
            We have already checked the first two with 'hey bot'.
            */
            if (words.length >= 5) {
                let trigger = [];
                let triggerPhrase = '';
                let responseType = null;
                let index = 2;
                let teach = true;
                if (!words[index++] === 'when') teach = false;
                if (!words[index++] === 'i') teach = false;
                if (!words[index++] === 'say') teach = false;

                // teach command started, gather the trigger phrase
                if (teach) {
                    console.log("teach command detected");

                    // gather trigger phrase
                    if (words.length === index || !words[index].startsWith('"')) {
                        teach = false;
                        msg.reply(`it looks like you're trying to teach me something, but I don't understand! Your "call" phrase must start with double quotes.`);
                    } else {
                        /* If the 5th word starts with quote marks, then 
                        the learning syntax is valid. We will iterate
                        over the words in the sentence until we find a 
                        word that ends in quotes. Each iteration, we add
                        words to the trigger phrase. 
                        */
                        words[index] = words[index].slice(1, words[index].length); // remove start quote mark
                        let searching = true
                        while (searching && index < words.length) {
                            if (words[index].endsWith('"')) {
                                searching = false;
                                words[index] = words[index].slice(0, words[index].length - 1); // remove end quote mark
                            }
                            trigger.push(words[index]);
                            index++
                        }

                        /*
                        If we get to this point, and 'searching' is still true, then we did not
                        find a valid trigger phrase. We must notify the user.
                        */
                        if (searching) {
                            teach = false;
                            msg.reply(`it looks like you're trying to teach me something, but I don't understand! Your "call" phrase must end with double quotes.`);
                        } else {
                            triggerPhrase = trigger.join(' ');
                            console.log(`Trigger phrase: ${triggerPhrase}`);
                        }
                    }
                }

                // check for action after trigger phrase
                if (teach) {
                    /*
                    Note that the index will now be at the word after 
                    the trigger phrase. From here we can decide what the
                    user wants us to do after the trigger phrase is called.
                    Though for now, the only option is "you say", or
                    respond. Later, we will have to add correct length checks
                    on the word array for the different action options.
                    */

                    // check for "respond" action
                    if (!responseType && words.length - index >= 3) {
                        responseType = 'respond';
                        if (words[index] != 'you') responseType = null;
                        if (words[index + 1] != 'say') responseType = null;
                        // move index to correct position if valid
                        if (responseType) index += 2;
                    }

                    // notify user if action is not specified
                    if (!responseType) {
                        msg.reply(`I understand the trigger phrase "${triggerPhrase}", but not what to do afterwards.`);
                        teach = false;
                    }
                }

                // check different actions
                // Note that here, the index will be moved to the correct position to continue parsing.
                if (teach) {
                    console.log(`Response type: ${responseType}`);
                    if (responseType === 'respond') {
                        // gather response phrase
                    }
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


const gatherPhrase = function(arr, startIndex) {

}

client.login(process.env.BOT_TOKEN);
