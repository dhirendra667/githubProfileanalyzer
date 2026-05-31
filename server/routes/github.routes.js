import { Router } from 'express';
import {
  analyzeProfile,
  getAllProfiles,
  getSingleProfile,
  deleteProfile,
  compareProfiles,
  getStats,
} from '../controllers/github.controller.js';

const router = Router();

// Analyze a GitHub profile and store in DB
router.post('/analyze/:username', analyzeProfile);

// Get all stored profiles (with pagination)
router.get('/profiles', getAllProfiles);

// Compare stored profiles
router.get('/compare', compareProfiles);

// Aggregate stats
router.get('/stats', getStats);

// Get a single profile by username
router.get('/profiles/:username', getSingleProfile);

// Delete a profile
router.delete('/profiles/:username', deleteProfile);

export default router;
