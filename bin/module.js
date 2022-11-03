const shell = require("shelljs");
const log = require('log-beautify');
const prompt = require("prompt-sync")({ sigint: true });
const fs = require('fs');
const pathNow = process.cwd()

const create = async (args) => {
    if(args.directory) {
        if(args.database) {
            if(args.modulename) {
                if(await fs.existsSync('node_modules/construct/bin/createModule.js')) {
                    shell.exec("node node_modules/construct/bin/createModule.js "+args.directory+" "+args.database+" "+args.modulename);
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
                shell.exec("node node_modules/construct/bin/deleteModule.js " + args.directory);
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

const add = async () => {

    const moduleName = prompt("Module name:");
    const repositories = prompt("Module repo name (basecodeDev/Base) :");
    
    if(await fs.existsSync(pathNow + '/app/modules')) {

        let installedPackages = []

        if(await fs.existsSync(pathNow + '/app/install.json')) {
            installedPackages = require(pathNow + '/app/install.json');
            installedPackages = typeof installedPackages == 'object' ? installedPackages : [];
        }

        try {
            // const response = await axios.get('https://github.com/' + repositories);
            // console.log(response);
            if(!installedPackages.find(n => n.name == moduleName)) {
                
                installedPackages.push({
                    name: moduleName,
                    repo: repositories
                })

                fs.writeFileSync(pathNow + '/app/install.json', JSON.stringify(installedPackages, null, 4));

                if(!await fs.existsSync(pathNow + '/app/modules/'+moduleName)) {
                    shell.exec("git clone git@github.com:"+repositories+".git "+pathNow+"/app/modules/"+moduleName);
                }

                log.success('Module installed');

            } else {
                log.error('Module already installed');
            }

        } catch (error) {
            log.error('Module repo url not found');
            log.error(error)
        }

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
                shell.exec("git clone git@github.com:"+element.repo+".git "+pathNow+"/app/modules/"+element.name);
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
    create,
    del,
    add,
    install,
    update
}