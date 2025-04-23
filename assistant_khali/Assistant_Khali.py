import discord
from discord.ext import commands
from datetime import datetime
import json
import asyncio
import requests
from bs4 import BeautifulSoup
import re
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

intents = discord.Intents.default()
intents.members = True
intents.reactions = True
intents.typing = False
intents.presences = False
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

last_number = 0
CONFIG = {
    'api_key': '//', 
    'fortnite_api_url': 'https://fortnite-api.com/v2/stats/br/v2',
    'allowed_guild_id': 894541937464463412,
    'target_channel_id': 1036578555624165476
}

def load_last_number():
    try:
        with open('last_number.json', 'r') as file:
            data = json.load(file)
            return data['last_number']
    except (FileNotFoundError, json.JSONDecodeError):
        return 0

def save_last_number():
    with open('last_number.json', 'w') as file:
        json.dump({'last_number': last_number}, file)

async def send_embed(ctx, title, description, color=0x8B0000, fields=None, footer=None):
    embed = discord.Embed(title=title, description=description, color=color)
    if fields:
        for name, value, inline in fields:
            embed.add_field(name=name, value=value, inline=inline)
    if footer:
        embed.set_footer(text=footer, icon_url=ctx.author.avatar.url)
    await ctx.send(embed=embed)

@bot.event
async def on_ready():
    activity = discord.Game(name="Demande à Khali")
    await bot.change_presence(status=discord.Status.do_not_disturb, activity=activity)
    
    logger.info(f'Connecté en tant que {bot.user.name} (ID: {bot.user.id})')
    logger.info('------')
    logger.info('Serveurs connectés:')
    
    for guild in bot.guilds:
        logger.info(f'- {guild.name} (ID: {guild.id})')
    
    global last_number
    last_number = load_last_number()

@bot.event
async def on_message(message):
    if message.author == bot.user:
        return

    await bot.process_commands(message)

    if message.guild and message.guild.id == CONFIG['allowed_guild_id']:
        if message.content.isdigit():
            global last_number
            new_number = int(message.content)
            if new_number > last_number:
                last_number = new_number
                logger.info(f"Nouveau meilleur score : {new_number}")
                await message.channel.edit(topic=f"Best score les loulous : {new_number}")
                save_last_number()

    if message.channel.id == CONFIG['target_channel_id'] and message.content.isdigit():
        discord_id = message.content
        await message.channel.send(f"{discord_id} - <@{discord_id}>")
    
    await message.delete()

@bot.command(name='stats')
async def stats(ctx, *, pseudo):
    try:
        headers = {"Authorization": CONFIG['api_key']}
        params = {"name": pseudo, "accountType": "epic"}
        
        response = requests.get(CONFIG['fortnite_api_url'], headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        if 'error' in data:
            await ctx.send(f"Erreur : {data['error']['message']}")
            return

        stats = data['data']['stats']['all']['overall']
        fields = [
            (":skull: Kills", str(stats['kills']), False),
            (":bar_chart: K/D", str(stats['kd']), False),
            (":trophy: TOP1", str(stats['wins']), False)
        ]
        
        await send_embed(
            ctx,
            f"Statistiques de {pseudo}",
            "",
            fields=fields
        )
    except Exception as e:
        logger.error(f"Erreur dans la commande stats: {e}")
        await ctx.send("Une erreur s'est produite lors de la récupération des statistiques.")

@stats.error
async def stats_error(ctx, error):
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("Usage: `!stats [PSEUDO_FORTNITE_EPIC]`")

@bot.command(name='news')
async def news(ctx):
    try:
        response = requests.get("https://fortnite-api.com/v2/news/br?language=fr")
        response.raise_for_status()
        data = response.json()

        news_list = data.get('data', {}).get('motds', [])
        if not news_list:
            await ctx.send("Aucune actualité disponible.")
            return

        date_str = data['data'].get('date', 'N/A')
        news_date = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ").strftime("%Y-%m-%d")
        
        embed = discord.Embed(color=0x8B0000)
        embed.set_author(name=f"Actualités Fortnite - {news_date}", icon_url=ctx.author.avatar.url)

        for news_item in news_list:
            title = news_item.get('title', 'N/A')
            body = news_item.get('body', 'N/A')
            embed.add_field(name=f"• {title}", value=body, inline=False)

        await ctx.send(embed=embed)
    except Exception as e:
        logger.error(f"Erreur dans la commande news: {e}")
        await ctx.send("Une erreur s'est produite lors de la récupération des actualités.")

@bot.command(name='trad')
async def trad(ctx, *, mot):
    try:
        mot = re.sub(r"[ ’'çéè]", lambda m: {' ':'-', '’':'', "'":'', 'ç':'c', 'é':'e', 'è':'e'}[m.group()], mot.lower())
        url = f"https://tajinequiparle.com/francais-arabe-marocain/{mot}/"
        
        response = requests.get(url)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        translation = soup.find('q')
        
        if translation:
            await ctx.send(f"Traduction de {mot} en :flag_ma: : **{translation.get_text()}**")
        else:
            await ctx.send("Traduction non trouvée.")
    except Exception as e:
        logger.error(f"Erreur dans la commande trad: {e}")
        await ctx.send("Une erreur s'est produite lors de la traduction.")

@bot.command(name="vision")
async def vision(ctx):
    try:
        response = requests.get("https://steamcommunity.com/id/larabe12/")
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        recent_games = soup.find('div', class_='recent_games')
        
        if not recent_games:
            await ctx.send("Impossible de récupérer les informations de jeu.")
            return

        for game in recent_games.find_all('div', class_='recent_game'):
            if game.find('div', class_='game_name').text.strip() == "Source SDK Base 2007":
                details = game.find('div', class_='game_info_details')
                match = re.search(r'(\d+)\s*hrs on record', details.text)
                
                if match:
                    heures_fivem = int(match.group(1))
                    heures_restantes = 800 - heures_fivem
                    
                    if heures_restantes <= 0:
                        msg = f'<@663844641250213919> a atteint les 800h sur FiveM!'
                    elif heures_restantes <= 24:
                        msg = f"Il ne reste que {heures_restantes}h, bientôt le rôleplay !"
                    else:
                        msg = f"Il reste {heures_restantes}h pour la whitelist !"
                    
                    await ctx.send(msg)
                    await ctx.channel.edit(topic="VPS fourni par : 🇯🇪 - 🇫🇮🇱🇲🇪 - 🇱🇪 - 🇲🇦🇹🇨🇭 - ❤️")
                    return
        
        await ctx.send("Jeu non trouvé dans l'historique récent.")
    except Exception as e:
        logger.error(f"Erreur dans la commande vision: {e}")
        await ctx.send("Une erreur s'est produite lors de la vérification des heures.")

@bot.command(name="logs")
@commands.has_permissions(administrator=True)
async def logs(ctx):
    try:
        headers = {
            "authorization": "Bearer YOUR_TOKEN",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
        
        response = requests.get(
            "https://api.staff.gta.ctgaming.fr:2053/api/logs",
            headers=headers,
            params={"request": "logs", "type": "All", "search": "", "page": "0"}
        )
        response.raise_for_status()
        data = response.json()

        if "result" not in data:
            await ctx.send("Aucun log disponible.")
            return

        embed = discord.Embed(title="LOGS SERVEUR", color=0x000000)
        
        for entry in data["result"]:
            if entry.get("type") != "Login":
                date = datetime.strptime(entry.get("tcreate", ""), "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%d/%m/%Y %H:%M")
                embed.add_field(
                    name=f"Type: {entry.get('type', 'Inconnu')}",
                    value=f"Message: {entry.get('message', 'N/A')}\nDate: {date}",
                    inline=False
                )
        
        embed.set_footer(text="Assistant Khali", icon_url=ctx.author.avatar.url)
        await ctx.send(embed=embed)
    except Exception as e:
        logger.error(f"Erreur dans la commande logs: {e}")
        await ctx.send("Erreur lors de la récupération des logs.")

@bot.command(name="id")
@commands.has_permissions(administrator=True)
async def id(ctx, ident: str):
    try:
        headers = {
            "authorization": "Bearer YOUR_TOKEN",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
        
        response = requests.get(
            f"https://api.staff.gta.ctgaming.fr:2053/api/playerinfo?type=id&q={ident}",
            headers=headers
        )
        response.raise_for_status()
        data = response.json()

        if not data.get('accounts'):
            await ctx.send("Aucun joueur trouvé avec cet ID.")
            return

        account = data['accounts'][0]
        fields = [
            ("ID", account.get('id', 'N/A'), True),
            ("RANK", account.get('rank', 'N/A'), True),
            ("VIP", "Oui" if account.get('vip') == 1 else "Non", True),
            ("DERNIER BAN", account.get('bandata', 'Aucun'), False)
        ]
        
        await send_embed(
            ctx,
            f"Info Joueur - ID {ident}",
            "",
            color=0xFFFFFF,
            fields=fields,
            footer="Assistant Khali"
        )
    except Exception as e:
        logger.error(f"Erreur dans la commande id: {e}")
        await ctx.send("Erreur lors de la recherche du joueur.")

@bot.command(name="entretien")
@commands.has_permissions(administrator=True)
async def entretien(ctx):
    try:
        headers = {
            "cookie": "//",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
        
        response = requests.get(
            "https://panel.visionrp.fr/api/profile/getSessions/VFvnq42Mt9eEvtjX2VvzxivXitKY5H",
            headers=headers
        )
        response.raise_for_status()
        data = response.json()

        if not data:
            await ctx.send("Aucun entretien programmé.")
            return

        for session in data:
            fields = [
                ("ID", session.get('id', 'N/A'), True),
                ("Début", session.get('start', 'N/A'), True),
                ("Fin", session.get('end', 'N/A'), True),
                ("Slots", str(session.get('slots', 'N/A')), False),
                ("Thème", session.get('theme', 'N/A'), False)
            ]
            
            await send_embed(
                ctx,
                "Entretien Programmé",
                "",
                fields=fields
            )
    except Exception as e:
        logger.error(f"Erreur dans la commande entretien: {e}")
        await ctx.send("Erreur lors de la récupération des entretiens.")

if __name__ == "__main__":
    bot.run(api_token)