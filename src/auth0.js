'use latest';

import request from 'request';

const getAuth0Token = (err, ctx, cb) => {
  if (err) return cb(err);

  const options = {
    method: 'POST',
    url: `https://${ctx.secrets.AUTH0_DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/json' },
    body: {
      grant_type: 'client_credentials',
      client_id: ctx.secrets.AUTH0_API_CLIENT_ID,
      client_secret: ctx.secrets.AUTH0_API_CLIENT_SECRET,
      audience: `https://${ctx.secrets.AUTH0_DOMAIN}/api/v2/`
    },
    json: true
  };

  request(options, function (err, response, body) {
    if (err) return cb(err);
    return cb(null, body.access_token);
  });
};

module.exports = {
  getAuth0Token
};
