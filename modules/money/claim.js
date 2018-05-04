/**
 * @file claim command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

const moment = require('moment');
const specialIDs = require('../../data/specialIDs.json');

exports.exec = async (Bastion, message) => {
  try {
    let guildMemberModel = await Bastion.database.models.guildMember.findOne({
      attributes: [ 'lastClaimed', 'claimStreak' ],
      where: {
        userID: message.author.id,
        guildID: message.guild.id
      }
    });

    if (guildMemberModel && guildMemberModel.dataValues.lastClaimed) {
      /**
       * If current date is same as the last claimed date, you can't use this!
       */
      if (guildMemberModel.dataValues.lastClaimed.toDateString() === new Date().toDateString()) {
        return Bastion.emit('error', Bastion.strings.error(message.guild.language, 'cooldown'), Bastion.strings.error(message.guild.language, 'claimCooldown', true, message.author), message.channel);
      }


      /**
       * If it's a consecutive day, increase the claim streak of user.
       * Otherwise set the streak to 0.
       */
      let nextDay = moment(guildMemberModel.dataValues.lastClaimed).add(1, 'd');
      if (guildMemberModel.dataValues.claimStreak < 7 && moment().isSame(nextDay, 'day')) {
        guildMemberModel.dataValues.claimStreak++;
      }
      else {
        guildMemberModel.dataValues.claimStreak = 0;
      }
    }

    let rewardAmount = Bastion.functions.getRandomInt(50, 100);
    let description = `${message.author} You've claimed your daily reward.`;

    if (guildMemberModel.dataValues.claimStreak === 1) {
      description = `${description}\n\nKeep using this command every day and you'll get a bonus reward on completion of your 7 day streak!`;
    }
    else if (guildMemberModel.dataValues.claimStreak > 1 && guildMemberModel.dataValues.claimStreak < 6) {
      description = `${description}\n\n${7 - guildMemberModel.dataValues.claimStreak} days to get your bonus reward! Keep Going!`;
    }
    else if (guildMemberModel.dataValues.claimStreak === 6) {
      description = `${description}\n\nJust one day left for your 7 day streak to complete!`;
    }
    else if (guildMemberModel.dataValues.claimStreak === 7) {
      guildMemberModel.dataValues.claimStreak = 0;
      rewardAmount += Bastion.functions.getRandomInt(350, 700);
      description = `${description}\n\nCongratulations! You've completed your 7 day streak! Check for a DM from me for your bonus reward.`;
    }
    
    let guildMemberModel2 = await message.client.database.models.guildMember.findOne({
        attributes: [ 'bastionCurrencies' ],
        where: {
          userID: message.author.id,
          guildID: message.guild.id
        }
      });
      
    let curr = guildMemberModel2.dataValues.bastionCurrencies;
    let curr2 = parseInt(rewardAmount)+parseInt(curr);

    Bastion.emit('userDebit', message.member, rewardAmount);

    await Bastion.database.models.guildMember.update({
      lastClaimed: Date.now(),
      claimStreak: guildMemberModel.dataValues.claimStreak
    },
    {
      where: {
        userID: message.author.id,
        guildID: message.guild.id
      },
      fields: [ 'lastClaimed', 'claimStreak' ]
    });

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
    
    

    /**
     * Let the user know by DM that their account has been debited.
     */
    message.channel.send({
      embed: {
        color: Bastion.colors.GREEN,
        description: `Your account has been debited with **${rewardAmount}** dollars. You now have **${curr2}** dollars.`
      }
    }).catch(e => {
      if (e.code !== 50007) {
        Bastion.log.error(e);
      }
    });
  }
  catch (e) {
    Bastion.log.error(e);
  }
};

exports.config = {
  aliases: [ 'daily' ],
  enabled: true
};

exports.help = {
  name: 'claim',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'claim',
  example: []
};
