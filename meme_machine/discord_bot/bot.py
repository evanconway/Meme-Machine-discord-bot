import discord
import os
import re
from dotenv import load_dotenv
from asgiref.sync import sync_to_async
from discord_bot.models import Response

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)

greetings = ['hey', 'hi', 'hello', 'yo', 'sup', 'greetings']
summons = ['boys', 'bois', 'boyz', 'guys', 'guyz', 'bros', 'broz']


@sync_to_async
def get_response(call):
    try:
        return Response.objects.get(call=call)
    except:
        pass


@client.event
async def on_ready():
    print(f'We have logged in as {client.user}')


@client.event
async def on_message(message):
    if message.author == client.user:
        return
    
    check = str(message.content.lower())
    stored_response = await get_response(message.content.lower())

    if stored_response is not None:
        await message.channel.send(stored_response.response)
        return

    if check.startswith('$set'):
        split = re.split('[\[\]]', message.content)
        if len(split) != 5:
            await message.channel.send(f'Incorrect syntax. Format of $set command is: $set [call] [response]')
            return
        await Response(call=split[1].lower(), response=split[3]).asave()
        await message.channel.send(f'Got it. When someone says "{split[1]}" I\'ll say "{split[3]}".')
        return
    
    if check.startswith('$del'):
        split = re.split('[\[\]]', message.content)
        if len(split) != 3:
            await message.channel.send(f'Incorrect syntax. Format of $del command is: $del [call]')
            return
        r = await get_response(split[1].lower())
        if r is None:
            await message.channel.send(f'I\'m not programmed to respond to "{split[1]}".')
        else:
            await r.adelete()
            await message.channel.send(f'Got it. I won\'t respond to "{split[1]}" anymore.')
        return

    if check == 'i love bots':
        await message.add_reaction('❤️')
        return
    
    if check == 'i hate bots':
        await message.add_reaction('💩')
        return
    
    if check == 'good bot':
        await message.add_reaction('👍')
        return
    
    if check == 'bad bot':
        await message.add_reaction('😦')
        return
    
    if check == '^':
        messages = [m async for m in message.channel.history(limit=2)]
        await messages[1].add_reaction('⬆️')
        await message.delete()
        return
    
    words = re.split(' ', check)
    all_same = words[0] == words[1] and words[1] == words[2]
    if len(words) >= 3 and all_same and words[0] in summons:
        await message.channel.send(f'@everyone {message.author} has summoned the boys!')
        return
    
    if words[0] in greetings and words[1] == 'bot':
        await message.channel.send(f'Hi {message.author}!')
        return


def start_bot():
    client.run(os.getenv('BOT_TOKEN'))

