const express = require('express');
const router = express.Router();
const { allotRoom, removeAllotment } = require('../controllers/allotment.controller');

router.post('/', allotRoom);
router.delete('/:studentId', removeAllotment);

module.exports = router;
