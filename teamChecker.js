const puppeteer = require('puppeteer');

(async () => {
    const baseUrl = 'https://osu.ppy.sh/teams/';
    let lower = 1, upper = 1000000; 
    let lastValidId = null;

    const browser = await puppeteer.launch({headless: false});
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

    console.log(`Total osu!Teams: ${lastValidId}`);
    console.log(`Last team URL: ${baseUrl}${lastValidId}`);

    await browser.close();
})();
