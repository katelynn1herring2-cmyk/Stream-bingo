
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require("discord.js");

const {
  streamEvents,
  generalEvents,
  dbdEvents,
  tlouEvents,
  tlou2Events,
  raftEvents,
  minecraftEvents
} = require("./events");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error("Missing DISCORD_TOKEN or CLIENT_ID.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ======================================================
// GAME SETTINGS
// ======================================================

const gamePools = {
  dbd: dbdEvents,
  tlou: tlouEvents,
  tlou2: [...tlouEvents, ...tlou2Events],
  raft: raftEvents,
  minecraft: minecraftEvents
};

const gameNames = {
  general: "GENERAL GAMING",
  dbd: "DEAD BY DAYLIGHT",
  tlou: "THE LAST OF US PART I",
  tlou2: "THE LAST OF US PART II",
  raft: "RAFT",
  minecraft: "MINECRAFT"
};

const gameEmojis = {
  general: "🎮",
  dbd: "🔪",
  tlou: "🍄",
  tlou2: "🍄",
  raft: "🦈",
  minecraft: "⛏️"
};

// One active card per player while the bot is running.
const activeCards = new Map();

// ======================================================
// CARD GENERATION
// ======================================================

function shuffle(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function pickRandom(items, count) {
  return shuffle(items).slice(0, count);
}

function makeCard(game) {
  const events = game === "general"
    ? [
        ...pickRandom(streamEvents, 12),
        ...pickRandom(generalEvents, 12)
      ]
    : [
        ...pickRandom(streamEvents, 8),
        ...pickRandom(generalEvents, 8),
        ...pickRandom(gamePools[game], 8)
      ];

  const card = shuffle(events);

  // Square #13 is the automatic free space.
  card.splice(12, 0, "FREE SPACE — OSHAY MOMENT");

  return card;
}

// ======================================================
// CARD DISPLAY
// ======================================================

function formatCard(card, marked) {
  let result = "";

  for (let row = 0; row < 5; row++) {
    result += `**ROW ${row + 1}**\n`;

    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;

      result +=
        `${marked.has(index) ? "✅" : "⬜"} ` +
        `**${index + 1}.** ${card[index]}\n`;
    }

    result += "\n";
  }

  return result;
}

// ======================================================
// INTERACTIVE BUTTONS
// ======================================================

function makeButtons(marked) {
  const rows = [];

  for (let row = 0; row < 5; row++) {
    const actionRow = new ActionRowBuilder();

    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      const free = index === 12;
      const checked = marked.has(index);

      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`bingo_${index}`)
          .setLabel(
            free
              ? "⭐ 13"
              : checked
                ? `✓ ${index + 1}`
                : `${index + 1}`
          )
          .setStyle(
            free
              ? ButtonStyle.Primary
              : checked
                ? ButtonStyle.Success
                : ButtonStyle.Secondary
          )
          .setDisabled(free)
      );
    }

    rows.push(actionRow);
  }

  return rows;
}

// ======================================================
// BINGO DETECTION
// ======================================================

const bingoLines = [
  // Horizontal
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],

  // Vertical
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],

  // Diagonal
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20]
];

function hasBingo(marked) {
  return bingoLines.some(line =>
    line.every(index => marked.has(index))
  );
}

// ======================================================
// SLASH COMMANDS
// ======================================================

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if Stream Bingo is awake!"),

  new SlashCommandBuilder()
    .setName("bingo")
    .setDescription("Generate your personal Stream Bingo card!")
    .addStringOption(option =>
      option
        .setName("game")
        .setDescription("What is Oshay playing?")
        .setRequired(true)
        .addChoices(
          { name: "🎮 General Gaming", value: "general" },
          { name: "🔪 Dead by Daylight", value: "dbd" },
          { name: "🍄 The Last of Us Part I", value: "tlou" },
          { name: "🍄 The Last of Us Part II", value: "tlou2" },
          { name: "🦈 Raft", value: "raft" },
          { name: "⛏️ Minecraft", value: "minecraft" }
        )
    )
].map(command => command.toJSON());

// ======================================================
// BOT READY
// ======================================================

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
    console.error(
      "Couldn't register slash commands:",
      error
    );
  }
});

// ======================================================
// INTERACTIONS
// ======================================================

client.on("interactionCreate", async interaction => {
  try {

    // --------------------------------------------------
    // SLASH COMMANDS
    // --------------------------------------------------

    if (interaction.isChatInputCommand()) {

      // /ping
      if (interaction.commandName === "ping") {
        await interaction.reply({
          content: "🏓 Pong! Stream Bingo is alive!",
          flags: MessageFlags.Ephemeral
        });

        return;
      }

      // /bingo
      if (interaction.commandName === "bingo") {
        const game = interaction.options.getString("game");

        if (
          game !== "general" &&
          !gamePools[game]
        ) {
          await interaction.reply({
            content: "That bingo game doesn't exist.",
            flags: MessageFlags.Ephemeral
          });

          return;
        }

        const card = makeCard(game);
        const marked = new Set([12]);

        activeCards.set(interaction.user.id, {
          card,
          marked,
          game,
          bingoAnnounced: false
        });

        await interaction.reply({
          content:
            `${gameEmojis[game]} ` +
            `**${gameNames[game]} — STREAM BINGO**\n` +
            "*Only you can see your card. " +
            "Tap the numbered buttons as events happen.*\n\n" +
            formatCard(card, marked),
          components: makeButtons(marked),
          flags: MessageFlags.Ephemeral
        });

        return;
      }
    }

    // --------------------------------------------------
    // BINGO BUTTONS
    // --------------------------------------------------

    if (
      interaction.isButton() &&
      interaction.customId.startsWith("bingo_")
    ) {
      const state = activeCards.get(interaction.user.id);

      if (!state) {
        await interaction.reply({
          content:
            "That card is no longer active. " +
            "Run `/bingo` for a new one!",
          flags: MessageFlags.Ephemeral
        });

        return;
      }

      const index = Number(
        interaction.customId.slice("bingo_".length)
      );

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index > 24
      ) {
        await interaction.deferUpdate();
        return;
      }

      // Center free space stays marked.
      if (index === 12) {
        await interaction.deferUpdate();
        return;
      }

      // Toggle square.
      if (state.marked.has(index)) {
        state.marked.delete(index);
      } else {
        state.marked.add(index);
      }

      const bingo = hasBingo(state.marked);

      const header =
        `${gameEmojis[state.game]} ` +
        `**${gameNames[state.game]} — STREAM BINGO**\n` +
        (
          bingo
            ? "\n🎉 **BINGO! YOU GOT FIVE IN A ROW!** 🎉\n"
            : ""
        );

      await interaction.update({
        content:
          header +
          "*Tap a numbered button to mark or unmark a square.*\n\n" +
          formatCard(state.card, state.marked),
        components: makeButtons(state.marked)
      });

      // Announce only the first completed bingo.
      if (bingo && !state.bingoAnnounced) {
        state.bingoAnnounced = true;

        try {
          await interaction.channel.send(
            `🎉 **BINGO!** ${interaction.user} ` +
            "completed a Stream Bingo line during " +
            `**${gameNames[state.game]}**!`
          );
        } catch (error) {
          console.error(
            "Couldn't post bingo announcement:",
            error
          );
        }
      }

      return;
    }

  } catch (error) {
    console.error("Interaction error:", error);

    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content:
            "Something went wrong with Stream Bingo. Try again!",
          flags: MessageFlags.Ephemeral
        });
      } catch (replyError) {
        console.error(
          "Couldn't send error response:",
          replyError
        );
      }
    }
  }
});

// ======================================================
// LOGIN
// ======================================================

client.login(TOKEN);
