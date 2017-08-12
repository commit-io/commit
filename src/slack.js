'use latest';

import SlackClient from 'slack-node';
import request from 'request';

let slack = {};

const requestAccessToken = (id, secret, code, redirectUri, cb) => {
  request(`https://slack.com/api/oauth.access?client_id=${id}&client_secret=${secret}` +
    `&code=${code}&redirect_uri=${redirectUri}`, (err, result) => {
      if(err) return cb(err);
      return cb(null, JSON.parse(result.body));
    });
};

const authenticate = (token) => {
  if(!slack.api) slack = new SlackClient(token);
};

const getChannels = (cb) => {
  slack.api('channels.list', (err, channels) => {
   if (err) return cb(err);

   return cb(null, channels);
 });
};

const sendMessage = (msg, channel, token, cb) => {
  authenticate(token);
  slack.api('chat.postMessage', {
    text: msg,
    channel,
    as_user: false
  }, function(err, response){
    if (err) return cb(err);

    return cb(null, response);
  });
};

const formatMsg = (points) => {
  let str =
    `Here's the weekly *Commit* leaderboard

>>>`;

  let sortedUsers = Object.keys(points).sort((a,b) => points[b] - points[a]);

  sortedUsers.forEach((user, index) => str += '\n' + `*${index+1}.* ${user}: *${points[user]} commit${(points[user] > 1) ? 's' : ''}*`);

  return str;
};

module.exports = {
  authenticate,
  getChannels,
  requestAccessToken,
  sendMessage,
  formatMsg
};
