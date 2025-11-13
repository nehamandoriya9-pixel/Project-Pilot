import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'viewer'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [teamMemberSchema],
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: false
    },
    defaultRole: {
      type: String,
      enum: ['member', 'viewer'],
      default: 'member'
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private'
    }
  },
  joinCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate unique join code before saving
teamSchema.pre('save', function(next) {
  if (!this.joinCode) {
    this.joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Indexes for better performance
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ createdBy: 1 });
teamSchema.index({ joinCode: 1 });

export default mongoose.model('Team', teamSchema);