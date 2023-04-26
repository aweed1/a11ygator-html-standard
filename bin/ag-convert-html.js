#! /usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

// Define the usage documentation.
const usage = '\nUsage: ag-convert-pdf [options] <file>';

const options = yargs 
    .usage(usage)
    .option('p', { alias: 'pdf', describe: 'PDF file to convert', type: 'string' })
    .option('d', { alias: 'data', describe: 'Data to use in the template', type: 'string' })
    .option('o', { alias: 'output', describe: 'Output file', type: 'string' })
    .option('t', { alias: 'template', describe: 'Template file', type: 'string' })
    .option('v', { alias: 'verbose', describe: 'Verbose output', type: 'boolean' })
    .help('h').alias('h', 'help')
    .argv;


console.log('hi again');
