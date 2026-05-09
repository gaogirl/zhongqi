const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const multer = require('multer');
const questionsController = require('../../controllers/questions');

const upload = multer({ storage: multer.memoryStorage() });

// Student routes
router.get('/practice', protect, questionsController.getRandom);
router.post('/check', protect, questionsController.checkAnswers);
router.get('/', protect, questionsController.list);

// Teacher routes
router.post('/', protect, authorize('teacher', 'admin'), questionsController.create);
router.patch('/:id', protect, authorize('teacher', 'admin'), questionsController.update);
router.delete('/:id', protect, authorize('teacher', 'admin'), questionsController.remove);
router.post('/import', protect, authorize('teacher', 'admin'), upload.single('file'), questionsController.importExcel);
router.get('/template', protect, authorize('teacher', 'admin'), questionsController.downloadTemplate);

module.exports = router;
