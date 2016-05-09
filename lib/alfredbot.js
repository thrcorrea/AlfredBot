'use strict';

var util = require('util');
var path = require('path');
var Bot = require('slackbots');
var database = require('../config/database.js');
var pg = require('pg');

var AlfredBot = function Constructor(settings){
    this.settings = settings;
    this.settings.name = this.settings.name || 'alfredbot';
    
    this.user = null;   
    
    console.log('Iniciando Bot...')
};

util.inherits(AlfredBot, Bot);

AlfredBot.prototype.run = function(){
    AlfredBot.super_.call(this, this.settings);
    
    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

AlfredBot.prototype._onStart = function(){
    this._loadBotUser();
    this._firstRunCheck();
};

AlfredBot.prototype._loadBotUser = function(){
    var self = this;
    this.user = this.users.filter(function(user){
        return user.name === self.name;
    })[0];
};

AlfredBot.prototype._firstRunCheck = function(){
    var self = this;
    this._welcomeMessage();
};

AlfredBot.prototype._welcomeMessage = function(){
    this.postMessageToChannel(this.channels[0].name, 'Olá mestre, se precisar de algo é só falar "alfred"', {as_user: true});
};

AlfredBot.prototype._onMessage = function(message){
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromAlfredBot(message) &&
        this._isMentioningAlfred(message)
    ){
        this._verificaQualResposta(message);
    }
};

AlfredBot.prototype._verificaQualResposta = function (message) {
    if (message.text.toLowerCase().indexOf('/fosprint') > -1) {
        this._MostraFosSprint(message);
    } 
};

AlfredBot.prototype._isChatMessage = function(message){
    return message.type === 'message' && Boolean(message.text);
};

AlfredBot.prototype._isChannelConversation = function(message){
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C';
};

AlfredBot.prototype._isFromAlfredBot = function(message){
    return message.user === this.user.id;
};

AlfredBot.prototype._isMentioningAlfred = function(message){
    return message.text.toLowerCase().indexOf('alfred') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1;
};

AlfredBot.prototype._postaMensagem = function(originalMessage, mensagem){
    var self = this;
    var channel = self._getChannelById(originalMessage.channel);
    self.postMessageToChannel(channel.name, 'Aqui está patrão bruce: ' + mensagem, {as_user: true});
};

AlfredBot.prototype._MostraFosSprint = function(originalMessage){
    var self = this;
    
    var results = [];
    
    pg.connect(database.url, function(err, client, done){
       if (err){
           done();
           console.log(err);
       }
       
       var query = client.query("select numero_fo from gerente.fos where cod_funcionario_responsavel_fo = (select id_funcionario from gerente.funcionarios where nm_funcionario ilike 'SPRINT')");
       
       query.on('row', function(row){
           results.push(row); 
       });
       
       query.on('end', function(){
          done();
          
          var numeroFos = '';
          
          for (var index = 0; index < results.length; index++) {
              if (index == 0) {
                  numeroFos = results[index].numero_fo;
              }else{
                numeroFos = numeroFos + ' - ' + results[index].numero_fo;
              }
          };
          
         self._postaMensagem(originalMessage, numeroFos);
       });
    });
    
};

AlfredBot.prototype._getChannelById = function(channelId) {
    return this.channels.filter(function (item){
        return item.id === channelId
    })[0];
    
    console.log('executou getchannelbyid');
};

module.exports = AlfredBot;