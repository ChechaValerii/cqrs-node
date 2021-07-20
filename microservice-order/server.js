// server.js is the starting point of the domain process:
//
// `node server.js`
const log4js = require('log4js');
const colors = require('../colors');
const msgbus = require('../msgbus');
const domainConfig = require('../config/domain-config');

// configurate logger
log4js.configure({
  appenders: [
    {
      type: 'console',
    },
    {
      type: 'log4js-node-mongodb',
      connectionString: 'localhost:27017/logs',
      category: 'order',
    },
  ],
});

const logger = log4js.getLogger('order');

// configurate domain
const domain = require('cqrs-domain')({
  domainPath: `${__dirname}/lib`,
  eventStore: {
    type: 'mongodb',
    host: 'localhost', // optional
    port: 27017, // optional
    dbName: 'domain-order', // optional
    eventsCollectionName: 'events', // optional
    snapshotsCollectionName: 'snapshots', // optional
    transactionsCollectionName: 'transactions', // optional
    timeout: 10000, // optional
    // authSource: 'authedicationDatabase',        // optional
    // username: 'technicalDbUser',                // optional
    // password: 'secret'                          // optional
  },
});

domain.defineCommand(domainConfig.commandDefinition);
domain.defineEvent(domainConfig.eventDefinition);

domain.init((err) => {
  if (err) {
    return logger.error(err);
  }

  // on receiving a message (__=command__) from msgbus pass it to
  // the domain calling the handle function
  msgbus.onCommand((cmd) => {
    logger.info(colors.blue(`\ndomain -- received command ${cmd.command} from redis:`));
    logger.info(cmd);

    logger.info(colors.cyan(`\n-> handle command ${cmd.command}`));

    domain.handle(cmd);
  });

  // on receiving a message (__=event) from domain pass it to the msgbus
  domain.onEvent((evt) => {
    logger.info(`domain: ${evt.event}`);
    msgbus.emitEvent(evt);
  });

  logger.trace('Starting Orders Microservice'.cyan);
});
