const express = require('express');
const noblox = require('noblox.js');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON
app.use(express.json());

const API_SECRET_KEY = "RankParadizmBootAavyx1102";
const GROUP_ID = 35787449;

// --- Connexion noblox.js ---
async function initNoblox() {
	try {
		await noblox.setCookie(process.env.ROBLOX_COOKIE);
		const currentUser = await noblox.getCurrentUser();
		console.log(`[Noblox] Connecté en tant que ${currentUser.UserName}`);
	} catch (err) {
		console.error("[Noblox] Erreur de connexion :", err.message);
	}
}

// --- Endpoint rank-up ---
app.post('/rank-up', async (req, res) => {
	// Vérification de la clé API
	const apiKey = req.headers['x-api-key'];
	if (apiKey !== API_SECRET_KEY) {
		return res.status(403).json({ error: "Clé API invalide" });
	}

	const { userId, username, newRankId } = req.body;
	if (!userId || !newRankId) {
		return res.status(400).json({ error: "userId et newRankId requis" });
	}

	try {
		await noblox.setRank(GROUP_ID, userId, newRankId);
		console.log(`[Paradiz] ${username} (${userId}) promu au rang ${newRankId}`);
		return res.status(200).json({ success: true, message: `Rang mis à jour pour ${username}` });
	} catch (err) {
		console.error(`[Paradiz] Erreur promotion ${username} :`, err.message);
		return res.status(500).json({ success: false, error: err.message });
	}
});

// --- Monitoring ---
app.get('/', (req, res) => {
	res.send('Bot Paradiz est en ligne !');
});

app.listen(port, () => {
	console.log(`Serveur actif sur le port ${port}`);
	initNoblox();
});

// --- Bot Discord ---
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});

client.once('ready', () => {
	console.log(`Connecté en tant que ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
