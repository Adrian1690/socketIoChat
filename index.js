var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', process.env.PORT || 3001);

app.get('/', function(req, res){
	//res.send('<h1>Hello world Adrian</h1>')
	res.sendFile(__dirname + '/index.html');
});

users = [];
connections = [];
io.on('connection', function(socket){
	
	connections.push(socket);
	console.log('user conected : ' + connections.length);

	socket.on('chat message', function(msg){
		console.log('message sended : ' + msg);
		io.emit('chat message', { user: socket.username , message: msg} );
	});

	socket.on('disconnect', function(){

		users.splice(users.indexOf(socket.username), 1);
		updateUsernames();

		console.log('user disconnect');
		connections.splice(connections.indexOf(socket), 1);
		console.log('user conected : ' + connections.length);
	});

	// new user
	socket.on('new user', function(data, callback){
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
	});

	function updateUsernames(){
		io.emit('get users', users);
	}

})

http.listen(app.get('port'), function (){
	console.log('App listen port : ' + app.get('port'));
});