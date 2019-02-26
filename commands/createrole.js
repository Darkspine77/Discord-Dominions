module.exports = {
    fullAuth:true,
    name:"+createrole",
    description:"Create a role for your dominion",
    usage:"+createrole (role name) (red value) (blue value) (green value)",
    example:"+createrole miners 0 0 255",
    run: function(tools,input,dominion,player,message,embed){
        if(input.length == 5){
            var authorized = false;
            for(var role of message.guild.members.get(player.id).roles.array()){
                for(var roleType in dominion.roles){
                    if(dominion.roles[roleType].id == role.id){
                        if(dominion.roles[roleType].permissions.master || dominion.roles[roleType].permissions.canMakeRole){
                            if(input[1] != "leader"){
                                authorized = true
                                break;
                            } else {
                                authorized = dominion.roles[roleType].permissions.master
                                if(authorized){
                                    break;
                                }
                            }  
                        }
                    }
                }
                if(authorized){
                    break;
                }
            }
            if(authorized){
                if(dominion.roles[input[1]] == undefined){
                    if(!isNaN(parseInt(input[2])) && parseInt(input[2]) >= 0 && parseInt(input[2]) <= 255){
                        if(!isNaN(parseInt(input[3])) && parseInt(input[3]) >= 0 && parseInt(input[3]) <= 255){
                            if(!isNaN(parseInt(input[4])) && parseInt(input[4]) >= 0 && parseInt(input[4]) <= 255){
                                message.guild.createRole({
                                    name:input[1],
                                    color:[parseInt(input[2]),parseInt(input[3]),parseInt(input[4])] 
                                }).then(role => {
                                    dominion.roles[input[1]] = {
                                        id:role.id,
                                        permissions:{
                                            canMakeRole:false,
                                            canGiveRole:false,
                                            canTakeResources:false,
                                            canBuildCity:false,
                                            canManageTrading:false,
                                            canOpenChannels:false
                                        }
                                    }
                                    tools.updateDominion(dominion,function(){
                                        embed.addField("Role Created","The role (" + input[1] + ") has been created")
                                        tools.outputEmbed(message.channel,embed,player)
                                    })
                                })
                            } else {
                                embed.addField("Invalid Role Color","Colors for roles are designated by 3 RGB values separated by spaces\nExample: +createRole green 0 255 0")
                                tools.outputEmbed(message.channel,embed,player)
                            }
                        } else {
                            embed.addField("Invalid Role Color","Colors for roles are designated by 3 RGB values separated by spaces\nExample: +createRole green 0 255 0")
                            tools.outputEmbed(message.channel,embed,player)
                        }  
                    } else {
                        embed.addField("Invalid Role Color","Colors for roles are designated by 3 RGB values separated by spaces\nExample: +createRole green 0 255 0")
                        tools.outputEmbed(message.channel,embed,player)
                    }
                } else {
                    embed.addField("Role Already Present","A role with the name (" + input[1] + ") already exists")
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