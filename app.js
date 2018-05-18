const server = require('http').createServer();
const io = require('socket.io')(server);
const kafka = require("node-rdkafka");
require('dotenv').config();

const port = process.env.PORT || 1337;

const producer = new kafka.Producer({
  'metadata.broker.list' : process.env.KAFKA_BROKER_URL,
  'dr_cb': true
})

producer.connect(err => { console.log(err) });

io.on('connection', client => {
  console.log('A client connected.');
  producer.on('ready', () => { 
    client.on('current_loc', data => {
      try {
        console.log(data);
        producer.produce('car_loc', null, new Buffer(data), null, Date.now);
      } catch(e) {
        console.error('A problem occurred when sending our message.');
        console.error(e);
      };
    });
    client.on('disconnect', () => {console.log("A driver disconnected,")});
  });
  producer.on('event.error', function(err) {
    console.error('Error from producer');
    console.error(err);
  })
});

server.listen(port);
console.log(`Listening on port ${port}.`);