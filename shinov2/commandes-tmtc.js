require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
    {
        name: 'catfact',
        description: 'Des faits à la demande',
        options: [
            {
                name: "nombre",
                description: "Mon bébéw",
                type: 4,
                required: false
            }
        ]
    },

    {
        name: 'embed',
        description: 'tmtc',
    },

    {
        name: 'duty',
        description: 'Dehors les migrants !',
    },

];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log('Slash commands were registered successfully!');
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();