const connection = require('./connection');
const request = require('request');

class InventoryCell{
    constructor(connection){
        this.connection = connection
    }

    getAll(team_id, inventory_id, item_id){
        const _this = this;
        return new Promise( resolve => {
            this.connection.checkToken(function (token) {
                const headers = {'Authorization': 'Bearer ' + token};
                const url = _this.connection.server_name + '/api/v1/teams/' + team_id
                    + '/inventories/' + inventory_id
                    + '/items/' + item_id
                    + '/cells';
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

    create(team_id, inventory_id, item_id, cell) {
        const _this = this;
        return new Promise( resolve => {
            this.connection.checkToken(function (token) {
                const headers = {'Authorization': 'Bearer ' + token};
                const url = _this.connection.server_name + '/api/v1/teams/' + team_id
                    + '/inventories/' + inventory_id
                    + '/items/' + item_id
                    + '/cells';

                let data = {
                    "data": {
                        "type": "inventory_cells",
                        "attributes": {
                            "value": cell.value,
                            "column_id": cell.column_id
                        }
                    }
                };

                request.post({
                        headers: headers,
                        url: url,
                        body: data,
                        json: true
                    },
                    function (error, response, body) {

                        resolve(body);
                    });
            });
        });
    }

    update(team_id, inventory_id, item_id, cell_id, cell) {
        const _this = this;
        return new Promise( resolve => {
            this.connection.checkToken(function (token) {
                const headers = {'Authorization': 'Bearer ' + token};
                const url = _this.connection.server_name + '/api/v1/teams/' + team_id
                    + '/inventories/' + inventory_id
                    + '/items/' + item_id
                    + '/cells/' + cell_id;

                let data = {
                    "data": {
                        "id": cell_id,
                        "type": "inventory_cells",
                        "attributes": {
                            "value": cell.value,
                            "column_id": cell.column_id
                        }
                    }
                };

                request.patch({
                        headers: headers,
                        url: url,
                        body: data,
                        json: true
                    },
                    function (error, response, body) {
                        resolve(body);
                    });
            });
        });
    }

}
module.exports = InventoryCell;
