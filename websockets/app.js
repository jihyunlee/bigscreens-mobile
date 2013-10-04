// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
httpServer.listen(8080);

function requestHandler(req, res) {
	// Read index.html
	fs.readFile(__dirname + '/index.html', 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading canvas_socket.html');
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);
var users = new Array();

io.set('log level', 1);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);

		socket.on('button', function(data) {

			console.log(data);

			var newUser = true;

			for(var i=0; i<users.length; i++) {
				var u = users[i];
				if(data.id == u.id) {
					u.id = data.id;
					u.button = data.button;
					u.cnt += 1;
					users[i] = u;
					newUser = false;
					break;
				}
			}

			if(newUser) {
				var user = {};
				user.id = data.id;
				user.button = data.button;
				user.cnt = 1;
				users.push(user);
			}

			console.log('users', users);

		});


		socket.on('disconnect', function() {

			socket.broadcast.emit('disconnect', socket.id);
			
			var index = -1;
			for(var i=0; i<users.length; i++) {
				if(users[i].id == socket.id)
					index = i;
			}
			if(index != -1) {
				users.splice(index,1);
			}
		});
	}
);