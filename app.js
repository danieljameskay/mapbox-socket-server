const server = require('http').createServer();
const io = require('socket.io')(server);
const kafka = require("node-rdkafka");
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 1337;
let kafkaReady = false;

const producer = new kafka.Producer({
  'metadata.broker.list' : '0.tcp.ngrok.io:15346',
  'dr_cb': true
});

producer.connect(null, (err, data) => { 
  if(!err) {
    server.listen(port);
    console.log(`Listening on port ${port}.`);
  } else {
    console.error("An error has occured.");
    console.error(err);
  }
}).on('ready', () => {
  kafkaReady = true;
  console.log("Connected to Kafka.")
});

producer.on('event.error', function(err) {
  console.error('Error from producer');
  console.error(err);
});

io.on('connection', client => {
  console.log('A client connected.');
  if(kafkaReady) {
    client.on('current_loc', data => {
      try {
        console.log(data);
        producer.produce('car_loc', null, new Buffer(data), "1", Date.now(), null);
      } catch(e) {
        console.error('A problem occurred when sending our message.');
        console.error(e);
      };
    });
  }
});
