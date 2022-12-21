const log = require('log-beautify');
const fs = require('fs');
const axios = require('axios');
const archiver = require('archiver');
const extract = require('extract-zip');
const prompt = require("prompt-sync")({ sigint: true });
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
        log.warning(slug + ' package already exists use update:module method');
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
        const version = await addToInstallJson(directory, slug, 1);
        await createVersionFile(slug, version);
        log.success(slug + ' package has been uploaded successfully');
    } else {
        log.error(slug + ' package upload failed');
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
        log.warning(slug + ' package not exists use upload:module method');
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
        const version = await addToInstallJson(directory, slug, ((getLastVersion.version_id || 0) + 1));
        await createVersionFile(slug, version);
        log.success(slug + ' package has been uploaded successfully');
    } else {
        log.error(slug + ' package upload failed');
        log.error(data.messages.join(','))
    }
}

const get = async (slug = undefined, directory = undefined, options = undefined, force = false) => {

    const user = await login();

    if(user) {

        const source_dir = pathNow + '/app/modules/' + directory;

        if(!await fs.existsSync(source_dir) || force) {
            const package = await checkPackage(slug, user);

            if(package) {

                const getLastVersion = package.versions.sort((a,b) => b.version_id - a.version_id)[0];
                const source_path = pathNow + '/dist/' + directory + '.zip';

                getLastVersion.version_id = options.vers == 'latest' ? getLastVersion.version_id : options.vers;

                let dataResponse = {
                    status: false
                }

                try {
                    const { data } = await axios.get(baseUrl + 'packages/download/' + package.slug + '/' + getLastVersion.version_id, {
                        headers: {
                            'token': user.token
                        }
                    })

                    dataResponse = data;

                    console.log(dataResponse);

                } catch (error) {
                    log.error(slug + ' package request failed')
                    dataResponse = {
                        status: false
                    }
                }

                if (dataResponse.status) {

                    if(!await fs.existsSync(pathNow + '/dist')) {
                        await fs.mkdirSync(pathNow + '/dist');
                    }

                    if(await fs.existsSync(source_path)) {
                        await fs.unlinkSync(source_path);
                    }

                    await fs.writeFileSync(source_path, new Buffer.from(dataResponse.data.file));

                    if(await fs.existsSync(source_path)) {

                        log.info(slug + ' package has been download successfully');

                        try {
                            await extract(source_path, { dir: pathNow + '/app/modules/' + directory })
                            log.info(slug + ' package has been extract successfully');
                            const version = await addToInstallJson(directory, slug, getLastVersion.version_id);
                            await createVersionFile(slug, version);
                            log.success(slug + ' package version ' + getLastVersion.version_id + ' has been installed successfully.');

                            if(await fs.existsSync(source_path)) {
                                await fs.unlinkSync(source_path);
                            }
                            
                        } catch (error) {
                            log.error(slug + ' package extract failed');
                        }

                    } else {
                        log.error(slug + ' package download failed');
                    }

                } else {
                    const getActiveVersion = await checkVersionFile(slug);
                    if(getActiveVersion && !isNaN(getActiveVersion) && getActiveVersion > 0) {
                        await createVersionFile(slug, getLastVersion.version_id);
                    }
                    log.error(slug + ' package version not exists');
                }

            } else {
                log.error(slug + ' package not exists');
            }

        } else {
            log.error(slug + ' package already exists');
        }

    } else {
        log.error('Login failed');
    }

    return true;
}

const install = async (options = {}) => {

    const user = await login();

    if(user) {

        const { installJson } = await checkInstallJson();

        const controlInstall = await controlInstallJson();

        if(!controlInstall) {
            return false;
        }

        if(installJson.length > 0) {

            for (let index = 0; index < installJson.length; index++) {

                const package = installJson[index];

                const source_dir = pathNow + '/app/modules/' + package.directory;

                if(!await fs.existsSync(source_dir)) {
                    await get(package.name, package.directory, { vers: package.version }, options.force);
                } else {
                    const checkActiveVersion = await checkVersionFile(package.name);
                    if(checkActiveVersion != package.version) {

                        if(!checkActiveVersion) {
                            await get(package.name, package.directory, { vers: package.version }, true);
                        } else {
                            const askVersionUpdate = prompt('Do you want to update ' + package.name + ' package version ' + checkActiveVersion + ' to ' + package.version + ' ? (y/n)');
                            if(askVersionUpdate === 'y') {
                                await get(package.name, package.directory, { vers: package.version }, true);
                            } else {
                                log.warning(package.name + ' passed');
                            }
                        }
                    } else if(options.force) {
                        const askForceInstall = prompt('Do you want to force install ' + package.name + ' package ? (y/n)');
                        if(askForceInstall === 'y') {
                            await get(package.name, package.directory, { vers: package.version }, true);
                        } else {
                            log.warning(package.name + ' passed');
                        }
                    } else {
                        log.warning(package.name + ' package already exists & equal version');
                    }
                }
            }

        } else {
            log.warning('There is no package inside install.json file');
        }

    } else {
        log.error('Login failed');
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

    return version
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
        return false
    }

    return {
        installJsonPath,
        installJson
    }
}

const controlInstallJson = async () => {

    const { installJson } = await checkInstallJson();

    try {
        if(installJson.length > 0) {
            for (let i = 0; i < installJson.length; i++) {
                const json = installJson[i];
                const keyOfJson = (i + 1)

                if(typeof json !== 'object') {
                    log.error(keyOfJson + '. object not found in install.json');
                    return false;
                }
                
                if(Object.keys(json).length !== 3) {
                    log.error(keyOfJson + '. object key length not equal 3 in install.json (name,directory,version)');
                    return false;
                }

                if(!Object.keys(json).includes('name')) {
                    log.error(keyOfJson + '. object name key not found in install.json');
                    return false;
                }

                if(!Object.keys(json).includes('directory')) {
                    log.error(keyOfJson + '. object directory key not found in install.json');
                    return false;
                }

                if(!Object.keys(json).includes('version')) {
                    log.error(keyOfJson + '. object version key not found in install.json');
                    return false;
                }

                if(typeof json.name !== 'string') {
                    log.error(keyOfJson + '. object name value not string in install.json');
                    return false;
                }

                if(typeof json.directory !== 'string') {
                    log.error(keyOfJson + '. object directory value not string in install.json');
                    return false;
                }

                if(isNaN(json.version)) {
                    log.error(keyOfJson + '. object version value not number in install.json');
                    return false;
                }

                if(json.name === '') {
                    log.error(keyOfJson + '. object name value is empty in install.json');
                    return false;
                }

                if(json.directory === '') {
                    log.error(keyOfJson + '. object directory value is empty in install.json');
                    return false;
                }

                if(json.version === 0) {
                    log.error(keyOfJson + '. object version value is 0 in install.json');
                    return false;
                }
            }
        }
    } catch (error) {
        log.error('install.json file is not valid');
        return false;
    }

    return true;
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

const createVersionFile = async (slug = '', version = 1) => {

    const versionPath = pathNow + '/app/.version.json';

    if(!await fs.existsSync(versionPath)) {
        await fs.writeFileSync(versionPath, '{}', 'utf8');
    }

    let versionJson = {}

    try {
        versionJson = await fs.readFileSync(versionPath, 'utf8');
        versionJson = JSON.parse(versionJson);   
    } catch (error) {
        versionJson = {}
    }

    versionJson[slug] = version;

    await fs.writeFileSync(versionPath, JSON.stringify(versionJson, null, 4), 'utf8');

    return true
}

const checkVersionFile = async (slug = '') => {

    const versionPath = pathNow + '/app/.version.json';

    if(!await fs.existsSync(versionPath)) {
        await fs.writeFileSync(versionPath, '{}', 'utf8');
    }

    let versionJson = {}

    try {
        versionJson = await fs.readFileSync(versionPath, 'utf8');
        versionJson = JSON.parse(versionJson);
    } catch (error) {
        versionJson = {}
    }

    if(versionJson[slug]) {
        return versionJson[slug];
    } else {
        return false;
    }
}


module.exports = {
    upload,
    update,
    get,
    install
}