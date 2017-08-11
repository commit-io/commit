'use latest';

import { MongoClient } from 'mongodb';
import { ObjectID } from 'mongodb';

const collection = 'leaderboard';

const save = (ctx, leaderboard, cb) => {
  MongoClient.connect(ctx.secrets.MONGO_URL || ctx.data.MONGO_URL, (err, db) => {
    if (err) return cb(err);

    db.collection(collection).createIndex( { ownerId: 1 }, { unique: true } );
    db.collection(collection).save(leaderboard, (err, result) => {
      db.close();
      if (err) return cb(err);

      return cb(null, result);
    });
  });
};

const findOne = (ctx, query, cb) => {
  MongoClient.connect(ctx.secrets.MONGO_URL || ctx.data.MONGO_URL, (err, db) => {
    if (err) return cb(err);

    db.collection(collection).findOne(query, (err, result) => {
      db.close();
      if (err) return cb(err);

      return cb(null, result);
    });
  });
};

const findAll = (ctx, cb) => {
  MongoClient.connect(ctx.secrets.MONGO_URL || ctx.data.MONGO_URL, (err, db) => {
    if (err) return cb(err);

    db.collection(collection).find({}, (err, result) => {
      db.close();
      if (err) return cb(err);

      return cb(null, result);
    });
  });
};

module.exports = {
  save,
  findOne,
  findAll
};
