const server = require('http').createServer();
const io = require('socket.io')(server);

const PORT = 9667;
let clients = [];
let room = 0;
let userID = 0;

io.on('connection', client => {
  client.roomId = ++room;

  // User id for React user list key.
  client.userId = ++userID;

  console.log(`[${client.id}] Connected!`);

  clients.push(client);

  client.on('loginUser', userData => {
    client.name = userData.name;

    // Place user to desired room.
    if (userData.room) {
      client.roomId = +userData.room;
    }

    console.log(
      `[${client.id}] ${client.name} with id ${client.userId} joined room ${client.roomId}`
    );

    // Send to user his room number and id.
    client.emit('loginUser', {
      roomId: client.roomId,
      userId: client.userId
    });

    // Notify all users in the room for the new user joined.
    let usersList = [];
    for (let c = 0; c < clients.length; c++) {
      if (clients[c].roomId == client.roomId) {

        clients[c].emit(
          'chatUser', [{
            id: client.userId,
            name: client.name,
            online: true
          }]);

        usersList.push({
          id: clients[c].userId,
          name: clients[c].name
        });

      }
    }

    // Send users list to the new user.
    client.emit('usersList', usersList);
  });

  // User sent message,
  // so moderate it and send to all users in the room.
  client.on('sendMessage', messageText => {

    console.log(
      `[${client.id}] ${client.name} in ` +
      `room ${client.roomId} message: ${messageText}`
    );

    for (let c = 0; c < clients.length; c++) {
      if (clients[c].roomId == client.roomId) {

        clients[c].emit('sendMessage', {
          author: client.name,
          text: messageText,
          datetime: new Date().toLocaleTimeString(),
          local: clients[c] === client
        });

        console.log(
          `Resent message to ${clients[c].name}`
        );

      }
    }
  });

  // User has leaved chat.
  client.on('disconnect', () => {

    console.log(
      `[${client.id}] Disconnected ${client.name}` +
      ` from room = ${client.roomId}`
    );

    clients.splice(clients.indexOf(client), 1);

    // Notify all users in the room for the user has leaved.
    for (let c = 0; c < clients.length; c++) {
      if (clients[c].roomId == client.roomId) {

        clients[c].emit(
          'chatUser', [{
            id: client.userId,
            name: client.name,
            online: false
          }]);

      }
    }
  });
});

// Ctrl+C pressed!
process.on('SIGINT', () => {
  server.close();
  setTimeout(process.exit, 1000, 0);
});


server.listen(PORT);
console.log("listening port " + PORT);
