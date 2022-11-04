const shell = require("shelljs");
const log = require('log-beautify');
const fs = require('fs');
const pathNow = process.cwd()

const create = async (args) => {
    if(await fs.existsSync(pathNow + '/node_modules/construct/bin/createTools.js')) {
        shell.exec("node " + pathNow + "/node_modules/construct/bin/createTools.js");
    } else {
        log.error('Construct is not installed');
    }
}

module.exports = {
    create
}