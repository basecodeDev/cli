const shell = require("shelljs");
const log = require('log-beautify');
const fs = require('fs');

const create = async (args) => {
    if(await fs.existsSync('node_modules/construct/bin/createTools.js')) {
        shell.exec("node node_modules/construct/bin/createTools.js");
    } else {
        log.error('Construct is not installed');
    }
}

module.exports = {
    create
}