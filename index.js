#! /usr/bin/env node
'use strict';

const { program } = require('commander');
const { create:createProject } = require('./bin/create');
const { reset:dbReset, migrate:dbMigrate, seed:dbSeed } = require('./bin/db')
const { create:createModule, del:deleteModule } = require('./bin/module');
const { create:createTools } = require('./bin/tools');
const { upload:uploadModule, update:updateModule, get:getModule } = require('./bin/upload');
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
    .command('upload:module')
    .description('Upload module to base.al')
    .argument('module_directory', 'Module directory name (string) (required)')
    .argument('name', 'Module name (string) (required)')
    .argument('slug', 'Slug (string) (required)')
    .action(uploadModule)

program
    .command('update:module')
    .description('Update module to base.al')
    .argument('module_directory', 'Module directory name (string) (required)')
    .argument('slug', 'Slug (string) (required)')
    .action(updateModule)

program
    .command('get:module')
    .description('Get module to base.al')
    .argument('slug', 'Slug (string) (required)')
    .action(getModule)

program.parse()