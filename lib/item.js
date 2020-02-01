const connection = require('./connection');
const request = require('request');
const inventoryColumns = require('./inventory_column');
const inventoryCells = require('./inventory_cell');

class Item{
    constructor(connection){
        this.connection = connection;
    }

    getAll(team_id, inventory_id, next_url) {
        const _this = this;
        return new Promise( resolve => {
            this.connection.checkToken(async function (token) {
                const headers = {'Authorization': 'Bearer ' + token};
                let url = next_url ? next_url :_this.connection.server_name + '/api/v1/teams/' + team_id + '/inventories/' +
                    inventory_id + '/items';

                url += '?include=inventory_cells';

                let columns = new inventoryColumns(_this.connection);
                columns = await columns.getAll(team_id, inventory_id);

                request.get({
                        headers: headers,
                        url: url
                    },
                    function (error, response, body) {
                        let inventory = [];
                        const b = JSON.parse(body);
                        for(var i=0; i<b.data.length; i++){
                            let temp_item = {
                                id: b.data[i].id,
                                name: b.data[i].attributes.name,
                                fields: []
                            };

                            //first two for loops combine the columns and values. Scinote seperates this for some reason
                            if(b.data[i].relationships){
                                for(var x=0; x<b.data[i].relationships.inventory_cells.data.length; x++){
                                    for(var z=0; z<b.included.length; z++){
                                        //if the item in data[] matches the included array, combine
                                        if(b.data[i].relationships.inventory_cells.data[x].id === b.included[z].id){
                                            let temp_field = {
                                                id: b.data[i].relationships.inventory_cells.data[x].id,
                                                value: b.included[z].attributes.value.text,
                                            };

                                            //add column name to returned data
                                            for(var y=0; y<columns.data.length; y++){
                                                if(parseInt(columns.data[y].id) === parseInt(b.included[z].attributes.column_id)){
                                                    temp_field.name = columns.data[y].attributes.name
                                                }
                                            }
                                            temp_item.fields.push(temp_field)
                                        }
                                    }
                                }
                            }
                            inventory.push(temp_item);
                        }

                        const data = {
                            inventory: inventory,
                            links: b.links
                        };
                        resolve(data);
                    });
            });
        });
    }

    get(team_id, inventory_id, item_id) {
        const _this = this;
        return new Promise( resolve => {
            this.connection.checkToken(function (token) {
                const headers = {'Authorization': 'Bearer ' + token};
                const url = _this.connection.server_name + '/api/v1/teams/' + team_id + '/inventories/' +
                    inventory_id + '/items/' + item_id;

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

    // item = {name: item_name, includes: {col_id: value, col2_id: value2, etc...}
    create(team_id, inventory_id, item) {
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
                        const columns = JSON.parse(body);
                        const post_headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/vnd.api+json'};
                        const post_url = _this.connection.server_name + '/api/v1/teams/' + team_id + '/inventories/' +
                            inventory_id + '/items';

                        if (!item.name) {
                            resolve({error: "data.name is required when creating item"});
                        }

                        let includes = [];

                        //lop through fields to find columns
                        for (var col in item) {
                            for(var i=0; i<columns.data.length; i++){
                                if(columns.data[i].attributes.name === col){
                                    includes.push({
                                        "type": "inventory_cells",
                                        "attributes": {
                                            "value": item[col],
                                            "column_id": columns.data[i].id
                                        }
                                    })
                                }
                            }
                        }

                        //build data for call
                        const data = {
                            "data": {
                                "type": "inventory_items",
                                "attributes": {
                                    "name": item.name
                                }
                            }, "included": includes
                        };

                        request.post({
                                headers: post_headers,
                                url: post_url,
                                body: data,
                                json: true
                            },
                            function (error, response, body) {
                                resolve(body);
                            });
                    });
            });
        });
    }

    update(team_id, inventory_id, item_id, item) {
        const _this = this;
        return new Promise( resolve => {
            let promise = this.connection.checkToken(async function (token) {

                //get item using id
                let current_item = await _this.get(team_id, inventory_id, item_id);

                //get inventory columns. ids are needed to update
                let columns = new inventoryColumns(_this.connection);
                columns = await columns.getAll(team_id, inventory_id);
                columns = columns.data;

                const patch_headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/vnd.api+json'};
                const patch_url = _this.connection.server_name + '/api/v1/teams/' + team_id + '/inventories/' +
                    inventory_id + '/items/' + item_id;
                let includes = [];
                let active_cols = [];
                let active_cells = [];

                for(var i=0; i<current_item.included.length; i++){
                    active_cols.push(current_item.included[i].attributes.column_id)
                }

                for(var i=0; i<current_item.data.relationships.inventory_cells.data.length; i++){
                    active_cells.push(current_item.data.relationships.inventory_cells.data[i].id)
                }


                for(var i=0; i<columns.length; i++){
                    for(var col in item){
                        //compare desired column changes against column list
                        if(col === columns[i].attributes.name){

                            //if column name is matched, check if it exists in active_cols.
                            //if column does not exists in active_cols
                            if(!active_cols.includes(parseInt(columns[i].id))){
                                let cell = new inventoryCells(_this.connection);
                                let new_cell = await cell.create(team_id, inventory_id, item_id, {value: item[col], column_id: columns[i].id});
                            }else{
                                //if column already exists, update value
                                includes.push({
                                    "id": active_cells[active_cols.indexOf(parseInt(columns[i].id))],
                                    "type": "inventory_cells",
                                    "attributes": {
                                        "value": item[col],
                                        "column_id": parseInt(columns[i].id)
                                    }
                                })
                            }
                        }
                    }
                }

                //build data for call
                let data = {
                    "data": {
                        "id": item_id,
                        "type": "inventory_items",
                    }, "included": includes
                };

                if(item.name){
                    data.data.attributes = {
                        name: item.name
                    }
                }

                request.patch({
                        headers: patch_headers,
                        url: patch_url,
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
module.exports = Item;
