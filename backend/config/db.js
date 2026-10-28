// backend/config/db.js
// -------------------------------------------------------
// Connects to MongoDB Atlas using the URI stored in .env.
// We export a function (connectDB) so server.js can call
// it once at startup and wait for the result.
// -------------------------------------------------------

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // Guard: make sure the env variable was actually loaded
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined. ' +
      'Add it to backend/.env and restart the server.'
    );
  }

  // Connect – mongoose returns a promise we can await
  await mongoose.connect(uri);

  console.log('MongoDB connected:', mongoose.connection.host);
}

module.exports = connectDB;
