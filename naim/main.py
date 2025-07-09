import discord
import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

intents = discord.Intents.all()
bot = discord.Client(intents=intents)

WEBHOOK_URL = os.getenv('WEBHOOK_URL')
BOT_TOKEN = os.getenv('BOT_TOKEN')

@bot.event
async def on_ready():
    print(f"✅ Connecté en tant que {bot.user}")

@bot.event
async def on_guild_channel_update(before, after):
    if before.category_id != after.category_id or before.position != after.position:
        executor = None
        
        try:
            async for entry in after.guild.audit_logs(
                limit=10,
                action=discord.AuditLogAction.channel_update,
                after=datetime.utcnow() - timedelta(minutes=5)
            ):
                if entry.target.id == after.id:
                    executor = entry.user
                    break
        except discord.Forbidden:
            print("❌ Permission manquante : View Audit Log")

        if executor is None:
            async for member in after.guild.fetch_members():
                if member.guild_permissions.manage_channels and member.status != discord.Status.offline:
                    executor = member
                    break

        embed = {
            "title": "🔧 Salon déplacé",
            "color": 0x3498db,
            "description": (
                f"**Salon:** {after.mention}\n"
                f"**Responsable:** {executor.mention if executor else 'Inconnu (Permissions insuffisantes)'}\n"
                f"**Déplacement:** `{before.category.name if before.category else 'Aucune'}` → `{after.category.name if after.category else 'Aucune'}`"
            )
        }

        requests.post(WEBHOOK_URL, json={"embeds": [embed]})

bot.run(BOT_TOKEN)