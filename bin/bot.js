'use strict';

var AlfredBot = require('../lib/alfredbot');

var token = 'xoxb-39217127474-kVF0ZDN32WSBpnhGk4tp7sbs';//process.env.BOT_API_KEY;
var dbPath = process.env.BOT_DB_PATH;
var name = process.env.BOT_NAME;

var alfredbot = new AlfredBot({
    token: token,
    dbPath: dbPath,
    name: name
});

alfredbot.run();