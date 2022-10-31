const shell = require("shelljs");
const log = require('log-beautify');
const fs = require('fs')
const prompt = require("prompt-sync")({ sigint: true });
const pathNow = process.cwd()

log.setSymbols({
    info: "⚙️"
});

const create = async (args = undefined) => {

    const project_name = args || 'construct';
    
    if(!await fs.existsSync(project_name)) {

        let baseDirectoryPath = project_name;

        const installPanel = prompt("Do you want to install ui panel ? (y/n) ");

        if(installPanel === 'y') {
            baseDirectoryPath = project_name + '/base';
            shell.exec("mkdir "+ project_name);
            shell.exec("cd " + project_name + " && git clone git@github.com:basecodeDev/Base.git base");
        } else {
            shell.exec("git clone git@github.com:basecodeDev/Base.git " + project_name);
        }

        shell.exec("npm install -g yarn");
        
        shell.exec("cd " + baseDirectoryPath + " && rm -rf .git && git init");
        shell.exec("cd " + baseDirectoryPath + " && mv app/config/index.sample.js app/config/index.js");
        log.success(baseDirectoryPath + ' project created successfully');
        log.info(baseDirectoryPath + '/app/config/index.js for configurations');
        log.info(baseDirectoryPath + '/app/modules for modules');
        log.info(baseDirectoryPath + '/app/tools for tools');
        log.info(baseDirectoryPath + '/app/migrations for custom migrations');
        log.info(baseDirectoryPath + '/app/tests for manual tests');
        log.info(baseDirectoryPath + '/app/install.json for third party modules');
        log.info('Yarn packages installing...')
        shell.exec("cd " + baseDirectoryPath + " && yarn");

        if(installPanel === 'y') {
            log.info('Installing ui panel...');
            shell.exec("cd " + project_name + " && mkdir "+ project_name + "/ui");
            shell.exec("cd " + project_name + "/ui && git clone git@github.com:basecodeDev/Panel-Frontend.git panel");
            shell.exec("cd " + project_name + "/ui/panel && yarn");
            log.info('Yarn packages installing...')
        }

        await editConfig(baseDirectoryPath + '/app/config/index.js');

    } else {
        log.error(project_name + ' project already exists');
    }
}

const editConfig = async (configFile = '') => {

    if(await fs.existsSync(pathNow + '/' + configFile)) {

        const installedMysql = prompt("Did you install mysql ? (y/n) ");

        if(installedMysql === 'y') {
            const createmysql = {
                host: '127.0.0.1',
                user: 'root',
                pass: '',
                port: 3306,
                database: 'construct' 
            }

            const mysqlHostAsk = prompt("Mysql host ("+createmysql.host+") ?");

            if(mysqlHostAsk) {
                createmysql.host = mysqlHostAsk != '' ? mysqlHostAsk : createmysql.host;
            }

            const mysqlUsernameAsk = prompt("Mysql username ("+createmysql.user+") ?");

            if(mysqlUsernameAsk) {
                createmysql.user = mysqlUsernameAsk != '' ? mysqlUsernameAsk : createmysql.user;
            }

            const mysqlPasswordAsk = prompt("Mysql password ("+createmysql.pass+") ?");

            if(mysqlPasswordAsk) {
                createmysql.pass = mysqlPasswordAsk != '' ? mysqlPasswordAsk : createmysql.pass;
            }

            const mysqlPortAsk = prompt("Mysql port ("+createmysql.port+") ?");

            if(mysqlPortAsk) {
                createmysql.port = mysqlPortAsk != '' ? mysqlPortAsk : createmysql.port;
            }

            const mysqlDatabase = prompt("Mysql database ("+createmysql.database+") ?");

            if(mysqlDatabase) {
                createmysql.database = mysqlDatabase != '' ? mysqlDatabase : createmysql.database;
            }

        }

        const defaultAdminAsk = prompt("Default admin username (administrator) ?");
        const defaultAdmin = defaultAdminAsk != '' ? defaultAdminAsk : 'administrator';

        const defaultAdminPasswordAsk = prompt("Default admin password (123456) ?");
        const defaultAdminPassword = defaultAdminPasswordAsk != '' ? defaultAdminPasswordAsk : '123456';

        const siteInfoNameAsk = prompt("Site name (Construct) ?");
        const siteInfoName = siteInfoNameAsk != '' ? siteInfoNameAsk : 'Construct';

        const siteInfoEmailAsk = prompt("Site email (info@basecode.al) ?");
        const siteInfoEmail = siteInfoEmailAsk != '' ? siteInfoEmailAsk : 'info@basecode.al'

        const readConfig = await fs.readFileSync(pathNow + '/' + configFile, 'utf8');
        const config = await JSON.parse(readConfig);

        config.mysql = createmysql;
        config.defaultadmin.username = defaultAdmin;
        config.defaultadmin.password = defaultAdminPassword;
        config.siteinfo.name = siteInfoName;
        config.siteinfo.email = siteInfoEmail;
    }

}

module.exports = {
    create
}