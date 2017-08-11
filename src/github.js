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

module.exports = {
  authenticate,
  getAllRepos,
  getGithubUser
};
