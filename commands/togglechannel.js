module.exports = {
    fullAuth:true,
    name:"+togglechannel",
    description:"Toggle whether commands may be used in a channel or not",
    usage:"+togglechannel (channel)",
    example:"+togglechannel #general",
    run: function(tools,input,dominion,player,message,embed){
        if(input.length == 2){
            var authorized = false;
            for(var role of message.guild.members.get(player.id).roles.array()){
                for(var roleType in dominion.roles){
                    if(dominion.roles[roleType].id == role.id){
                        if(dominion.roles[roleType].permissions.master || dominion.roles[roleType].permissions.canOpenChannels){
                            authorized = true
                            break;
                        }
                    }
                }
                if(authorized){
                    break;
                }
            }
            if(authorized){
                if(input[1].substring(0,2) == "<#" && input[1].slice(-1) == ">"){
                    var channelID = input[1].split("#")[1].replace(">","").replace("!","")
                    if(message.guild.channels.get(channelID)){
                        if(dominion.legalChannels.includes(channelID)){
                            if(dominion.legalChannels.length > 1){
                                dominion.legalChannels.splice(dominion.legalChannels.indexOf(channelID))
                                embed.addField("Channel Updated","Commands from Discord Dungeons can no longer be used in " + input[1])
                                tools.updateDominion(dominion,function(){
                                    tools.outputEmbed(message.channel,embed,player)
                                })
                            } else {
                                embed.addField("Invalid Number of Legal Channels","Toggling this channel would cause there to be no more legal channels to use this bot in")
                                tools.outputEmbed(message.channel,embed,player)
                            }
                        } else {
                            dominion.legalChannels.push(channelID)
                            embed.addField("Chananel Updated","Commands from Discord Dungeons can now be used in " + input[1])
                            tools.updateDominion(dominion,function(){
                                tools.outputEmbed(message.channel,embed,player)
                            })
                        }   
                    } else {
                        embed.addField("Guild Channel Not Found","Channel not found in this server")
                        tools.outputEmbed(message.channel,embed,player)
                    }
                } else {
                    embed.addField("Invalid Channel Mention","Channel not found")
                    tools.outputEmbed(message.channel,embed,player)
                }
            } else {
                embed.addField("Invalid Authorization",player.name + " is not authorized for this action")
                tools.outputEmbed(message.channel,embed,player)
            }
        } else {
            embed.addField("Invalid Use of Command","Description: " + this.description + "\nUsage: " + this.usage + "\nExample: " + this.example)
            tools.outputEmbed(message.channel,embed,player)
        }
    }
}