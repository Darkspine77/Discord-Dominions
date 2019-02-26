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
                case "give":
                    player.resources[player.confirming.resource] -= player.confirming.amount
                    tools.getDominion(player.confirming.destination,function(targetDominion){
                        targetDominion.resources[player.confirming.resource] += player.confirming.amount
                        targetDominion.resources.gold -= player.confirming.repayment
                        player.resources.gold += player.confirming.repayment
                        if(targetDominion.trading.active){
                            targetDominion.trading.buying[player.confirming.resource].wanted -= player.confirming.amount
                            if(targetDominion.trading.buying[player.confirming.resource].wanted < 0){
                                targetDominion.trading.buying[player.confirming.resource].wanted = 0
                            }
                        }
                        embed.addField("Transaction Successful",player.name + " has given " +player.confirming.amount + " " + player.confirming.resource + " to the dominion of " + tools.getDominionName(targetDominion.id))
                        if(player.confirming.repayment > 0){
                            embed.addField("",player.name + " has received " + player.confirming.repayment + " gold in return")
                        }
                        player.confirming = null
                        tools.updatePlayer(player,function(){
                            tools.updateDominion(targetDominion,function(){
                                tools.outputEmbed(message.channel,embed)
                            })
                        })
                    })
                    break;
                case "craft":
                    for(var resource in player.confirming.expenses){
                        player.resources[resource] -= player.confirming.expenses[resource]
                    }
                    tools.getPlayer(player.confirming.destination,function(targetPlayer){
                        targetPlayer.toolDurability[player.confirming.action] = player.confirming.durability
                        targetPlayer.toolDurability[player.confirming.action] = player.confirming.rank
                        embed.addField("Crafting Successful",player.name + " has crafted rank " + player.confirming.rank + " " + player.confirming.action + " gear")
                        player.confirming = null
                        tools.updatePlayer(player,function(){
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
                        tools.deleteDominion(player.confirming.destination,function(){
                            tools.outputEmbed(message.channel,embed)
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