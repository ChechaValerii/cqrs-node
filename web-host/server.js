// server.js is the starting point of the host process:
//
// `node server.js`
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const log4js = require('log4js');
const socket = require('socket.io');
const viewmodel = require('viewmodel');
const colors = require('../colors');
const eventDenormalizerConfig = require('../config/eventDenormalizer-config');

// configurate logger
log4js.configure({
  appenders: [
    {
      type: 'console',
    },
    {
      type: 'log4js-node-mongodb',
      connectionString: 'localhost:27017/logs',
      category: 'host',
    },
  ],
});

const logger = log4js.getLogger('host');

// create an configure:
//
// - express webserver
// - socket.io socket communication from/to browser
const app = express();
const server = http.createServer(app);
const io = socket.listen(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use('/bower_components', express.static(`${__dirname}/bower_components`));

app.engine('html', require('ejs').renderFile);

app.set('views', `${__dirname}/public/views`);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

// BOOTSTRAPPING
logger.trace('\nBOOTSTRAPPING:'.cyan);

const eventDenormalizerOptions = {
  denormalizerPath: `${__dirname}/app/viewBuilders`,
  repository: eventDenormalizerConfig.repository,
  revisionGuardStore: eventDenormalizerConfig.revisionGuardStore,
};

logger.trace('1. -> viewmodel'.cyan);
viewmodel.read(eventDenormalizerOptions.repository, (err, repository) => {
  const eventDenormalizer = require('cqrs-eventdenormalizer')(eventDenormalizerOptions);

  eventDenormalizer.defineEvent(eventDenormalizerConfig.eventDefinition);

  logger.trace('2. -> eventdenormalizer'.cyan);
  eventDenormalizer.init((err) => {
    if (err) {
      logger.error(err);
    }

    logger.trace('3. -> routes'.cyan);
    require('./app/routes').actions(app, eventDenormalizerOptions, repository);

    // angular routes
    app.use('/*', (req, res) => {
      res.sendFile('./public/index.html', { root: __dirname });
    });

    logger.trace('4. -> message bus'.cyan);
    const msgbus = require('../msgbus');

    // on receiving an __event__ from redis via the hub module:
    //
    // - let it be handled from the eventDenormalizer to update the viewmodel storage
    msgbus.onEvent((data) => {
      logger.info(colors.cyan(`eventDenormalizer -- denormalize event ${data.event}`));
      eventDenormalizer.handle(data);
    });

    // on receiving an __event__ from eventDenormalizer module:
    //
    // - forward it to connected browsers via socket.io
    eventDenormalizer.onEvent((evt) => {
      logger.info(colors.magenta(`\nsocket.io -- publish event ${evt.event} to browser`));
      io.sockets.emit('events', evt);
    });

    // on receiving an missed__event__ from eventDenormalizer module:
    //
    // - Handle missed event
    eventDenormalizer.onEventMissing((info, evt) => {
      logger.warn(`\n Missed event ${evt.event}:`);
      logger.warn(evt);
      logger.warn(info);

      /*
           eventDenormalizer.handle(evt, function (err) {
            if (err) { logger.error(err); }
           });
           */
    });

    // SETUP COMMUNICATION CHANNELS

    // on receiving __commands__ from browser via socket.io emit them on the ĥub module (which will
    // forward it to message bus (redis pubsub))
    io.sockets.on('connection', (socket) => {
      logger.trace(colors.magenta(' -- connects to socket.io'));

      socket.on('commands', (data) => {
        logger.info(colors.magenta(`\n -- sends command ${data.command}:`));
        logger.info(data);

        msgbus.emitCommand(data);
      });
    });

    // START LISTENING
    const port = 3000;
    logger.trace(colors.cyan(`\nStarting server on port ${port}`));
    server.listen(port);
  });
});
