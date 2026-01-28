const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const config = require("./config.json");

const commands = [
  new SlashCommandBuilder()
    .setName("hadir")
    .setDescription("Login harian")
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands("1465872195434577951"),
      { body: commands }
    );
    console.log("✅ Slash command terdaftar");
  } catch (err) {
    console.error(err);
  }
})();
