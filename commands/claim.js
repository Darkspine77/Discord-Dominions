module.exports = {
    name:"+claim",
    description:"Claim a server as your dominion",
    usage:"+claim",
    example:"+claim",
    run: function(tools,input,message,embed){
        if(input.length == 1){
            if(message.author.id == message.guild.ownerID){
                tools.getDominion(message.guild.id,function(dominion){
                    if(dominion == null){
                        embed.addField("Dominion Created","The dominion of " + message.guild.name + " has been created! All commands related to Discord Dominions will be handled here",true)
                        embed.addField("Player Created","Welcome to the world of Discord Dominions " + message.author.username + "!\n\nYou have been given the 'Dominion Leader' role. Only one person on a server may have this role. Giving this role to another person will transfer leadership of this dominion",true)
                        tools.createDominion(message.guild,message.author,message.channel.id)
                        tools.outputEmbed(message.channel,embed)  
                    } else {
                        embed.addField("Error","A dominion for this server has already been created",true)
                        tools.outputEmbed(message.channel,embed)  
                    }
                })
            } else {
                embed.addField("Invalid Use of Command","Description: " + this.description + "\nUsage: " + this.usage + "\nExample: " + this.example)
                tools.outputEmbed(message.channel,embed,player)
            }
        } else {
            embed.addField("Invalid Use of Command","Description: " + this.description + "\nUsage: " + this.usage + "\nExample: " + this.example)
            tools.outputEmbed(message.channel,embed)
        }
    }
}
