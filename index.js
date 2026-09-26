const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error("Missing DISCORD_TOKEN or CLIENT_ID.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// TEST POOLS — we'll replace these with the full lists next.
const streamEvents = [
  "Chat bullies Oshay",
  "Oshay bullies chat back",
  "Somebody says “good boy”",
  "Accidental scream",
  "hest_s loses all his points",
  "Oshay gets distracted by chat",
  "Chat derails the stream",
  "Accidental innuendo",
  "Kate bullies Oshay",
  "Oshay bullies Kate"
];

const generalEvents = [
  "Oshay dies stupidly",
  "Oshay forgets what he was doing",
  "Oshay misses something obvious",
  "Oshay argues with the game",
  "“I know what I’m doing”",
  "He did not know what he was doing",
  "Oshay celebrates too early",
  "Oshay completely whiffs an easy action",
  "Game physics commits a crime",
  "Oshay wins through dumb luck"
];

const gameEvents = {
  dbd: [
    "Oshay gets jumpscared by the killer",
    "Oshay runs directly into the killer",
    "Pallet gets wasted",
    "Skill check gets absolutely butchered",
    "Generator explodes at the worst possible time",
    "Oshay gets tunneled",
    "Oshay gets camped",
    "Exit gate chaos",
    "Oshay accidentally sandbags someone",
    "Everyone should have just fucking left"
  ],

  tlou: [
    "Oshay wastes ammo",
    "Stealth goes to shit immediately",
    "Clicker-related panic",
    "Oshay walks past supplies",
    "Chat spots supplies before Oshay",
    "Oshay forgets Listen Mode exists",
    "Oshay spends way too long looting",
    "Oshay panic-heals",
    "Oshay forgets to reload",
    "Oshay runs out of ammo mid-fight"
  ],

  raft: [
    "Oshay gets bitten by the shark",
    "The shark attacks at the worst possible time",
    "Oshay falls off the raft",
    "Oshay gets left behind by the raft",
    "Oshay misses the barrel",
    "Oshay forgets to eat",
    "Oshay forgets to drink",
    "Seagull attacks the crops",
    "Oshay gets lost on an island",
    "Someone asks “Where's Oshay?”"
  ]
};

function pickRandom(array, amount) {
  return [...array]
    .sort(() => Math.random() - 0.5)
    .slice(0, amount);
}

function makeCard(game) {
  // Test version uses 5 from each pool.
  const selected = [
    ...pickRandom(streamEvents, 5),
    ...pickRandom(generalEvents, 5),
    ...pickRandom(gameEvents[game], 5)
  ];

  return selected.sort(() => Math.random() - 0.5);
}

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if Stream Bingo is awake!"),

  new SlashCommandBuilder()
    .setName("bingo")
    .setDescription("Generate your Stream Bingo card!")
    .addStringOption(option =>
      option
        .setName("game")
        .setDescription("What is Oshay playing?")
        .setRequired(true)
        .addChoices(
          { name: "Dead by Daylight", value: "dbd" },
          { name: "The Last of Us", value: "tlou" },
          { name: "Raft", value: "raft" }
        )
    )
].map(command => command.toJSON());

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("Slash commands registered!");
  } catch (error) {
    console.error("Couldn't register slash commands:", error);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply({
      content: "🏓 Pong! Stream Bingo is alive!",
      ephemeral: true
    });
    return;
  }

  if (interaction.commandName === "bingo") {
    const game = interaction.options.getString("game");
    const card = makeCard(game);

    const gameNames = {
      dbd: "Dead by Daylight",
      tlou: "The Last of Us",
      raft: "Raft"
    };

    const cardText = card
      .map((event, index) => `${index + 1}. ${event}`)
      .join("\n");

    await interaction.reply({
      content:
        `🎮 **${gameNames[game]} — Stream Bingo**\n\n` +
        `${cardText}\n\n` +
        `⭐ **FREE SPACE: OSHAY MOMENT**`,
      ephemeral: true
    });
  }
});

client.login(TOKEN);
