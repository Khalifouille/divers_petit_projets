const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');

const enservice = {};
const IDsalonvoc = {};
let verifsalon = false;

module.exports = {
    name: 'duty',
    enservice, 
    IDsalonvoc, 
    async execute(interaction) {
        const roledouane = process.env.ROLE_DOUANE;
        const douanier = interaction.member.roles.cache.some(role => role.id === roledouane);

        if (!douanier) {
            return interaction.reply({
                content: "https://tenor.com/view/michael-scott-no-no-no-no-no-no-gif-25279215",
                ephemeral: true
            });
        }

        const bouton = new ButtonBuilder().setLabel("Prise de service").setStyle(ButtonStyle.Success).setCustomId("boutonid1");
        const bouton2 = new ButtonBuilder().setLabel("Fin de service").setStyle(ButtonStyle.Danger).setCustomId("boutonid2");
        const boutons = new ActionRowBuilder().addComponents(bouton, bouton2);

        const rep = await interaction.reply({
            content: "Voici les boutons avec lesquels je m'encule depuis +1h : ",
            ephemeral: true,
            components: [boutons]
        });

        const collect = rep.createMessageComponentCollector({ componentType: ComponentType.Button });

        collect.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'boutonid1') {
                if (enservice[btnInteraction.user.id]) {
                    btnInteraction.reply({ content: "https://tenor.com/view/oh-jai-le-droit-de-gif-19520131", ephemeral: true });
                } else {
                    enservice[btnInteraction.user.id] = true;
                    btnInteraction.reply({ content: "Vous venez de prendre votre service en tant que Douanier !", ephemeral: true });

                    const salonvoccrea = await btnInteraction.guild.channels.create({
                        name: `Douane - ${btnInteraction.user.displayName}`,
                        type: 2,
                        parent: "1506997452987961455",
                        userLimit: 1,
                    });
                    IDsalonvoc[salonvoccrea.id] = btnInteraction.user.id;
                    verifsalon = true;
                }
                enservice[btnInteraction.user.id] = true;
            }

            if (btnInteraction.customId === 'boutonid2') {
                if (!enservice[btnInteraction.user.id]){
                    btnInteraction.reply({ content: "Tu dois te mettre en service d'abord !", ephemeral: true });
                } else {
                    btnInteraction.reply({ content: "Vous venez de prendre votre fin de service en tant que Douanier !", ephemeral: true });
                    let salon = Object.keys(IDsalonvoc).find((key) => IDsalonvoc[key] === btnInteraction.user.id);
                    if (salon) {
                        const salonvocsupp = btnInteraction.guild.channels.cache.get(salon);
                        if (salonvocsupp) {
                            salonvocsupp.delete().then(() => {
                                delete IDsalonvoc[salon];
                                verifsalon = false;
                                enservice[btnInteraction.user.id] = false;
                            });
                        }
                    }
                }
            }
        });
    }
};