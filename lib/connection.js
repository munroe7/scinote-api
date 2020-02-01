const request = require('request');

class Connection {

    constructor(options){
        this.server_name = options.server_name;
        this.client_id = options.client_id;
        this.client_secret = options.client_secret;
        this.redirect_uri = options.redirect_uri;
        this.refresh_token = options.refresh_token;
    }

    async checkToken(callback, error){
        const _this = this;
        if(!_this.access_token){
            let token = await this.getToken();
            _this.access_token = token;
            callback(token);
        }else{
            callback(_this.access_token)
        }
    }

    async getToken(){
        return new Promise( resolve => {
            const propertiesObject = {
                grant_type: 'refresh_token',
                client_id: this.client_id,
                client_secret: this.client_secret,
                refresh_token: this.refresh_token,
                redirect_uri: this.redirect_uri,
            };

            request.post({
                    headers: {'content-type': 'application/json'},
                    url: this.server_name + '/oauth/token',
                    json: propertiesObject
                },
                function (error, response, body) {
                    resolve(body.access_token);
                });
        });
    }
}

module.exports = Connection;
