const express = require('express');
const noblox = require('noblox.js');
const { Client, GatewayIntentBits } = require('discord.js');

// --- SERVEUR POUR L'HÉBERGEMENT ---
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot Paradiz est en ligne !');
});

app.listen(port, () => {
  console.log(`Serveur de monitoring actif sur le port ${port}`);
});

// --- CONFIGURATION DU BOT DISCORD ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Ton code de ranking noblox et tes événements Discord vont ici...

client.once('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
