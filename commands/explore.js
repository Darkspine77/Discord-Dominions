module.exports = {
    fullAuth:true,
    needEnergy:true,
    takeStructureData:true,
    name:"+explore",
    description:"Explore the overworld to have a random encounter",
    usage:"+explore",
    example:"+explore",
    legalParameterCount:[1],
    run: function(structureData,tools,input,dominion,player,message,embed){
        if(player.gear.includes("exploring")){
            var gearIndex = player.gear.indexOf("exploring")
            
        } else {
            embed.setColor([255,0,0])
            embed.addField("Missing Gear","You need construction gear to preform this action")
            tools.outputEmbed(message.channel,embed,player)
        }
}
}