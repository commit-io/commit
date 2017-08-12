'use latest';

import bodyParser from 'body-parser';
import express from 'express';
import Webtask from 'webtask-tools';
import { MongoClient } from 'mongodb';
import { ObjectID } from 'mongodb';
import request from 'request';

import { getAuth0Token } from './src/auth0';
import github from './src/github';
import slack from './src/slack';
import { createLeaderboard, saveChannel, saveWebhook, getScore } from './src/leaderboard';

import User from './db/user';

import { renderView } from './view/index';

const server = express();

server.use(bodyParser.json());

server.get('/slack', (req, res) => {
  let ctx = req.webtaskContext;
  slack.requestAccessToken(
    ctx.secrets.SLACK_CLIENT_ID,
    ctx.secrets.SLACK_CLIENT_SECRET,
    req.query.code,
    ctx.secrets.SLACK_AUTH_REDIRECT_URL + '%3Faccess_token=' + req.query.access_token,
    (err, accessObj) => {
      let accessToken = accessObj.access_token;
      slack.authenticate(accessToken);

      let userObj = require('jsonwebtoken').verify(req.query.access_token, ctx.secrets.AUTH0_CLIENT_SECRET, {
        audience: ctx.secrets.AUTH0_CLIENT_ID,
        issuer: 'https://' + ctx.secrets.AUTH0_DOMAIN + '/'
      });

      User.findOne(ctx, { 'user_id': userObj.sub }, (err, user) => {
        if (err) res.status(500).send(err);
        accessObj.provider = 'slack';
        user.identities.push(accessObj);
        User.save(ctx, user, (err, result) => {
          if (err) res.status(500).send(err);

          res.writeHead(302, { Location: `https://wt-1d230a38e18ec582a3dce585ff81f44b-0.run.webtask.io/commit/app/?slack_token=${ accessToken }&access_token=${ req.query.access_token }#/channels` });
          return res.end();
        });
      });
    });
});

server.get('/app', (req, res) => {
  const HTML = renderView(req.webtaskContext);

  res.set('Content-Type', 'text/html');
  res.status(200).send(HTML);
});

server.get('/repos', (req, res) => {
  github.getAllRepos().then(repos => {
    res.status(200).send(repos);
  }, err => res.status(500).send(err));
});

server.post('/repos', (req, res) => {
  createLeaderboard(null, req.webtaskContext, req.body, (err, result) => {
    // Ignore existing leaderboard
    if(err.code !== 11000) return res.status(500).send(err);

    github.createWebhook(req.webtaskContext, req.body, (err, hook) => {
      if(err) return res.status(500).send(err);

      saveWebhook(req.webtaskContext, hook, (err, finalResult) => {
        if(err) return res.status(500).send(err);
        return res.status(200).send(finalResult);
      });
    });
  });
});

server.get('/channels', (req, res) => {
  slack.getChannels((err, channels) => {
    if (err) res.status(500).send(err)

    res.status(200).send(channels);
  });
});

server.post('/channels', (req, res) => {
  saveChannel(null, req.webtaskContext, req.body, (err, result) => {
    if(err) res.status(500).send(err);

    res.status(200).send(result);
  });
});

server.get('/score', (req, res) => {
  getScore(req.webtaskContext, (err, result) => {
    if(err) res.status(500).send(err);

    res.status(200).send(result.points);
  });
});

server.get('/score-slack', (req, res) => {
  getScore(req.webtaskContext, (err, result) => {
    if(err) return res.status(500).send(err);

    User.findOne(req.webtaskContext, { user_id: req.webtaskContext.user.sub }, (err, user) => {
      let slackData;
      if(err) return res.status(500).send(err);
      user.identities.forEach(identity => {
        if(identity.provider === 'slack') {
          slackData = identity;
        }
      });
      slack.sendMessage(slack.formatMsg(result.points), result.channel.id, slackData.access_token, (err, finalResult) => {
        if(err) return res.status(500).send(err);

        return res.status(200).send(finalResult);
      });
    });
  });
});

module.exports = Webtask.fromExpress(server).auth0({
  loginSuccess: function(ctx, req, res, baseUrl) {
    getAuth0Token(null, ctx, (err, token) => {
      github.getGithubUser(err, ctx, token, (err, user) => {
        github.authenticate(JSON.parse(user).identities[0].access_token);
        User.save(ctx, user, (err, result) => {
          if(err) console.log(err);
          res.writeHead(302, { Location: `${ baseUrl }/app?access_token=${ ctx.accessToken }` });
          return res.end();
        });
      });
    });
  },
  validateToken: function (ctx, req, token, cb) {
    let user;
    console.log(token)
    try {
      user = require('jsonwebtoken').verify(token, ctx.secrets.AUTH0_CLIENT_SECRET, {
        audience: ctx.secrets.AUTH0_CLIENT_ID,
        issuer: 'https://' + ctx.secrets.AUTH0_DOMAIN + '/'
      });
    } catch (e) {
      return cb({
        code: 401,
        message: 'Unauthorized: ' + e.message
      });
    }
    return cb(null, user);
  }, exclude: [
    '/slack',
  ]
});
