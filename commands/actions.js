module.exports = {
    fullAuth:true,
    takeStructureData:true,
    name:"+actions",
    description:"List all commands that you may preform with your current gear",
    usage:"+actions",
    example:"+actions",
    legalParameterCount:[1],
    run: function(structureData,tools,input,dominion,player,message,embed){
        var ableActions = {}
        for(var gear of player.gear){
            var actions = structureData.gearUseMap[gear]
            for(var cmd in actions){
                if(ableActions[cmd] == undefined){
                    ableActions[cmd] = []
                }
                for(var parameters of actions[cmd]){
                    ableActions[cmd].push(cmd + " " + parameters)
                }
            }
        }
        embed.setTitle("Actions " + player.name.capitalize() + " Can Do")
        for(var cmd in ableActions){
            var variantString = "```"
            for(var variant of ableActions[cmd]){
                variantString += variant + "\n"
            }
            embed.addField(cmd,variantString + "```")
        }
        tools.outputEmbed(message.channel,embed,player)
    }
}