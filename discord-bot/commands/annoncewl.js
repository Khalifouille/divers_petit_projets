const dutyCommand = require('./duty.js');

module.exports = {
    name: 'annoncewl',
    async execute(interaction) {
        const idSalonAnnonce = "811911508900184116";
        const salonAnnonce = interaction.guild.channels.cache.get(idSalonAnnonce);

        if (!salonAnnonce) {
            return interaction.reply({ content: "Le salon d'annonce est introuvable (vérifie l'ID).", ephemeral: true });
        }
        
        const salonsOuverts = Object.keys(dutyCommand.IDsalonvoc);

        if (salonsOuverts.length === 0) {
            return interaction.reply({
                content: "Aucun douanier n'a ouvert de salon actuellement. Utilise /duty pour prendre ton service d'abord.",
                ephemeral: true
            });
        }

        const mentionsSalons = salonsOuverts.map(id => `<#${id}>`).join(", ");
        await salonAnnonce.send(`Un douanier est prêt à vous prendre en charge, rejoignez le salon : ${mentionsSalons}`);

        interaction.reply({ content: "L'annonce WL a été envoyée avec succès !", ephemeral: true });
    }
};