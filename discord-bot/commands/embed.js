const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.json');

module.exports = {
    name: 'embed',
    async sendRegistrationEmbed(client, email) {
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        dbData.lastId += 1;
        const currentId = dbData.lastId;
        
        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));

        const targetChannelId = "811911508900184116"; 
        const channel = await client.channels.fetch(targetChannelId);

        if (!channel) return console.error("Salon de Whitelist introuvable !");

        const embed = new EmbedBuilder()
            .setTitle(`Nouvelle demande de whitelist`)
            .setColor("Yellow")
            .setTimestamp()
            .setFooter({ text: "En attente de whitelist", iconURL: client.user.displayAvatarURL() })
            .setDescription(`Un utilisateur s'est inscrit avec l'adresse mail : **${email}** avec pour ID : **${currentId}**`);

        const message = await channel.send({ embeds: [embed] });
        await message.react('👍');
        await message.react('👎');
        await message.react('🖕');

        let changementcouleur = false;
        let changementfooter = false;
        let acceptwhit = false;
        let refuswhit = false;

        const filter = (reaction, user) => ['👍','👎','🖕'].includes(reaction.emoji.name) && !user.bot;
        const collector = message.createReactionCollector({ filter });

        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === "👎" && !changementcouleur && !changementfooter){
                embed.setColor("Red");
                embed.setFooter({ text: `Whitelist refusée par : ${user.tag}`, iconURL: user.displayAvatarURL() });
                changementcouleur = true; changementfooter = true; refuswhit = true;
            } 
            if (reaction.emoji.name === "👍" && !changementcouleur && !changementfooter){
                embed.setColor("Green");
                embed.setFooter({ text: `Whitelist validée par : ${user.tag}`, iconURL: user.displayAvatarURL() });
                changementcouleur = true; changementfooter = true; acceptwhit = true;
                console.log(`L'ID ${currentId} a été accepté !`);
            } 
            if (reaction.emoji.name === "🖕" && !refuswhit && !acceptwhit){
                embed.setColor("Blue");
                embed.setFooter({ text: `Deuxième chance donnée par : ${user.tag}`, iconURL: user.displayAvatarURL() });
            }
            message.edit({ embeds: [embed] });
            reaction.users.remove(user.id).catch(console.error);
        });
    }
};