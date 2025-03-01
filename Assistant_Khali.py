import discord
from discord.ext import commands
from datetime import datetime
import json
import asyncio
import requests
from bs4 import BeautifulSoup
import re

intents = discord.Intents.default()
intents.members = True
intents.reactions = True
intents.typing = False
intents.presences = False
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

last_number = 0


def load_last_number():
    try:
        with open('last_number.json', 'r') as file:
            data = json.load(file)
            return data['last_number']
    except (FileNotFoundError, json.JSONDecodeError):
        return 0


def save_last_number():
    data = {'last_number': last_number}
    with open('last_number.json', 'w') as file:
        json.dump(data, file)


@bot.event
async def on_ready():
    activity = discord.Game(name="Demande à Khali")
    await bot.change_presence(status=discord.Status.do_not_disturb, activity=activity)
    print(f'Salut mon gars {bot.user.name}')
    print(f'Logged in as {bot.user.name} (ID: {bot.user.id})')
    print('------')
    print('Connected to the following guilds:')
    for guild in bot.guilds:
        print(f'- {guild.name} (ID: {guild.id})')
        print('  Channels:')
        for channel in guild.channels:
            print(f'    - {channel.name} (ID: {channel.id})')
    '''channel = bot.get_channel(926198709895725076)
    if channel is not None:
        await channel.send("@everyone libérez Khalifouille")
    else:
        print("Channel not found")'''
    global last_number
    last_number = load_last_number()


@bot.event
async def on_message(message):
    global last_number
    if message.author == bot.user:
        return

    await bot.process_commands(message)

    if message.guild and message.guild.id == 894541937464463412:
        if message.content.isdigit():
            new_number = int(message.content)
            if new_number > last_number:
                last_number = new_number
                print(f"Nouveau nombre : {new_number}")
                await message.channel.edit(topic=f"Best score les loulous : {str(new_number)}")
                save_last_number()

@bot.command(name='stats')
async def stats(ctx, *, pseudo):
    account_type = "epic"

    headers = {
        "Authorization": api_key
    }

    params = {
        "name": pseudo,
        "accountType": account_type,
    }

    response = requests.get(url, params=params, headers=headers)
    data = response.json()

    if 'error' in data:
        await ctx.send(f"Erreur : {data['error']['message']}")
        return

    overall_stats = data['data']['stats']['all']['overall']
    kd_ratio = overall_stats['kd']
    top1 = overall_stats['wins']
    kills = overall_stats['kills']

    response_message = (
        f"__**\n- Statistiques de {pseudo} : **__\n"
        f"**\n:skull: - Kills :** {kills}\n"
        f"**\n:bar_chart: - K/D :** {kd_ratio}\n"
        f"**\n:trophy: - TOP1 :** {top1}"
    )

    await ctx.send(response_message)


@stats.error
async def stats_error(ctx, error):
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("Il faut écrire comme suit : `!stats [INSEREZ UN PSEUDO FORTNITE EPIC]`")


@bot.command(name='news')
async def news(ctx):
    url_news = "https://fortnite-api.com/v2/news/br?language=fr"

    response = requests.get(url_news)
    data = response.json()

    if 'error' in data:
        await ctx.send(f"Erreur : {data['error']['message']}")
        return

    news_list = data.get('data', {}).get('motds', [])

    if not news_list:
        await ctx.send("Aucune actualité disponible.")
        return

    full_date_str = data['data'].get('date', 'N/A')
    full_date = datetime.strptime(full_date_str, "%Y-%m-%dT%H:%M:%SZ")
    date = full_date.strftime("%Y-%m-%d")

    embed = discord.Embed(color=0x8B0000)

    embed.set_author(name=f"DATE DES NEWS : {date}", icon_url=ctx.author.avatar.url)

    for news_item in news_list:
        fortnews = news_item.get('title', 'N/A')
        forttextnews = news_item.get('body', 'N/A')

        embed.add_field(name=f"• {fortnews}", value=f"{forttextnews}\n\n\n\n", inline=False)

    await ctx.send(embed=embed)

@bot.command(name='trad')
async def trad(ctx, *, mot):
    mot = mot.replace(' ', '-')
    mot = mot.replace("’", '')
    mot = mot.replace("ç", 'c')
    mot = mot.replace("é", 'e')
    mot = mot.replace("è", 'e')

    url = f"https://tajinequiparle.com/francais-arabe-marocain/{mot}/"

    response = requests.get(url)

    print(url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        element_cible = soup.find('q')

        if element_cible:
            await ctx.send(f"Traduction de {mot} en :flag_ma: est : **{element_cible.get_text()}**")
            await ctx.send("اللعنة على إسرائيل")
        else:
            await ctx.send("L'élément spécifié n'a pas été trouvé.")
    else:
        await ctx.send(f"La requête a échoué avec le code d'état {response.status_code}")

@bot.command(name="vision")
async def vision(ctx):
    url_news = "https://steamcommunity.com/id/larabe12/"

    response = requests.get(url_news)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')

        recent_games_div = soup.find('div', class_='recent_games')

        new_divs = recent_games_div.find_all('div', class_='recent_game')

        for index, recent_game_div in enumerate(new_divs):
            if recent_game_div.find('div', class_='game_name').text.strip() == "Source SDK Base 2007":
                game_info_details_div = recent_game_div.find('div', class_='game_info_details')

                hours_pattern = re.compile(r'(\d+)\s*hrs on record')
                match = hours_pattern.search(game_info_details_div.text)

                if match:
                    heures_fivem = int(match.group(1))

                    heures_whitelist = 800 - heures_fivem

                    if heures_whitelist <= 24 and heures_whitelist > 0:
                        await ctx.send(f"Il reste que {heures_whitelist}, bientôt le rôleplay ! Tic Tac Tic Tac")
                        print(ctx.channel.topic)
                        await ctx.channel.edit(topic="VPS fournit par : 🇯 🇪  -  🇫 🇮 🇱 🇲 🇪  -  🇱 🇪  -  🇲 🇦 🇹 🇨 🇭 - ❤️ !")
                        print(ctx.channel.topic)

                    elif heures_whitelist <= 0:
                        await ctx.send(f'<@663844641250213919> à eu les 800hrs FivM, mais qu\'on est-il de la whitelist')
                        print(ctx.channel.topic)
                        await ctx.channel.edit(topic="VPS fournit par : 🇯 🇪  -  🇫 🇮 🇱 🇲 🇪  -  🇱 🇪  -  🇲 🇦 🇹 🇨 🇭 - ❤️ !")
                        print(ctx.channel.topic)

                    else:
                        await ctx.send(f"Il reste {heures_whitelist}hrs pour la whitelist de <@663844641250213919> ! S\'il rate, je cramptouille 24h")
                        print(ctx.channel.topic)
                        await ctx.channel.edit(topic="VPS fournit par : 🇯 🇪  -  🇫 🇮 🇱 🇲 🇪  -  🇱 🇪  -  🇲 🇦 🇹 🇨 🇭 - ❤️ !")
                        print(ctx.channel.topic)


@bot.command(name="logs")
async def logs(ctx):

    url = "https://api.staff.gta.ctgaming.fr:2053/api/logs"

    querystring = {"request": "logs", "type": "All", "search": "", "page": "0"}
    headers = {
        "authority": "api.staff.gta.ctgaming.fr:2053",
        "accept": "*/*",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjN1RXlWMjgwcWNyTzFxa1cwQU50ZyJ9.eyJpc3MiOiJodHRwczovL2Rldi1teXA2YmVsby51cy5hdXRoMC5jb20vIiwic3ViIjoib2F1dGgyfGRpc2NvcmR8NjYzODQ0NjQxMjUwMjEzOTE5IiwiYXVkIjpbImh0dHBzOi8vZGFzaGJvYXJkLWN0Zy1hcGkiLCJodHRwczovL2Rldi1teXA2YmVsby51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzA4NjQxODMyLCJleHAiOjE3MDg3MjgyMzIsImF6cCI6Ik1SY25JZFg1RXZLdWt0aXlIZGpQb013QkZzYVBNMjFmIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCJ9.an13hhy6gTs7KgmeMEiLQJ9Cb5bkQqWil4pxx83Ti-q1F3EKW2_915l6nULJkzWvkbXKztN3QDlb4Q6LBjm9F63JLb0JmyiXTYYdAzg1V9IUnXstHJaNQYU5thGZn4HWaZX1vJG6wjF9cQNWVAxNs5w4BmtQjRYXhb_hxlDrJCIbVAIt-m6pHjKluPb4oMR2EdP7F1vY0grArDbFvCovntd92YwzySoCIAu_6uK9mGkG03rBJQ04PLx8OGZLF6uxJ8RT7nOjbbBkRIcz-Qz8xwTUVxPI6MS8DdjZpgLsucPuZNE2Yfxtf49tJ89UP4qsfUkLR-gVhyQYGJfIsoOQ8w",
        "if-none-match": "W/^\^ce5-W39uZvGvcdMxTABhrXN2aFdt6kQ^^",
        "origin": "https://staff.gta.ctgaming.fr",
        "referer": "https://staff.gta.ctgaming.fr/",
        "sec-ch-ua": "^\^Not",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "^\^Windows^^",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0"
    }

    response = requests.get(url, headers=headers, params=querystring)

    data = response.json()

    if "result" in data:
        embed = discord.Embed(title="LOGGING CTG - NO ZOMBIE HERE", color=discord.Color.from_rgb(0, 0, 0))
        for entry in data["result"]:
            log_type = entry.get("type", "")
            if log_type != "Login":
                log_message = entry.get("message", "")
                log_date = datetime.strptime(entry.get("tcreate", ""), "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%d/%m/%Y %H:%M")
                embed.add_field(name=f"Type: {log_type}", value=f"Message: {log_message}\nDate: {log_date}",inline=False)
                embed.set_footer(text="Assistant Khali", icon_url=ctx.author.avatar.url)

        await ctx.send(embed=embed)

@bot.command(name="id")
async def id(ctx, ident: str):

    url = f'https://api.staff.gta.ctgaming.fr:2053/api/playerinfo?type=id&q={ident}'
    print(url)

    headers = {
        "authority": "api.staff.gta.ctgaming.fr:2053",
        "accept": "*/*",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjN1RXlWMjgwcWNyTzFxa1cwQU50ZyJ9.eyJpc3MiOiJodHRwczovL2Rldi1teXA2YmVsby51cy5hdXRoMC5jb20vIiwic3ViIjoib2F1dGgyfGRpc2NvcmR8NjYzODQ0NjQxMjUwMjEzOTE5IiwiYXVkIjpbImh0dHBzOi8vZGFzaGJvYXJkLWN0Zy1hcGkiLCJodHRwczovL2Rldi1teXA2YmVsby51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzA4NjQxNjI1LCJleHAiOjE3MDg3MjgwMjUsImF6cCI6Ik1SY25JZFg1RXZLdWt0aXlIZGpQb013QkZzYVBNMjFmIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCJ9.vpH7ldi70EW13_Ma72beYx6mOibetqcTBTk12yWDAo0dJOSwPsbORuJTLzX2iTdiTYUTwxNIzaWtE6o9mv0nOnPV6D0CsWHqxRSqAeyf6G3W4-jtdx8yy3wsfCMm9umzZH4pbTw_uoQkeu2i9deTHpPV4a3pVKOGNfHjS7JW-YPoMtHHaJVZ0-WPAGs_12qIyaU7KU2HJzYTweqP3xJrCza4-062xEp8fxFuSuk0R5lLPYHX75Tx7RrxG_jnEij8Mb1xCQBxsJCdAAmavAxlyCo1VsCEgbQotJlirYtAl6iGDBTk1zRRJO3hAvCL_wSfgzQsrt0UQmSlLXsYNiL7dg",
        "if-none-match": "W/^\^14b-yEtfv+POjBKYimgUqZuXlntoI24^^",
        "origin": "https://staff.gta.ctgaming.fr",
        "referer": "https://staff.gta.ctgaming.fr/",
        "sec-ch-ua": "^\^Not",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "^\^Windows^^",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0"
    }

    response = requests.get(url, headers=headers)

    print(response.text)

    if response.status_code == 200:
        data = response.json()

        user_info = {
            'id': data['accounts'][0]['id'],
            'rank': data['accounts'][0]['rank'],
            'vip': data['accounts'][0]['vip'],
            'bandata': data['accounts'][0]['bandata']
        }

        embed = discord.Embed(title=f"Informations sur l'ID {ident}", color=discord.Color.from_rgb(255, 255, 255))
        embed.add_field(name='ID', value=user_info['id'])
        embed.add_field(name='RANK', value=user_info['rank'])
        embed.add_field(name='VIP', value='Oui' if user_info['vip'] == 1 else 'Non')
        embed.add_field(name='INFORMATIONS SUR LE DERNIER BAN', value=user_info['bandata'])
        embed.set_footer(text="Assistant Khali", icon_url=ctx.author.avatar.url)

        await ctx.send(embed=embed)

@bot.command(name="entretien")
async def entretien(ctx):

    url = "https://panel.visionrp.fr/api/profile/getSessions/VFvnq42Mt9eEvtjX2VvzxivXitKY5H"

    payload = ""
    headers = {
        "authority": "panel.visionrp.fr",
        "accept": "application/json, text/plain, */*",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "cookie": "token=VFvnq42Mt9eEvtjX2VvzxivXitKY5H",
        "if-none-match": "W/^\^8d-J6buw80pkbXNkgWI63AsW5B3G2g^^",
        "referer": "https://panel.visionrp.fr/",
        "sec-ch-ua": "^\^Not",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "^\^Windows^^",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = json.loads(response.text)

        for entretien in data:
            entretien_id = entretien.get("id")
            start_time = entretien.get("start")
            end_time = entretien.get("end")
            slots = entretien.get("slots")
            theme = entretien.get("theme")

            await ctx.send(f"# Entretien # {entretien_id}\n\n**Commence le :** {start_time}\n**Fini le :** {end_time}\n**Slots:** {slots}\n**Theme:** {theme}")

@bot.event
async def on_message(message):
    await message.delete()
    if message.author.bot:
        return
    salon_voulu = 1036578555624165476
    if message.channel.id == salon_voulu and message.content.isdigit():
        discordid = message.content
        await message.channel.send(f"{discordid} - <@{discordid}>")


