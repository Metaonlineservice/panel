require("dotenv").config();
const { google } = require("googleapis");

async function testConnection() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    console.log("✅ اتصال موفق بود!");
    console.log("نام فایل:", response.data.properties.title);

  } catch (error) {
    console.error("❌ خطا در اتصال:");
    console.error(error.message);
  }
}

testConnection();