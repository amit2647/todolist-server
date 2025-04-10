const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
const options = {
  ssl: true,
  tlsAllowInvalidCertificates: false,
};

let client;
let clientPromise;

if (!process.env.MONGO_URI) {
  throw new Error("Please define MONGO_URI in environment variables");
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

module.exports = clientPromise;
