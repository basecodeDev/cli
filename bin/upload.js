const log = require('log-beautify');
const fs = require('fs');
const axios = require('axios');
const archiver = require('archiver');
const extract = require('extract-zip')
const stream = require('stream')
const { login } = require('../lib/user')
const FormData = require('form-data');
const pathNow = process.cwd()
const baseUrl = 'https://dev.base.al/api/v1/'

const upload = async (directory = undefined, name = undefined, slug = undefined) => {

    const user = await login();

    if(user) {

        const module_name = directory || 'construct';

        createZip(module_name, (filePath) => {
            if(filePath) {
                uploadPackage(filePath, directory, name, slug, user)
            } else {
                log.error('Module not found');
            }
        })

    } else {
        log.error('Login failed');
        return;
    }
}

const uploadPackage = async (path, directory, name, slug, user = {}) => {


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
        addToInstallJson(directory, slug, package);
        log.success('Package has been uploaded successfully');
    } else {
        log.error('Package upload failed');
        log.error(data.messages.join(','))
    }
}

const update = async (directory = undefined, slug = undefined) => {

    const user = await login();

    if(user) {

        const module_name = directory || 'construct';

        createZip(module_name, (filePath) => {
            if(filePath) {
                updatePackage(filePath, directory, slug, user)
            } else {
                log.error('Module not found');
            }
        })

    } else {
        log.error('Login failed');
        return;
    }
}

const updatePackage = async (path, directory, slug, user = {}) => {


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

        addToInstallJson(directory, slug, ((getLastVersion.version_id || 0) + 1));
        log.success('Package has been uploaded successfully');
    } else {
        log.error('Package upload failed');
        log.error(data.messages.join(','))
    }
}

const get = async (slug = undefined, directory = undefined) => {

    const user = await login();

    if(user) {

        const source_dir = pathNow + '/app/modules/' + directory;

        if(!await fs.existsSync(source_dir)) {
            const package = await checkPackage(slug, user);

            if(package) {

                const getLastVersion = package.versions.sort((a,b) => b.version_id - a.version_id)[0];

                const { data } = await axios.get(baseUrl + 'packages/download/' + package.package_id + '/' + getLastVersion.version_id, {
                    headers: {
                        'token': user.token
                    },
                    responseType: 'stream'
                });

                if (data instanceof stream.Readable) {

                    const source_path = pathNow + '/dist/' + directory + '.zip';

                    if(!await fs.existsSync(pathNow + '/dist')) {
                        await fs.mkdirSync(pathNow + '/dist');
                    }

                    if(!await fs.existsSync(source_path)) {
                        await fs.unlinkSync(source_path);
                    }

                    const createStream = await fs.createWriteStream(source_path);

                    data.pipe(createStream);

                    createStream.on('finish', async () => {

                        await extract(source_path, { dir: pathNow + '/app/modules/' + directory }, async (err) => {
                            if(err) {
                                log.error('Package download failed');
                            } else {
                                log.success('Package has been downloaded successfully');
                                addToInstallJson(directory, slug, getLastVersion.version_id);
                            }
                        })

                    });

                } else {
                    log.error('Package download failed');
                }

            } else {
                log.error('Package not found');
            }

        } else {
            log.error('Package already exists');
        }

    } else {
        log.error('Login failed');
        return;
    }
}

const addToInstallJson = async (directory = '', slug = '', version = 1) => {

    const { installJsonPath, installJson } = await checkInstallJson();

    const searchPackage = installJson.find(n => n.name === slug);

    if(!searchPackage) {
        installJson.push({
            name: slug,
            directory : directory,
            version: version
        });
    } else {
        searchPackage.directory = directory;
        searchPackage.version = version;
    }

    await fs.writeFileSync(installJsonPath, JSON.stringify(installJson, null, 4), 'utf8');

    return true
}

const createZip = async (module_name = '', callback = () => {}) => {

    const source_dir = pathNow + '/app/modules/' + module_name;
    // const source_dir = pathNow + '/bin'; // For testing

    if(!await fs.existsSync(pathNow + '/dist')) {
        await fs.mkdirSync(pathNow + '/dist');
    }
    
    if(await fs.existsSync(source_dir)) {
        const source_path = pathNow + '/dist/' + module_name + '.zip';
        const output = fs.createWriteStream(source_path);
        const archive = archiver('zip');

        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            
            if(archive.pointer() > 0) {
                callback(source_path)
                log.success('Module uploaded successfully');
            } else {
                callback(false)
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
        callback(false)
        log.error('Module not found');
    }

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
    update,
    get
}