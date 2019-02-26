module.exports = {
    fullAuth:true,
    name:"+build",
    description:"Build a structure in the city of the dominion the command is executed in",
    usage:"+take (structure) (x-coordinate) (y-coordinate)",
    example:"+build mine 3 3",
    run: function(tools,input,dominion,player,message,embed){
        if(input.length == 4){
            var authorized = false;
            for(var role of message.guild.members.get(player.id).roles.array()){
                for(var roleType in dominion.roles){
                    if(dominion.roles[roleType].id == role.id){
                        if(dominion.roles[roleType].permissions.master || dominion.roles[roleType].permissions.canBuildCitys){
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
                var structureMap ={
                    mine:{
                        id:3,
                        resources:{
                            stone:10,
                            lumber:50
                        }
                    },
                    lumberyard:{
                        id:2,
                        resources:{
                            stone:50,
                            lumber:10
                        }
                    },        
                    blacksmith:{
                        id:4,
                        resources:{
                            stone:75,
                            lumber:75
                        }
                    },
                    tradingpost:{
                        id:5,
                        resources:{
                            stone:10,
                            lumber:150
                        }
                    },
                    farm:{
                        id:6,
                        resources:{
                            lumber:300
                        }
                    },
                    furnacehouse:{
                        id:7,
                        resources:{
                            stone:250,
                            lumber:50
                        }
                    },
                    storage:{
                        id:8,
                        resources:{
                            stone:100,
                            lumber:100
                        }
                    }
                }
                if(structureMap[input[1]] != undefined){
                    var desiredBuild = structureMap[input[1]]
                    var cleared = true
                    for(var resource in desiredBuild.resources){
                        if(dominion.resources[resource] < desiredBuild.resources[resource]){
                            cleared = false
                            embed.addField("Not Enough of Resource",tools.getDominionName(dominion.id) + " does not have enough " + resource + " to build a " + input[1] + " (" + dominion.resources[resource] + "/" + desiredBuild.resources[resource]+ ")")
                        }
                    }
                    if(cleared){
                        if(!isNaN(parseInt(input[2])) && parseInt(input[2]) >= 1 && parseInt(input[2]) <= 9){
                            if(!isNaN(parseInt(input[3])) && parseInt(input[3]) >= 1 && parseInt(input[3]) <= 9){
                                var coords = [parseInt(input[2]) - 1,parseInt(input[3]) - 1]
                                if(dominion.city[coords[0]][coords[1]] == 0){
                                    dominion.city[coords[0]][coords[1]] = desiredBuild.id
                                    for(var resource in desiredBuild.resources){
                                        dominion.resources[resource] -= desiredBuild.resources[resource]
                                    }
                                    tools.updateDominion(dominion,function(){
                                        embed.addField("Structure Built","A new " + input[1] + " was built at coordinates (" + input[2] + "," + input[3] + ") in the city of the dominion of " + tools.getDominionName(dominion.id))
                                        tools.outputEmbed(message.channel,embed,player)   
                                    })
                                } else {
                                    embed.addField("Structure Already Exists","There is already a structure at these coordinates")
                                    tools.outputEmbed(message.channel,embed,player)
                                }
                            } else {
                                embed.addField("Invalid Coordinates","Invalid coordinates for structure")
                                tools.outputEmbed(message.channel,embed,player)
                            }
                        } else {
                            embed.addField("Invalid Coordinates","Invalid coordinates for structure")
                            tools.outputEmbed(message.channel,embed,player)
                        }
                    } else {
                        tools.outputEmbed(message.channel,embed,player)
                    }
{}                }
            } else {
                embed.addField("Invalid Authorization",player.name + " is not authorized for this action")
                tools.outputEmbed(message.channel,embed,player)
            }
        } else {
            embed.addField("Invalid Use of Command","Description: " + this.description + "\nUsage: " + this.usage + "\nExample: " + this.example)
            tools.outputEmbed(message.channel,embed,player)
        }
    }
}