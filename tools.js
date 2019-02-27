const { createCanvas, loadImage, Image } = require('canvas')

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
                iron:0,
                ironOre:0,
                stone:0,
                crystals:0,
                food:0,
                lumber:0,
                gold:0
            },
            followers:0,
            maxGear:4,
            gear:["mining","lumberjacking","construction"],
            toolLevel:[1,1,1],
            toolDurability:[-1,-1,-1],
            energy:10,
            energyCap:10,
            dob:now.getTime(),
            prefix:"+"
        }
        playerData.update(newPlayer)
    })
}
function getPlayerStorage(player){
    return 100 + (player.maxGear - player.gear.length) * 100 
}

module.exports = {
    firebase:null,
    client:null,
    version:null,
    fs:null,
    structureData:null,
    initialize: function(firebaseI,clientI,versionI,fsI,structureDataI){
        firebase = firebaseI
        client = clientI;
        version = versionI;
        fs = fsI;
        structureData = structureDataI
    },
    getDominionName: function (id){
        return client.guilds.get(id).name
    },
    updatePlayer: function (newData,callback){
        var playerData = firebase.database().ref("players/" + newData.id);
        playerData.update(newData)
        callback(newData)
    },
    getPlayer: function (id,callback){
        var playerData = firebase.database().ref("players/" + id);
        playerData.once('value').then(function(playerSnapshot) {
            callback(playerSnapshot.val())
        })
    },
    updateDominion: function (newData,callback){
        var dominionData = firebase.database().ref("dominions/" + newData.id);
        dominionData.update(newData)
        callback(newData)
    },
    getDominion: function (id,callback){
        var dominionData = firebase.database().ref("dominions/" + id);
        dominionData.once('value').then(function(dominionSnapshot) {
            callback(dominionSnapshot.val())
        })
    },
    getAllDominionsSnap: function(callback){
        var data = firebase.database().ref("dominions/");
        data.once('value').then(function(snapshot) {
            callback(snapshot)
        })
    },
    deleteDominion: function (id,callback){
        var data = firebase.database().ref("dominions/");
        data.once('value').then(function(snapshot) {
            snapshot.forEach(function(child) {
                if(child.val().id == id){
                    child.ref.remove();
                    callback()
                }
            })
            
        })
    },
    deletePlayer: function (id,callback){
        var data = firebase.database().ref("players/");
        data.once('value').then(function(snapshot) {
            snapshot.forEach(function(child) {
                if(child.val().id == id){
                    child.ref.remove();
                    callback()
                }
            })
            
        })
    },
    getRandom: function (min,max){
        return (Math.random() * (max - min)) + min
    },
    drawProfile: function (user,channel,embed,callback){
        this.getPlayer(user.id,function(player){
            var date = new Date(player.dob)
            embed.setTitle(player.name)
            embed.addField("Date Started:",date.toString(),)
            embed.addField("Energy:",player.energy + " / " + player.energyCap)
            embed.addField("Followers:",player.followers)
            for(var gearIndex in player.gear){
                var durability = player.toolDurability[gearIndex]
                if(durability == -1){
                    durability = "Infinite"
                }
                var rank = player.toolLevel[gearIndex]
                if(rank == 0){
                    rank = "None"
                }
                embed.addField(player.gear[gearIndex].capitalize() + " Gear:","Rank: " + rank + "\nDurability: " + durability,true)
            }
            var resources = ""
            var resourceCount = 0
            for(var type in player.resources){
                if(player.resources[type] > 0){
                    resources += type.capitalize() + ": " + player.resources[type] + "\n"
                    resourceCount += player.resources[type]
                }
            }
            if(resources == ""){
                embed.addField("Resources (" + resourceCount + " / " + getPlayerStorage(player) + ")","(None)")
            } else {
                embed.addField("Resources (" + resourceCount + " / " + getPlayerStorage(player) + "):" ,resources,true)
            }
            embed.setThumbnail(user.displayAvatarURL)
            callback(embed)
        })
    },
    getDominionStorage: function(dominion){
        var storage = 0
        for(var x in dominion.city){
            for(var y in dominion.city[x]){
                if(dominion.city[x][y] == 8){
                    storage += 200
                }
                if(dominion.city[x][y] == 1){
                    storage += 1000
                }
            } 
        }
        return storage
    },
    getPlayerStorage: function(player){
        return getPlayerStorage(player)
    },
    getDominionCapacity: function(dominion){
        var capacity = 0
        for(var x in dominion.city){
            for(var y in dominion.city[x]){
                if(dominion.city[x][y] == 1){
                    capacity += 5
                }
                if(dominion.city[x][y] == 9){
                    capacity += 10
                }
            } 
        }
        return capacity
    },
    drawDominion: function(dominion,channel,embed,callback){
        var date = new Date(dominion.dob)
        var housing = 0
        embed.setTitle(this.getDominionName(dominion.id))
        embed.addField("Date Created:",date.toString())
        embed.addField("Villager Population: ",dominion.villagerPopulation + "/" + this.getDominionCapacity(dominion))
        var resources = ""
        var resourceCount = 0
        for(var type in dominion.resources){
            if(dominion.resources[type] > 0){
                resources += type.capitalize() + ": " + dominion.resources[type] + "\n"
                resourceCount += dominion.resources[type]
            }
        }
        if(resources == ""){
            embed.addField("Resources (" + resourceCount + " / " + this.getDominionStorage(dominion) + ")","(None)")
        } else {
            embed.addField("Resources (" + resourceCount + " / " + this.getDominionStorage(dominion) + "):" ,resources)
        }
        embed.setThumbnail(channel.guild.splashURL)
        callback(embed)
    },
    drawCity: function (dominion,channel,embed,callback){
        var out = fs.createWriteStream("./cities/" + dominion.id + '.jpg')
        var canvas = createCanvas(290, 290)
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
                    ctx.drawImage(sprites[structureData.buildingMap[dominion.city[i][j]]],i*32,j*32)
                }   
            }    
            ctx.beginPath()  
            for (let i = 0; i < 9; i++) {
                ctx.moveTo(0,i*32)
                ctx.lineTo(290,i*32)   
                ctx.stroke();
                ctx.moveTo(i*32,0)
                ctx.lineTo(i*32,290)   
                ctx.stroke();             
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
    },
    createPlayer: function(user){
        createPlayer(user)
    },
    outputEmbed: function (channel,embed){
        if(!embed.color){
            embed.setColor([114,137,218])
        }
        channel.send("",embed)
    },
    cityHasStructure: function(dominion,structureID){
        for(var row in dominion.city){
            if(dominion.city[row].includes(structureID)){
                return true
            }
        }
        return false
    },
    dominionAuthorization: function(auth,message,player,dominion,embed){
        var authorized = false;
        for(var role of message.guild.members.get(player.id).roles.array()){
            for(var roleType in dominion.roles){
                if(dominion.roles[roleType].id == role.id){
                    if(dominion.roles[roleType].permissions.master || dominion.roles[roleType].permissions[auth]){
                        authorized = true
                        break;
                    }
                }
            }
            if(authorized){
                break;
            }
        }
        if(authorized){
            return authorized
        } else {
            embed.setColor([255,0,0])
            embed.addField("Invalid Authorization",player.name + " is not authorized for this action")
            this.outputEmbed(message.channel,embed,player)
            return false
        }
    },
    createDominion: function (guild,user,channelID){
        var playerData = firebase.database().ref("players/" + user.id);
        playerData.once('value').then(function(playerSnapshot) {
            var now = new Date();
            var dominions = firebase.database().ref("dominions/" + guild.id);
            guild.createRole({
                name:"Dominion Leader",
                color:[255,189,27] 
            }).then(role => {
                var newDominion = {
                    villagerPopulation:0,
                    resources:{     
                        coal:0,
                        gold:0,
                        stone:0,
                        iron:0,
                        crystals:0,
                        food:0,
                        lumber:0,
                        
                    },
                    roles:{
                        leader:{
                            id:role.id,
                            permissions:{
                                master:true
                            }
                        }
                    },
                    trading:{
                        active:false
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
                    cityHealth:[
                        [0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,10,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0]
                    ],
                    military:[0,0,0,0,0,0,0,0,0,0],
                    id:guild.id,
                    owner:user.id,
                    dob:now.getTime(),
                    legalChannels:[channelID]
                }
                if(playerSnapshot.val() == null){
                    createPlayer(user)
                }
                dominions.update(newDominion)
                guild.members.get(user.id).addRole(role.id)
            })   
        })
    }
}
