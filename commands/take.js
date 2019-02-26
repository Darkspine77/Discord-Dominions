module.exports = {
    fullAuth:true,
    name:"+take",
    description:"Take resources from the dominion the command is executed in",
    usage:"+take (resource) (amount)",
    example:"+take stone 1",
    legalParameterCount:[3],
    run: function(tools,input,dominion,player,message,embed){
        if(tools.dominionAuthorization("canTakeResources",message,player,dominion,embed)){
            var resources = ["coal","stone","iron","food","crystals","lumber"]
            if(resources.includes(input[1])){
                if(!isNaN(parseInt(input[2])) && parseInt(input[2]) > 0){
                    if(dominion.resources[input[1]] >= parseInt(input[2])){
                        var resourceCount = 0
                        for(var type in player.resources){
                            resources += type.capitalize() + ": " + player.resources[type] + "\n"
                            resourceCount += player.resources[type]
                        }
                        if(resourceCount + parseInt(input[2]) <= player.storageCapacity){
                            player.resources[input[1]] += parseInt(input[2])
                            dominion.resources[input[1]] -= parseInt(input[2])
                            tools.updatePlayer(player,function(){
                                tools.updateDominion(dominion,function(){
                                    embed.addField("Successful Resource Withdrawal",player.name + " took " + input[2] + " " + input[1] + " from " + tools.getDominionName(dominion.id))
                                    tools.outputEmbed(message.channel,embed,player)     
                                })
                            })
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Invalid Dominion Storage",player.name + " does not have enough storage for " + input[2] + " " + input[1])
                            tools.outputEmbed(message.channel,embed,player) 
                        }
                    } else {
                        embed.setColor([255,0,0])
                        embed.addField("Not Enough of Resource",tools.getDominionName(dominion.id) + " does not have " + input[2] + " " + input[1] + " to be taken")
                        tools.outputEmbed(message.channel,embed,player) 
                    }
                } else {
                    embed.setColor([255,0,0])
                    embed.addField("Invalid Resource Amount",input[2] + " is not a valid amount of a resource to take. Please use positive numbers to determine how much of a resource you would like to take")
                    tools.outputEmbed(message.channel,embed,player)
                }
            } else {
                var validResources = ""
                for(var resource of resources){
                    validResources += "(" + resource + ")\n"
                }
                embed.setColor([255,0,0])
                embed.addField("Invalid Resource",input[1] + " is not a valid resource to take. Valid resources to take are:\n" + validResources)
                tools.outputEmbed(message.channel,embed,player)
            }
        }
    }
}