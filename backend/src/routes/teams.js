import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Activity from '../models/Activity.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// 🎯 HELPER FUNCTIONS

// Check if user is team member
const isTeamMember = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  return team.members.some(member => member.user.toString() === userId);
};

// Check if user is team admin
const isTeamAdmin = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  return team.members.some(member => 
    member.user.toString() === userId && member.role === 'admin'
  );
};

// Create activity log
const logActivity = async (teamId, userId, action, description, metadata = {}) => {
  await Activity.create({
    team: teamId,
    user: userId,
    action,
    description,
    metadata
  });
};

// 🎯 TEAM MANAGEMENT

// Get all teams (directory)
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's teams
router.get('/my-teams', auth, async (req, res) => {
  try {
    const teams = await Team.find({
      'members.user': req.user.id
    })
    .populate('createdBy', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific team
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    // Check if user is member
    const userIsMember = await isTeamMember(team._id, req.user.id);
    if (!userIsMember) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You are not a member of this team.'
      });
    }

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create team
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      createdBy: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    await team.populate('createdBy', 'name email avatar');
    await team.populate('members.user', 'name email avatar');

    // Log activity
    await logActivity(
      team._id,
      req.user.id,
      'team_created',
      `${req.user.name} created team "${name}"`
    );

    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 🎯 MEMBER MANAGEMENT

// Invite member
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { email, role } = req.body;
    const teamId = req.params.id;

    // Check if user is admin
    const userIsAdmin = await isTeamAdmin(teamId, req.user.id);
    if (!userIsAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only team admins can invite members'
      });
    }

    const team = await Team.findById(teamId);
    const userToInvite = await User.findOne({ email });

    if (!userToInvite) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if already member
    const alreadyMember = team.members.some(member => 
      member.user.toString() === userToInvite._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        error: 'User is already a team member'
      });
    }

    // Add member
    team.members.push({
      user: userToInvite._id,
      role: role || 'member'
    });

    await team.save();
    await team.populate('members.user', 'name email avatar');

    // Log activity
    await logActivity(
      teamId,
      req.user.id,
      'member_joined',
      `${req.user.name} invited ${userToInvite.name} to the team`,
      { invitedUser: userToInvite._id, role }
    );

    res.json({
      success: true,
      data: team,
      message: 'Member invited successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Join team with code
router.post('/:id/join', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    // Check if already member
    const alreadyMember = team.members.some(member => 
      member.user.toString() === req.user.id
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this team'
      });
    }

    // Add member
    team.members.push({
      user: req.user.id,
      role: team.settings.defaultRole
    });

    await team.save();
    await team.populate('members.user', 'name email avatar');

    // Log activity
    await logActivity(
      team._id,
      req.user.id,
      'member_joined',
      `${req.user.name} joined the team`
    );

    res.json({
      success: true,
      data: team,
      message: 'Successfully joined the team'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update member role
router.put('/:teamId/members/:memberId/role', auth, async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { role } = req.body;

    // Check if user is admin
    const userIsAdmin = await isTeamAdmin(teamId, req.user.id);
    if (!userIsAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only team admins can change roles'
      });
    }

    const team = await Team.findById(teamId);
    const member = team.members.find(member => 
      member.user.toString() === memberId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found in team'
      });
    }

    const oldRole = member.role;
    member.role = role;
    await team.save();

    // Log activity
    await logActivity(
      teamId,
      req.user.id,
      'role_changed',
      `${req.user.name} changed role from ${oldRole} to ${role} for member`,
      { memberId, oldRole, newRole: role }
    );

    res.json({
      success: true,
      message: 'Role updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Remove member
router.delete('/:teamId/members/:memberId', auth, async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    const team = await Team.findById(teamId);
    const member = team.members.find(member => 
      member.user.toString() === memberId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found in team'
      });
    }

    // Check permissions
    const userIsAdmin = await isTeamAdmin(teamId, req.user.id);
    const isSelf = memberId === req.user.id;

    if (!userIsAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can remove other members'
      });
    }

    // Prevent admin from removing themselves if they're the only admin
    if (isSelf && member.role === 'admin') {
      const adminCount = team.members.filter(m => m.role === 'admin').length;
      if (adminCount === 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot leave team as the only admin. Assign another admin first.'
        });
      }
    }

    // Remove member
    team.members = team.members.filter(m => 
      m.user.toString() !== memberId
    );

    await team.save();

    // Log activity
    const action = isSelf ? 'member_left' : 'member_removed';
    const description = isSelf 
      ? `${member.user.name} left the team`
      : `${req.user.name} removed ${member.user.name} from the team`;

    await logActivity(teamId, req.user.id, action, description, { memberId });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 🎯 DISCUSSION/MESSAGES

// Get team messages
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is member
    const userIsMember = await isTeamMember(id, req.user.id);
    if (!userIsMember) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const messages = await Message.find({ team: id })
      .populate('user', 'name email avatar')
      .populate('mentions', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ team: id });

    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send message
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, mentions = [] } = req.body;

    // Check if user is member
    const userIsMember = await isTeamMember(id, req.user.id);
    if (!userIsMember) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const message = await Message.create({
      team: id,
      user: req.user.id,
      content,
      mentions
    });

    await message.populate('user', 'name email avatar');
    await message.populate('mentions', 'name email');

    // Log activity
    await logActivity(
      id,
      req.user.id,
      'message_sent',
      `${req.user.name} sent a message in team chat`,
      { messageId: message._id }
    );

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 🎯 ACTIVITIES

// Get team activities
router.get('/:id/activities', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if user is member
    const userIsMember = await isTeamMember(id, req.user.id);
    if (!userIsMember) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const activities = await Activity.find({ team: id })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments({ team: id });

    res.json({
      success: true,
      data: activities,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🎯 ANALYTICS

// Get team analytics
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is member
    const userIsMember = await isTeamMember(id, req.user.id);
    if (!userIsMember) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const team = await Team.findById(id);
    
    // Basic counts
    const totalMembers = team.members.length;
    const adminCount = team.members.filter(m => m.role === 'admin').length;
    
    // Recent activity count (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentActivities = await Activity.countDocuments({
      team: id,
      createdAt: { $gte: oneWeekAgo }
    });

    // Message count
    const totalMessages = await Message.countDocuments({ team: id });

    // Project and task counts
    const totalProjects = await Project.countDocuments({ team: id });
    const totalTasks = await Task.countDocuments({ 
      project: { $in: await Project.find({ team: id }).distinct('_id') }
    });
    const completedTasks = await Task.countDocuments({ 
      project: { $in: await Project.find({ team: id }).distinct('_id') },
      status: 'completed'
    });

    // Member activity breakdown
    const memberActivity = await Activity.aggregate([
      { $match: { team: team._id } },
      {
        $group: {
          _id: '$user',
          activityCount: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          'user.name': 1,
          'user.email': 1,
          'user.avatar': 1,
          activityCount: 1,
          lastActivity: 1
        }
      },
      { $sort: { activityCount: -1 } }
    ]);

    // Activity trend (last 7 days)
    const activityTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await Activity.countDocuments({
        team: id,
        createdAt: {
          $gte: date,
          $lt: nextDate
        }
      });
      
      activityTrend.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalMembers,
          adminCount,
          recentActivities,
          totalMessages,
          totalProjects,
          totalTasks,
          completedTasks,
          completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0
        },
        memberActivity,
        charts: {
          activityTrend,
          taskStatus: {
            completed: completedTasks,
            pending: totalTasks - completedTasks
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🎯 TEAM PROJECTS

// Get team projects
router.get('/:id/projects', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is member
    const userIsMember = await isTeamMember(id, req.user.id);
    if (!userIsMember) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const projects = await Project.find({ team: id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🎯 SETTINGS

// Update team settings
router.put('/:id/settings', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const settings = req.body;

    // Check if user is admin
    const userIsAdmin = await isTeamAdmin(id, req.user.id);
    if (!userIsAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only team admins can update settings'
      });
    }

    const team = await Team.findByIdAndUpdate(
      id,
      { settings },
      { new: true }
    ).populate('createdBy', 'name email avatar')
     .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      data: team,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;