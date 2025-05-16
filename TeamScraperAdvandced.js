const puppeteer = require('puppeteer');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./credentials.json'); // Replace with your Google API credentials

const SPREADSHEET_ID = '1vVaqTVjNR09pkxb3Pqnvc_Kf6WuUVc4yw5KMregBUH4';
const CHECK_INTERVAL = 60000; // 1 minute

async function updateSpreadsheet(id, name, tag, url) {
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.auth.useServiceAccountAuth({$1});
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({ ID: id, Name: name, Tag: tag, URL: url });
}

async function checkOsuTeams() {
    const baseUrl = 'https://osu.ppy.sh/teams/';
    let lower = 1, upper = 10000;
    let lastValidId = null;
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    while (lower <= upper) {
        const mid = Math.floor((lower + upper) / 2);
        await page.goto(`${baseUrl}${mid}`, { waitUntil: 'domcontentloaded' });
        
        const isMissingPage = await page.evaluate(() => 
            document.querySelector('.header-v4__title')?.textContent.includes('missing'));

        if (!isMissingPage) {
            lastValidId = mid;
            lower = mid + 1;
        } else {
            upper = mid - 1;
        }
    }

    if (lastValidId) {
        await page.goto(`${baseUrl}${lastValidId}`, { waitUntil: 'domcontentloaded' });
        const { name, tag } = await page.evaluate(() => ({
            name: document.querySelector('.team-profile__name')?.textContent.trim() || 'Unknown',
            tag: document.querySelector('.team-profile__tag')?.textContent.trim() || 'Unknown',
        }));

        console.log(`Total osu!Teams: ${lastValidId}`);
        console.log(`Last team URL: ${baseUrl}${lastValidId}`);
        console.log(`Team Name: ${name}`);
        console.log(`Team Tag: ${tag}`);

        await updateSpreadsheet(lastValidId, name, tag, `${baseUrl}${lastValidId}`);
    }

    await browser.close();
    setTimeout(checkOsuTeams, CHECK_INTERVAL);
}

checkOsuTeams();