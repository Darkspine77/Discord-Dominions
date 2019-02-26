module.exports = {
    fullAuth:true,
    name:"+togglepermission",
    description:"Toggle permission on a role",
    usage:"+togglepermission (dominon role) (permission)",
    example:"+togglepermission builder canBuildCity",
    run: function(tools,input,dominion,player,message,embed){
        if(input.length == 3){
            var authorized = false;
            for(var role of message.guild.members.get(player.id).roles.array()){
                for(var roleType in dominion.roles){
                    if(dominion.roles[roleType].id == role.id){
                        if(dominion.roles[roleType].permissions.master || dominion.roles[roleType].permissions.canMakeRole){
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
                if(input[1] != "leader"){
                    if(dominion.roles[input[1]]){
                        if(dominion.roles[input[1]].permissions[input[2]]){
                            dominion.roles[input[1]].permissions[input[2]] = false
                        } else {
                            dominion.roles[input[1]].permissions[input[2]] = true
                        }
                        embed.addField("Permission Toggled","The permission (" + input[2] + ") for the (" + input[1] + ") role has been toggled to " + dominion.roles[input[1]].permissions[input[2]])
                        tools.updateDominion(dominion,function(){
                            tools.outputEmbed(message.channel,embed,player)
                        })
                    } else {
                        embed.addField("Invalid Role","This role can not be removed as it does not exist")
                        tools.outputEmbed(message.channel,embed,player)
                    }
                } else {
                    embed.addField("Invalid Role","The leader role can not be edited")
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