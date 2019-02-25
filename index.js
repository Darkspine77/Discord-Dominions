const Discord = require("discord.js");
const firebase = require("firebase");
const credentials = require("./credentials.json")
const { createCanvas, loadImage, Image } = require('canvas')
const client = new Discord.Client();
const fs = require("fs")

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var cityToSpriteMap = {
    0:"grass",
    1:"capital",
    2:"lumberyard",
    3:"mine"
}

var config = {
    apiKey: "AIzaSyCtMLkPCbgRLUUkY9r4zjFe5djwMqoUrN0",
    authDomain: "discord-dominions.firebaseapp.com",
    databaseURL: "https://discord-dominions.firebaseio.com",
    projectId: "discord-dominions",
    storageBucket: "discord-dominions.appspot.com",
    messagingSenderId: "802474753316"
};

var version = "0.0.1"
firebase.initializeApp(config);


function updatePlayer(newData,callback){
    var playerData = firebase.database().ref("players/" + newData.id);
    playerData.update(newData)
    callback(newData)
}

function getPlayer(id,callback){
    var playerData = firebase.database().ref("players/" + id);
    playerData.once('value').then(function(playerSnapshot) {
        callback(playerSnapshot.val())
    })
}

function updateDominion(newData,callback){
    var dominionData = firebase.database().ref("dominions/" + newData.id);
    dominionData.update(newData)
    callback(newData)
}

function getDominion(id,callback){
    var dominionData = firebase.database().ref("dominions/" + id);
    dominionData.once('value').then(function(dominionSnapshot) {
        callback(dominionSnapshot.val())
    })
}

client.login(credentials.token)

client.on('ready', () => {
	console.log("Starting Dominions v" + version + " ... on shard #" + (client.shard.id + 1))
	setInterval(function(){
		client.user.setPresence({game:{name:"Discord Dominions v" + version}})
	},60000)
});

function getRandom(min,max){
    return (Math.random() * (max - min)) + min
}

function drawProfile(user,channel,embed,callback){
    getPlayer(user.id,function(player){
        var date = new Date(player.dob)
        embed.setTitle(player.name)
        embed.addField("Date Started:",date.toString(),true)
        embed.addField("Energy:",player.energy + " / " + player.energyCap,false)
        embed.addField("Followers:",player.followers,true)
        for(var skill in player.toolLevel){
            var durability = player.toolDurability[skill]
            if(durability == -1){
                durability = "Infinite"
            }
            var rank = player.toolLevel[skill]
            if(rank == 0){
                rank = "None"
            }
            embed.addField(skill.capitalize() + ":","Rank: " + rank + "\nDurability: " + durability,true)
        }
        var resources = ""
        var resourceCount = 0
        for(var type in player.resources){
            resources += type.capitalize() + ": " + player.resources[type] + "\n"
            resourceCount += player.resources[type]
        }
        embed.addField("Resources (" + resourceCount + " / " + player.storageCapacity + "):" ,resources,true)
        embed.setThumbnail(user.displayAvatarURL)
        callback(embed)
    })
}

function drawCity(dominion,channel,embed,callback){
    var out = fs.createWriteStream("./cities/" + dominion.id + '.jpg')
    var canvas = createCanvas(144, 144)
    const ctx = canvas.getContext('2d')
    var stream = canvas.pngStream();
    var sprites = {}                
    fs.readdir("./art",function(err,items){
        for(var images in items){
            const img = new Image()
            img.src = "./art/" + items[images]
            sprites[items[images].split(".")[0]] = (img)
        }
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                ctx.drawImage(sprites[cityToSpriteMap[dominion.city[i][j]]],i*16,j*16)
            }   
        }
                
        stream.on('data', function(chunk){
            out.write(chunk);
          });
           
          stream.on('end', function(){
            out.end(function(){
                embed.addField("City View","Now viewing the city of the dominion of " + client.guilds.get(dominion.id).name + "!",true)
                embed.attachFile("./cities/" + dominion.id + '.jpg')
                callback(embed)
            })
          });
    })
}

function createPlayer(user){
    var playerData = firebase.database().ref("players/" + user.id);
    playerData.once('value').then(function(playerSnapshot) {
        var now = new Date();
        var newPlayer = {
            name:user.username,
            id:user.id,
            lastAction:now.getTime(),
            resources:{
                coal:0,
                ironOre:0,
                stone:0,
                crystals:0,
                food:0,
                lumber:0
            },
            storageCapacity:200,
            followers:0,
            toolLevel:{
                fighting:1,
                mining:1,
                lumberjacking:1,
                building:1,
                farming:0
            },
            toolDurability:{
                fighting:-1,
                mining:-1,
                lumberjacking:-1,
                building:-1,
                farming:-1
            },
            energy:10,
            energyCap:10,
            dominions:[],
            dob:now.getTime(),
            prefix:"+"
        }
        playerData.update(newPlayer)
    })
}

function outputEmbed(channel,embed,player){
    if(player != null && player != undefined){
        var now = new Date();
        if(now.getTime() - player.lastAction >= 600000 && player.energy != player.energyCap){
            player.energy += Math.floor(now.getTime() - player.lastAction/600000)
            player.lastAction = now.getTime()
            if(player.energy > player.energyCap){
                player.energy = player.energyCap
            }
            updatePlayer(player,function(){
                embed.setFooter("Discord Dominons v" + version + " by Darkspine77#1365 ⚡" +player.name + " now has (" + player.energy + " / " + player.energyCap + ") energy!⚡")
                channel.sendEmbed("",embed)
            })
        } else {
            embed.setFooter("Discord Dominons v" + version + " by Darkspine77#1365")
            channel.sendEmbed("",embed)
        }
    } else {
        embed.setFooter("Discord Dominons v" + version + " by Darkspine77#1365")
        channel.sendEmbed("",embed)
    }   
}

function createDominion(guild,user,channelID){
    var playerData = firebase.database().ref("players/" + user.id);
    playerData.once('value').then(function(playerSnapshot) {
        var now = new Date();
        var dominions = firebase.database().ref("dominions/" + guild.id);
        var newDominion = {
            resources:{
                villagerPopulation:0,
                coal:0,
                stone:0,
                iron:0,
                crystals:0,
                food:0,
                lumber:0,
                housing:0
            },
            city:[
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0]
            ],
            storageCapacity:2000,
            military:[0,0,0,0,0,0,0,0,0,0],
            id:guild.id,
            owner:user.id,
            moderators:[user.id],
            dob:now.getTime(),
            legalChannels:[channelID]
        }
        if(playerSnapshot.val() == null){
            createPlayer(user)
        }
        dominions.update(newDominion)
    })
}

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
            if(legal){
                switch(input[0]){
                    case prefix + "claim":
                        if(message.author.id == message.guild.ownerID){
                            if(dominion == null){
                                embed.addField("Dominion Created","The dominion of " + message.guild.name + " has been created! All commands related to Discord Dominions will be handled here",true)
                                embed.addField("Player Created","Welcome to the world of Discord Dominions " + message.author.username + "!",true)
                                createDominion(message.guild,message.author,message.channel.id)
                                outputEmbed(message.channel,embed)  
                            } else {
                                embed.addField("Error","A dominion for this server has already been created",true)
                                outputEmbed(message.channel,embed)  
                            }
                        } else {
                            embed.addField("Error","A dominion can only be started by the server owner. Have them do the command '+claim' in the channel that will be used for this bots functions.",true)
                            outputEmbed(message.channel,embed)  
                        }
                        break;
                    case prefix + "start":
                        if(player == null){
                            embed.addField("Player Created","Welcome to the world of Discord Dominions " + message.author.username + "!",true)
                            createPlayer(message.author)
                            outputEmbed(message.channel,embed)  
                        } else {
                            embed.addField("Error","A player account already exists for " + message.author.username,true)
                            outputEmbed(message.channel,embed)  
                        }
                        break;
                    default:
                        if(dominion != null && player != null){
                            switch(input[0]){
                                case prefix + "city":
                                    if(dominion != null){
                                        drawCity(dominion,message.channel,embed,function(newembed){
                                            message.channel.send("",newembed,player)  
                                        })
                                    } else {
                                        embed.addField("Error","A dominion has not been established for this server, ask the creator of the server to do +claim",true)
                                        outputEmbed(message.channel,embed,player)  
                                    }
                                    break; 
                                case prefix + "profile":
                                        drawProfile(message.author,message.channel,embed,function(newembed){
                                            outputEmbed(message.channel,embed,player) 
                                        })
                                    break;
                                case prefix + "gather":
                                    var actionMap = {
                                        "minerals":"mining",
                                        "lumber":"lumberjacking"
                                    }
                                    if(input.length == 2){
                                        var yieldMaps = {
                                            mining:{
                                                stone:[0.9,8],
                                                coal:[0.5,5],
                                                ironOre:[0.33,1.33],
                                                crystals:[0.1,0.9]
                                            },
                                            lumberjacking:{
                                                lumber:[2,10]
                                            }
                                        }
                                        var resourceStructureMap = {
                                            "minerals":3,
                                            "lumber":2
                                        }                                        
                                        var resourceStructureID = resourceStructureMap[input[1]]
                                        var action = actionMap[input[1]];
                                        if(action != undefined){
                                            var energyCost = 2
                                            for(var row in dominion.city){
                                                if(dominion.city[row].includes(resourceStructureID)){
                                                    energyCost = 1
                                                    break;
                                                }
                                            }
                                            if(player.energy >= energyCost){
                                                player.energy -= energyCost        
                                                var maximumYield = 0
                                                for(var resource in yieldMaps[action]){
                                                    maximumYield += yieldMaps[action][resource][1] * player.toolLevel[action]
                                                }
                                                var currentCapacity  = 0
                                                for(var type in player.resources){
                                                    currentCapacity += player.resources[type]
                                                }
                                                if(currentCapacity + maximumYield <= player.storageCapacity){
                                                    var resourceYield = yieldMaps[action]
                                                    for(var resources in resourceYield){
                                                        resourceYield[resources] = Math.floor(getRandom(player.toolLevel[action] * resourceYield[resources][0],player.toolLevel[action] * resourceYield[resources][1]))
                                                    }
                                                    embed.setTitle("Resources Gathered By " + player.name + ":")
                                                    for(var type in resourceYield){
                                                        player.resources[type] += resourceYield[type]
                                                        embed.addField(type.capitalize(),resourceYield[type],true)
                                                    }
                                                    if(player.toolDurability[action] != -1){
                                                        player.toolDurability[action]--
                                                        if(player.toolDurability[action] == 0){
                                                            player.toolLevel[action] = 1
                                                            player.toolDurability[action] = -1
                                                        }
                                                    }
                                                    updatePlayer(player,function(newPlayer){
                                                        outputEmbed(message.channel,embed,newPlayer)
                                                    })
                                                } else {
                                                    embed.addField("Not Enough Capacity","You would not be able to store the maximum resource yield from this action")
                                                    outputEmbed(message.channel,embed,player)
                                                }  
                                            } else {
                                                embed.addField("Out of Energy","You need more energy before you preform an action")
                                                outputEmbed(message.channel,embed,player)
                                            }
                                        }  else {
                                            var validResources = ""
                                            for(var resource in resourceStructureMap){
                                                validResources += "(" + resource + ")\n"
                                            }
                                            embed.addField("Invalid Resource",input[1] + " is not a valid resource to gather. Valid resources to gather are:\n" + validResources)
                                            outputEmbed(message.channel,embed,player)
                                        }
                                    } else {
                                        var validParameters = ""
                                        for(var paremeter in actionMap){
                                            validParameters += paremeter + "  "
                                        }
                                        embed.addField("Invalid Use  of Command","Usage: +gather (" + validParameters + ")\nExample: +gather minerals")
                                        outputEmbed(message.channel,embed,player)
                                    }
                                    break;
                            }   
                        } else {
                            if(dominion == null){
                                embed.addField("Error","A dominion must be started in this server before Discord Dominions commands can be used here. Have the server owner do the command '+claim' in the channel that will be used for this bots functions.",true)
                            }
                            if(player == null){
                                embed.addField("Error","No player account exists for " + message.author.username +". Please do +start",true)
                            }
                            outputEmbed(message.channel,embed,player)
                        }    
                        break;                 
                }
            } else {
                var legalChannels = dominion.legalChannels
                var channelList = ""
                for(var channel in legalChannels){
                    channelList += "<#" + legalChannels[channel] + ">  "
                }
                embed.addField("Error","Commands for Discord Dominions can only be used in the following channels: " + channelList,true)
                outputEmbed(message.channel,embed)  
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
                outputEmbed(guild.channels.array()[i],embed) 
                sent = true
            }
            i++
        }
    })
})