const express = require('express');
const router = express.Router();
const { addRoom, getAllRooms } = require('../controllers/room.controller');

router.post('/', addRoom);
router.get('/', getAllRooms);

module.exports = router;
