const { createCanvas, loadImage, Image } = require('canvas')
var cityToSpriteMap = {
    0:"grass",
    1:"capital",
    2:"lumberyard",
    3:"mine",
    4:"blacksmith",
    5:"tradingpost",
    6:"farm",
    7:"furnacehouse",
    8:"storage"
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
                iron:0,
                ironOre:0,
                stone:0,
                crystals:0,
                food:0,
                lumber:0,
                gold:0
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

module.exports = {
    firebase:null,
    client:null,
    version:null,
    fs:null,
    initialize: function(firebaseI,clientI,versionI,fsI){
        firebase = firebaseI
        client = clientI;
        version = versionI;
        fs = fsI;
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
    getRandom: function (min,max){
        return (Math.random() * (max - min)) + min
    },
    drawProfile: function (user,channel,embed,callback){
        this.getPlayer(user.id,function(player){
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
    },
    drawCity: function (dominion,channel,embed,callback){
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
    },
    createPlayer: function (user){
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
                    gold:0,
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
    },
    outputEmbed: function (channel,embed){
        embed.setColor([114,137,218])
        channel.send("",embed)
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
                    resources:{
                        villagerPopulation:0,
                        coal:0,
                        gold:0,
                        stone:0,
                        iron:0,
                        crystals:0,
                        food:0,
                        lumber:0,
                        housing:0
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
                        active:false,
                        buying:{
                            coal:{
                                wanted:0,
                                payPer:0
                            },
                            stone:{
                                wanted:0,
                                payPer:0
                            },
                            iron:{
                                wanted:0,
                                payPer:0
                            },
                            crystals:{
                                wanted:0,
                                payPer:0
                            },
                            food:{
                                wanted:0,
                                payPer:0
                            },
                            lumber:{
                                wanted:0,
                                payPer:0
                            },
                            housing:{
                                wanted:0,
                                payPer:0
                            }
                        },
                        selling:{
                            coal:{
                                offered:0,
                                payPer:0
                            },
                            stone:{
                                offered:0,
                                payPer:0
                            },
                            iron:{
                                offered:0,
                                payPer:0
                            },
                            crystals:{
                                offered:0,
                                payPer:0
                            },
                            food:{
                                offered:0,
                                payPer:0
                            },
                            lumber:{
                                offered:0,
                                payPer:0
                            },
                            housing:{
                                offered:0,
                                payPer:0
                            }
                        }
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
