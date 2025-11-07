// src/models/Article.js
import mongoose from 'mongoose'

const ArticleSchema = new mongoose.Schema({
  // Core content
  title:           { type: String, required: true },
  summary:         { type: String, default: '' },
  rawContent:      { type: String, default: '' },
  cleanedContent:  { type: String, default: '' },
  aiSummary:       { type: String, default: '' },
  tags:            { type: [String], default: [] },
  imageUrl:        { type: String, default: '' },

  // SEO
  metaTitle:       { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  slug:            { type: String, default: '', index: true },
  canonicalUrl:    { type: String, default: '' },

  // Source / attribution
  source:            { type: String, default: 'twitter' }, // e.g. 'twitter','rapidapi','manual'
  sourceId:          { type: String, index: true },        // tweet id, url hash, etc.
  sourceUrl:         { type: String, default: '' },
  sourceAuthor:      { type: String, default: '' },
  sourceHandle:      { type: String, default: '' },
  sourcePublishedAt: { type: Date },

  // Workflow
  status: {
    type: String,
    enum: ['draft','pending_review','approved','published','discarded'],
    default: 'draft' // manual creation starts as draft; ingest will set pending_review explicitly
  },
  ingestion:   { type: String, default: 'manual' }, // 'twitter','rapidapi','manual',...
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: { type: Date },

  // Monetization
  isSponsored:      { type: Boolean, default: false },
  sponsorName:      { type: String, default: '' },
  sponsorUrl:       { type: String, default: '' },
  sponsorLogoUrl:   { type: String, default: '' },
  disclosureText:   { type: String, default: '' },
  sponsoredAmount:  { type: Number, default: 0 },
  affiliateLinks:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'AffiliateLink' }],

  // Analytics
  views:       { type: Number, default: 0 },
  shares:      { type: Number, default: 0 },
  adRevenue:   { type: Number, default: 0 },
}, { timestamps: true, strict: true })

// De-dupe safety: only one record per (source, sourceId)
ArticleSchema.index({ source: 1, sourceId: 1 }, { unique: true, sparse: true })

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema)
