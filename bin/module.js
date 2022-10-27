const shell = require("shelljs");
const log = require('log-beautify');
const prompt = require("prompt-sync")({ sigint: true });
const fs = require('fs');

const create = async (args) => {
    if(args.directory) {
        if(args.database) {
            if(args.modulename) {
                if(await fs.existsSync('node_modules/construct/bin/createModule.js')) {
                    shell.exec("node node_modules/construct/bin/createModule.js");
                } else {
                    log.error('Construct is not installed');
                }
            } else {
                log.error('Module name is required');
            }
        } else {
            log.error('Database name is required');
        }
    } else {
        log.error('Directory name is required');
    }
}

const del = async (args) => {
    if(args.directory) {

        const areYouSure = prompt("Are you sure about delete "+ args.directory +" module ? (y/n) ");

        if(areYouSure == 'y') {
            if(await fs.existsSync('node_modules/construct/bin/deleteModule.js')) {
                shell.exec("node node_modules/construct/bin/deleteModule.js");
            } else {
                log.error('Construct is not installed');
            }
        } else {
            log.info('Module not deleted');
        }
        
    } else {
        log.error('Directory name is required');
    }
}

module.exports = {
    create,
    del
}