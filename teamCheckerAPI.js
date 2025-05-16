const axios = require('axios');
require('dotenv').config();

const CLIENT_ID = process.env.OSU_CLIENT_ID;
const CLIENT_SECRET = process.env.OSU_CLIENT_SECRET;
const TOKEN_URL = 'https://osu.ppy.sh/oauth/token';
let accessToken = '';

async function getAccessToken() {
    console.log('Fetching osu! API access token...');
    const response = await axios.post(TOKEN_URL, {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'public'
    });
    accessToken = response.data.access_token;
    console.log('Access token acquired.');
}

async function checkTeamExists(teamId) {
    try {
        console.log(`Checking team ID: ${teamId}`);
        const response = await axios.get(`https://osu.ppy.sh/teams/${teamId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log(`Team ID ${teamId} exists.`);
        return response.status === 200;
    } catch (error) {
        console.log(`Team ID ${teamId} does not exist.`);
        return false;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    await getAccessToken();
    
    let currentId = 11000; // Start from a high estimate
    let lastValidId = null;
    
    while (currentId > 0) {
        if (await checkTeamExists(currentId)) {
            lastValidId = currentId;
            break; // Stop once we find the highest valid ID
        }
        console.log(`Waiting 1 second before next request...`);
        //await delay(1000); // Add 1-second cooldown to avoid rate limit
        currentId--;
    }
    
    console.log(`Highest valid osu! Team ID found: ${lastValidId}`);
    if (lastValidId) {
        console.log(`URL: https://osu.ppy.sh/teams/${lastValidId}`);
    }
})();
