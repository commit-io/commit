'use latest';

import { MongoClient } from 'mongodb';
import { ObjectID } from 'mongodb';

const collection = 'leaderboard';

const save = (ctx, leaderboard, cb) => {
  MongoClient.connect(ctx.secrets.MONGO_URL, (err, db) => {
    if (err) return cb(err);
    db.collection(collection).insertOne(leaderboard, (err, result) => {
      db.close();
      if (err) return cb(err);

      return cb(null, result);
    });
  });
};

module.exports = {
  save
};
