const bcrypt = require("bcrypt");

const enteredPassword = "Sam11111";
const storedHash = "$2a$10$MYmFFq02dBVAgViQECG5kedZ2AJfWlaBtm1GXy0PHmc7jyd8As0CK"; // From DB

(async () => {
  console.log("Entered Password:", enteredPassword);
  console.log("Stored Hash:", storedHash);

  // Correct: Await the hash function
  const newHash = await bcrypt.hash("Sam11111", 10);
  console.log("Newly Hashed Password:", newHash);

  // Compare entered password with stored hash
  const isMatch = await bcrypt.compare(enteredPassword, storedHash);
  console.log("Password Match:", isMatch ? "✅ YES" : "❌ NO");
})();
