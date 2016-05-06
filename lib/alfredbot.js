'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');
// var database = require('..config/database.js');
var pg = require('pg');

var AlfredBot = function Constructor(settings){
    this.settings = settings;
    this.settings.name = this.settings.name || 'alfredbot';
    this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'norrisbot.db');
    
    // this.user = null;
    this.db = null;
    
    console.log('Iniciando Bot...')
};

util.inherits(AlfredBot, Bot);

AlfredBot.prototype.run = function(){
    AlfredBot.super_.call(this, this.settings);
    
    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

AlfredBot.prototype._onStart = function(){
    console.log('funcao de start');
    this._loadBotUser();
    console.log('passou pelo load');
    this._connectDb();
    console.log('conectou com o banco');
    this._firstRunCheck();
    console.log('passou pelo first run check');
};

AlfredBot.prototype._loadBotUser = function(){
    var self = this;
    console.log('this.users' + this.users);
    console.log('self.name' + self.name);
    console.log('this.name' + this.name);
    this.user = this.users.filter(function(user){
        console.log('user.name' + user.name);
        return user.name === self.name;
    })[0];
};

AlfredBot.prototype._connectDb = function(){
    if (!fs.existsSync(this.dbPath)){
        console.error('Database path ' + '"' + this.dbPath + '" does not exists.');
        process.exit(1);
    }
    
    this.db = new SQLite.Database(this.dbPath);
};

AlfredBot.prototype._firstRunCheck = function(){
    var self = this;
    self.db.get('select val from info where name = "lastrun" limit 1', function(err, record){
       if (err) {
           return console.error('Databse error: ', err);
       } 
       
       var currentTime = (new Date()).toJSON();
       
       console.log('verifica se ja existe record');
       if(true){
           console.log('ira dispar mensagem');
           self._welcomeMessage();
           return true;
        //    return self.db.run('insert into info(name, val) values("lastrun", ?)', currentTime);
       }
       
       self.db.run('update info set val = ? where name = "lastrun"', currentTime);
    });
};

AlfredBot.prototype._welcomeMessage = function(){
    console.log('canal: ' + this.channels[0].name);
    this.postMessageToChannel(this.channels[0].name, 'Olá mestre, se precisar de algo é só falar "alfred"', {as_user: true});
};

AlfredBot.prototype._onMessage = function(message){
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromAlfredBot(message) &&
        this._isMentioningAlfred(message)
    ){
        //this._replyWithRandomJoke(message);
        this._MostraFosSprint(message);
        
        var channel = this._getChannelById(message.channel);
        this.postMessageToChannel(channel.name, 'Olá patrão bruce, por enquanto não possuo nenhuma funcionalide. ', {as_user: true});
    }
};

AlfredBot.prototype._isChatMessage = function(message){
    return message.type === 'message' && Boolean(message.text);
    console.log('executou ischatmessage');
};

AlfredBot.prototype._isChannelConversation = function(message){
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C';
    console.log('executou ischannelconversation');
};

AlfredBot.prototype._isFromAlfredBot = function(message){
    console.log('executando isfromalfred');
    console.log('Message user' + message.user);
    console.log('this user' + this.user);
    return message.user === this.user.id;
    console.log('executou isfromalfred');
};

AlfredBot.prototype._isMentioningAlfred = function(message){
    return message.text.toLowerCase().indexOf('alfred') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1;
        
   console.log('executou is metioning alfred');
};

AlfredBot.prototype._replyWithRandomJoke = function(originalMessage){
    var self = this;
    self.db.get('select id, joke from jokes order by used asc, random() limit 1', function(err, record){
        if (err) {
            return console.err('database error:', err);
        }
        
        var channel = self._getChannelById(originalMessage.channel);
        self.postMessageToChannel(channel.name, record.joke, {as_user: true});
        self.db.run('update jokes set used = used + 1 where id = ?', record.id);
    });
    
    console.log('executou replywith random joke');
};

AlfredBot.prototype._MostraFosSprint = function(originalMessage){
    var self = this;
    
    var results = [];
    
    pg.connect('postgres://hd_faturamento:fat2013@192.168.232.210:5437/hd_producao', function(err, client, done){
       if (err){
           done();
           console.log(err);
       } 
       
       var query = client.query("select numero_fo from gerente.fos where cod_funcionario_responsavel_fo = (select id_funcionario from gerente.funcionarios where nm_funcionario = 'SPRINT')");
       
       query.on('row', function(row){
           results.push(row); 
       });
       
       query.on('end', function(){
          done();
          console.log(results);
          var channel = self._getChannelById(originalMessage.channel);
          self.postMessageToChannel(channel.name, results, {as_user: true});
       });
    });
    
}

AlfredBot.prototype._getChannelById = function(channelId) {
    return this.channels.filter(function (item){
        return item.id === channelId
    })[0];
    
    console.log('executou getchannelbyid');
};

module.exports = AlfredBot;