import mongoose from 'mongoose'

const affiliateLinkSchema = new mongoose.Schema({
  // Link information
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  affiliateUrl: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    unique: true,
    required: true,
    index: true
  },

  // Affiliate program
  program: {
    type: String,
    required: true,
    enum: ['amazon', 'shareAsale', 'clickbank', 'cj', 'custom'],
    default: 'custom'
  },

  // Categorization
  category: {
    type: String,
    trim: true
  },
  tags: [String],

  // Display
  displayText: String,
  description: String,
  imageUrl: String,

  // Tracking
  clicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true
})

// Generate short code if not provided
affiliateLinkSchema.pre('save', function(next) {
  if (!this.shortCode) {
    this.shortCode = generateShortCode()
  }
  next()
})

function generateShortCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const AffiliateLink = mongoose.model('AffiliateLink', affiliateLinkSchema)
export default AffiliateLink
