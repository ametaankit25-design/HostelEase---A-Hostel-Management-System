const Room = require('../models/Room.model');

// POST /api/rooms — Add a new room
const addRoom = async (req, res) => {
  try {
    const { roomNumber, capacity } = req.body;

    if (!roomNumber || !capacity) {
      return res.status(400).json({ success: false, message: 'Both roomNumber and capacity are required.' });
    }

    const room = await Room.create({ roomNumber, capacity });
    res.status(201).json({ success: true, message: 'Room added successfully.', data: room });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A room with this room number already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/rooms — Get all rooms with occupant details
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('occupants', 'name email course');
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addRoom, getAllRooms };
