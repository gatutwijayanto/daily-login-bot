const { REST, Routes, SlashCommandBuilder } = require("discord.js");

// AMBIL DARI ENV (RAILWAY)
const TOKEN = process.env.TOKEN;
const APPLICATION_ID = process.env.APPLICATION_ID;

const commands = [
  new SlashCommandBuilder()
    .setName("hadir")
    .setDescription("Login harian"),

  new SlashCommandBuilder()
    .setName("progress")
    .setDescription("Cek progress login harian")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("⏳ Mendaftarkan slash command...");
    await rest.put(
      Routes.applicationCommands(APPLICATION_ID),
      { body: commands }
    );
    console.log("✅ Slash command /hadir & /progress berhasil didaftarkan");
  } catch (error) {
    console.error("❌ Gagal daftar command:", error);
  }
})();
