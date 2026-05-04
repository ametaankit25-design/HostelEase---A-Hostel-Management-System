const express = require('express');
const router = express.Router();
const {
  addStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
} = require('../controllers/student.controller');

router.post('/', addStudent);
router.get('/', getAllStudents);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
