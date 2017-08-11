'use latest';

import bodyParser from 'body-parser';
import express from 'express';
import Webtask from 'webtask-tools';
import { MongoClient } from 'mongodb';
import { ObjectID } from 'mongodb';
import request from 'request';

import { getAuth0Token } from './src/auth0';
import github from './src/github';
import { createLeaderboard } from './src/leaderboard';

import User from './db/user';

import { renderView } from './view/index';

const server = express();

server.use(bodyParser.json());

server.get('/slack', (req, res) => {
  res.status(200).send('slack');
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
  console.log(req.body);
  createLeaderboard(null, req.webtaskContext, req.body, (err, result) => {
    if(err) res.status(500).send(err);

    res.status(200).send(result);
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
  loginError: function (error, ctx, req, res, baseUrl) {
    console.log(error);
  },
  validateToken: function (ctx, req, token, cb) {
    let user;
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
