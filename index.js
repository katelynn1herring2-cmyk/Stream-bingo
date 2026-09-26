const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  AttachmentBuilder
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

// =========================
// STREAM EVENTS
// =========================

const streamEvents = [
  "Chat bullies Oshay",
  "Oshay bullies chat back",
  "Game crashes",
  "Somebody says “good boy”",
  "Accidental scream",
  "hest_s loses all his points",
  "hest_s goes all-in",
  "Chat encourages hest_s to gamble",
  "Oshay gets distracted by chat",
  "Chat derails the stream",
  "Oshay forgets what he was saying",
  "Accidental innuendo",
  "Intentional innuendo",
  "Someone joins at the worst possible moment",
  "Oshay argues with chat",
  "Chat collectively says “NO”",
  "Someone tells Oshay to hydrate",
  "Food discussion interrupts gameplay",
  "Oshay gets distracted IRL",
  "Chat argues about something unrelated",
  "Oshay blames chat",
  "It actually IS chat’s fault",
  "Technical difficulties",
  "Kate bullies Oshay",
  "Oshay bullies Kate",
  "Kate gets blamed for something",
  "It actually WAS Kate",
  "Newcomer asks what the fuck is happening",
  "Inside joke requires a lore explanation",
  "New inside joke is born",
  "Someone says “clip that”",
  "Oshay says “DON’T clip that”",
  "It gets clipped anyway",
  "New server emoji material appears",
  "Oshay regrets giving chat power",
  "Chat demands a poll",
  "Poll makes everything worse",
  "Stream breaks while Oshay talks shit",
  "Chat predicts the disaster",
  "Two bingo events happen simultaneously",
  "Three bingo events happen within a minute",
  "Tech issue fixes itself",
  "Ancient server joke resurfaces",
  "Oshay says something that silences chat",
  "Chat is genuinely nice to Oshay",
  "Oshay admits chat was right",
  "Somebody makes an unspellable noise"
];

// =========================
// GENERAL GAME EVENTS
// =========================

const generalEvents = [
  "Oshay dies stupidly",
  "Oshay forgets what he was doing",
  "Oshay misses something obvious",
  "Oshay argues with the game",
  "Oshay ignores instructions",
  "Oshay asks something the game just answered",
  "“I know what I’m doing”",
  "He did not know what he was doing",
  "Oshay dies to fall damage",
  "“I’ll be fine” → immediate disaster",
  "Oshay survives something impossible",
  "Oshay celebrates too early",
  "Accidental friendly fire",
  "Oshay completely whiffs an easy action",
  "Oshay is unexpectedly cracked",
  "Oshay blames lag",
  "Oshay blames the controller",
  "Game physics commits a crime",
  "Oshay exploits a glitch",
  "Oshay gets lost WITH a map",
  "Oshay walks past the objective",
  "Inventory management takes forever",
  "Oshay hoards something “for later”",
  "The hoarded item never gets used",
  "Panic button-mashing",
  "Violence chosen over stealth",
  "Stealth attempt immediately fails",
  "“One more try”",
  "Fake rage quit",
  "Oshay insults the difficulty",
  "Tutorial gets ignored",
  "Oshay wins through dumb luck",
  "Game has perfect comedic timing",
  "NPC accidentally roasts Oshay",
  "Oshay predicts something by accident",
  "Oshay creates a problem fixing another problem",
  "Oshay discovers something embarrassingly late",
  "“What’s the worst that could happen?” → disaster",
  "Oshay hits the wrong button during a fight",
  "Oshay wastes a valuable resource",
  "Chat sees the threat before Oshay",
  "Oshay talks shit → immediate punishment",
  "Oshay somehow survives on basically no health",
  "Oshay dies immediately after surviving something worse",
  "Oshay gets betrayed by his own trap/strategy",
  "Oshay confidently goes the wrong way",
  "Oshay spends forever searching an empty room",
  "Oshay misses something directly in front of him"
];

// =========================
// DEAD BY DAYLIGHT
// =========================

const dbdEvents = [
  "Oshay gets jumpscared by the killer",
  "Oshay runs directly into the killer",
  "Oshay accidentally brings the killer to someone else",
  "Pallet gets wasted",
  "Oshay gets hit immediately after talking shit",
  "Skill check gets absolutely butchered",
  "Generator explodes at the worst possible time",
  "Oshay gets tunneled",
  "Oshay gets camped",
  "Teammate makes an incomprehensible decision",
  "Oshay attempts a heroic save and regrets it",
  "Oshay gets left on hook for an offensive amount of time",
  "Killer appears immediately after Oshay says they’re gone",
  "Oshay hides somewhere incredibly obvious",
  "Exit gate chaos",
  "Someone gets sacrificed while everyone else fucks around",
  "Oshay accidentally sandbags someone",
  "Someone accidentally sandbags Oshay",
  "Oshay loses the killer and immediately finds them again",
  "Killer walks directly past Oshay somehow",
  "Oshay screams at a surprise hit",
  "“WHY ARE THEY ON ME?!”",
  "Oshay starts healing at a terrible time",
  "Teammate refuses to leave",
  "Everyone should have just fucking left"
];

// =========================
// THE LAST OF US
// =========================

const tlouEvents = [
  "Oshay wastes ammo",
  "Oshay refuses to use ammo because “I might need it later”",
  "Oshay desperately needs the ammo he refused to use",
  "Oshay misses a shot at point-blank range",
  "Stealth goes to shit immediately",
  "Oshay accidentally alerts the entire area",
  "Clicker-related panic",
  "Oshay hears a noise and immediately stops moving",
  "Oshay checks a room that obviously contains something horrible",
  "Oshay walks past supplies",
  "Chat spots supplies before Oshay",
  "Inventory is full when Oshay finally finds something useful",
  "Oshay crafts the wrong thing",
  "Oshay uses a valuable item on something stupid",
  "Oshay tries to melee something he absolutely should not melee",
  "Oshay gets grabbed from behind",
  "Oshay forgets Listen Mode exists",
  "Oshay spends way too long looting",
  "“There’s definitely something in here”",
  "There was, in fact, something in there",
  "“I don’t like this room”",
  "Oshay walks directly into an obvious ambush",
  "Oshay successfully stealths something by pure accident",
  "NPC companion scares Oshay",
  "Oshay attacks something that wasn’t actually a threat",
  "Oshay panic-heals",
  "Oshay reloads at the worst possible time",
  "Oshay forgets to reload",
  "Oshay runs out of ammo mid-fight",
  "Oshay chooses violence when stealth was working"
];

// =========================
// RAFT
// =========================

const raftEvents = [
  "Oshay gets bitten by the shark",
  "The shark attacks at the worst possible time",
  "Oshay forgets the shark exists",
  "Oshay falls off the raft",
  "Oshay gets left behind by the raft",
  "Oshay panic-swims back to the raft",
  "Oshay nearly drowns",
  "Oshay runs out of oxygen while looting",
  "Oshay stays underwater way too long",
  "Oshay gets distracted while underwater",
  "Oshay misses an obvious resource",
  "Oshay misses the barrel",
  "Oshay throws the hook and completely whiffs",
  "Oshay accidentally hooks the wrong thing",
  "Oshay complains about the hook",
  "Oshay falls into the water trying to grab something",
  "Oshay uses the last of an important resource",
  "Oshay needs something immediately after using the last one",
  "Oshay forgets what resource he was looking for",
  "Oshay hoards a ridiculous amount of something",
  "Oshay complains about inventory space",
  "Oshay spends forever reorganizing storage",
  "Oshay can't remember which chest something is in",
  "Oshay opens the same chest multiple times looking for something",
  "Oshay puts something in the wrong chest",
  "Someone steals Oshay's food",
  "Oshay steals someone else's food",
  "Oshay forgets to eat",
  "Oshay forgets to drink",
  "Oshay starts starving mid-task",
  "Oshay starts dying of thirst mid-task",
  "Oshay eats/drinks at the absolute last second",
  "Oshay forgets to refill the water purifier",
  "Oshay forgets food is cooking",
  "Food burns/is forgotten about",
  "Oshay plants something and forgets about it",
  "Seagull attacks the crops",
  "Oshay declares war on a seagull",
  "Oshay gets distracted fighting a seagull",
  "Oshay accidentally destroys part of the raft",
  "Oshay builds something in the wrong place",
  "Oshay immediately regrets a building decision",
  "Raft renovation becomes a whole project",
  "Oshay runs out of materials mid-build",
  "Oshay builds something completely unnecessary",
  "Oshay argues about raft organization",
  "Someone rearranges something Oshay wanted left alone",
  "The shark eats an important part of the raft",
  "Oshay is too late to stop the shark",
  "Oshay attacks the shark out of pure spite",
  "The shark wins the argument",
  "Oshay kills the shark",
  "Everyone immediately starts harvesting the shark",
  "Shark dinner",
  "Oshay jumps into the water immediately after the shark dies",
  "The shark respawns at the worst possible time",
  "Oshay gets attacked by wildlife",
  "Oshay picks a fight with wildlife unnecessarily",
  "Oshay underestimates an enemy",
  "Oshay runs away from an enemy he confidently challenged",
  "Oshay gets jumpscared by an animal",
  "Oshay gets hit while trying to loot",
  "Oshay gets lost on an island",
  "Oshay can't find the raft",
  "Oshay goes the wrong direction on an island",
  "Oshay walks past the thing he was looking for",
  "Chat spots something before Oshay",
  "Oshay leaves the island and realizes he forgot something",
  "Oshay has to go BACK onto the island",
  "Oshay gets separated from everyone",
  "Someone asks “Where's Oshay?”",
  "Oshay asks “Where are you guys?”",
  "Nobody knows where anybody is",
  "Oshay finds something useful completely by accident",
  "Oshay falls from somewhere he absolutely shouldn't have",
  "Oshay attempts questionable parkour",
  "Questionable parkour somehow works",
  "Questionable parkour absolutely does not work",
  "Oshay misses a jump repeatedly",
  "Oshay gets stuck somewhere stupid",
  "Oshay doesn't have enough planks",
  "Oshay doesn't have enough plastic",
  "Oshay doesn't have enough rope",
  "Oshay somehow has way too much of something useless",
  "Oshay forgets the anchor",
  "Oshay drops anchor at a terrible time",
  "Oshay forgets the anchor is down",
  "Oshay tries to sail with the anchor down",
  "Raft goes the wrong direction",
  "Oshay argues with the wind",
  "Oshay argues with the sail",
  "Oshay argues with the navigation",
  "Oshay realizes they've been sailing the wrong way",
  "Someone falls overboard while the raft is moving",
  "“WAIT FOR ME!”",
  "Rescue mission for someone who fell overboard",
  "Oshay causes a completely avoidable emergency",
  "Multiple problems happen at once",
  "Everyone starts yelling different instructions",
  "Nobody is doing the thing they thought someone else was doing",
  "Simple task turns into a group disaster",
  "Oshay says “we need to be organized”",
  "Organization lasts less than five minutes"
];

const gamePools = {
  dbd: dbdEvents,
  tlou: tlouEvents,
  raft: raftEvents
};

const gameNames = {
  dbd: "DEAD BY DAYLIGHT",
  tlou: "THE LAST OF US",
  raft: "RAFT"
};

// Fisher-Yates shuffle — better than sort(Math.random)
function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function pickRandom(array, amount) {
  return shuffle(array).slice(0, amount);
}

function makeCard(game) {
  const events = [
    ...pickRandom(streamEvents, 8),
    ...pickRandom(generalEvents, 8),
    ...pickRandom(gamePools[game], 8)
  ];

  const shuffled = shuffle(events);

  // Center square = index 12 on a 25-square board.
  shuffled.splice(12, 0, "⭐ OSHAY MOMENT ⭐");

  return shuffled;
}

// Makes a readable 5x5 text grid for Discord.
function formatCard(card) {
  let output = "";

  for (let row = 0; row < 5; row++) {
    output += `**ROW ${row + 1}**\n`;

    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      output += `⬜ **${index + 1}.** ${card[index]}\n`;
    }

    output += "\n";
  }

  return output;
}

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

    await interaction.reply({
      content:
        `🎮 **${gameNames[game]} — STREAM BINGO**\n` +
        `*Only you can see your randomized card.*\n\n` +
        formatCard(card),
      ephemeral: true
    });
  }
});

client.login(TOKEN);
