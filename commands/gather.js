module.exports = {
    fullAuth:true,
    takeStructureData:true,
    name:"+gather",
    description:"Gather resources ",
    usage:"+gather (resource type)",
    example:"+gather minerals",
    legalParameterCount:[2],
    run: function(structureData,tools,input,dominion,player,message,embed){
        var actionMap = structureData.actionMap
        var buildingMap = structureData.buildingMap
        var yieldMaps = structureData.yieldMaps                                   
        var action = actionMap[input[1]];
        if(action != undefined){
                var resourceStructureID = yieldMaps[action].structure
                var energyCost = yieldMaps[action].energyCostNS
            if(tools.cityHasStructure(dominion,resourceStructureID)){
                energyCost = yieldMaps[action].energyCost
            }
            if(energyCost != null){
                if(player.energy >= energyCost){
                    if(player.gear.includes(action) > 0){
                        var gearIndex = player.gear.indexOf(action)
                        player.energy -= energyCost        
                        var maximumYield = 0
                        for(var resource in yieldMaps[action].resources){
                            maximumYield += Math.floor(yieldMaps[action].resources[resource][1] * player.toolLevel[gearIndex])
                        }
                        var currentCapacity = 0
                        for(var type in player.resources){
                            currentCapacity += player.resources[type]
                        }
                        if(currentCapacity + maximumYield <= tools.getPlayerStorage(player)){
                            var resourceYield = {}
                            for(var resources in yieldMaps[action].resources){
                                resourceYield[resources] = Math.floor(tools.getRandom(player.toolLevel[gearIndex] * yieldMaps[action].resources[resources][0],player.toolLevel[gearIndex] * yieldMaps[action].resources[resources][1]))
                            }
                            embed.setTitle("Resources Gathered By " + player.name + ": (" + energyCost + " energy spent)")
                            for(var type in resourceYield){
                                player.resources[type] += resourceYield[type]
                                embed.addField(type.capitalize(),resourceYield[type],true)
                            }
                            if(player.toolDurability[gearIndex] != -1){
                                player.toolDurability[gearIndex]--
                                if(player.toolDurability[gearIndex] == 0){
                                    if(["mining","lumberjacking","construction"].includes(player.gear[gearIndex])){
                                        player.toolLevel[gearIndex] = 1
                                        player.toolDurability[gearIndex] = -1
                                        embed.addField(action.capitalize() + " Gear Destroyed","Your rank " + player.toolLevel[gearIndex] + " " + action + " gear has been destroyed! You now have rank 1 " + player.gear[gearIndex] + " gear")
                                    } else {
                                        embed.addField(action.capitalize() + " Gear Destroyed","Your rank " + player.toolLevel[gearIndex] + " " + action + " gear has been destroyed! You can no longer execute the " + player.gear[gearIndex] + "action")
                                        player.gear.splice(gearIndex,1)
                                        player.toolDurability.splice(gearIndex,1)
                                        player.toolLevel.splice(gearIndex,1)
                                    }
                                } else {
                                    embed.addField(action.capitalize() + " Gear Used","Your rank " + player.toolLevel[gearIndex] + " " + action + " gear has " + player.toolDurability[gearIndex] + " uses remaining")
                                }
                            }
                            tools.updatePlayer(player,function(newPlayer){
                                tools.outputEmbed(message.channel,embed,newPlayer)
                            })
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Not Enough Capacity","You would not be able to store the maximum resource yield from this action")
                            tools.outputEmbed(message.channel,embed,player)
                        }
                    } else {
                        embed.setColor([255,0,0])
                        embed.addField("Missing Gear","You need " + action + " gear to preform this action")
                        tools.outputEmbed(message.channel,embed,player)
                    }
                } else {
                    embed.setColor([255,0,0])
                    embed.addField("Out of Energy","You need more energy before you preform an action")
                    tools.outputEmbed(message.channel,embed,player)
                }
            } else {
                embed.setColor([255,0,0])
                embed.addField("Structure Required","You must have a " + buildingMap[resourceStructureID] + " and the appropiate gear to gather " + input[1])
                tools.outputEmbed(message.channel,embed,player)
            }
        }  else {
            var validResources = ""
            for(var resource in yieldMaps){
                validResources += "(" + resource + ")\n"
            }
            embed.setColor([255,0,0])
            embed.addField("Invalid Resource",input[1] + " is not a valid type of gathering. Valid types of gathering are:\n" + validResources)
            tools.outputEmbed(message.channel,embed,player)
        }
    }
}

