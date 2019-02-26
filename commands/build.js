module.exports = {
    fullAuth:true,
    name:"+build",
    description:"Build a structure in the city of the dominion the command is executed in\nList all structures that can be built",
    usage:"+build (structure) (x-coordinate) (y-coordinate)\n+build (intent)",
    example:"+build mine 3 3\n+build options",
    legalParameterCount:[4,2],
    run: function(tools,input,dominion,player,message,embed){
        if(tools.dominionAuthorization("canBuildCity",message,player,dominion,embed)){
            var structureMap = {
                mine:{
                    id:3,
                    health:3,
                    buildLevel:1,
                    resources:{
                        stone:10,
                        lumber:50
                    }
                },
                lumberyard:{
                    id:2,
                    health:3,
                    buildLevel:1,
                    resources:{
                        stone:50,
                        lumber:10
                    }
                },        
                blacksmith:{
                    id:4,
                    health:4,
                    buildLevel:1,
                    resources:{
                        stone:75,
                        lumber:75
                    }
                },
                tradingpost:{
                    id:5,
                    health:3,
                    buildLevel:1,
                    resources:{
                        stone:10,
                        lumber:150
                    }
                },
                farm:{
                    id:6,
                    health:1,
                    buildLevel:1,
                    resources:{
                        lumber:300
                    }
                },
                furnacehouse:{
                    id:7,
                    health:4,
                    buildLevel:1,
                    resources:{
                        stone:250,
                        lumber:50
                    }
                },
                storage:{
                    id:8,
                    health:2,
                    buildLevel:1,
                    resources:{
                        stone:100,
                        lumber:100
                    }
                },
                house:{
                    id:9,
                    health:2,
                    buildLevel:1,
                    resources:{
                        stone:25,
                        lumber:175
                    }
                }
            }
            if(input.length == 4){
                if(structureMap[input[1]] != undefined){
                    if(player.gear.includes("construction")){
                        var gearIndex = player.gear.indexOf("construction")
                        var desiredBuild = structureMap[input[1]]
                        if(player.toolLevel[gearIndex] >= desiredBuild.buildLevel){                     
                            var cleared = true
                            for(var resource in desiredBuild.resources){
                                if(dominion.resources[resource] <= desiredBuild.resources[resource]){
                                    cleared = false
                                    embed.setColor([255,0,0])
                                    embed.addField("Not Enough of Resource",tools.getDominionName(dominion.id) + " does not have enough " + resource + " to build a " + input[1] + " (" + dominion.resources[resource] + "/" + desiredBuild.resources[resource]+ ")")
                                }
                            }
                            if(cleared){
                                if(!isNaN(parseInt(input[2])) && parseInt(input[2]) >= 1 && parseInt(input[2]) <= 9){
                                    if(!isNaN(parseInt(input[3])) && parseInt(input[3]) >= 1 && parseInt(input[3]) <= 9){
                                        var coords = [parseInt(input[2]) - 1,parseInt(input[3]) - 1]
                                        if(dominion.city[coords[0]][coords[1]] == 0){
                                            player.confirming = {
                                                type:"build",
                                                destination:dominion.id,
                                                desiredBuild:desiredBuild,
                                                coordinates:coords,
                                                name:input[1]
                                            }
                                            embed.addField("Construction Request",player.name + " will build a " + input[1] + " for " + tools.getDominionName(dominion.id))
                                            embed.addField("Confirmation",player.name + " must type +yes to confirm this action or +no to decline"); 
                                            tools.updatePlayer(player,function(){
                                                tools.outputEmbed(message.channel,embed,player)     
                                            }) 
                                        } else {
                                            embed.setColor([255,0,0])
                                            embed.addField("Structure Already Exists","There is already a structure at these coordinates")
                                            tools.outputEmbed(message.channel,embed,player)
                                        }
                                    } else {
                                        embed.setColor([255,0,0])
                                        embed.addField("Invalid Coordinates","Invalid coordinates for structure")
                                        tools.outputEmbed(message.channel,embed,player)
                                    }
                                } else {
                                    embed.setColor([255,0,0])
                                    embed.addField("Invalid Coordinates","Invalid coordinates for structure")
                                    tools.outputEmbed(message.channel,embed,player)
                                }
                            } else {

                                tools.outputEmbed(message.channel,embed,player)
                            } 
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Missing Gear","You need construction rank " + desiredBuild.buildLevel + " gear to preform this action")
                            tools.outputEmbed(message.channel,embed,player)
                        }
                    } else {
                        embed.setColor([255,0,0])
                        embed.addField("Missing Gear","You need construction gear to preform this action")
                        tools.outputEmbed(message.channel,embed,player)
                    }
                }
            } else if(input.length == 2){
                if(input[1] == "options"){
                    for(var structure in structureMap){
                        var costString = ""
                        for(var resource in structureMap[structure].resources){
                            costString += resource.capitalize() + ": " + structureMap[structure].resources[resource] +"\n"
                        }
                        embed.addField(structure.capitalize() + " (" + structure +")","Costs:\n" + costString)
                    }
                    tools.outputEmbed(message.channel,embed,player)
                }
            }
        }
    }
}