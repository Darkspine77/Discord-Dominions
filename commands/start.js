module.exports = {
    name:"+start",
    description:"Start your account",
    usage:"+start",
    example:"+start",
    run: function(tools,input,message,embed){
        tools.getPlayer(message.author.id,function(player){
            if(input.length == 1){
                if(player == null){
                    embed.addField("Player Created","Welcome to the world of Discord Dominions " + message.author.username + "!",true)
                    tools.createPlayer(message.author)
                    tools.outputEmbed(message.channel,embed)  
                } else {
                    embed.addField("Error","A player account already exists for " + message.author.username,true)
                    tools.outputEmbed(message.channel,embed)  
                }
            } else {
                embed.addField("Invalid Use of Command","Description: " + this.description + "\nUsage: " + this.usage + "\nExample: " + this.example)
                tools.outputEmbed(message.channel,embed)
            } 
        })
    }
}