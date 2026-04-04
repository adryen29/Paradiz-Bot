const express = require('express');
const noblox = require('noblox.js');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const API_SECRET_KEY = "RankParadizmBootAavyx1102";
const GROUP_ID = 35787449;

// Historique des dernières requêtes
const recentLogs = [];
function addLog(type, message) {
	const entry = {
		type,
		message,
		time: new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })
	};
	recentLogs.unshift(entry);
	if (recentLogs.length > 20) recentLogs.pop();
	console.log(`[${type}] ${message}`);
}

// --- Page de status ---
app.get('/', (req, res) => {
	const rows = recentLogs.map(log => `
		<tr style="border-bottom:1px solid #333;">
			<td style="padding:8px;color:${log.type === 'SUCCESS' ? '#4caf50' : log.type === 'ERROR' ? '#f44336' : '#2196f3'}">${log.type}</td>
			<td style="padding:8px;">${log.time}</td>
			<td style="padding:8px;">${log.message}</td>
		</tr>
	`).join('');

	res.send(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>Paradiz Ranker</title>
			<meta http-equiv="refresh" content="10">
			<style>
				body { background:#1a1a2e; color:#eee; font-family:Arial,sans-serif; padding:20px; }
				h1 { color:#e94560; }
				table { width:100%; border-collapse:collapse; background:#16213e; border-radius:8px; overflow:hidden; }
				th { background:#0f3460; padding:10px; text-align:left; }
				.status { display:inline-block; width:12px; height:12px; background:#4caf50; border-radius:50%; margin-right:8px; }
			</style>
		</head>
		<body>
			<h1>🎮 Paradiz Ranker</h1>
			<p><span class="status"></span>Bot en ligne</p>
			<h2>Dernières requêtes</h2>
			<table>
				<tr>
					<th>Statut</th>
					<th>Heure</th>
					<th>Message</th>
				</tr>
				${rows.length > 0 ? rows : '<tr><td colspan="3" style="padding:10px;text-align:center;">Aucune requête reçue</td></tr>'}
			</table>
		</body>
		</html>
	`);
});

// --- Connexion noblox.js ---
async function initNoblox() {
	try {
		await noblox.setCookie(process.env.ROBLOX_COOKIE);
		const currentUser = await noblox.getCurrentUser();
		addLog("INFO", `Noblox connecté en tant que ${currentUser.UserName}`);
	} catch (err) {
		addLog("ERROR", `Erreur connexion Noblox : ${err.message}`);
	}
}

// --- Endpoint rank-up ---
app.post('/rank-up', async (req, res) => {
	const apiKey = req.headers['x-api-key'];
	if (apiKey !== API_SECRET_KEY) {
		addLog("ERROR", "Clé API invalide — requête rejetée");
		return res.status(403).json({ error: "Clé API invalide" });
	}

	const { userId, username, newRankId } = req.body;
	if (!userId || !newRankId) {
		addLog("ERROR", "Requête invalide — userId ou newRankId manquant");
		return res.status(400).json({ error: "userId et newRankId requis" });
	}

	addLog("INFO", `Promotion demandée pour ${username} (${userId}) → rang ${newRankId}`);

	try {
		await noblox.setRank(GROUP_ID, userId, newRankId);
		addLog("SUCCESS", `${username} promu au rang ${newRankId} avec succès`);
		return res.status(200).json({ success: true });
	} catch (err) {
		addLog("ERROR", `Échec promotion ${username} : ${err.message}`);
		return res.status(500).json({ success: false, error: err.message });
	}
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
	addLog("INFO", `Discord connecté : ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
