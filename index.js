#! /usr/bin/env node
'use strict';

const { program } = require('commander');
const { create:createProject } = require('./bin/create');
const { reset:dbReset, migrate:dbMigrate, seed:dbSeed } = require('./bin/db')
const { create:createModule, del:deleteModule } = require('./bin/module');
const { create:createTools } = require('./bin/tools');
const { add:addPackage, install:installPackages, update:updatePackages } = require('./bin/package');

program
    .command('create')
    .description('Create empty construct project')
    .option('-n, --name <name>', 'Project name')
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

program
    .command('add:package')
    .description('Add existing package to app/install.json')
    .action(addPackage)

program
    .command('install:package')
    .description('Install packages from app/install.json file')
    .action(installPackages)

program
    .command('update:package')
    .description('Update packages from app/install.json file')
    .action(updatePackages)

program.parse()