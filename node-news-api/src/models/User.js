import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { Roles } from '../utils/permissions.js'

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, index: true, required: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, required: true },
  role: { type: String, enum: Object.values(Roles), default: Roles.USER }
}, { timestamps: true })

userSchema.methods.setPassword = async function (pwd) {
  this.passwordHash = await bcrypt.hash(pwd, 10)
}

userSchema.methods.verifyPassword = function (pwd) {
  return bcrypt.compare(pwd, this.passwordHash)
}

export default mongoose.model('User', userSchema)