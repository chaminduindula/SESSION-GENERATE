const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const pino = require("pino");
const {
    default: Maher_Zubair,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
} = require("maher-zubair-baileys");

const router = express.Router();

// Function to remove a file or directory recursively
async function removeFile(FilePath) {
    try {
        if (fs.existsSync(FilePath)) {
            fs.rmSync(FilePath, { recursive: true, force: true });
        }
    } catch (err) {
        console.error('Error removing file:', err);
    }
}

// Main route for pairing code
router.get('/', async (req, res) => {
    const id = makeid();  // Generate a unique session ID
    let num = req.query.number;  // Get the number from query params

    if (!num) {
        return res.status(400).send({ error: "No number provided" });
    }

    async function SIGMA_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);

        try {
            const Pair_Code_By_Maher_Zubair = Maher_Zubair({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: ["Chrome (Linux)", "", ""],
            });

            // Check if the user is registered
            if (!Pair_Code_By_Maher_Zubair.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, ''); // Sanitize the number

                // Request pairing code
                const code = await Pair_Code_By_Maher_Zubair.requestPairingCode(num);

                // Send the pairing code to the user
                if (!res.headersSent) {
                    return res.send({ code });
                }
            }

            // Save credentials and listen for connection updates
            Pair_Code_By_Maher_Zubair.ev.on('creds.update', saveCreds);
            Pair_Code_By_Maher_Zubair.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    // Delay to ensure all data is ready
                    await delay(5000);

                    // Read the credentials data
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    let b64data = Buffer.from(data).toString('base64');

                    // Send the session data to the user
                    const session = await Pair_Code_By_Maher_Zubair.sendMessage(Pair_Code_By_Maher_Zubair.user.id, { text: "" + b64data });

                    // Send a confirmation message with links and details
                    const SIGMA_MD_TEXT = `
┏━━━━━━━━━━━━━━
┃MASTER MD SESSION IS 
┃SUCCESSFULLY
┃CONNECTED ✅🔥
┗━━━━━━━━━━━━━━━
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❶ || Creator = Sahan / MASTER MIND_👨🏻‍💻
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❷ || WhattsApp Channel = https://whatsapp.com/channel/0029VaWWZa1G3R3c4TPADo0M
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❸ || Owner = https://wa.me/+94720797915
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❺ || INSTAGRAM = https://www.instagram.com/sahanmaduwantha2006?igsh=YzljYTk1ODg3Zg==
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❻ || FaceBook = https://www.facebook.com/profile.php?id=100089180711131
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴍʀ ꜱᴀʜᴀɴ ᴏꜰᴄ`;

                    await Pair_Code_By_Maher_Zubair.sendMessage(Pair_Code_By_Maher_Zubair.user.id, { text: SIGMA_MD_TEXT }, { quoted: session });

                    // Close the WebSocket connection and clean up the temporary files
                    await delay(100);
                    await Pair_Code_By_Maher_Zubair.ws.close();
                    return await removeFile(`./temp/${id}`);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    // Handle connection retries
                    await delay(10000);
                    SIGMA_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Service restarted due to error:", err);
            await removeFile(`./temp/${id}`);
            if (!res.headersSent) {
                return res.status(500).send({ code: "Service Unavailable" });
            }
        }
    }

    // Start the pairing process
    await SIGMA_MD_PAIR_CODE();
});

module.exports = router;
