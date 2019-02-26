module.exports = {
    fullAuth:true,
    name:"+city",
    description:"Displays a map of the city of the dominion the command is executed in",
    usage:"+city",
    example:"+city",
    run: function(tools,input,dominion,player,message,embed){
        if(input.length == 1){
            tools.drawCity(dominion,message.channel,embed,function(newEmbed){
                tools.outputEmbed(message.channel,newEmbed,player)
            })
        } else {
            embed.addField("Invalid Use of Command","Description: " + this.description + "\nUsage: " + this.usage + "\nExample: " + this.example)
            tools.outputEmbed(message.channel,embed,player)
        }
    }
}