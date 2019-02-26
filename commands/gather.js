module.exports = {
    fullAuth:true,
    name:"+gather",
    description:"Gather resources ",
    usage:"+gather (resource type)",
    example:"+gather minerals",
    legalParameterCount:[2],
    run: function(tools,input,dominion,player,message,embed){
        var actionMap = {
            "minerals":"mining",
            "lumber":"lumberjacking",
            "food":"farming"
        }
        var buildingMap = {
            1:"capital",
            2:"lumberyard",
            3:"mine",
            4:"blacksmith",
            5:"tradingpost",
            6:"farm",
            7:"furnacehouse",
            8:"storage"
        }
        var yieldMaps = {
            mining:{
                resources:{
                    stone:[0.9,8],
                    coal:[0.5,5],
                    ironOre:[0.33,1.33],
                    crystals:[0.1,0.9]
                },
                energyCostNS:2,
                energyCost:1,
                structure:3
            },
            lumberjacking:{
                resources:{
                    lumber:[2,10]
                },
                energyCostNS:2,
                energyCost:1,
                structure:2
            },
            farming:{
                resources:{
                    food:[2,10]
                },
                energyCostNS:null,
                energyCost:1,
                structure:6
            }
        }                                   
        var action = actionMap[input[1]];
        var resourceStructureID = yieldMaps[action].structure
        if(action != undefined){
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
                            maximumYield += yieldMaps[action].resources[resource][1] * player.toolLevel[gearIndex]
                        }
                        var currentCapacity = 0
                        for(var type in player.resources){
                            currentCapacity += player.resources[type]
                        }
                        if(currentCapacity + maximumYield <= player.storageCapacity){
                            var resourceYield = yieldMaps[action].resources
                            for(var resources in resourceYield){
                                resourceYield[resources] = Math.floor(tools.getRandom(player.toolLevel[gearIndex] * resourceYield[resources][0],player.toolLevel[gearIndex] * resourceYield[resources][1]))
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
            for(var resource in resourceStructureMap){
                validResources += "(" + resource + ")\n"
            }
            embed.setColor([255,0,0])
            embed.addField("Invalid Resource",input[1] + " is not a valid resource to gather. Valid resources to gather are:\n" + validResources)
            tools.outputEmbed(message.channel,embed,player)
        }
    }
}

