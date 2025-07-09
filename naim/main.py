import discord
import requests
import os
from dotenv import load_dotenv

load_dotenv()

intents = discord.Intents.default()
intents.guilds = True

bot = discord.Client(intents=intents)

WEBHOOK_URL = os.getenv('WEBHOOK_URL')
BOT_TOKEN = os.getenv('BOT_TOKEN')

@bot.event
async def on_ready():
    print(f"✅ Connecté en tant que {bot.user}")

@bot.event
async def on_guild_channel_update(before, after):
    if before.category_id != after.category_id or before.position != after.position:
        old_cat = before.category.name if before.category else "Aucune"
        new_cat = after.category.name if after.category else "Aucune"

        async for entry in after.guild.audit_logs(limit=5, action=discord.AuditLogAction.channel_update):
            if entry.target.id == after.id:
                executor = entry.user
                break
        else:
            executor = None

        embed = {
            "title": "🔧 Salon déplacé",
            "color": 0x3498db,
            "fields": [
                {"name": "Salon", "value": after.name, "inline": True},
                {"name": "Ancienne catégorie", "value": old_cat, "inline": True},
                {"name": "Nouvelle catégorie", "value": new_cat, "inline": True},
                {"name": "Ancienne position", "value": str(before.position), "inline": True},
                {"name": "Nouvelle position", "value": str(after.position), "inline": True},
                {"name": "Déplacé par", "value": executor.mention if executor else "Inconnu", "inline": False}
            ]
        }

        try:
            requests.post(WEBHOOK_URL, json={"embeds": [embed]})
        except Exception as e:
            print(f"❌ Erreur webhook : {e}")

bot.run(BOT_TOKEN)