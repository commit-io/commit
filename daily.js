const Leaderboard = require('./db/leaderboard');
const { countScore } = require('./src/leaderboard');
const User = require('./db/user');
const slack = require('./src/slack');

module.exports = function (ctx, cb) {
  Leaderboard.findAll(ctx, (err, leaderboards) => {
    if(err) return cb(err);

    leaderboards.forEach(leaderboard => {
      countScore(leaderboard, (err, result) => {
        User.findOne(ctx, { user_id: leaderboard.ownerId }, (err, user) => {
          console.log(err, user);
          if(err) return cb(err);

          let slackData;
          user.identities.forEach(identity => {
            if(identity.provider === 'slack') {
              slackData = identity;
            }
          });
          if(result.channel && result.channel.id) {
            slack.sendMessage(slack.formatMsg(result.points), result.channel.id, slackData.access_token, (err, finalResult) => {
              if(err) return cb(err);

              return cb(null, finalResult);
            });
          }
        });
      });
    });
  });
};
