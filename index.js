#! /usr/bin/env node
'use strict';

const { program } = require('commander');
const { create:createProject } = require('./bin/create');
const { reset:dbReset, migrate:dbMigrate, seed:dbSeed } = require('./bin/db')
const { create:createPackage, del:deletePackage } = require('./bin/package');
const { create:createTools } = require('./bin/tools');
const { upload:uploadPackage, update:updatePackage, get:getPackage, install:installPackages } = require('./bin/upload');
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
    .command('create:package')
    .option('-d, --directory <directory>', 'Directory name')
    .option('-db, --database <database>', 'Database table name')
    .option('-pn, --packagename <packagename>', 'Package name')
    .description('Package will create inside of app directory')
    .action(createPackage)

program
    .command('delete:package')
    .option('-d, --directory <directory>', 'Directory name')
    .description('Package will delete inside of app directory')
    .action(deletePackage)

program
    .command('create:tools')
    .description('From tools directory, tools will create')
    .action(createTools)

program
    .command('upload:package')
    .description('Upload package to base.al')
    .argument('package_directory', 'Package directory name (string) (required)')
    .argument('name', 'Package name (string) (required)')
    .argument('slug', 'Slug (string) (required)')
    .action(uploadPackage)

program
    .command('update:package')
    .description('Update package to base.al')
    .argument('package_directory', 'Package directory name (string) (required)')
    .argument('slug', 'Slug (string) (required)')
    .action(updatePackage)

program
    .command('get:package')
    .description('Get package to base.al')
    .argument('slug', 'Slug (string) (required)')
    .argument('directory', 'Directory (string) (required)')
    .option('-vs, --vers <vers>', 'Version (string) (optional)', 'latest')
    .action(getPackage)

program
    .command('install:packages')
    .option('-f, --force <force>', 'Force install (boolean) (optional)', false)
    .description('Install all packages from app/install.json')
    .action(installPackages)

program.parse()