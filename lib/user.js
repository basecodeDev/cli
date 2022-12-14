const axios = require('axios');
const prompt = require("prompt-sync")({ sigint: true });
const log = require('log-beautify');
const fs = require('fs')
const baseUrl = 'https://api.base.al/v1/accounts'

const login = async () => {

    const checkUser = await checkUserData();

    if(checkUser) {
        return checkUser;
    } else {

        if(!await fs.existsSync(__dirname + '/../data')) {
            await fs.mkdirSync(__dirname + '/../data');
        }

        const username = prompt("Username or Email Address : ");
        const password = prompt("Password : ");
        
        const { data } = await axios.post(baseUrl + 'auth/login', {
            username: username,
            password: password
        });

        if(data.status) {
            fs.writeFileSync(__dirname + '/../data/user.json', JSON.stringify(data.data));
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
        controlFile = await fs.readFileSync(__dirname + '/../data/user.json', 'utf8');
        controlFile = JSON.parse(controlFile);
        
        if(controlFile.token) {

            const { data } = await axios.get(baseUrl + 'users/me', {
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