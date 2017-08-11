const Leaderboard = require('./db/leaderboard');

const API_URL = 'https://api.github.com';
const WEB_URL = 'https://github.com';
const REF = 'refs/heads/master';

function score(commits, ctx, cb) {
  Leaderboard.findOne(ctx, { 'repo.full_name': ctx.body.repository.full_name }, (err, leaderboard) => {
    commits.forEach(commit => {
      if(!leaderboard.score[commit.author.username]) {
        leaderboard.score[commit.author.username] = [];
      }
      leaderboard.score[commit.author.username].push(commit);
    });

    Leaderboard.save(ctx, leaderboard, (err, res) => {
      if(err) return cb(err);

      return(null, res);
    });
  });
};

module.exports = function (ctx, cb) {
  var msg;
  var err;

  if (!ctx.body) {
    err = new Error('This webtask must be created with the `--parse` flag (`pb` claim)');
    return cb(err);
  }

  if (!Array.isArray(ctx.body.commits)) {
    err = new Error('Unexpected payload: Missing commits array.');
    return cb(err);
  }

  if (!ctx.body.repository) {
    err = new Error('Unexpected payload: Missing repository information.');
    return cb(err);
  }
  var payload = ctx.body;

  var headers = {
    'Authorization': 'Bearer ' + ctx.data.GITHUB_TOKEN,
    'User-Agent': 'Webtask Tagger',
  };

  score(ctx.body.commits, ctx, (err, response) => {
    if(err) return cb(err);

    return(null, response);
  });
};
