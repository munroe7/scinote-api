const connection = require('./connection');
const request = require('request');

class Inventory{
    constructor(connection){
        this.connection = connection
    }

    getAll(team_id) {
        const _this = this;
        return new Promise( resolve => {
            this.connection.checkToken(function (token) {
                const headers = {'Authorization': 'Bearer ' + token};
                const url = _this.connection.server_name + '/api/v1/teams/' + team_id + '/inventories';

                request.get({
                        headers: headers,
                        url: url
                    },
                    function (error, response, body) {
                        resolve(JSON.parse(body));
                    });

            })
        });
    }

    get(team_id, inventory_id){
        const _this = this;
        return new Promise( resolve => {
            this.connection.checkToken(function (token) {
                const headers = {'Authorization': 'Bearer ' + token};
                const url = _this.connection.server_name + '/api/v1/teams/' + team_id + '/inventories/' + inventory_id;

                request.get({
                        headers: headers,
                        url: url
                    },
                    function (error, response, body) {
                        resolve(JSON.parse(body));
                    });

            });
        });
    }

    create(team_id, name){
        const _this = this;
        return new Promise( resolve => {
            this.connection.checkToken(function (token) {
                const headers = {'Authorization': 'Bearer ' + token};
                const url = _this.connection.server_name + '/api/v1/teams/' + team_id + '/inventories';
                const data = {
                    "data": {
                        "type": "inventories",
                        "attributes": {
                            "name": name
                        }
                    }
                };

                request.post({
                        headers: headers,
                        url: url,
                        form: data
                    },
                    function (error, response, body) {
                        resolve(JSON.parse(body));
                    });
            });
        });
    }

    update(team_id, inventory_id, name){
        const _this = this;
        return new Promise( resolve => {
            this.connection.checkToken(function (token) {
                const headers = {'Authorization': 'Bearer ' + token};
                const url = _this.connection.server_name + '/api/v1/teams/' + team_id + '/inventories/' + inventory_id;
                const data = {
                    "data": {
                        "id": inventory_id,
                        "type": "inventories",
                        "attributes": {
                            "name": name
                        }
                    }
                };

                request.patch({
                        headers: headers,
                        url: url,
                        form: data
                    },
                    function (error, response, body) {
                        resolve(JSON.parse(body));
                    });

            });
        });
    }

    delete(team_id, inventory_id){
        const _this = this;
        return new Promise( resolve => {
            this.connection.checkToken(function (token) {
                const headers = {'Authorization': 'Bearer ' + token};
                const url = _this.connection.server_name + '/api/v1/teams/' + team_id + '/inventories/' + inventory_id;

                request.delete({
                        headers: headers,
                        url: url,
                    },
                    function (error, response, body) {
                        resolve(JSON.parse(body));
                    });
            });
        });
    }
}
module.exports = Inventory;
