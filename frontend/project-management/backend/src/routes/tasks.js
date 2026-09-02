// routes/tasks.js - FIXED VERSION
import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all tasks for a user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user.id },
        { createdBy: req.user.id }
      ]
    })
    .populate('project', 'name status')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ dueDate: 1, priority: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks for a specific project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, priority: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    // Verify project exists and user has access
    const project = await Project.findOne({
      _id: req.body.project,
      $or: [
        { createdBy: req.user.id },
        { teamMembers: req.user.id }
      ]
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const task = new Task({
      ...req.body,
      createdBy: req.user.id
    });
    
    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'name');
    
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update task - KEEP ONLY THIS ONE (REMOVE THE DUPLICATE BELOW)
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('🔄 Updating task:', req.params.id);
    console.log('Update data:', req.body);

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('assignedTo', 'name email')
    .populate('project', 'name')
    .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ 
        success: false,
        error: 'Task not found or you do not have permission to update it' 
      });
    }

    console.log('✅ Task updated successfully:', task._id);
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('❌ Error updating task:', error);
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// DELETE THIS DUPLICATE PUT ROUTE - IT'S CAUSING THE ISSUE
// router.put('/:id', auth, async (req, res) => {
//   try {
//     const task = await Task.findOneAndUpdate(
//       { _id: req.params.id, createdBy: req.user.id },
//       req.body,
//       { new: true, runValidators: true }
//     )
//     .populate('assignedTo', 'name email')
//     .populate('project', 'name');
    
//     if (!task) {
//       return res.status(404).json({ error: 'Task not found' });
//     }
//     console.log('task updated successfully')
//     res.json(task);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;