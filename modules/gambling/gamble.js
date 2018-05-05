/**
 * @file betRoll command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

let recentUsers = [];

exports.exec = async (Bastion, message, args) => {
  try {
    let cooldown = 0;
    if (!recentUsers.includes(message.author.id)) {
      if (!args || args < 1 || (isNaN(args) && args.toLowerCase() !== 'all')) {
        /**
        * The command was ran with invalid parameters.
        * @fires commandUsage
        */
        return Bastion.emit('commandUsage', message, this.help);
      }
      
      let guildMemberModel = await message.client.database.models.guildMember.findOne({
        attributes: [ 'bastionCurrencies' ],
        where: {
          userID: message.author.id,
          guildID: message.guild.id
        }
      });
      
      if(args.toLowerCase() === 'all')
      {
      args = parseInt(guildMemberModel.dataValues.bastionCurrencies);
      }
      else
      {
      args = parseInt(args);
      }

      let minAmount = 5;
      if (args < minAmount) {
        /**
        * Error condition is encountered.
        * @fires error
        */
        return Bastion.emit('error', Bastion.strings.error(message.guild.language, 'invalidInput'), Bastion.strings.error(message.guild.language, 'minBet', true, minAmount), message.channel);
      }

      let outcomes = [
        'one',
        'two',
        'three',
      ];
      let outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

      

      guildMemberModel.dataValues.bastionCurrencies = parseInt(guildMemberModel.dataValues.bastionCurrencies);

      if (args > guildMemberModel.dataValues.bastionCurrencies) {
        /**
        * Error condition is encountered.
        * @fires error
        */
        return Bastion.emit('error', Bastion.strings.error(message.guild.language, 'insufficientBalance'), Bastion.strings.error(message.guild.language, 'insufficientBalance', true, guildMemberModel.dataValues.bastionCurrencies), message.channel);
      }

      recentUsers.push(message.author.id);

      let result;
      if (outcome.toLowerCase() === 'one') {
        let prize = args < 50 ? args + outcomes.length : args < 100 ? args : args * 2;
        let curr = guildMemberModel.dataValues.bastionCurrencies;
        let curr2 = parseInt(prize)+parseInt(curr);
        result = `Congratulations! You won.\nYou won **${prize}** dollars. You now have **${curr2}** dollars.`;

        /**
        * User's account is debited with Bastion Currencies
        * @fires userDebit
        */
        
        Bastion.emit('userDebit', message.member, prize);
      }
      else {
        let curr = guildMemberModel.dataValues.bastionCurrencies;
        let curr2 = parseInt(curr)-parseInt(args);
        result = `Sorry, you lost. Better luck next time. You now have **${curr2}** dollars.`;

        /**
        * User's account is credited with Bastion Currencies
        * @fires userCredit
        */
        Bastion.emit('userCredit', message.member, args);
      }
      
      await message.channel.send({
        embed: {
          color: Bastion.colors.BLUE,
          description: result
        }
      });
      
      setTimeout(() => {
        recentUsers.splice(recentUsers.indexOf(message.author.id), 1);
      }, cooldown * 0);
    }
    else {
      /**
      * Error condition is encountered.
      * @fires error
      */
      return Bastion.emit('error', Bastion.strings.error(message.guild.language, 'cooldown'), Bastion.strings.error(message.guild.language, 'gamblingCooldown', true, message.author, cooldown), message.channel);
    }
  }
  catch (e) {
    Bastion.log.error(e);
  }
};

exports.config = {
  aliases: [ 'gb' ],
  enabled: true,
};

exports.help = {
  name: 'gamble',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'gamble <amount>',
  example: [ 'gamble 100' ]
};
