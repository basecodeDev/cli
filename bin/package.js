const shell = require("shelljs");
const log = require('log-beautify');
const prompt = require("prompt-sync")({ sigint: true });
const fs = require('fs');
const pathNow = process.cwd()

const add = async () => {

    const moduleName = prompt("Module name:");
    const repositories = prompt("Module repo url:");
    
    if(await fs.existsSync(pathNow + '/app/modules')) {

        let installedPackages = []

        if(await fs.existsSync(pathNow + '/app/install.json')) {
            installedPackages = require(pathNow + '/app/install.json');
        }

        installedPackages.push({
            name: moduleName,
            repo: repositories
        })

        fs.writeFileSync(pathNow + '/app/install.json', JSON.stringify(installedPackages, null, 4));

        if(!await fs.existsSync(pathNow + '/app/modules/'+moduleName)) {
            shell.exec("git clone "+repositories+" "+pathNow+"/app/modules/"+moduleName);
        }

        log.success('Module installed');

    } else {
        log.error(pathNow + '/app/modules directory not found');
    }

}

const install = async (args) => {

    if(await fs.existsSync(pathNow + '/app/install.json')) {

        const installedPackages = require(pathNow + '/app/install.json');

        for (let i = 0; i < installedPackages.length; i++) {
            const element = installedPackages[i];
            if(!await fs.existsSync(pathNow + '/app/modules/'+element.name)) {
                shell.exec("git clone "+element.repo+" "+pathNow+"/app/modules/"+element.name);
            }
        }

        log.success('Modules installed');

    } else {
        log.error(pathNow + '/app/install.json file not found');
    }

}

const update = async () => {

    if(await fs.existsSync(pathNow + '/app/install.json')) {

        const installedPackages = require(pathNow + '/app/install.json');

        for (let i = 0; i < installedPackages.length; i++) {
            const element = installedPackages[i];

            if(await fs.existsSync(pathNow + '/app/modules/'+element.name)) {
                shell.exec("cd "+pathNow+"/app/modules/"+element.name+" && git pull");
            }
        }

        log.success('Modules updated');

    } else {
        log.error(pathNow + 'app/install.json file not found');
    }

}

module.exports = {
    add,
    install,
    update
}