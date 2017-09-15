var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', process.env.PORT || 3001);

app.get('/', function(req, res){
	//res.send('<h1>Hello world Adrian</h1>')
	res.sendFile(__dirname + '/index.html'); 
});

// sending to sender-client only
//socket.emit('message', "this is a test");

// sending to all clients, include sender
//io.emit('message', "this is a test");

// sending to all clients except sender
//socket.broadcast.emit('message', "this is a test");

// sending to all clients in 'game' room(channel) except sender
//socket.broadcast.to('game').emit('message', 'nice game');

// sending to all clients in 'game' room(channel), include sender
//io.in('game').emit('message', 'cool game');

// sending to sender client, only if they are in 'game' room(channel)
//socket.to('game').emit('message', 'enjoy the game');

// sending to all clients in namespace 'myNamespace', include sender
//io.of('myNamespace').emit('message', 'gg');

// sending to individual socketid
//socket.broadcast.to(socketid).emit('message', 'for your eyes only');

users = [];
connections = [];

socketUsers = [];

io.on('connection', function(socket){
	
	connections.push(socket);
	console.log('user conected : ' + connections.length);


	//send menssage
	socket.on('chat message', function(msg){
		
		msg = msg.trim();
		console.log('message sended : ' + msg);

		if( msg.substring(0,3) === '/w ' ){ // if is whisper
			
			msg = msg.substring(3);
			var ind = msg.indexOf(' ');
			
			if( ind !== -1 ){
				var username = msg.substring(0, ind);// nickname;
				username = username.trim();
				msg = msg.substring(ind + 1);

				if( username in socketUsers ){
					console.log('valid name');
					console.log(socket.username);
					socket.broadcast
						.to(socketUsers[username].id)
						.emit('whisper', { user: socket.username , message: msg});
				}else{
					console.log('Error: send to valid username');
				}

			}else{
				console.log('Send message to whisper.');
			}
		}else{
			io.emit('chat message', { user: socket.username , message: msg} );
			//socket.broadcast.emit('chat message', { user: socket.username , message: msg} ); // send all except me
		}
	});

	socket.on('disconnect', function(){

		users.splice(users.indexOf(socket.username), 1);
		updateUsernames();

		console.log('user disconnect');
		connections.splice(connections.indexOf(socket), 1);
		//delete users[socket.username];
		console.log('user conected : ' + connections.length);
		//updateUsernames();
	});

	// new user
	socket.on('new user', function(data, callback){
		callback(true);
		data =  data.trim();
		socket.username = data;
		users.push(socket.username);

		socketUsers[socket.username] = socket;
		updateUsernames();

	});

	function updateUsernames(){
		io.emit('get users', users);
	}

})

http.listen(app.get('port'), function (){
	console.log('App listen port : ' + app.get('port'));
});