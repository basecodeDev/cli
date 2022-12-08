const shell = require("shelljs");
const log = require('log-beautify');
const fs = require('fs');
const archiver = require('archiver');
const pathNow = process.cwd()

const upload = async (args = undefined) => {

    const module_name = args || 'construct';

    const source_dir = pathNow + '/app/modules/' + module_name;

    if(!await fs.existsSync(pathNow + '/dist')) {
        await fs.mkdirSync(pathNow + '/dist');
    }
    
    if(await fs.existsSync(source_dir)) {
        const output = fs.createWriteStream(pathNow + '/dist/' + module_name + '.zip');
        const archive = archiver('zip');

        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
        });

        archive.on('error', function(err){
            throw err;
        });

        archive.pipe(output);

        // append files from a sub-directory, putting its contents at the root of archive
        archive.directory(source_dir, false);

        archive.finalize();

        log.success('Module uploaded successfully');
    } else {
        log.error('Module not found');
    }
}

module.exports = {
    upload
}