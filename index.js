#! /usr/bin/env node
'use strict';

const { program } = require('commander');
const create = require('./bin/create');

program
    .command('create')
    .description('Create empty construct project')
    .option('-n, --name <name>', 'Project name')
    .action(create)

program.parse()