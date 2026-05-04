const express = require('express');
const router = express.Router();
const {
  createReport,
  getReportsByStudent,
  getAllReports,
  updateReportStatus
} = require('../controllers/report.controller');

router.post('/', createReport);
router.get('/', getAllReports);
router.get('/student/:studentId', getReportsByStudent);
router.put('/:id', updateReportStatus);

module.exports = router;
