const shell = require("shelljs");
const log = require('log-beautify');
const prompt = require("prompt-sync")({ sigint: true });
const fs = require('fs');
const pathNow = process.cwd()

const create = async (args) => {
    if(args.directory) {
        if(args.database) {
            if(args.modulename) {
                if(await fs.existsSync(pathNow + '/node_modules/construct/bin/createModule.js')) {
                    shell.exec("node "+pathNow+"/node_modules/construct/bin/createModule.js "+args.directory+" "+args.database+" "+args.modulename);
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
            if(await fs.existsSync(pathNow + '/node_modules/construct/bin/deleteModule.js')) {
                shell.exec("node "+pathNow+"/node_modules/construct/bin/deleteModule.js " + args.directory);
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