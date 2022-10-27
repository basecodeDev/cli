const shell = require("shelljs");
const log = require('log-beautify');
const fs = require('fs');

const create = async (args) => {
    if(await fs.existsSync('node_modules/construct/bin/createModule.js')) {
        shell.exec("node node_modules/construct/bin/createModule.js");
    } else {
        log.error('Construct is not installed');
    }
}

module.exports = {
    create
}