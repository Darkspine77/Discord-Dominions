module.exports = {
    fullAuth:true,
    name:"+craft",
    description:"Craft gear for an action\nList types of gear that can be build",
    usage:"+craft (action) (rank)\n+craft (intent)",
    example:"+craft mining 2\n+craft options",
    legalParameterCount:[2,3],
    run: function(tools,input,dominion,player,message,embed){
        if(tools.dominionAuthorization("canUseFacilities",message,player,dominion,embed)){
            if(tools.cityHasStructure(4) || true){
                var toolMap = {
                    mining:{
                        rank:{
                            2:{
                                resources:{
                                    lumber:10,
                                    stone:30
                                },
                                durability:25
                            },
                            3:{
                                resources:{
                                    lumber:20,
                                    stone:60
                                },
                                durability:35
                            }
                        }
                    },
                    lumberjacking:{
                        rank:{
                            2:{
                                resources:{
                                    lumber:20,
                                    stone:30
                                },
                                durability:25
                            }
                        }
                    },
                    farming:{
                        rank:{
                            1:{
                                resources:{
                                    lumber:50,
                                },
                                durability:25
                            }
                        }
                    },
                    construction:{
                        rank:{
                            2:{
                                resources:{
                                    lumber:100,
                                    stone:100
                                },
                                durability:10
                            }
                        }
                    },
                    fighting:{
                        rank:{
                            2:{
                                resources:{
                                    lumber:20,
                                    stone:150
                                },
                                durability:15
                            }
                        }
                    }
                }
                if(input.length == 3){
                    var validAction = false
                    for(var action in toolMap){
                        if(input[1] == action){
                            validAction = true
                        }
                    }
                    if(validAction){
                        if(toolMap[input[1]].rank[input[2]]){
                            var cleared = true
                            for(var resource in toolMap[input[1]].rank[input[2]].resources){
                                if(player.resources[resource] < toolMap[input[1]].rank[input[2]].resources[resource]){
                                    cleared = false                  
                                    embed.addField("Not Enough of Resource",player.name + " does not have enough " + resource + " to craft rank " + input[2] + " " +  input[1] + " gear (" + player.resources[resource] + "/" + toolMap[input[1]].rank[input[2]].resources[resource] + ")")
                                }
                            }
                            if(cleared){
                                player.confirming = {
                                    type:"craft",
                                    rank:parseInt(input[2]),
                                    action:input[1],
                                    destination:player.id,
                                    expenses:toolMap[input[1]].rank[input[2]].resources,
                                    durability:toolMap[input[1]].rank[input[2]].durability
                                }
                                embed.addField("Crafting Request",player.name + " will craft rank " + player.confirming.rank + " " + player.confirming.action + " gear")
                                embed.addField("Confirmation",player.name + " must type +yes to confirm this action or +no to decline"); 
                                tools.updatePlayer(player,function(){
                                    tools.outputEmbed(message.channel,embed,player)     
                                })
                            } else {
                                embed.setColor([255,0,0])
                                tools.outputEmbed(message.channel,embed,player)
                            }
                        } else {
                            var validRanks = ""
                            for(var rank in toolMap[input[1]].rank){
                                validRanks += "\n(" + rank + ")"
                            }
                            embed.setColor([255,0,0])
                            embed.addField("Invalid Rank","Valid ranks to craft " + input[1] + " gear for are:" + validRanks)
                            tools.outputEmbed(message.channel,embed,player) 
                        }
                    } else {
                        var validActions = ""
                        for(var action in toolMap){
                            validActions += "\n(" + action + ")"
                        }
                        embed.setColor([255,0,0])
                        embed.addField("Invalid Action","Valid actions to craft gear for are:" + validActions)
                        tools.outputEmbed(message.channel,embed,player) 
                    }
                } else if(input.length == 2){
                    if(input[1] == "options"){
                        for(var action in toolMap){
                            var rankString = ""
                            for(var rank in toolMap[action].rank){
                               rankString += "\n-----\nRank: " +rank + "\n"
                               var detailString = ""
                               for(var resource in toolMap[action].rank[rank].resources){
                                    detailString += "(" + resource.capitalize() + ": " + toolMap[action].rank[rank].resources[resource] + ")\n"
                               }
                               detailString += "(Durability: " +toolMap[action].rank[rank].durability + ")"
                               rankString += detailString
                            }
                            embed.addField(action.capitalize() + " (" + action +")","\n" + rankString)
                        }
                        tools.outputEmbed(message.channel,embed,player)
                    }
                }
            } else {
                embed.setColor([255,0,0])
                embed.addField("Missing Structure","No blacksmith found in the dominion where this command was used")
                tools.outputEmbed(message.channel,embed,player)
            }           
        }
        
    }
}