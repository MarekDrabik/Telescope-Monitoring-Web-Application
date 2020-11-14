
class Client {
    socket;
    request;
    token;

    constructor(socket, request) {
        this.socket = socket;
	this.request = request;
        const token = request.headers.cookie;
        this.token = token ? token.replace('access_token=', '') : null;
    }
}

module.exports = class ConnectedClientsContainer {

    _clients = []

    constructor () {}

    add (socket, request) {
        let client = new Client(socket, request);
        this._clients.push(client)
	console.log('added new client')
    }

    removeBySocket (socket) {
	let lengthBefore = this._clients.length;
        this._clients = this._clients.filter(client => client.socket !== socket )
	if (this._clients.length !== lengthBefore) {
		console.log('client kicked by socket')
	} else {
		console.log('client kick UNSUCCESSFUL!')
	}
    }

    removeByToken (token) {
	let lengthBefore = this._clients.length;
	this._clients = this._clients.filter(client => client.token !== token) 
	if (this._clients.length !== lengthBefore) {
		console.log('client kicked by token')
	} else {
		console.log('client kick UNSUCCESSFUL!')
	}
    }

    getClients () {
        return this._clients;
    }

}
