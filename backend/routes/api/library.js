const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const lib = require('../../controllers/library');

// Terms
router.get('/terms', protect, lib.listTerms);
router.post('/terms', protect, authorize('teacher', 'admin'), lib.createTerm);
router.patch('/terms/:id', protect, authorize('teacher', 'admin'), lib.updateTerm);
router.delete('/terms/:id', protect, authorize('teacher', 'admin'), lib.removeTerm);

// Cases
router.get('/cases', protect, lib.listCases);
router.get('/cases/:id', protect, lib.getCase);
router.post('/cases', protect, authorize('teacher', 'admin'), lib.createCase);
router.patch('/cases/:id', protect, authorize('teacher', 'admin'), lib.updateCase);
router.delete('/cases/:id', protect, authorize('teacher', 'admin'), lib.removeCase);

module.exports = router;

