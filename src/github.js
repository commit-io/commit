'use latest';

import request from 'request';
import githubClient from 'github';
import promise from 'bluebird';

const github = new githubClient({
  debug: false,
  Promise: promise
});

const getGithubUser = (err, ctx, token, cb) => {
  if (err) return cb(err);

  const options = {
    method: 'GET',
    url: `https://${ctx.secrets.AUTH0_DOMAIN}/api/v2/users/${ctx.user.sub}`,
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  };

  request(options, function (err, response, body) {
    if (err) return cb(err);
    return cb(null, body);
  });
};

const authenticate = (token) => {
  github.authenticate({
    type: "token",
    token
  });
};

const getAllRepos = () => {
  return github.repos.getAll({});
};

const createWebhook = (ctx, repo, cb) => {
  github.repos.createHook({
    owner: repo.owner.login,
    repo: repo.name,
    name: 'web',
    config: {
      url: 'https://wt-1d230a38e18ec582a3dce585ff81f44b-0.run.webtask.io/githubhook',
      content_type: 'json'
    }
  }).then(res => cb(null, res), err => cb(err));
};

module.exports = {
  authenticate,
  getAllRepos,
  getGithubUser,
  createWebhook
};
