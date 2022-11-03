#! /usr/bin/env node
'use strict';

const { program } = require('commander');
const { create:createProject } = require('./bin/create');
const { reset:dbReset, migrate:dbMigrate, seed:dbSeed } = require('./bin/db')
const { create:createModule, del:deleteModule, add:addModule, install:installModules, update:updateModules } = require('./bin/module');
const { create:createTools } = require('./bin/tools');
const packageInfo = require('./package.json');

program
    .name(packageInfo.name)
    .description(packageInfo.description)
    .helpOption('-h, --help', 'Display help for command')
    .version(packageInfo.version, '-v, --version', 'output the current version');

program
    .command('create')
    .description('Create empty construct project')
    .argument('name', 'Project name (string) (required)')
    .action(createProject)

program
    .command('db:reset')
    .description('Database will empty and create new tables and seed data')
    .action(dbReset)

program
    .command('db:migrate')
    .description('Database tables will create')
    .action(dbMigrate)

program
    .command('db:seed')
    .description('Database tables will fill with seed data')
    .action(dbSeed)

program
    .command('add:module')
    .description('Add existing module to app/install.json')
    .action(addModule)

program
    .command('install:module')
    .description('Install modules from app/install.json file')
    .action(installModules)

program
    .command('update:module')
    .description('Update modules from app/install.json file')
    .action(updateModules)
    
program
    .command('create:module')
    .option('-d, --directory <directory>', 'Directory name')
    .option('-db, --database <database>', 'Database table name')
    .option('-mn, --modulename <modulename>', 'Module name')
    .description('Module will create inside of app directory')
    .action(createModule)

program
    .command('delete:module')
    .option('-d, --directory <directory>', 'Directory name')
    .description('Module will delete inside of app directory')
    .action(deleteModule)

program
    .command('create:tools')
    .description('From tools directory, tools will create')
    .action(createTools)

program.parse()