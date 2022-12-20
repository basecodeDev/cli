const log = require('log-beautify');
const fs = require('fs');
const axios = require('axios');
const archiver = require('archiver');
const { login } = require('../lib/user')
const FormData = require('form-data');
const pathNow = process.cwd()
const baseUrl = 'https://dev.base.al/api/v1/'

const upload = async (args = undefined) => {

    const user = await login();

    if(user) {

        const module_name = args || 'construct';

        const source_dir = pathNow + '/app/modules/' + module_name;
        // const source_dir = pathNow + '/bin'; // For testing

        if(!await fs.existsSync(pathNow + '/dist')) {
            await fs.mkdirSync(pathNow + '/dist');
        }
        
        if(await fs.existsSync(source_dir)) {
            const output = fs.createWriteStream(pathNow + '/dist/' + module_name + '.zip');
            const archive = archiver('zip');

            output.on('close', function () {
                console.log(archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');
                
                if(archive.pointer() > 0) {
                    uploadPackage(pathNow + '/dist/' + module_name + '.zip', module_name, user)
                    log.success('Module uploaded successfully');
                }
            });

            archive.on('error', function(err){
                throw err;
            });

            archive.pipe(output);

            // append files from a sub-directory, putting its contents at the root of archive
            archive.directory(source_dir, false);

            archive.finalize();
        } else {
            log.error('Module not found');
        }

    } else {
        log.error('Login failed');
        return;
    }
}

const uploadPackage = async (path, module_name, user = {}) => {

    const form = new FormData();
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            'token': user.token
        }
    }

    form.append('name', module_name);
    form.append('slug', module_name);
    form.append('package', fs.createReadStream(path));

    const { data } = await axios.post(baseUrl + 'packages/add', form, config);

    if(data.status) {
        log.success('Package has been uploaded successfully');
    } else {
        log.error('Package upload failed');
        log.error(data.messages.join(','))
    }
}

module.exports = {
    upload
}