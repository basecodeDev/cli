const axios = require('axios');
const prompt = require("prompt-sync")({ sigint: true });
const log = require('log-beautify');
const fs = require('fs')
const pathNow = process.cwd()
const baseUrl = 'https://accounts.base.al/api/v1/'

const login = async () => {

    const checkUser = await checkUserData();

    if(checkUser) {
        return checkUser;
    } else {

        if(!await fs.existsSync(pathNow + '/data')) {
            await fs.mkdirSync(pathNow + '/data');
        }

        const username = prompt("Username or Email Address : ");
        const password = prompt("Password : ");
        
        const { data } = await axios.post(baseUrl + 'auth/login', {
            username: username,
            password: password
        });

        if(data.status) {
            fs.writeFileSync(pathNow + '/data/user.json', JSON.stringify(data.data));
            log.success('Login success, Welcome ' + data.data.username);
            return data.data;
        } else {
            log.error('Login failed');
            return await login();
        }

    }

}

const checkUserData = async () => {

    let controlFile = null

    try {
        controlFile = await fs.readFileSync(pathNow + '/data/user.json', 'utf8');
        controlFile = JSON.parse(controlFile);
        
        if(controlFile.token) {

            const { data } = await axios.get(baseUrl + 'auth/me', {
                headers: {
                    token: controlFile.token
                }
            });

            if(data.status) {
                return controlFile;
            } else {
                return false;
            }

        } else {
            return false;
        }
    } catch (error) {
        return false
    }
}

module.exports = {
    login
}