/*
All the boiler plate setup code is taken from this video:
https://www.youtube.com/watch?v=qv24S2L1N0k

Notes:
Roles are based on IDs, not string names. In fact most things in 
Discord are based on IDs instead of string names.
Look up 'parials' to deal with messages/data posted before the bot joined/updated.
*/
const BOTID = 'Meme Machine#9639'

require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const messages_max = 5;
const messages = []; // collection of messages

const DOUBLE_QUOTES = `“‟””〝〞＂❝❞"`;
const SINGLE_QUOTES = `’‘‛❛❜'`;

const RESPONSE_TYPES = {
    RESPONSE: 'response',
    REACT: 'react',
    NOTHING: 'nothing'
};

const DB_TABLES = {
    RESPONSES: 'responses'
}

const { Client } = require('pg');

const database = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.on('ready', () => {
    console.log('Meme Machine is ready to go!');

    database.connect();

    //'SELECT table_schema,table_name FROM information_schema.tables;'
    const createTableCommand = `
        CREATE TABLE IF NOT EXISTS ${DB_TABLES.RESPONSES}(
            id serial primary key,
            call text unique not null,
            response text not null
        );
    `;
    //databaseQuery(`DROP TABLE IF EXISTS ${DB_TABLES.RESPONSES}`);
    databaseQuery(createTableCommand);
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
            words[i] = stripPunc(words[i]);
        }

        // replace single quote mark types with default
        for (let i = 0; i < words.length; i++) {
            for (let c = 0; c < words[i].length; c++) {
                let replace = false;
                if (SINGLE_QUOTES.includes(words[i][c])) {
                    replace = words[i].substring(0, c) + `'`;
                }

                // only add the last part of the word if it exists
                if (replace && c < words[i].length - 1) {
                    replace = replace + words[i].substring(c + 1, words[i].length);
                }

                if (replace) words[i] = replace;
            }
        }

        let firstIsGreet = false;
        if (words[0] === 'hey') firstIsGreet = true;
        if (words[0] === 'hi') firstIsGreet = true;
        if (words[0] === 'hello') firstIsGreet = true;
        if (words[0] === 'yo') firstIsGreet = true;
        if (words[0] === 'sup') firstIsGreet = true;
        if (words[0] === 'greetings') firstIsGreet = true;

        // address the bot!
        if (words.length >= 2 && firstIsGreet && words[1] === 'bot') {

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
                    trigger = gatherPhrase(words, index);

                    if (words.length === index || !trigger) {
                        teach = false;
                        msg.reply(`it looks like you're trying to teach me something, but I don't understand! Your "call" phrase must start and end with double quotes.`);
                    } else {
                        triggerPhrase = trigger.phrase;
                        console.log(`The trigger phrase is: ${triggerPhrase}`);
                        index = trigger.index;
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
                        responseType = RESPONSE_TYPES.RESPONSE;
                        if (words[index] != 'you') responseType = null;
                        if (words[index + 1] != 'say') responseType = null;
                        // move index to correct position if valid
                        if (responseType) index += 2;
                    }

                    // check for "do nothing"
                    if (!responseType && words.length - index >= 2) {
                        responseType = RESPONSE_TYPES.NOTHING;
                        if (words[index] != 'do') responseType = null;
                        if (words[index + 1] != 'nothing') responseType = null;
                        // no need to worry about index
                    }

                    // check for "react with"
                    if (!responseType && words.length - index >= 3) {
                        responseType = RESPONSE_TYPES.REACT;
                        if (words[index] != 'react') responseType = null;
                        if (words[index + 1] != 'with') responseType = null;
                        if (responseType) index += 2;
                    }

                    // notify user if action is not specified
                    if (!responseType) {
                        msg.reply(`I understand the trigger phrase "${triggerPhrase}", but not what to do afterwards.`);
                        teach = false;
                    }
                }

                // check different actions
                // Note that here, the index will have been moved to the correct position to parse phrases.
                if (teach) {
                    let phraseObj = gatherPhrase(words_og, index, false);
                    createCallResponse(triggerPhrase, phraseObj, responseType, msg);
                }
            }
        }

        let simpleMsg = words.join(' ');
        //console.log(simpleMsg);

        // learned call and responses
        respondToCall(msg, simpleMsg);

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
            if (words[0] === 'bros') pingEveryone = true;
            if (words[0] === 'broz') pingEveryone = true;

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

/*
This function will determine if there is a string of words in the given arr
starting at the given index that satisfy our syntax for a "phrase". A phrase 
starts and ends with double quotes. If a valid phrase is found, an object with
a "phrase" and "index" field is returned. The phrase field is a valid phrase
as an array. The index field is the index of the word 1 spot past the end of
the valid phrase. If there is no valid phrase, the function returns null.
*/
const gatherPhrase = function(arr, startIndex, rmvPunc = true) {
    let index = startIndex;

    let char = arr[index][0];

    // quit if starting char is not a double quote
    if (!DOUBLE_QUOTES.includes(char)) return null;
    arr[index] = arr[index].slice(1, arr[index].length); // remove starting quote

    let searching = true;
    let phrase = [];
    while (searching && index < arr.length) {
        char = arr[index][arr[index].length - 1]; // check if ends in quote
        if (DOUBLE_QUOTES.includes(char)) {
            searching = false;
            arr[index] = arr[index].slice(0, arr[index].length - 1); // remove end quote
            if (rmvPunc) arr[index] = stripPunc(arr[index]); // remove extra punctuation
        }
        phrase.push(arr[index]);
        index++;
    }

    // if we reach this point, and searching is still true, there was no valid phrase
    if (searching) return null;

    phrase = phrase.join(' ');

    return { phrase, index };
}

// remove punctuation from end of word
const stripPunc = function(str) {
    let puncFound = true;
    while (puncFound) {
        puncFound = false;
        if (str.endsWith('.')) puncFound = true;
        if (str.endsWith(',')) puncFound = true;
        if (str.endsWith('?')) puncFound = true;
        if (str.endsWith('!')) puncFound = true;
        if (str.endsWith(':')) puncFound = true;
        if (str.endsWith(';')) puncFound = true;
        if (puncFound) {
            str = str.substr(0, str.length - 1);
        }
    }
    return str;
}

const createCallResponse = async function(call, phraseObj, type, msg) {
    if (type === RESPONSE_TYPES.NOTHING) {
        await databaseQuery(`DELETE FROM ${DB_TABLES.RESPONSES} WHERE call = $1`, [call]);
        msg.channel.send(`Understood. I won't respond to "${call}" anymore.`);
        return;
    }

    let response = null;
    if (phraseObj) response = phraseObj.phrase; // phraseObj will be null on type === NOTHING
    let entries = await databaseQuery(`SELECT * FROM ${DB_TABLES.RESPONSES}`);
    let updated = false;

    if (type === RESPONSE_TYPES.RESPONSE) {
        for (let i = 0; i < entries.rows.length; i++) {
            if (entries.rows[i].call === call) {
                // update
                
                // respond differently if update already exists
                let oldResponse = entries.rows[i].response;

                if (oldResponse !== response) {
                    await databaseQuery(`UPDATE ${DB_TABLES.RESPONSES} SET response = $1 WHERE call = $2`, [response, call]);
                    msg.channel.send(`Got it! When someone says "${call}", I'll say "${response}" instead of "${oldResponse}"!`);
                } else {
                    msg.channel.send(`I am already programmed to say "${response}" when someone says "${call}".`);
                }
                updated = true;
                i = entries.rows.length;
            }
        }

        if (!updated) {
            await databaseQuery(`INSERT INTO ${DB_TABLES.RESPONSES} (call, response) VALUES ($1, $2)`, [call, response]);
            msg.channel.send(`Got it! When someone says "${call}", I'll say "${response}"`);
        }
        return;
    }

    if (type === RESPONSE_TYPES.REACT) {
        msg.channel.send(`Reactions are not implemented yet.`);
        return;
    }
}

const respondToCall = async function(msg, call) {
    try {
        let response = await databaseQuery(`SELECT * FROM ${DB_TABLES.RESPONSES}`);
        for (let i = 0; i < response.rows.length; i++) {
            if (response.rows[i].call === call) {
                msg.channel.send(response.rows[i].response);
                i = response.rows.length;
            }
        }
    } catch (err) {
        console.log(err);
    }
}

const databaseQuery = async function(query, values = []) {
    try {
        let success = await database.query(query, values);
        return success;
    } catch (err) {
        console.log(err);
    }
}

client.login(process.env.BOT_TOKEN);
