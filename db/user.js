'use latest';

import { MongoClient } from 'mongodb';
import { ObjectID } from 'mongodb';

const collection = 'user';

const save = (ctx, user, cb) => {
  if(typeof user === 'string') user = JSON.parse(user);

  MongoClient.connect(ctx.secrets.MONGO_URL, (err, db) => {
    if (err) return cb(err);

    db.collection(collection).createIndex( { user_id: 1 }, { unique: true } );
    db.collection(collection).save(user, (err, result) => {
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
