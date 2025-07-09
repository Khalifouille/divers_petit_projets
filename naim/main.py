import discord
import requests
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()

intents = discord.Intents.default()
intents.guilds = True
intents.members = True 

bot = discord.Client(intents=intents)

WEBHOOK_URL = os.getenv('WEBHOOK_URL')
BOT_TOKEN = os.getenv('BOT_TOKEN')

@bot.event
async def on_ready():
    print(f"✅ Connecté en tant que {bot.user}")

@bot.event
async def on_guild_channel_update(before, after):
    if before.category_id != after.category_id or before.position != after.position:
        await asyncio.sleep(3)
        
        executor = None
        try:
            async for entry in after.guild.audit_logs(
                limit=5,
                action=discord.AuditLogAction.channel_update
            ):
                if entry.target.id == after.id:
                    executor = entry.user
                    break
        except discord.Forbidden:
            print("❌ Permission manquante: View Audit Log")

        if executor is None:
            try:
                suspects = []
                async for member in after.guild.fetch_members():
                    if member.guild_permissions.manage_channels:
                        suspects.append(member.mention)
                
                if suspects:
                    executor_text = f"Suspects: {', '.join(suspects)}"
                else:
                    executor_text = "Inconnu (aucun modérateur détecté)"
            except discord.Forbidden:
                executor_text = "Inconnu (permissions insuffisantes)"

        embed = {
            "title": "🔧 Salon déplacé",
            "color": 0x3498db,
            "description": (
                f"**Salon:** {after.mention}\n"
                f"**Responsable:** {executor.mention if executor else executor_text}\n"
                f"**Déplacement:** `{before.category.name if before.category else 'Aucune'}` → `{after.category.name if after.category else 'Aucune'}`"
            )
        }

        try:
            requests.post(WEBHOOK_URL, json={"embeds": [embed]})
        except Exception as e:
            print(f"❌ Erreur webhook: {e}")

bot.run(BOT_TOKEN)