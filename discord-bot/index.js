require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, Collection} = require('discord.js');
const token = process.env.TOKEN;
const roledouane = process.env.ROLE_DOUANE;
const https = require("https");

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
];

const client = new Client({ intents });

//------------------------------------------------ DEBUT DES CMDS

client.on("ready", function () {
    console.log("Je suis là");
    client.user.setStatus('invisible')
});

client.on("messageCreate", function (message) {
    if (message.author.bot) return;
    if (message.author.displayName === "Khali" && message.author.displayName === "Shino Akeshi") return;
    if (message.content === "Israel" && message.author.displayName != "Khali" && message.author.displayName != "Shino Akeshi") {
        message.reply(":flag_ps:VIVE LA PALESTINE BANDE DE FILS DEUP:flag_ps:");
    }
});

// ---------------------------------------------------------------------------- DEBUT EMBED

let changementcouleur = false;
let changementfooter = false;
let acceptwhit = false;
let refuswhit = false;

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "embed" && interaction.user.tag === "shinoakeshi") {
        const embed = new EmbedBuilder()
            .setTitle("2")
            .setColor("Yellow")
            .setTimestamp()
            .setFooter({ text: "En attente de whitelist", iconURL: client.user.displayAvatarURL() })
            .setDescription("Un utilisateur s'est inscrit avec l'adresse mail: shinoakeshi@gmail.com avec pour ID: 2");

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        await message.react('👍');
        await message.react('👎');
        await message.react('🖕');

        const filter = async (reaction, user) => {
            return ['👍','👎','🖕' ].includes(reaction.emoji.name) && user.id !== client.user.id;
        };

        const collector = message.createReactionCollector({ filter });

        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === "👎" && !changementcouleur && !changementfooter){
                embed.setColor("Red")
                embed.setFooter({ text: `Whitelist refusée par : ${user.tag} (${user.id})`, iconURL: user.displayAvatarURL() })
                changementcouleur = true
                changementfooter = true
                refuswhit = true
            }if (reaction.emoji.name === "👍" && !changementcouleur && !changementfooter){
                embed.setColor("Green")
                embed.setFooter({ text: `Whitelist validée par : ${user.tag} (${user.id})`, iconURL: user.displayAvatarURL() })
                changementcouleur = true
                changementfooter = true
                acceptwhit = true
            }if (reaction.emoji.name === "🖕" && !refuswhit && !acceptwhit){
                embed.setColor("Blue")
                embed.setFooter({ text: `Deuxiéme chance donner par : ${user.tag} (${user.id})`, iconURL: user.displayAvatarURL() })

            }

            message.edit({ embeds: [embed] })
            reaction.users.remove(user.id)

        });

        changementcouleur = false;
        changementfooter = false;
        refuswhit = false;
        acceptwhit = false;
    }else if (interaction.commandName === "embed" && interaction.user.tag === "khalifouille") {
        const embed = new EmbedBuilder()
            .setTitle("155")
            .setColor("Yellow")
            .setTimestamp()
            .setFooter({ text: "En attente de whitelist", iconURL: client.user.displayAvatarURL() })
            .setDescription("Un utilisateur s'est inscrit avec l'adresse mail: mohamedbrown@gmail.com avec pour ID: 155");

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        await message.react('👍');
        await message.react('👎');
        await message.react('🖕');

        const filter = async (reaction, user) => {
            return ['👍','👎','🖕' ].includes(reaction.emoji.name) && user.id !== client.user.id;
        };

        const collector = message.createReactionCollector({ filter });

        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === "👎" && !changementcouleur && !changementfooter){
                embed.setColor("Red")
                embed.setFooter({ text: `Whitelist refusée par : ${user.tag} (${user.id})`, iconURL: user.displayAvatarURL() })
                changementcouleur = true
                changementfooter = true
                refuswhit = true
            }if (reaction.emoji.name === "👍" && !changementcouleur && !changementfooter){
                embed.setColor("Green")
                embed.setFooter({ text: `Whitelist validée par : ${user.tag} (${user.id})`, iconURL: user.displayAvatarURL() })
                changementcouleur = true
                changementfooter = true
                acceptwhit = true
            }if (reaction.emoji.name === "🖕" && !refuswhit && !acceptwhit){
                embed.setColor("Blue")
                embed.setFooter({ text: `Deuxiéme chance donner par : ${user.tag} (${user.id})`, iconURL: user.displayAvatarURL() })

            }

            message.edit({ embeds: [embed] })
            reaction.users.remove(user.id)

        });

        changementcouleur = false;
        changementfooter = false;
        refuswhit = false;
        acceptwhit = false;
    }
});

// ---------------------------------------------------------------------------- FIN EMBED // DEBUT CATFACT

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === "catfact") {
        const factnmbr = interaction.options.getInteger("nombre") || 1;
        if (factnmbr < 1 || factnmbr >= 15) {
            interaction.reply("https://tenor.com/view/islam-astaghfirullah-haram-gif-22586634");
            return;
        }

        const url = `https://catfact.ninja/facts?limit=${factnmbr}`;

        https.get(url, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                const catFacts = JSON.parse(data).data;
                const factText = catFacts.map((fact, index) => `- ${fact.fact}`).join('\n');

                interaction.reply(`**Les faits demandés par ${interaction.user.tag} sont :** \n${factText}`);
            });
        });
    }
});

// ---------------------------------------------------------------------------- FIN CATFACT // DEBUT DOUANE NEW

let enservice = {};
let IDsalonvoc = {};
let verifsalon = false;

// let Salons = [
//     {idSalon: 0000000, idOwner: 000000}
// ]
// Salons.find((salon) => salon.idSalon === interaction.channel.id)
// Salons.find((salon) => salon.idOwner === interaction.user.id)

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === "duty") {
        const douanier = interaction.member.roles.cache.some(role => role.id === roledouane);

        if (!douanier) {
            interaction.reply({
                content: "https://tenor.com/view/michael-scott-no-no-no-no-no-no-gif-25279215",
                ephemeral: true
            })
            console.log("Good")
        } else if (douanier) {

            const bouton = new ButtonBuilder()
                .setLabel("Prise de service")
                .setStyle(ButtonStyle.Success)
                .setCustomId("boutonid1");
            console.log("Go!")

            const bouton2 = new ButtonBuilder()
                .setLabel("Fin de service")
                .setStyle(ButtonStyle.Danger)
                .setCustomId("boutonid2");

            const boutons = new ActionRowBuilder().addComponents(bouton, bouton2)
            const rep = await interaction.reply({
                content: "Voici les boutons avec lesquels je m'encule depuis +1h : ",
                ephemeral: true,
                components: [boutons]
            },);

            const collect = rep.createMessageComponentCollector({
                componentType: ComponentType.Button,
            });

            collect.on('collect', async (interaction) => {
                if (interaction.customId === 'boutonid1') {
                    if (enservice[interaction.user.id]) {
                        interaction.reply({
                            content: "https://tenor.com/view/oh-jai-le-droit-de-gif-19520131",
                            ephemeral: true
                        })
                    } else {
                        enservice[interaction.user.id] = true;
                        interaction.reply({
                            content: "Vous venez de prendre votre service en tant que Douanier !",
                            ephemeral: true
                        });

                        const salonvoccrea = await interaction.guild.channels.create({
                            name: `Douane - ${interaction.user.displayName}`,
                            type: 2,
                            parent: "1042098326566338591",
                            userLimit: 1,
                        });
                        IDsalonvoc[salonvoccrea.id] = interaction.user.id;
                        verifsalon = true;
                        console.log("Service activé");
                    }

                    enservice[interaction.user.id] = true;


                }

                if (interaction.customId === 'boutonid2') {
                    if (!enservice[interaction.user.id]){
                        interaction.reply({content: "Tu dois te mettre en service d'abord !", ephemeral: true})
                        console.log("MET TOI EN SERVICE !")
                    } else {
                        interaction.reply({
                            content: "Vous venez de prendre votre fin de service en tant que Douanier !",
                            ephemeral: true
                        })
                        console.log("Service désactivé")
                        let salon = Object.keys(IDsalonvoc).find((key) => IDsalonvoc[key] === interaction.user.id)
                        console.log(salon)
                        if (salon) {
                            const salonvocsupp = interaction.guild.channels.cache.get(salon);
                            if (salonvocsupp) {
                                salonvocsupp.delete().then(() => {
                                    delete IDsalonvoc[salon]
                                    verifsalon = false;
                                    enservice[interaction.user.id] = false;
                                });
                            }
                        }
                    }
                }
            });
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
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
        salonvocexpired.edit({ userLimit: 1 });
        console.log("Le vocal est maintenant limité à 1 utilisateur !");
    }

    if (salonvoc) {
        console.log(`${membre.user.tag} a rejoint le salon vocal ${newState.channel.name}`);
    }
    if (salonvocexpired) {
        console.log(`${membre.user.tag} a quitté le salon vocal ${oldState.channel.name}`);
    }if (salonvoc) {
        delete enservice[salonvoc.id];
    }
});

//------------------------------------------------ FIN DES CMDS

client.login(token);
