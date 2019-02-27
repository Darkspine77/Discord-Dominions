module.exports = {
    fullAuth:true,
    name:"+yes",
    description:"Confirm a request",
    usage:"+yes",
    example:"+yes",
    legalParameterCount:[1],
    run: function(tools,input,dominion,player,message,embed){
        if(player.confirming){
            switch(player.confirming.type){
                case "store":
                    tools.getPlayer(player.confirming.destination,function(targetPlayer){
                        tools.getDominion(player.confirming.destination,function(targetDominion){
                            targetPlayer.resources[player.confirming.resource] -= player.confirming.amount
                            targetDominion.resources[player.confirming.resource] += player.confirming.amount
                            // if(targetDominion.trading.active){
                            //     targetDominion.resources.gold -= player.confirming.repayment
                            //     targetPlayer.resources.gold += player.confirming.repayment
                            //     targetDominion.trading.buying[player.confirming.resource].wanted -= player.confirming.amount
                            //     if(targetDominion.trading.buying[player.confirming.resource].wanted < 0){
                            //         targetDominion.trading.buying[player.confirming.resource].wanted = 0
                            //     }
                            // }
                            embed.addField("Transaction Successful",targetPlayer.name + " has stored" +player.confirming.amount + " " + player.confirming.resource + " in the dominion of " + tools.getDominionName(targetDominion.id))
                            // if(player.confirming.repayment > 0){
                            //     embed.addField("",player.name + " has received " + player.confirming.repayment + " gold in return")
                            // }
                            targetPlayer.confirming = null
                            tools.updatePlayer(player,function(){
                                tools.updateDominion(targetDominion,function(){
                                    tools.outputEmbed(message.channel,embed)
                                })
                            })
                        })
                    })
                    break;
                case "craftGear":
                    tools.getPlayer(player.confirming.destination,function(targetPlayer){
                        for(var resource in player.confirming.expenses){
                            targetPlayer.resources[resource] -= player.confirming.expenses[resource]
                        }
                        var gearIndex = targetPlayer.gear.indexOf(player.confirming.action)
                        if(gearIndex == -1){
                            targetPlayer.gear.push(player.confirming.action)
                            targetPlayer.toolDurability.push(player.confirming.durability)
                            targetPlayer.toolLevel.push(player.confirming.rank)
                        } else {
                            targetPlayer.toolDurability[gearIndex] = player.confirming.durability
                            targetPlayer.toolLevel[gearIndex] = player.confirming.rank
                        }
                        embed.addField("Crafting Successful",player.name + " has crafted rank " + targetPlayer.confirming.rank + " " + targetPlayer.confirming.action + " gear")
                        targetPlayer.confirming = null
                        tools.updatePlayer(targetPlayer,function(){
                            tools.outputEmbed(message.channel,embed)
                        })
                    })
                    break;
                case "deletedominion":
                    tools.getDominion(player.confirming.destination,function(targetDominion){
                        for(var role in targetDominion.roles){
                            client.guilds.get(targetDominion.id).roles.get(targetDominion.roles[role].id).delete()
                        }
                        embed.addField("Deletion Successful","The dominion of " + tools.getDominionName(player.confirming.destination) + " has been deleted")
                        player.confirming = null
                        tools.updatePlayer(player,function(){
                            tools.deleteDominion(player.confirming.destination,function(){
                                tools.outputEmbed(message.channel,embed)
                            })
                        })
                    })
                    break;
                case "end":
                    tools.getPlayer(player.confirming.destination,function(targetPlayer){
                        embed.addField("Deletion Successful","The player " + targetPlayer.name + " has ended their journey")
                        tools.deletePlayer(player.confirming.destination,function(){
                            tools.outputEmbed(message.channel,embed)
                        })
                    })
                    break;
                case "build":
                    tools.getDominion(player.confirming.destination,function(targetDominion){
                        targetDominion.city[player.confirming.coordinates[0]][player.confirming.coordinates[1]] = player.confirming.desiredBuild.id
                        targetDominion.cityHealth[player.confirming.coordinates[0]][player.confirming.coordinates[1]] = player.confirming.desiredBuild.health
                        for(var resource in player.confirming.desiredBuild.resources){
                            targetDominion.resources[resource] -= player.confirming.desiredBuild.resources[resource]
                        }
                        player.confirming = null
                        tools.updatePlayer(player,function(){
                            tools.updateDominion(targetDominion,function(){
                                embed.addField("Structure Built","A new " + player.confirming.name + " was built at coordinates (" + (player.confirming.coordinates[0] + 1) + "," + (player.confirming.coordinates[1] + 1) + ") in the city of the dominion of " + tools.getDominionName(targetDominion.id))
                                tools.outputEmbed(message.channel,embed,player)   
                            })
                        })
                    })
                    break;
                case "take":
                    tools.getDominion(player.confirming.donator,function(targetDominion){
                        tools.getPlayer(player.confirming.destination,function(targetPlayer){
                            targetPlayer.resources[player.confirming.resource] += player.confirming.amount
                            targetDominion.resources[player.confirming.resource] -= player.confirming.amount
                            embed.addField("Successful Resource Withdrawal",targetPlayer.name + " took " + player.confirming.amount + " " + player.confirming.resource + " from " + tools.getDominionName(targetDominion.id))
                            targetPlayer.confirming = null
                            tools.updatePlayer(targetPlayer,function(){
                                tools.updateDominion(targetDominion,function(){
                                    tools.outputEmbed(message.channel,embed)
                                })
                            })
                        })
                    })
                    break;
                case "craftResources":
                        tools.getPlayer(player.confirming.destination,function(targetPlayer){
                            targetPlayer.resources[player.confirming.resource] += player.confirming.amount
                            for(var resource in player.confirming.expenses){
                                targetPlayer.resources[resource] -= player.confirming.expenses[resource] * player.confirming.amount
                            }
                            embed.addField("Crafting Successful",targetPlayer.name + " crafted " + player.confirming.amount + " " + player.confirming.resource)
                            targetPlayer.confirming = null
                            tools.updatePlayer(targetPlayer,function(){
                                tools.outputEmbed(message.channel,embed)
                            })
                        })
                    break;
                case "request":
                    tools.getDominion(player.confirming.destination,function(targetDominion){
                        if(targetDominion.trading.buying == undefined){
                            targetDominion.trading.buying = {}
                        }
                        targetDominion.trading.buying[player.confirming.resource] ={
                            wanted:player.confirming.totalAmount,
                            exchange:{
                                amount:player.confirming.minResource,
                                value:player.confirming.minGold
                            }
                        }
                        embed.addField("Request Successful",tools.getDominionName(dominion.id)+ " is now giving " + minGold + " gold to players who sell it at least " + minResource + " " + input[1])
                        player.confirming = null
                        tools.updateDominion(targetDominion,function(){
                            tools.updatePlayer(targetPlayer,function(){
                                tools.outputEmbed(message.channel,embed)
                            })
                        })
                    })
                case "offer":
                    tools.getDominion(player.confirming.destination,function(targetDominion){
                        if(targetDominion.trading.selling == undefined){
                            targetDominion.trading.selling = {}
                        }
                        targetDominion.trading.selling[player.confirming.resource] ={
                            wanted:player.confirming.totalAmount,
                            exchange:{
                                amount:player.confirming.minResource,
                                value:player.confirming.minGold
                            }
                        }
                        embed.addField("Offer Successful",tools.getDominionName(dominion.id)+ " is now selling " + minResource + " " + input[1] + " for " + minGold + " gold")
                        player.confirming = null
                        tools.updateDominion(targetDominion,function(){
                            tools.updatePlayer(targetPlayer,function(){
                                tools.outputEmbed(message.channel,embed)
                            })
                        })
                    })
                break;
            }
        } else {
            embed.setColor([255,0,0])
            embed.addField("No Pending Confirmation",player.name + " is not confirming anything at the current moment")
            tools.outputEmbed(message.channel,embed)
        }
    }
}