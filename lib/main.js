const Connection = require('./connection');
const Inventory = require('./inventory');
const InventoryColumn = require('./inventory_column');
const InventoryCell = require('./inventory_cell');
const Item = require('./item');
const Team = require('./team');

function Scinote(options){
    if (
        !options ||
        !options.server_name ||
        !options.client_id ||
        !options.client_secret ||
        !options.refresh_token ||
        !options.redirect_uri
    ) {
        throw new Error('Missing or invalid options');
    }

    this.connection = new Connection(options);
    this.team = new Team(this.connection);
    this.inventory = new Inventory(this.connection);
    this.item = new Item(this.connection);
    this.inventory_column = new InventoryColumn(this.connection);
    this.inventory_cell = new InventoryCell(this.connection);
}

module.exports = Scinote;
