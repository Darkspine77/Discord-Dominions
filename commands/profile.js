module.exports = {
    fullAuth:true,
    name:"+profile",
    description:"View your profile",
    usage:"+profile",
    example:"+profile",
    run: function(tools,input,dominion,player,message,embed){
        if(input.length == 1){
            tools.drawProfile(message.author,message.channel,embed,function(newEmbed){
                tools.outputEmbed(message.channel,newEmbed,player) 
            })
        } else {
            embed.addField("Invalid Use of Command","Description: " + this.description + "\nUsage: " + this.usage + "\nExample: " + this.example)
            tools.outputEmbed(message.channel,embed,player)
        } 
    }
}