const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const fs = require('fs');
const path = require('path');


module.exports = function LaunchModule(altospath) {

    var ospath = process.env.PORTABLE_EXECUTABLE_DIR || __dirname;

    if (process.platform !== 'win32') ospath = altospath;

    const appDir = path.join(ospath, '/NTMLauncher');
    const gameDir = path.join(appDir, '/netaskmodded');

    if (!fs.existsSync(appDir)){
        fs.mkdirSync(appDir);
    }

    loggerFunction = () => {};

    serverdata = {
        ip: '',
        port: ''
    }

    this.gameDirectory = gameDir;
    this.appDirectory = appDir;
    this.pathModule = path;

    this.launch = function(nickname, ram, connect, callback) {
        let opts = {
            clientPackage: null,
            // For production launchers, I recommend not passing 
            // the getAuth function through the authorization field and instead
            // handling authentication outside before you initialize
            // MCLC so you can handle auth based errors and validation!
            authorization: Authenticator.getAuth(nickname),
            root: gameDir,
            version: {
                number: "1.12.2",
                type: "release"
            },
            memory: {
                max: ram,
                min: ram
            },
            forge: gameDir + "/forge.jar"
        }
        
        if (serverdata.ip != serverdata.port && connect) {
            opts = {...opts, server: {
                host: serverdata.ip,
                port: serverdata.port
            }}
        }

        launcher.launch(opts);
        launcher.on('close', (e) => {callback({type: 'close', task: 0, total: 1})})
        launcher.on('progress', callback);
        launcher.on('debug', (e) => this.log(e));
        launcher.on('data', (e) => this.log(e));
    }
    this.log = function (data) {
        loggerFunction(data);
    }
    this.setLogger = function(callback) {
        loggerFunction = callback;
    }
    this.checkForModpack = function() {
        return fs.existsSync(gameDir + "/forge.jar");
    }
    this.deleteModpack = function() {
        fs.rmdirSync(gameDir, {recursive: true});
    }
    this.savePrefs = function(nick, ram, connect) {
        fs.writeFileSync(path.join(appDir, '/prefs.json'), JSON.stringify({
            nickname: nick,
            ram: ram,
            connect: connect
        }), 'utf8');
    }
    this.readPrefs = function() {
        let r = {nickname: '', ram: '', connect: false};
        if (fs.existsSync(path.join(appDir, '/prefs.json'))) r = JSON.parse(fs.readFileSync(path.join(appDir, '/prefs.json'), 'utf8'));
        return r;
    }
    this.delFile = function(file) {
        fs.unlinkSync(file);
    }
    this.acceptServerIP = function(ip, port) {
        serverdata.ip = ip;
        serverdata.port = port;
    }
}