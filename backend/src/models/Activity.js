import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'team_created',
      'member_joined',
      'member_left',
      'role_changed',
      'project_created',
      'project_updated',
      'task_created',
      'task_completed',
      'message_sent',
      'file_uploaded'
    ]
  },
  description: {
    type: String,
    required: true
  },
  targetEntity: {
    type: String,
    enum: ['team', 'project', 'task', 'message', 'file']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
activitySchema.index({ team: 1, createdAt: -1 });
activitySchema.index({ user: 1 });

export default mongoose.model('Activity', activitySchema);