import mongoose from 'mongoose'

const logSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  entity: String,
  entityId: String,
  meta: Object
}, { timestamps: true })

export default mongoose.model('AuditLog', logSchema)