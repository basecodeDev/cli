const shell = require("shelljs");
const log = require('log-beautify');
const fs = require('fs')
const pathNow = process.cwd()

const reset = async () => {
    if(await fs.existsSync(pathNow + '/node_modules/construct/bin/dbReset.js')) {
        shell.exec("node "+pathNow+"/node_modules/construct/bin/dbReset.js");
    } else {
        log.error('Construct is not installed');
    }
}

const migrate = async () => {
    if(await fs.existsSync(pathNow + '/node_modules/construct/bin/runMigration.js')) {
        shell.exec("node "+pathNow+"/node_modules/construct/bin/runMigration.js");
    } else {
        log.error('Construct is not installed');
    }
}

const seed = async () => {
    if(await fs.existsSync(pathNow + '/node_modules/construct/bin/runSeed.js')) {
        shell.exec("node "+pathNow+"/node_modules/construct/bin/runSeed.js");
    } else {
        log.error('Construct is not installed');
    }
}

module.exports = {
    reset,
    migrate,
    seed
}