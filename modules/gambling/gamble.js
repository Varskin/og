/**
 * @file betRoll command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

let recentUsers = [];

exports.exec = async (Bastion, message, args) => {
  try {
    let cooldown = 60;
    if (!recentUsers.includes(message.author.id)) {
      if (!args.money || args.money < 1) {
        /**
        * The command was ran with invalid parameters.
        * @fires commandUsage
        */
        return Bastion.emit('commandUsage', message, this.help);
      }

      args.money = parseInt(args.money);

      let minAmount = 5;
      if (args.money < minAmount) {
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

      let guildMemberModel = await message.client.database.models.guildMember.findOne({
        attributes: [ 'bastionCurrencies' ],
        where: {
          userID: message.author.id,
          guildID: message.guild.id
        }
      });

      guildMemberModel.dataValues.bastionCurrencies = parseInt(guildMemberModel.dataValues.bastionCurrencies);

      if (args.money > guildMemberModel.dataValues.bastionCurrencies) {
        /**
        * Error condition is encountered.
        * @fires error
        */
        return Bastion.emit('error', Bastion.strings.error(message.guild.language, 'insufficientBalance'), Bastion.strings.error(message.guild.language, 'insufficientBalance', true, guildMemberModel.dataValues.bastionCurrencies), message.channel);
      }

      recentUsers.push(message.author.id);
      let prizer;

      let result;
      if (outcome.toLowerCase() === 'one') {
        let prize = args.money < 50 ? args.money + outcomes.length : args.money < 100 ? args.money : args.money * 2;
        prizer = prize;
        result = `Congratulations! You won.\nYou won **${prize}** Bastion Currencies.`;

        /**
        * User's account is debited with Bastion Currencies
        * @fires userDebit
        */
        let curr = guildMemberModel.dataValues.bastionCurrencies;
        await message.channel.send({
        embed: {
          color: Bastion.colors.BLUE,
          description: prize+curr
        }
      });
        
        Bastion.emit('userDebit', message.member, prize);
      }
      else {
        result = 'Sorry, you lost. Better luck next time.';

        /**
        * User's account is credited with Bastion Currencies
        * @fires userCredit
        */
        Bastion.emit('userCredit', message.member, args.money);
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
  argsDefinitions: [
     { name: 'outcome', type: String, alias: 'o', defaultOption: true },
    { name: 'money', type: Number, alias: 'm' }
  ]
};

exports.help = {
  name: 'gamble',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'gamble <amount>',
  example: [ 'gamble 100' ]
};