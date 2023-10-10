from django.core.management.base import BaseCommand
from discord_bot.bot import start_bot

class Command(BaseCommand):
    help = 'runs the discord bot'

    def handle(self, *args, **options):
        start_bot()

