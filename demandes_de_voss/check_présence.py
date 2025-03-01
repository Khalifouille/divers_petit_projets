import discord
from discord.ext import commands
import asyncio
from datetime import datetime

intents = discord.Intents.default()
intents.members = True
intents.reactions = True
intents.typing = False
intents.presences = False
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

#------------------------------------------------------------------------------ LANCEMENT BOT

@bot.event
async def on_ready():
    activity = discord.Game(name="Demande à Khali")
    await bot.change_presence(status=discord.Status.do_not_disturb, activity=activity)
    print(f'Je suis {bot.user.name} (ID: {bot.user.id})')
    '''for guild in bot.guilds:
        print(f'- {guild.name} (ID: {guild.id})')
        print('  Channels:')
        for channel in guild.channels:
            print(f'    - {channel.name} (ID: {channel.id})')'''

#------------------------------------------------------------------------------ DEBUT DE FARMING

@bot.command(name="rappel")
async def rappel(ctx, minutes: int):
    await ctx.message.delete()

    maintenant = datetime.now().strftime("%d/%m/%Y")

    embed = discord.Embed(
        title=f"LANCEMENT DE {minutes} MINUTE(S) DE FARM !",
        color=discord.Color.blue()
    )
    embed.set_footer(text=f"Notification créé par : {ctx.author.display_name} ({ctx.author.discriminator}) • {maintenant}", icon_url=ctx.author.avatar.url)
    original_message = await ctx.send(embed=embed)

    print(f"Un rappel a été fait par {ctx.author.display_name}")

    await asyncio.sleep(minutes * 60)

# ------------------------------------------------------------------------------ FIN DE FARMING

    await original_message.delete()

    reminder_embed = discord.Embed(
        title=":green_circle: LABO WEED - VISION WL",
        color=discord.Color.green()
    )
    reminder_embed.add_field(name=f'RECOLTE PRETE !', value=" ")
    reminder_embed.set_footer(text=f"Notification créé par : {ctx.author.display_name} ({ctx.author.discriminator}) • {maintenant}", icon_url=ctx.author.avatar.url)

    await ctx.send(ctx.author.mention, embed=reminder_embed)

#------------------------------------------------------------------------------ GESTION ERREURS

@rappel.error
async def rappel_error(ctx, error):
    await ctx.message.delete()
    if isinstance(error, commands.MissingRequiredArgument):
        error_message = await ctx.send(":warning:  Un argument est manquant dans votre commande ! ")
        await asyncio.sleep(5)
        await error_message.delete()

#------------------------------------------------------------------------------ DEBUT ANNONCE

@bot.command(name="annonce")
async def annonce(ctx, *, message: str):
    await ctx.message.delete()

    maintenant = datetime.now().strftime("%d/%m/%Y")
    salon_id = 1276600466863820921

    if ctx.channel.id != salon_id:
        await ctx.send(":warning: La Commande `!annonce` ne peut s'executer ici !")
        return

    embed = discord.Embed(
        title=":loudspeaker: ANNONCE DU JOUR",
        description=message,
        color=discord.Color.dark_orange()
    )
    embed.set_footer(text=f"Notification créé par : {ctx.author.display_name} ({ctx.author.discriminator}) • {maintenant}", icon_url=ctx.author.avatar.url)

    message_env = await ctx.send("<@1277760324661149716>", embed=embed)
    await message_env.add_reaction("✅")
    await message_env.add_reaction("❌")
    await message_env.add_reaction("⌛")

#------------------------------------------------------------------------------ FIN ANNONCE / DEBUT CHECK

@bot.command(name="gay")
async def gay(ctx):
    await ctx.message.delete()
    guild_id = 1276593313989787649
    role_id = 1276595323627896902
    channel_id = 1276600466863820921
    maintenant = datetime.now().strftime("%d/%m/%Y")
    guild = bot.get_guild(guild_id)
    channel = bot.get_channel(channel_id)

    if not guild or not channel:
        await ctx.send("Erreur : Impossible de trouver le serveur ou le salon spécifié.")
        return

    role = guild.get_role(role_id)
    if not role:
        await ctx.send("Erreur : Impossible de trouver le rôle spécifié.")
        return

    required_emojis = {'✅', '❌', '⌛'}
    last_message = None

    async for message in channel.history(limit=100):
        message_emojis = {str(reaction.emoji) for reaction in message.reactions}

        if required_emojis.issubset(message_emojis):
            last_message = message
            break

    if not last_message:
        await ctx.send("Aucun message avec les émojis requis trouvé.")
        return

    bot_user = bot.user

    reactions = {
        '✅': set(),
        '❌': set(),
        '⌛': set()
    }

    for reaction in last_message.reactions:
        if str(reaction.emoji) in reactions:
            async for user in reaction.users():
                if user != bot_user:
                    reactions[str(reaction.emoji)].add(user)

    non_reactors = []
    for member in guild.members:
        if role in member.roles and all(member not in users for users in reactions.values()):
            non_reactors.append(member.display_name)

    non_reactors_message = "\n".join(f"- {name}" for name in non_reactors) if non_reactors else "Tous les utilisateurs ayant le rôle ont réagi au dernier message."

    reactions_message = {
        '✅': "\n".join([user.display_name for user in reactions['✅']]) or "Aucun utilisateur n'a réagi avec `✅`.",
        '❌': "\n".join([user.display_name for user in reactions['❌']]) or "Aucun utilisateur n'a réagi avec `❌`.",
        '⌛': "\n".join([user.display_name for user in reactions['⌛']]) or "Aucun utilisateur n'a réagi avec `⌛`."
    }

    embed = discord.Embed(
        title=f":loudspeaker: STATS DE L'ANNONCE DU {maintenant}",
        color=discord.Color.red()
    )
    embed.add_field(
        name=":skull: AUCUNE REACTION",
        value=non_reactors_message,
        inline=False
    )

    await ctx.send(embed=embed)


bot.run('') ##TOKEN BOT ICI