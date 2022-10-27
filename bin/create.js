const shell = require("shelljs");
const log = require('log-beautify');
const fs = require('fs')

const create = async (args) => {

    const project_name = args.name || 'construct';

    if(!await fs.existsSync(project_name)) {
        shell.exec("git clone git@github.com:basecodeDev/Base.git " + project_name);
        shell.exec("cd " + project_name + " && rm -rf .git && git init");
        shell.exec("cd " + project_name + " && mv config/index.sample.js config/index.js");
        log.ok(project_name + ' project created successfully');
        log.ok(project_name + '/config/index.js for configurations');
        log.ok(project_name + '/app/modules for modules');
        log.ok(project_name + '/app/tools for tools');
        log.ok(project_name + '/app/migrations for custom migrations');
        log.ok(project_name + '/app/tests for manual tests');
        log.ok(project_name + '/app/install.json for third party modules');
    } else {
        log.error(project_name + ' project already exists');
    }
}

module.exports = {
    create
}