// routes/projects.js
import express from 'express';
import Project from '../models/Project.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all projects for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user.id },
        { teamMembers: req.user.id }
      ]
    }).populate('createdBy', 'name email')
      .populate('teamMembers', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email')
      .populate('tasks.assignedTo', 'name email');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access to this project
    if (!project.createdBy.equals(req.user.id) && 
        !project.teamMembers.some(member => member._id.equals(req.user.id))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new project
router.post('/', auth, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      createdBy: req.user.id
    });
    
    await project.save();
    await project.populate('createdBy', 'name email');
    
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('teamMembers', 'name email');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;