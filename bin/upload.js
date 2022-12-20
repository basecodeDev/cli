const log = require('log-beautify');
const fs = require('fs');
const axios = require('axios');
const archiver = require('archiver');
const { login } = require('../lib/user')
const FormData = require('form-data');
const pathNow = process.cwd()
const baseUrl = 'https://dev.base.al/api/v1/'

const upload = async (directory = undefined, name = undefined, slug = undefined) => {

    const user = await login();

    if(user) {

        const module_name = directory || 'construct';

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
                    uploadPackage(pathNow + '/dist/' + module_name + '.zip', name, slug, user)
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

const uploadPackage = async (path, name, slug, user = {}) => {


    const package = await checkPackage(slug, user);

    if(package) {
        log.warning('Package already exists use update:module method');
        return;
    }

    const form = new FormData();
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            'token': user.token
        }
    }

    form.append('name', name);
    form.append('slug', slug);
    form.append('package', fs.createReadStream(path));

    const { data } = await axios.post(baseUrl + 'packages/add', form, config);

    if(data.status) {
        addToInstallJson(path, slug, package);
        log.success('Package has been uploaded successfully');
    } else {
        log.error('Package upload failed');
        log.error(data.messages.join(','))
    }
}

const update = async (path, slug, user = {}) => {


    const package = await checkPackage(slug, user);

    if(!package) {
        log.warning('Package not exists use upload:module method');
        return;
    }

    const form = new FormData();
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            'token': user.token
        }
    }

    form.append('name', slug);
    form.append('slug', slug);
    form.append('package', fs.createReadStream(path));

    const { data } = await axios.post(baseUrl + 'packages/add', form, config);

    if(data.status) {

        const getLastVersion = package.versions.sort((a,b) => b.version_id - a.version_id)[0];

        addToInstallJson(path, slug, getLastVersion.version_id);
        log.success('Package has been uploaded successfully');
    } else {
        log.error('Package upload failed');
        log.error(data.messages.join(','))
    }
}

const addToInstallJson = async (path = '', slug = '', version = 1) => {

    const { installJsonPath, installJson } = await checkInstallJson();

    const searchPackage = installJson.find(n => n.name === slug);

    if(!searchPackage) {
        installJson.push({
            name: slug,
            directory : path,
            version: version
        });
    } else {
        searchPackage.directory = path;
        searchPackage.version = version;
    }

    await fs.writeFileSync(installJsonPath, JSON.stringify(installJson, null, 4), 'utf8');

    return true
}

const checkInstallJson = async () => {

    const installJsonPath = pathNow + '/app/install.json';

    if(!await fs.existsSync(installJsonPath)) {
        await fs.writeFileSync(installJsonPath, '[]', 'utf8');
    }

    let installJson = []

    try {
        installJson = await fs.readFileSync(installJsonPath, 'utf8');
        installJson = JSON.parse(installJson);   
    } catch (error) {
        installJson = []
    }

    return {
        installJsonPath,
        installJson
    }
}

const checkPackage = async (slug = '', user = {}) => {

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            'token': user.token
        }
    }

    const { data } = await axios.get(baseUrl + 'packages/' + slug, config);

    if(data.status) {
        return data.data;
    } else {
        return false;
    }
}

module.exports = {
    upload,
    update
}