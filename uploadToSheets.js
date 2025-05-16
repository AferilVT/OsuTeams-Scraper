const fs = require('fs');
const { google } = require('googleapis');


const rawData = fs.readFileSync('osu_teams.json');
const teamData = JSON.parse(rawData);


const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function uploadToSheets() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1HibMJqqyH5cUhrX9GRoiKANPoflK7hZAqBQLjcJWQLM"; 
    const sheetName = "Osu Teams";

    try {
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:A`, 
        });

        let lastRow = response.data.values ? response.data.values.length : 1; 
        console.log(`📌 Last used row: ${lastRow}`);

        
        const values = teamData.map(t => [
            t.id,
            t.teamName,
            t.teamTag,
            `=HYPERLINK("https://osu.ppy.sh/teams/${t.id}", "View Team")`
        ]);

        const totalRowsNeeded = lastRow + values.length;
        const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
        const sheet = sheetInfo.data.sheets.find(s => s.properties.title === sheetName);
        const currentRowCount = sheet.properties.gridProperties.rowCount;

        if (totalRowsNeeded > currentRowCount) {
            console.log(`📢 Expanding sheet from ${currentRowCount} to ${totalRowsNeeded} rows`);
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: {
                    requests: [{
                        updateSheetProperties: {
                            properties: {
                                sheetId: sheet.properties.sheetId,
                                gridProperties: { rowCount: totalRowsNeeded },
                            },
                            fields: "gridProperties.rowCount",
                        }
                    }]
                }
            });
        }

        
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A${lastRow + 1}`,
            valueInputOption: "USER_ENTERED",
            resource: { values },
        });

        console.log("✅ Data appended successfully!");
    } catch (error) {
        console.error("❌ Error updating sheet:", error);
    }
}

uploadToSheets().catch(console.error);
