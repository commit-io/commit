'use latest';

import { MongoClient } from 'mongodb';
import { ObjectID } from 'mongodb';

const collection = 'user';

const save = (ctx, user, cb) => {
  MongoClient.connect(ctx.secrets.MONGO_URL, (err, db) => {
    if (err) return cb(err);

    db.collection(collection).insertOne(JSON.parse(user), (err, result) => {
      db.close();
      if (err) return cb(err);

      return cb(null, result);
    });
  });
};

const findOne = (ctx, query, cb) => {
  MongoClient.connect(ctx.secrets.MONGO_URL, (err, db) => {
    if (err) return cb(err);

    db.collection(collection).findOne(query, (err, result) => {
      db.close();
      if (err) return cb(err);

      return cb(null, result);
    });
  });
};

module.exports = {
  save,
  findOne
};
