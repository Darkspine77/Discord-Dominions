module.exports = {
    fullAuth:true,
    takeStructureData:true,
    name:"+request",
    description:"Set a request at a dominion's trading post",
    usage:"+request (resource) (total amount) (minimum gold per transaction) (minimum resource per transaction)",
    example:"+request iron 20 1 5",
    legalParameterCount:[5],
    run: function(structureData,tools,input,dominion,player,message,embed){
        if(tools.dominionAuthorization("canManageTrading",message,player,dominion,embed)){
            var resources = structureData.resources
            if(resources.includes(input[1])){
                if(!isNaN(parseInt(input[2])) && parseInt(input[2]) > 0){
                    if(!isNaN(parseInt(input[3])) && parseInt(input[2]) > 0){
                        if(!isNaN(parseInt(input[4])) && parseInt(input[2]) > 0){
                            var totalAmount = parseInt(input[2])
                            var minGold = parseInt(input[3])
                            var minResource = parseInt(input[4])
                            var dominionCurrentStorage = 0
                            for(var resource in dominion.resources){
                                dominionCurrentStorage += dominion.resources[resource]
                            }
                            if(dominionCurrentStorage + parseInt(input[2]) <= tools.getDominionStorage(dominion)){
                                if(dominion.resources.gold >= (totalAmount/minResource) * minGold){
                                    player.confirming = {
                                        type:"request",
                                        totalAmount:totalAmount,
                                        minGold:minGold,
                                        minResource:minResource,
                                        resource:input[1],
                                        destination:dominion.id
                                    }
                                    embed.addField("Trading Request",tools.getDominionName(dominion.id)+ " will be giving " + minGold + " gold to players who sell it at least " + minResource + " " + input[1])
                                    embed.addField("Confirmation",player.name + " must type +yes to confirm this action or +no to decline"); 
                                    tools.updatePlayer(player,function(){
                                        tools.outputEmbed(message.channel,embed,player)     
                                    })
                                } else {
                                    embed.setColor([255,0,0])
                                    embed.addField("Invalid Dominion Gold Reserves",tools.getDominionName(dominion.id) + " does not have enough gold to allow transactions at this exchange rate")
                                    tools.outputEmbed(message.channel,embed,player) 
                                }
                            } else {
                                embed.setColor([255,0,0])
                                embed.addField("Invalid Dominion Storage",tools.getDominionName(dominion.id) + " does not have enough storage for " + input[2] + " " + input[1])
                                tools.outputEmbed(message.channel,embed,player) 
                            }
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Invalid Amount","Please use positive numbers when indicating a minimum amount of " + input[1] + " a player will receive per transaction")
                            tools.outputEmbed(message.channel,embed,player)
                        }
                    } else {
                        embed.setColor([255,0,0])
                        embed.addField("Invalid Amount","Please use positive numbers when indicating a minimum amount of gold a player will receive per transaction")
                        tools.outputEmbed(message.channel,embed,player)
                    }   
                } else {
                    embed.setColor([255,0,0])
                    embed.addField("Invalid Amount","Please use positive numbers when indicating a total number of a resource you would like to buy")
                    tools.outputEmbed(message.channel,embed,player)
                }
            } else {
                var validResources = ""
                for(var resource of resources){
                    validResources += "(" + resource + ")\n"
                }
                embed.setColor([255,0,0])
                embed.addField("Invalid Resource",input[1] + " is not a valid resource to request. Valid resources to request are:\n" + validResources)
                tools.outputEmbed(message.channel,embed,player)   
            }
        }
    }
}