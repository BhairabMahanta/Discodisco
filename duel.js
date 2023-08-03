// Import necessary modules and dependencies
const { CommandInteraction, StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Build the correct file path to 'players.json' using the '__dirname' variable
const playersFilePath = path.join(__dirname, '..', '..', 'data', 'players.json');
// Read 'players.json' file and parse its contents
const playerData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));
const { getUserCardFromName } = require('./db.js');
const { initiateDuel, getMax, checkResults, updateMovesOnCd, calculateAbilityDamage, getCardStats, getCardMoves,
  calculateDamage } = require('./glogic.js'); // Assuming you have implemented the duel logic in gamelogic.js
const cards = require('../fun/cards.js'); // Import the cards data from 'cards.js'

// Duel command handler
module.exports = {
    name: 'duel',
    description: 'Challenge someone to a duel!',
  async execute(client, message, args, interaction) {
   // const collector = message.createMessageComponentCollector({ idle: 30000 });

     // collector.on('collect', async (i) => {
      //  console.log('Collector event - Button clicked:', i.customId);
    try {
     
      const author = message.author.id;
     const opponent = args[0].trim();
      
      // Verify that 'cards' property exists for both author and opponent
    if (!playerData[author]?.cards) {
      throw new Error('author players do not have cards.');
    }
      if (!playerData[opponent]?.cards) {
        message.channel.send('Opponent did not register yet');
      throw new Error('seggs players do not have cards.');
    }
      

      // Other code for retrieving card data and deck information similar to the previous implementation
// Get the cards of the author and the opponent
const authorCards = playerData[author]?.cards?.name;
    
const opponentCards = playerData[opponent]?.cards?.name;
    //  console.log('authorCards:', authorCards);
     // console.log('opponentCards:', opponentCards);
      const authorUserName = playerData[author]?.name;
const opponentUserName = playerData[opponent]?.name;
     //       console.log('authorCardsData:', authorUserName);
    //  console.log('opponentCardsData:', opponentUserName);

      // Get the stats of the author's and opponent's cards
      const authorStats = getCardStats(authorCards[0]);
      const opponentStats = getCardStats(opponentCards[0]);

      console.log('authorStats:', authorStats);
      console.log('opponentStats:', opponentStats);
// Determine the first turn based on the speed of the author and opponent
    let currentTurn =[];
    let attackedUsers = [];
    if (authorStats?.speed > opponentStats?.speed) {
      currentTurn = author;
      attackedUsers.push(opponent);
    } else if (opponentStats?.speed > authorStats?.speed) {
      currentTurn = opponent;
      attackedUsers.push(author);
    } else {
      // If both have the same speed, randomly choose the first turn
      currentTurn = Math.random() < 0.5 ? author : opponent;
    }
      console.log('123mictesting:', attackedUsers)

      
      // Set initial HP for the duel
      let authorHP = authorStats?.hp || 100; // Assuming initial HP is 100 for both author and opponent
      let opponentHP = opponentStats?.hp || 100;

      // Array to store battle logs
      const battleLogs = [];


  // Function to send the duel status as an embed with buttons and wait for user response
      
  async function sendDuelStatus(currentTurn) {
    // Get the moves of each card for the author and the opponent
    const authorMoves = authorCards.map(cardName => getCardMoves(cardName));
    // console.log('authormoves:', authorMoves)
    console.log('123mictestinginsidesendduel:', attackedUsers)
    const opponentMoves = opponentCards.map(cardName => getCardMoves(cardName));
 const movesArray = attackedUsers[0] === opponent ? authorMoves[0] : opponentMoves[0];
console.log('thisattackedusers[0]insidesendDUel:', attackedUsers[0])
    
    // Send the duel status as a message embed with the current turn information
  const embed = generateDuelStatusEmbed(author, authorUserName, opponentUserName, authorCards, authorHP, opponent, opponentCards,  opponentHP, battleLogs);
  const messageResponse = await message.channel.send({ embeds: [embed], components: getDuelActionRow(authorCards, opponentCards, attackedUsers, opponent, authorMoves, opponentMoves) });

   // Wait for the player or opponent to select an action using buttons
       const filter = i => (i.user.id === message.author.id || i.user.id === opponent) && i.customId.startsWith('action_') || i.customId === ('starter');
  const collector = messageResponse.createMessageComponentCollector({ filter, time: 1200000 });

    return new Promise((resolve) => {
      collector.on('collect', async (interaction) => {
        console.log('Player action:', interaction.customId);
    
   

 // Check if the action is taken by the author
       console.log(attackedUsers);
         console.log('1st', currentTurn);
       if (attackedUsers.includes(interaction.user.id)) {
        await interaction.deferUpdate(); // Defer the update instead of replying
        await interaction.followUp({ content: 'You have already attacked lol', ephemeral: true });
        return;
      }
        

   if (interaction.user.id === author && !attackedUsers.includes(interaction.user.id)) {
    // Handle the author's chosen action
    if (interaction.customId === 'action_attack') {
      // Handle author's attack action
     const damage = calculateDamage(authorStats.attack, opponentStats.defense);
 // Change the damage range as per your game rules
  opponentHP -= damage;
      battleLogs.push(`${authorUserName} attacks for ${damage} damage!`);
      attackedUsers = [];
     currentTurn = [];
      currentTurn.push(interaction.user.id);
      attackedUsers.push(interaction.user.id);
        console.log(attackedUsers);
         console.log('2nd', currentTurn);
    } else if (interaction.customId === 'action_dodge') {
      // Handle author's dodge action
      // Implement dodge logic as per your game rules
      // For example, reduce incoming damage or increase player's defense for a turn
      battleLogs.push(`${authorUserName} dodges the attack!`);
      attackedUsers = [];
        attackedUsers.push(interaction.user.id);
    } else if (interaction.customId === 'starter') {
    const selectedMoveId = interaction.values[0]; // Get the selected move ID from the interaction
 console.log('selectedmoveauthor:', movesArray)
    // Use the selectedMoveId to perform the corresponding action
    // For example, find the move with the matching ID and calculate damage
    const selectedMove = movesArray.find(move => move.id.toString() === selectedMoveId);
    if (selectedMove) {
      console.log('selectedmovelol:', selectedMove)
      
      // Update HP and battle logs accordingly
           const ability = selectedMove
   // console.log('authorMoves:', movesArray);
     // console.log('abilitylogs:', ability);
     const abilityDamage = calculateAbilityDamage(selectedMove.power);
      console.log('abilitydamage:', abilityDamage)
      opponentHP -= abilityDamage;
    attackedUsers = [];
      battleLogs.push(`${authorUserName} uses ${ability.name} for ${abilityDamage} damage!`);
       // Clear the attackedUsers and set the current turn to the player who used the Select Menu
      
      attackedUsers.push(interaction.user.id);
      currentTurn = [interaction.user.id];
    }
    }
  } else if (interaction.user.id === opponent && !attackedUsers.includes(interaction.user.id)) {
    // Handle the opponent's chosen action
  
     if (interaction.customId === 'action_attack') {
       // Handle opponent's attack action
       // Calculate damage and update author's HP
        const damage = calculateDamage(opponentStats.attack, authorStats.defense); // Change the damage range as per your game rules
  authorHP -= damage;
       attackedUsers = [];
       currentTurn = [];
      currentTurn.push(interaction.user.id);
         console.log('4th', currentTurn);
        attackedUsers.push(interaction.user.id);
       battleLogs.push(`${opponentUserName} attacks for ${damage} damage!`);
     } else if (interaction.customId === 'action_dodge') {
       // Handle opponent's dodge action
       // Implement dodge logic as per your game rules
       // For example, reduce incoming damage or increase player's defense for a turn
       battleLogs.push(`${opponentUserName} dodges the attack!`);
       attackedUsers.push(interaction.user.id);
     } else if (interaction.customId === 'starter') {
    const selectedMoveId = interaction.values[0]; // Get the selected move ID from the interaction
       console.log('thisselect:', selectedMoveId);
       console.log('selectedmoveopp:', movesArray)

    // Use the selectedMoveId to perform the corresponding action
    // For example, find the move with the matching ID and calculate damage
    const selectedMove = movesArray.find(move => move.id.toString() === selectedMoveId);
    if (selectedMove) {
      console.log('selectedmovelol:', selectedMove)
      
      // Update HP and battle logs accordingly
           const ability = selectedMove
   // console.log('authorMoves:', movesArray);
     // console.log('abilitylogs:', ability);
     const abilityDamage = calculateAbilityDamage(selectedMove.power);
      console.log('abilitydamage:', abilityDamage)
      authorHP -= abilityDamage;
    attackedUsers = [];
      battleLogs.push(`${opponentUserName} uses ${ability.name} for ${abilityDamage} damage!`);
       // Clear the attackedUsers and set the current turn to the player who used the Select Menu
      
      attackedUsers.push(interaction.user.id);
      currentTurn = [interaction.user.id];
    }
  }
   }
        // Check if the duel has ended (i.e., one of the players' HP is <= 0)
        const result = checkResults(authorHP, opponentHP);
        
        console.log('Duel result:', result);
        updateMovesOnCd(authorMoves);
        updateMovesOnCd(opponentMoves);

        if (result) {
          // Duel has ended, display the final result
          battleLogs.push(result);
  // For example, showing player card stats, health bars, etc.
  const finalEmbed = new EmbedBuilder () 
    .setColor('#FF0000')
    .setTitle('Duel Status')
    .setDescription('The duel has Ended!')
     .addFields(
      { name: `**${authorUserName}**'s Familiar: **${authorCards.join(', ')}**`, value: `**${opponentUserName}**'s Familiar: **${opponentCards.join(', ')}**`, inline: false },
      { name: `**${authorUserName}**'s HP: **${authorHP.toString()}**`, value: `**${opponentUserName}**'s HP: **${opponentHP.toString()}**`, inline: true },

    );

  // Update the winner field based on the duel results
if (result === 1) {
  // User wins
  finalEmbed.addFields({ name: 'Winner', value: `${authorUserName}`, inline: true });
} else if (result === 2) {
  // Opponent wins
  finalEmbed.addFields({ name: 'Winner', value: `${opponentUserName}`, inline: true });
} else {
  // Draw
  finalEmbed.addFields({ name: 'Result', value: 'Draw', inline: true });
}
   message.channel.send({ embeds: [finalEmbed] });
        /*  const finalEmbed = generateDuelStatusEmbed(author, authorUserName, 
    opponentUserName, authorCards, authorHP, opponent, opponentCards, opponentHP, battleLogs);
          message.channel.send({ embeds: [finalEmbed] });*/
          collector.stop();
          resolve(); // Resolve the promise to indicate the end of the duel loop
        } else {
          // Update the duel status as the duel continues
          const updatedEmbed = generateDuelStatusEmbed(author, authorUserName, opponentUserName, authorCards, authorHP, opponent, opponentCards, opponentHP, battleLogs, currentTurn);
          interaction.update({ embeds: [updatedEmbed], components: getDuelActionRow(authorCards, opponentCards, attackedUsers, opponent, authorMoves, opponentMoves) });
          
        }
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          // Handle timeout (player took too long to respond)
          console.log('Player response timed out.');
          message.channel.send('You took too long to respond. The duel has ended.');
          collector.stop();
          resolve(); // Resolve the promise to indicate the end of the duel loop
        }
      });
    });
  }
    
    
      
  // Start the duel loop
  while (authorHP > 0 && opponentHP > 0 ) {
    console.log('Duel loop iteration:', { authorHP, opponentHP });
     // Send the duel status for the current turn
      await sendDuelStatus(authorUserName, opponentUserName, currentTurn);
    
  }
} catch (error) {
  console.error('Error executing duel command:', error);
  message.reply({
    content: 'An error occurred while processing the duel command. Please try again later.',
    ephemeral: true,
  });
}
 
  },
}; 
function getDuelActionRow(authorCards, opponentCards, attackedUsers, opponent, authorMoves, opponentMoves) {
// this is to commit
  if (!authorCards) {
    // If authorCards is not defined, return an empty action row
    return new ActionRowBuilder();
  }

console.log('thisattackedusers[0]:', attackedUsers[0])
   const movesArray = attackedUsers[0] === opponent ? authorMoves[0] : opponentMoves[0];



  
  const moveOptions = movesArray.map((move) => {
    if (move && move.id) {
      return {
        label: move.name,
        description: move.description,
        value: move.id.toString(),
      };
    }
  });

  const stringMenu = new StringSelectMenuBuilder()
    .setCustomId('starter')
    .setPlaceholder('Make a selection!')
    .addOptions(moveOptions);

  const buttonRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('action_attack')
        .setLabel('Attack')
        .setStyle('Danger'),
      new ButtonBuilder()
        .setCustomId('action_dodge')
        .setLabel('Dodge')
        .setStyle('Danger')
    );

  const stringMenuRow = new ActionRowBuilder().addComponents(stringMenu);

  // Add ability buttons based on the player's abilities
  // For example:
  // for (let i = 0; i < authorAbilities.length; i++) {
  //   row.addComponents(
  //     new MessageButton()
  //       .setCustomId(`ability_${i}`)
  //       .setLabel(authorAbilities[i].name)
  //       .setStyle('PRIMARY')
  //   );
  // }
  const rows = [buttonRow, stringMenuRow];

  return rows;
}



// Function to generate the duel status message embed
function generateDuelStatusEmbed(author, authorUserName, opponentUserName, authorCards, authorHP, opponent, opponentCards, opponentHP, battleLogs, currentTurn) {
   console.log('authorcardhomiecheckthree:', authorCards)

  // Generate the embed content based on the game state and battle logs
  // You can customize the appearance and information displayed in the embed
  // For example, showing player card stats, health bars, etc.
  const embed = new EmbedBuilder()
    .setColor('#008000')
    .setTitle('Duel Status')
    .setDescription('The duel is ongoing!')
  console.log('final', currentTurn);
   if (currentTurn?.includes(author)) {
  embed.addFields({ name: 'Current Turn', value: `${opponentUserName}`, inline: true })
     .addFields(
     { name: `**${authorUserName}**'s Familiar: **${authorCards.join(', ')}**`, value: `**${opponentUserName}**'s Familiar: **${opponentCards.join(', ')}**`, inline: false },
      { name: `**${authorUserName}**'s HP: **${authorHP.toString()}**`, value: `**${opponentUserName}**'s HP: **${opponentHP.toString()}**`, inline: true },

    );
      // Add battle logs only if they are not empty
  if (battleLogs.length > 0) {
    embed.addFields({ name: 'Battle Logs', value: '```' + battleLogs.join('\n') + '```', inline: false });
  } else {
    embed.addFields({ name: 'Battle Logs', value: 'No battle logs yet.', inline: true });
  }
    
    }
    else { 
  embed.addFields({ name: 'Current Turn', value: `${authorUserName}`, inline: true })
     .addFields(
      { name: `${authorUserName}'s Familiar: ${authorCards.join(', ')}`, value: `${opponentUserName}'s Familiar: ${opponentCards.join(', ')}`, inline: false },
      { name: `${authorUserName}'s HP: ${authorHP.toString()}`, value: `${opponentUserName}'s HP: ${opponentHP.toString()}`, inline: true },

    );

   // Add battle logs only if they are not empty
  if (battleLogs.length > 0) {
    embed.addFields({ name: 'Battle Logs', value: '```' + battleLogs.join('\n') + '```', inline: true });
  } else {
    embed.addFields({ name: 'Battle Logs', value: 'No battle logs yet.', inline: false });
  }
    }
  return embed;
}


