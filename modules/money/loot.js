/**
 * @file claim command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

const moment = require('moment');
const specialIDs = require('../../data/specialIDs.json');
let recentUsers = [];

exports.exec = async (Bastion, message) => {
  try {
    let cooldown = 1;
    if (!recentUsers.includes(message.author.id)) {
    
    let rewardAmount = Bastion.functions.getRandomInt(50, 100);
    let description = `${message.author} You've claimed your loot.`;

    Bastion.emit('userDebit', message.member, rewardAmount);

    /**
     * Send a message in the channel to let the user know that the operation was successful.
     */
    
    message.channel.send({
      embed: {
        color: Bastion.colors.GREEN,
        description: description
      }
    }).catch(e => {
      Bastion.log.error(e);
    });
    
    setTimeout(() => {
        recentUsers.splice(recentUsers.indexOf(message.author.id), 1);
      }, cooldown * 1000);

    /**
     * Let the user know by DM that their account has been debited.
     */
    message.channel.send({
      embed: {
        color: Bastion.colors.GREEN,
        description: `Your account has been debited with **${rewardAmount}** Bastion Currencies.`
      }
    }).catch(e => {
      if (e.code !== 50007) {
        Bastion.log.error(e);
      }
    });
  }

      else
      {
    return Bastion.emit('error', Bastion.strings.error(message.guild.language, 'cooldown'), Bastion.strings.error(message.guild.language, 'claimCooldown', true, message.author), message.channel);
    }
   }
  catch (e) {
    Bastion.log.error(e);
  }
};

exports.config = {
  aliases: [ 'loot' ],
  enabled: true
};

exports.help = {
  name: 'loot',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'loot',
  example: []
};
