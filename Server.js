const server = require('http').createServer();
const io = require('socket.io')(server);

const PORT = 9667;
let clients = [];
let room = 0;

io.on('connection', client => {
  client.roomId = ++room;
  console.log(`Connected [${client.id}] to room ${client.roomId}`);

  clients.push(client);

  client.on('loginUser', data => {
    console.log(`Logged in user ${data} to room ${client.roomId}`);
  });

  client.on('disconnect', () => {
    console.log(`Disconnected [${client.id}] ${client.userName} from room = ${client.roomId}`);
    clients = clients.splice(clients.indexOf(client), 1);
  });
});

// Ctrl+C
process.on('SIGINT', () => {
  server.close();
  setTimeout(process.exit, 1000, 0);
});

server.listen(PORT);
console.log("listening port " + PORT);
