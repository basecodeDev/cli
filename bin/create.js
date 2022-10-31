const shell = require("shelljs");
const log = require('log-beautify');
const fs = require('fs')

log.setSymbols({
    info: "⚙️"
});

const create = async (args = undefined) => {

    const project_name = args || 'construct';
    
    if(!await fs.existsSync(project_name)) {
        shell.exec("npm install -g yarn");
        shell.exec("mkdir "+ project_name + " && mkdir "+ project_name + "/ui");
        shell.exec("cd " + project_name + " && git clone git@github.com:basecodeDev/Base.git base");
        shell.exec("cd " + project_name + "/ui && git clone git@github.com:basecodeDev/Panel-Frontend.git panel");
        shell.exec("cd " + project_name + "/base && rm -rf .git && git init");
        shell.exec("cd " + project_name + "/base && mv app/config/index.sample.js app/config/index.js");
        log.success(project_name + ' project created successfully');
        log.info(project_name + '/app/config/index.js for configurations');
        log.info(project_name + '/app/modules for modules');
        log.info(project_name + '/app/tools for tools');
        log.info(project_name + '/app/migrations for custom migrations');
        log.info(project_name + '/app/tests for manual tests');
        log.info(project_name + '/app/install.json for third party modules');
        log.info('Yarn packages installing...')
        shell.exec("cd " + project_name + "/base && yarn");
        shell.exec("cd " + project_name + "/ui/panel && yarn");
    } else {
        log.error(project_name + ' project already exists');
    }
}

module.exports = {
    create
}