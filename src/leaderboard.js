'use latest';

import request from 'request';
import Leaderboard from '../db/leaderboard';
import User from '../db/user';

const createLeaderboard = (err, ctx, repo, cb) => {
  if (err) return cb(err);

  let leaderboard = {
    repo,
    score: {}
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

const saveChannel = (err, ctx, channel, cb) => {
  if (err) return cb(err);

  Leaderboard.findOne(ctx, {
    ownerId: ctx.user.sub
  }, (err, leaderboard) => {
    if (err) return cb(err);

    leaderboard.channel = channel;
    Leaderboard.save(ctx, leaderboard, (err, result) => {
      if (err) return cb(err);
      return cb(null, result)
    });
  });
};

const saveWebhook = (ctx, hook, cb) => {
  Leaderboard.findOne(ctx, {
    ownerId: ctx.user.sub
  }, (err, leaderboard) => {
    if (err) return cb(err);

    leaderboard.hook = hook;
    Leaderboard.save(ctx, leaderboard, (err, result) => {
      if (err) return cb(err);
      return cb(null, result)
    });
  });
};

const getScore = (ctx, cb) => {
  Leaderboard.findOne(ctx, {
    ownerId: ctx.user.sub
  }, (err, leaderboard) => {
    if (err) return cb(err);

    let points = {};

    Object.keys(leaderboard.score).forEach(user => {
      points[user] = leaderboard.score[user].length;
    });

    let result = {
      points,
      channel: leaderboard.channel,
      repo: leaderboard.repo
    };
    cb(null, result);
  });
};

function getMonday(d) {
  d = d.split('T')[0];
  d = new Date(d);
  let day = d.getDay();
  let diff = d.getDate() - day + (day == 0 ? -6:1);

  return new Date(d.setDate(diff)).getTime();
};

const countScore = (leaderboard, cb) => {
  let points = {};
  let lastMonday = getMonday(new Date().toISOString());

  let score = Object.keys(leaderboard.score).forEach(user => {
    if(leaderboard.score[user]) {
      leaderboard.score[user] = leaderboard
      .score[user]
      .filter(commit => new Date(commit.timestamp).getTime() > lastMonday);

      points[user] = leaderboard.score[user].length;
    }
  });

  let result = {
    points,
    channel: leaderboard.channel,
    repo: leaderboard.repo
  };
  cb(null, result);
};

module.exports = {
  createLeaderboard,
  saveChannel,
  saveWebhook,
  getScore,
  countScore
};
