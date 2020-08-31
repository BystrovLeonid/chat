const server = require('http').createServer();
const io = require('socket.io')(server);

const PORT = 9667;
let clients = [];
let room = 0;
let userID = 0;

io.on('connection', client => {
  client.roomId = ++room;
  // client.roomId = 1;
  client.loggedIn = false;
  client.userId = ++userID;
  console.log(`[${client.id}] Connected!`);

  clients.push(client);

  client.on('loginUser', userData => {
    client.userName = userData.name;
    if(userData.room > 0) {
      client.roomId = userData.room;
    }
    client.loggedIn = true;
    console.log(`[${client.id}] Logged in user ${client.userName} to room ${client.roomId}`);
    client.emit('loginUser', {roomId: client.roomId, userId: client.userId});

    let usersList = [];
    for (let c = 0; c < clients.length; c++) {
      if (clients[c].loggedIn && clients[c].roomId == client.roomId) {
        clients[c].emit('chatUser', [{ id: client.userId, name: userData.name, online: true }]);
        usersList.push({ id: clients[c].userId, name: clients[c].userName, online: clients[c].online });
      }
    }
    client.emit('usersList', usersList);
  });

  client.on('sendMessage', messageText => {
    console.log(`[${client.id}] ${client.userName} in room ${client.roomId} message: ${messageText}`);

    for (let c = 0; c < clients.length; c++) {
      if (clients[c].loggedIn && clients[c].roomId == client.roomId) {
        clients[c].emit('sendMessage', {
          author: client.userName,
          text: messageText,
          datetime: new Date().toLocaleTimeString(),
          local: clients[c] === client
        });
        console.log(`Resent message to ${clients[c].userName}`);
      }
    }
  });


  client.on('disconnect', () => {
    console.log(`[${client.id}] Disconnected ${client.userName} from room = ${client.roomId}`);
    client.loggedIn = false;

    clients.splice(clients.indexOf(client), 1);

    for (let c = 0; c < clients.length; c++) {
      if (clients[c].loggedIn && clients[c].roomId == client.roomId) {
        clients[c].emit('chatUser', [{ id: client.userId, name: client.userName, online: client.loggedIn }]);
      }
    }
  });
});

// Ctrl+C
process.on('SIGINT', () => {
  server.close();
  setTimeout(process.exit, 1000, 0);
});

server.listen(PORT);
console.log("listening port " + PORT);
