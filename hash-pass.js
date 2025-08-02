

// hash-password.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt');
const saltRounds = 10;
const plainPassword = 'Test@123'; // <-- Change this to the desired new password
// output --> $2b$10$TWc79.8tZ.TBAfDsGQGE0ucNQdL2QvE6Jau4Y9Xz1WhlnJZtqxGBW

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
  if (err) {
    console.error("Error hashing password:", err);
    return;
  }
  console.log("Hashed Password:", hash);
});

