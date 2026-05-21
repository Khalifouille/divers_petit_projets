require("dotenv").config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
const app = express();
app.use(express.json());

const token = process.env.TOKEN;
const roledouane = process.env.ROLE_DOUANE;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

app.use(express.static('public'));

const embedModule = require('./commands/embed.js');

app.post('/api/inscription', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "L'adresse email est requise." });
    }

    try {
        await embedModule.sendRegistrationEmbed(client, email);
        return res.status(200).json({ success: "Demande envoyée à Discord !" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur interne du bot." });
    }
});

app.listen(3000, () => {
    console.log("Serveur Web et API lancés sur http://localhost:3000 !");
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
    }
}

const dutyCommand = require('./commands/duty.js');

client.on("ready", () => {
    console.log("Je suis là");
    client.user.setStatus('invisible');
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    if (message.author.displayName === "Khali" || message.author.displayName === "Shino Akeshi") return;
    if (message.content === "Israel") {
        message.reply(":flag_ps:VIVE LA PALESTINE BANDE DE FILS DEUP:flag_ps:");
    }
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Erreur lors de l\'exécution de la commande.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Erreur lors de l\'exécution de la commande.', ephemeral: true });
        }
    }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const salonvocexpired = oldState.channel;
    const salonvoc = newState.channel;
    const membre = newState.member;
    const possedeRoleSpecifique = membre.roles.cache.has(roledouane);
    
    if (salonvoc) {
        if (salonvoc.guild && salonvoc.guild.ownerId === membre.id && salonvoc.userLimit === 1) {
            salonvoc.edit({ userLimit: 2 });
            console.log("Le vocal est maintenant limité à 2 utilisateurs !");
        }
    } else if (possedeRoleSpecifique && salonvocexpired && salonvocexpired.userLimit === 2) {
        try {
            await salonvocexpired.edit({ userLimit: 1 });
            console.log("Le vocal est maintenant limité à 1 utilisateur !");
        } catch (error) {
            if (error.code === 10003) {
                console.log("Salon déjà supprimé, rien à faire.");
            } else {
                console.error("Erreur inattendue :", error);
            }
        }
    }

    if (salonvoc) {
        console.log(`${membre.user.tag} a rejoint le salon vocal ${salonvoc.name}`);
        delete dutyCommand.enservice[salonvoc.id];
    }
    if (salonvocexpired) {
        console.log(`${membre.user.tag} a quitté le salon vocal ${salonvocexpired.name}`);
    }
    if (salonvoc) {
        delete dutyCommand.enservice[salonvoc.id];
    }
});

client.login(token);