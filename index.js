const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder 
} = require("discord.js");

const fs = require("fs");
const moment = require("moment-timezone");

// CONFIG DARI ENV (RAILWAY)
const config = {
  token: process.env.TOKEN,
  loginChannelId: process.env.LOGIN_CHANNEL_ID,
  leaderboardChannelId: process.env.LEADERBOARD_CHANNEL_ID
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const DB_FILE = "./database.json";

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return {};
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function todayWIB() {
  return moment().tz("Asia/Jakarta").format("YYYY-MM-DD");
}

function getBadge(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `**${rank}.**`;
}

async function updateLeaderboard(guild) {
  const db = loadDB();
  const channel = guild.channels.cache.get(config.leaderboardChannelId);
  if (!channel) return;

  const sorted = Object.entries(db)
    .sort((a, b) => {
      if (b[1].robux !== a[1].robux) {
        return b[1].robux - a[1].robux;
      }
      return b[1].login_count - a[1].login_count;
    })
    .slice(0, 10);

  let desc = "";
  let rank = 1;

  for (const [userId, data] of sorted) {
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) continue;

    const badge = getBadge(rank);

    desc += `${badge} **${user.username}**\n`;
    desc += `🪙 Robux: **${data.robux}** | 📆 Login: **${data.login_count}x**\n\n`;
    rank++;
  }

  if (!desc) desc = "Belum ada data.";

  const embed = new EmbedBuilder()
    .setTitle("🏆 Leaderboard Login Harian")
    .setDescription(desc)
    .setColor(0x00ff99)
    .setFooter({ text: "Update otomatis dari bot login harian" })
    .setTimestamp();

  const messages = await channel.messages.fetch({ limit: 5 });
  const botMsg = messages.find(m => m.author.id === client.user.id);

  if (botMsg) {
    botMsg.edit({ embeds: [embed] });
  } else {
    channel.send({ embeds: [embed] });
  }
}

client.once("ready", () => {
  console.log(`✅ Bot aktif sebagai ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "hadir") return;

  if (interaction.channelId !== config.loginChannelId) {
    return interaction.reply({
      content: "❌ Gunakan command ini di channel login harian.",
      ephemeral: true
    });
  }

  const db = loadDB();
  const userId = interaction.user.id;
  const today = todayWIB();

  if (!db[userId]) {
    db[userId] = {
      login_count: 0,
      robux: 0,
      last_login: null
    };
  }

  const user = db[userId];

  if (user.last_login === today) {
    return interaction.reply({
      content: "❌ Kamu sudah login hari ini.",
      ephemeral: true
    });
  }

  user.login_count += 1;
  user.last_login = today;

  let msg = `✅ **Login berhasil!**\nProgress: **${user.login_count % 4 || 4}/4**`;

  if (user.login_count % 4 === 0) {
    user.robux += 1;
    msg += `\n🎉 Kamu mendapatkan **1 Robux**!`;
  }

  saveDB(db);
  interaction.reply({ content: msg, ephemeral: true });

  updateLeaderboard(interaction.guild);
});

client.login(config.token);
