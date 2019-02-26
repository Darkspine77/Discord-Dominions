const Discord = require("discord.js");
const firebase = require("firebase");
const credentials = require("./credentials.json")
const tools = require("./tools.js")
const client = new Discord.Client();
const fs = require("fs")
let commands = {};
fs.readdir("./commands", function(err, items) {
    for(var command of items){
        commands[command.split(".js")[0]] = require("./commands/" + command)
    }
});


String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var version = "0.0.1"
firebase.initializeApp(credentials.database);

client.login(credentials.token)

client.on('ready', () => {
    tools.initialize(firebase,client,version,fs)
    tools.tools = tools
	console.log("Starting Dominions v" + version + " ... on shard #" + (client.shard.id + 1))
	setInterval(function(){
		client.user.setPresence({game:{name:"Discord Dominions v" + version}})
	},60000)
});

client.on('guildMemberUpdate', (oldMember,newMember) => {
    tools.getDominion(newMember.guild.id,function(dominion){
        if(newMember.user.id != dominion.owner && newMember["_roles"].includes(dominion.roles.leader.id)){
            var embed = new Discord.RichEmbed()
            tools.getPlayer(newMember.user.id,function(player){
                if(player != null){
                    console.log("test")
                    for(var member of newMember.guild.members.array()){
                        if(member["_roles"].includes(dominion.roles.leader.id) && member.user.id != newMember.user.id){
                            member.removeRole(dominion.roles.leader.id)
                        }
                    }
                    dominion.owner = newMember.user.id
                    embed.addField("New Leadership",newMember.user.username + " has been made leader of the dominion of " + newMember.guild.name + "!")
                    tools.updateDominion(dominion,function(){
                        for(var channel in dominion.legalChannels){
                            tools.outputEmbed(client.channels.get(dominion.legalChannels[channel]),embed)
                        }  
                    })
                } else {
                    newMember.removeRole(dominion.roles.leader.id)
                    if(newMember.user.id != client.user.id){
                        embed.addField("Attempted Promotion","A user tried to give you owner ship of the dominion of " + newMember.guild.name + ". Please do +start and ask them to try again",true)
                        newMember.user.createDM().then(dm => {
                                tools.outputEmbed(dm,embed)
                            }
                        )
                    }
                }
            })
            
        }
    })   
})

client.on('message', message => {
    if(message.author.id == client.user.id){
        return
    } 
    var input = message.content.split(" ")
    var playerData = firebase.database().ref("players/" + message.author.id);
    playerData.once('value').then(function(playerSnapshot) {
        var dominions = firebase.database().ref("dominions/" + message.guild.id);
        dominions.once('value').then(function(dominionSnapshot) {
            var prefix = "+";
            var legal = true;
            var player = playerSnapshot.val()
            var dominion = dominionSnapshot.val()
            if(player != null){
                prefix = player.prefix 
            }
            if(dominion != null){
                legal = dominion.legalChannels.includes(message.channel.id)
            }
            var embed = new Discord.RichEmbed();
            if(input[0].slice(0,prefix.length) == prefix || input[0].slice(0,1) == "+"){
                if(legal){
                    var commandString = input[0].slice(prefix.length).toLocaleLowerCase()
                    if(commands[commandString]){
                        var command = commands[commandString]
                        if(command.fullAuth){
                            if(dominion != null && player != null){
                                var now = new Date();
                                if(now.getTime() - player.lastAction >= 300000 && player.energy != player.energyCap){
                                    player.energy += Math.floor((now.getTime() - player.lastAction)/300000)
                                    player.lastAction = now.getTime()
                                    if(player.energy > player.energyCap){
                                        player.energy = player.energyCap
                                    }
                                    tools.updatePlayer(player,function(){
                                        embed.setFooter("Discord Dominions v" + version + " by Darkspine77#1365 ⚡" + player.name + " now has (" + player.energy + " / " + player.energyCap + ") energy!⚡")
                                        command.run(tools,input,dominion,player,message,embed)
                                    })
                                } else {
                                    embed.setFooter("Discord Dominions v" + version + " by Darkspine77#1365")
                                    command.run(tools,input,dominion,player,message,embed)
                                }
                            } else {
                                if(dominion == null){
                                    embed.addField("Error","A dominion must be started in this server before this command can be used here. Have the server owner do the command '+claim' in the channel that will be used for this bots functions.",true)
                                }
                                if(player == null){
                                    embed.addField("Error","No player account exists for " + message.author.username +". Please do +start",true)
                                }
                                tools.outputEmbed(message.channel,embed,player)
                            }            
                        } else {
                            command.run(tools,input,message,embed)
                        }
                    } else {
                        embed.addField("Error","Command not found",true)
                        tools.outputEmbed(message.channel,embed) 
                    }
                } else {
                    var legalChannels = dominion.legalChannels
                    var channelList = ""
                    for(var channel in legalChannels){
                        channelList += "<#" + legalChannels[channel] + ">  "
                    }
                    embed.addField("Error","Commands for Discord Dominions can only be used in the following channels: " + channelList,true)
                    tools.outputEmbed(message.channel,embed)  
                }   
            }                   
        })
	})
})

client.on('guildCreate', guild => {
    var embed = new Discord.RichEmbed();
    embed.addField("Welcome to Discord Dominions!","Please have the owner of this server do the command '+claim' in the in the channel that will be used for this bots functions.")
    var sent = false;
    var i = 0;
    guild.fetchMember(client.user).then(member => {
        while(!sent){   
            if(guild.channels.array()[i].permissionsFor(member).has("SEND_MESSAGES") && guild.channels.array()[i].sendEmbed != undefined){
                tools.outputEmbed(guild.channels.array()[i],embed) 
                sent = true
            }
            i++
        }
    })
})