const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "SUSPENDED"], default: "ACTIVE" },
    adminLevel: { type: String, enum: ["SUPER_ADMIN", "ADMIN", "MODERATOR"], required: true },
    permissions: [{ type: String }],
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  { timestamps: true }
);

// Indexes
adminSchema.index({ email: 1, username: 1 }, { unique: true });

// Password Management
adminSchema.methods.setPassword = async function (password) {
  this.password = await bcrypt.hash(password, 12);
};

adminSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Static Method to Create Default Admin
adminSchema.statics.createDefaultAdmin = async function () {
  const defaultEmail = "admin@gmail.com";
  const defaultPassword = "admin123";

  if (await this.findOne({ email: defaultEmail })) return;

  const admin = new this({
    email: defaultEmail,
    username: "superadmin",
    adminLevel: "SUPER_ADMIN",
    status: "ACTIVE",
    permissions: ["ALL"],
  });

  await admin.setPassword(defaultPassword);
  await admin.save();
  console.log("Default Admin Created");
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
