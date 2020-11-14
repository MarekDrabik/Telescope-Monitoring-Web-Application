const express = require('express')
const fs = require('fs')
process.env.NODE_CONFIG_DIR = __dirname + "/config";
const config = require('config');
const https = require('https');
//just test that file exists
fs.readFile(__dirname + '/telemetry-settings.json', 'utf8', function (err, data) {
  if (err) {
    throw new Error('Couldnt read/find file required file "telemetry-settings.json".', err)
  }
});
const historyRoute = require('./routes/history')
const commandRoute = require('./routes/command')
const authRouter = require('./routes/auth');
const cors = require('cors'); 
const Spacecraft = require("./utils/spacecraft")
const SpacecraftEndpoint = require("./controllers/spacecraft.endpoint")
const RealtimeServer = require('./servers/realtime.server')
const SpacecraftServer = require('./servers/spacecraft.server')
const sequelize = require('./models/telemetry.seqModel')
const telemetryModel = require('./models/telemetry.model')
const authentication = require("./utils/authentication")
const cookieParser = require('cookie-parser');

const shared = require('./utils/shared')
const app = express()
const bodyParser = require ('body-parser')
const spacecraft = new Spacecraft()
const spacecraftEndpoint = new SpacecraftEndpoint()
const realtimeServer = new RealtimeServer()
const spacecraftServer = new SpacecraftServer()

//public server:
const privateKey = fs.readFileSync(__dirname + '/encryption/key.pem', 'utf-8');
const certificate = fs.readFileSync(__dirname + '/encryption/cert.pem', 'utf-8');
const passphrase = config.get('passphrase');
const port = config.get('port');
//app.use(morgan('combined'));

//start generating fake telemetry and notify telemetryReceiver on every point
shared.initializeImages()
spacecraft.startGenerating(spacecraftEndpoint.onMeasurementsReceived)
//port = 5000;

app.use(cookieParser());
app.use(bodyParser.json())
app.use(cors()); 
app.use(express.static(__dirname + '/public'));

app.use('/', (req, res, next) => { 
	let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
	console.log('REQ:', "\nIP: ", ip, "\nURL: ", req.url, "\nBROWSER: ", req.headers['user-agent'], "\n"); 
	next() 
})

app.use('/auth', authRouter);

//app.use('/', checkIsAuthenticated) //any request appart of /auth POST
app.use('/settings', authentication.checkIsAuthenticated, (req, res, next) => {
  res.send(telemetryModel.getTelemetrySettings())
})
app.use('/command', authentication.checkIsAuthenticated, commandRoute)
app.use('/history', authentication.checkIsAuthenticated, historyRoute)
app.use((req, res, next) => {
  res.redirect(301, '/index.html') //on not-found, redirect to app
})

sequelize.sync().then(result => {

  //https server:
  const httpsPort = port;
  const sslOptions = {
    key: privateKey,
    cert: certificate,
    passphrase: passphrase
  };
  const httpsServer = https.createServer(sslOptions, app).listen(httpsPort, () => {console.log(`Https webserver for BALON MONITORING on port: ${httpsPort}, mapped to 5444 on router.`)});

  realtimeServer.listenOn(httpsServer)

})
.catch(err => {
  console.log("seq sync error", err)
})
