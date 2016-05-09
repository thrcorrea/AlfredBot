'use strict';

var AlfredBot = require('../lib/alfredbot');

var token = process.env.BOT_API_KEY;
var name = process.env.BOT_NAME;

var alfredbot = new AlfredBot({
    token: token,
    name: name
});

alfredbot.run();