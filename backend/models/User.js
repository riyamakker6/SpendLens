// backend/models/User.js
// -------------------------------------------------------
// Mongoose User model for SpendLens.
//
// A "model" is a class that maps to a MongoDB collection.
// When we call mongoose.model('User', userSchema), Mongoose
// automatically uses the collection called "users" in Atlas.
//
// Why bcryptjs is imported here:
//   We import it now so Phase 3B (authentication) only needs
//   to add logic, not change imports.  Hashing is NOT done
//   yet — we leave a clear TODO comment where it belongs.
// -------------------------------------------------------

const mongoose  = require('mongoose');
const bcryptjs  = require('bcryptjs');  // will be used in Phase 3B

// ── 1. Define the shape of a user document ─────────────
const userSchema = new mongoose.Schema(
  {
    // Full name — required, plain text, trimmed of whitespace
    name: {
      type    : String,
      required: [true, 'Name is required'],
      trim    : true,
    },

    // Email — must be unique across all users
    // lowercase: true  → "User@Gmail.com" is saved as "user@gmail.com"
    // trim: true       → removes accidental spaces
    email: {
      type     : String,
      required : [true, 'Email is required'],
      unique   : true,        // Mongoose creates a unique index in Atlas
      lowercase: true,
      trim     : true,
    },

    // Password — we store ONLY the bcrypt hash, never plaintext.
    // The actual hashing will happen in Phase 3B inside the
    // auth controller, before calling user.save().
    password: {
      type    : String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },

    // Optional profile picture URL (filled in by Multer in a later phase)
    avatarUrl: {
      type   : String,
      default: '',
    },
  },
  {
    // ── 2. Timestamps ──────────────────────────────────
    // Mongoose automatically adds:
    //   createdAt  – when the document was first saved
    //   updatedAt  – whenever the document is changed
    timestamps: true,
  }
);

// ── 3. Instance method: compare a candidate password ───
// Called during login (in routes/auth.js).
// It uses bcryptjs to safely compare the plain-text input
// against the stored hash — never comparing passwords directly.
userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcryptjs.compare(candidatePassword, this.password);
};

// ── 4. Export the model ─────────────────────────────────
// 'User' → Mongoose looks for (or creates) a "users" collection in Atlas.
const User = mongoose.model('User', userSchema);

module.exports = User;
