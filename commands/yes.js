module.exports = {
    fullAuth:true,
    name:"+yes",
    description:"Confirm a request",
    usage:"+yes",
    example:"+yes",
    run: function(tools,input,dominion,player,message,embed){
        if(input.length == 1){
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
                }
            } else {
                embed.addField("No Pending Confirmation",player.name + " is not confirming anything at the current moment")
                tools.outputEmbed(message.channel,embed)
            }
        } else {
            embed.addField("Invalid Use of Command","Description: " + this.description + "\nUsage: " + this.usage + "\nExample: " + this.example)
            tools.outputEmbed(message.channel,embed,player)
        }
    }
}