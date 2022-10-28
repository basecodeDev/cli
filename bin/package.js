const shell = require("shelljs");
const log = require('log-beautify');
const prompt = require("prompt-sync")({ sigint: true });
const fs = require('fs');

const add = async () => {

    const moduleName = prompt("Module name:");
    const repositories = prompt("Module repo url:");

    if(await fs.existsSync('./app/modules')) {

        let installedPackages = []

        if(await fs.existsSync('./app/install.json')) {
            installedPackages = require('./app/install.json');
        }

        installedPackages.push({
            name: moduleName,
            repo: repositories
        })

        fs.writeFileSync('./app/install.json', JSON.stringify(installedPackages, null, 4));

        if(!await fs.existsSync('./app/modules/'+moduleName)) {
            shell.exec("git clone "+repositories+" ./app/modules/"+moduleName);
        }

        log.success('Module installed');

    } else {
        log.error('app/modules directory not found');
    }

}

const install = async (args) => {

    if(await fs.existsSync('./app/install.json')) {

        const installedPackages = require('./app/install.json');

        for (let i = 0; i < installedPackages.length; i++) {
            const element = installedPackages[i];
            if(!await fs.existsSync('./app/modules/'+element.name)) {
                shell.exec("git clone "+element.repo+" ./app/modules/"+element.name);
            }
        }

        log.success('Modules installed');

    } else {
        log.error('app/install.json file not found');
    }

}

const update = async () => {

    if(await fs.existsSync('./app/install.json')) {

        const installedPackages = require('./app/install.json');

        for (let i = 0; i < installedPackages.length; i++) {
            const element = installedPackages[i];

            if(await fs.existsSync('./app/modules/'+element.name)) {
                shell.exec("cd ./app/modules/"+element.name+" && git pull");
            }
        }

        log.success('Modules updated');

    } else {
        log.error('app/install.json file not found');
    }

}

module.exports = {
    add,
    install,
    update
}