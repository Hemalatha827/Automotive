const { google } = require("googleapis");

exports.googleSheetAction = async (req, res) => {
   
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const client = await auth.getClient();

    // Instance of Google Sheets API
    const googleSheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "11Y5n9nKKr-WpiSivfHCaj2D7tLlVB8gJjWBpF0HupAc";


    // Read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "cars!B3:B8",
    });

    console.log(getRows);

    // Write row(s) to spreadsheet
    // await googleSheets.spreadsheets.values.append({
    //     auth,
    //     spreadsheetId,
    //     range: "Sheet1!A:B",
    //     valueInputOption: "USER_ENTERED",
    //     resource: {
    //         values: [[request, name]],
    //     },
    // });


    res.json({
        "success": true
    });
};