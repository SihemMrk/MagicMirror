const fs = require("fs");
const electron = require("electron");
const readline = require("readline");
const { google } = require("googleapis");
const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron");
const os = require("os");

function createWindow() {
  // Cree la fenetre du navigateur.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    closable: true,
    // fullscreen: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.webContents.openDevTools();

  // and load the index.html of the app.
  win.loadFile("index.html");
}

app.on("ready", createWindow);

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  const calendar = google.calendar({ version: "v3", auth });
  var max = new Date();
  max.setTime(max.getTime() + 24 * 60 * 60 * 1000);
  max.setHours(0, 0, 0);
  console.log(max);
  calendar.events.list(
    {
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
      timeMax: max.toISOString()
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const events = res.data.items;
      comm.reply("agenda-data-ready", events);
    }
  );
}
var comm;
ipcMain.on("give-me-data", (event, arg) => {
  comm = event;
  fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), listEvents);
  });
});

function musicsList() {
  var path = "/Users/Sihem/projects/MagicMirror/musics";
  fs.readdir(path, function(err, items) {
    console.log(items);
    commBis.reply("music-data", items);
  });
}
var commBis;
ipcMain.on("wait-for-data", (event, arg) => {
  commBis = event;
  musicsList();
});

function checkPlatform() {
  var nodeListButton = document.getElementsByTagName("button").length;

  if (os.platform() === "darwin") {
    for (var i = 0; i < nodeListButton; i++) {
      document.getElementsByTagName("button")[i].style.display = "block";
    }
  } else {
    const Gpio = require("onoff").Gpio;
    const pushButton = new Gpio(17, "in", "both");
    pushButton.watch(function(err, value) {
      if (err) {
        console.error("There was an error", err);
        return;
      }
      console.log(value);
    });
    function unexportOnClose() {
      pushButton.unexport();
    }
    process.on(unexportOnClose);
  }
}

checkPlatform();
