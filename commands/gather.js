module.exports = {
    fullAuth:true,
    name:"+gather",
    description:"Gather resources ",
    usage:"+gather (resource type)",
    example:"+gather minerals",
    run: function(tools,input,dominion,player,message,embed){
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
                        if(type == "iron"){
                            currentCapacity += player.resources[type]
                        }
                    }
                    if(currentCapacity + maximumYield <= player.storageCapacity){
                        var resourceYield = yieldMaps[action]
                        for(var resources in resourceYield){
                            resourceYield[resources] = Math.floor(tools.getRandom(player.toolLevel[action] * resourceYield[resources][0],player.toolLevel[action] * resourceYield[resources][1]))
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
                        tools.updatePlayer(player,function(newPlayer){
                            tools.outputEmbed(message.channel,embed,newPlayer)
                        })
                    } else {
                        embed.addField("Not Enough Capacity","You would not be able to store the maximum resource yield from this action")
                        tools.outputEmbed(message.channel,embed,player)
                    }  
                } else {
                    embed.addField("Out of Energy","You need more energy before you preform an action")
                    tools.outputEmbed(message.channel,embed,player)
                }
            }  else {
                var validResources = ""
                for(var resource in resourceStructureMap){
                    validResources += "(" + resource + ")\n"
                }
                embed.addField("Invalid Resource",input[1] + " is not a valid resource to gather. Valid resources to gather are:\n" + validResources)
                tools.outputEmbed(message.channel,embed,player)
            }
        } else {
            embed.addField("Invalid Use of Command","Description: " + this.description + "\nUsage: " + this.usage + "\nExample: " + this.example)
            tools.outputEmbed(message.channel,embed,player)
        }
    }
}

