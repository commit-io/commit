'use latest';

import request from 'request';
import Leaderboard from '../db/leaderboard';
import User from '../db/user';

const createLeaderboard = (err, ctx, repo, cb) => {
  if (err) return cb(err);

  let leaderboard = {
    repo,
    points: []
  };

  User.findOne(ctx, {
    user_id: ctx.user.sub
  }, (err, user) => {
    if (err) return cb(err);

    leaderboard.owner = user;
    leaderboard.ownerId = user.user_id;
    Leaderboard.save(ctx, leaderboard, (err, result) => {
      if (err) return cb(err);
      return cb(null, result)
    });
  });
};

module.exports = {
  createLeaderboard
};
