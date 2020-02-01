const connection = require('./connection');
const request = require('request');

class InventoryColumn{
    constructor(connection){
        this.connection = connection
    }

    getAll(team_id, inventory_id){
        const _this = this;
        return new Promise( resolve => {
            this.connection.checkToken(function (token) {
                const headers = {'Authorization': 'Bearer ' + token};
                const url = _this.connection.server_name + '/api/v1/teams/' + team_id + '/inventories/' + inventory_id + '/columns';
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

}
module.exports = InventoryColumn;
