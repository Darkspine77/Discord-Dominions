module.exports = {
    fullAuth:true,
    takeStructureData:true,
    name:"+store",
    description:"Deposit resources to the dominion the command is used in",
    usage:"+store (resource) (amount)",
    example:"+store stone 1",
    legalParameterCount:[3],
    run: function(structureData,tools,input,dominion,player,message,embed){
        var resources = structureData.resources
        if(resources.includes(input[1])){
            if(!isNaN(parseInt(input[2])) && parseInt(input[2]) > 0){
                if(player.resources[input[1]] >= parseInt(input[2])){
                    //var sale = 0
                    // if(dominion.trading.active){
                    //     sale = dominion.trading.buying[input[1]].payPer * parseInt(input[2])
                    //     if(dominion.gold >= sale){
                    //         if(dominion.trading.buying[input[1]].wanted <= parseInt(input[2]) || dominion.trading.buying[input[1]].wanted == -1){
                    //             transactionMessage += "\n\nThe dominion of " + tools.getDominionName(dominion.id) + " will pay " + sale + " gold for " + dominion.trading.buying[input[1]].wanted + " of the incoming " + input[1] +". The remaining " + (parseInt(input[2]) - dominion.trading.buying[input[1]].wanted) + " " + input[1] + " will be donated for free"
                    //         } else {
                    //             transactionMessage += "\n\nThe dominion of " + tools.getDominionName(dominion.id) + " will pay " + sale + " gold for " + input[2] + " " + input[1]
                    //         }
                    //     }
                    // }
                    var dominionCurrentStorage = 0
                    for(var resource in dominion.resources){
                        dominionCurrentStorage += dominion.resources[resource]
                    }
                    if(dominionCurrentStorage + parseInt(input[2]) <= tools.getDominionStorage(dominion)){
                        player.confirming = {
                            type:"store",
                            amount:parseInt(input[2]),
                            resource:input[1],
                            destination:dominion.id,
                            donator:player.id
                        }
                        embed.addField("Storing Resources",player.name + " will be storing " + input[2] + " " + input[1] + " to the dominion of " + tools.getDominionName(dominion.id))
                        embed.addField("Confirmation",player.name + " must type +yes to confirm this action or +no to decline"); 
                        tools.updatePlayer(player,function(){
                            tools.outputEmbed(message.channel,embed,player)     
                        })
                    } else {
                        embed.setColor([255,0,0])
                        embed.addField("Invalid Dominion Storage",tools.getDominionName(dominion.id) + " does not have enough storage for " + input[2] + " " + input[1])
                        tools.outputEmbed(message.channel,embed,player) 
                    }
                } else {
                    embed.setColor([255,0,0])
                    embed.addField("Not Enough of Resource",player.name + " does not have " + input[2] + " " + input[1] + " to store")
                    tools.outputEmbed(message.channel,embed,player) 
                }
            } else {
                embed.setColor([255,0,0])
                embed.addField("Invalid Resource Amount",input[2] + " is not a valid amount of a resource to store. Please use positive numbers to determine how much of a resource you would like to store")
                tools.outputEmbed(message.channel,embed,player)
            }
        } else {
            var validResources = ""
            for(var resource of resources){
                validResources += "(" + resource + ")\n"
            }
            embed.setColor([255,0,0])
            embed.addField("Invalid Resource",input[1] + " is not a valid resource to store. Valid resources to store are:\n" + validResources)
            tools.outputEmbed(message.channel,embed,player)
        }
    }
}