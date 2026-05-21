const https = require("https");

module.exports = {
    name: 'catfact',
    async execute(interaction) {
        const factnmbr = interaction.options.getInteger("nombre") || 1;
        if (factnmbr < 1 || factnmbr >= 15) {
            return interaction.reply("https://tenor.com/view/islam-astaghfirullah-haram-gif-22586634");
        }

        const url = `https://catfact.ninja/facts?limit=${factnmbr}`;

        https.get(url, (response) => {
            let data = "";
            response.on("data", (chunk) => { data += chunk; });
            response.on("end", () => {
                const catFacts = JSON.parse(data).data;
                const factText = catFacts.map((fact) => `- ${fact.fact}`).join('\n');
                interaction.reply(`**Les faits demandés par ${interaction.user.tag} sont :** \n${factText}`);
            });
        });
    }
};