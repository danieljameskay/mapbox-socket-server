const server = require('http').createServer();
const io = require('socket.io')(server);


const port = process.env.PORT || 1337;

io.on('connection', function(client){
  client.on('current_loc', function(data){
    console.log(data)

  });
  client.on('disconnect', function(){});
});

server.listen(port);