import discord
import os
from dotenv import load_dotenv
from asgiref.sync import sync_to_async
from discord_bot.models import Response

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)

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

    response = await get_response(message.content.lower())

    if response is not None:
        print(response.response)
        await message.channel.send(response.response)

    if message.content.startswith('$hello'):
        await message.channel.send('Hello!')


def start_bot():
    print('logged responses: ', Response.objects.all().count())
    client.run(os.getenv('BOT_TOKEN'))

