const shell = require("shelljs");
const log = require('log-beautify');
const fs = require('fs')

const create = async (args) => {

    const project_name = args.name || 'construct';

    if(!await fs.existsSync(project_name)) {
        shell.exec("git clone git@github.com:basecodeDev/Base.git " + project_name);
        shell.exec("cd " + project_name + " && rm -rf .git");
        log.ok(project_name + ' project created successfully');
    } else {
        log.error(project_name + ' project already exists');
    }
}

module.exports = {
    create
}