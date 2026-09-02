// routes/users.js
import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all users (for team member selection)
router.get('/', auth, async (req, res) => {
  try {
    // Exclude the current user and password field
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email role')
      .sort({ name: 1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email role');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;