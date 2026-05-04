const Student = require('../models/Student.model');
const Room = require('../models/Room.model');
const sendEmail = require('../utils/sendEmail');

// POST /api/allot — Allot a room to a student
const allotRoom = async (req, res) => {
  try {
    const { studentId, roomId } = req.body;

    if (!studentId || !roomId) {
      return res.status(400).json({ success: false, message: 'Both studentId and roomId are required.' });
    }

    // 1. Check student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // 2. Check if student already has a room
    if (student.roomId) {
      return res.status(400).json({
        success: false,
        message: `Student is already allotted to a room. Remove the current allotment first.`,
      });
    }

    // 3. Check room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    // 4. Check room capacity
    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is full. Capacity: ${room.capacity}, Occupied: ${room.occupants.length}.`,
      });
    }

    // 5. Perform allotment — update both Student and Room atomically
    student.roomId = room._id;
    await student.save();

    room.occupants.push(student._id);
    await room.save();

    res.status(200).json({
      success: true,
      message: `Student "${student.name}" successfully allotted to Room ${room.roomNumber}.`,
      data: {
        student: { _id: student._id, name: student.name, email: student.email },
        room: { _id: room._id, roomNumber: room.roomNumber, capacity: room.capacity, occupiedBeds: room.occupants.length },
      },
    });

    // Send async email notification
    if (student.email) {
      sendEmail({
        to: student.email,
        subject: `Room Allotment Confirmation - HostelEase`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1E3A8A;">Room Allotment Confirmed</h2>
            <p>Dear <strong>${student.name}</strong>,</p>
            <p>You have been successfully allotted to <strong>Room ${room.roomNumber}</strong> in the hostel.</p>
            <p>Please log in to your Student Dashboard to view your room details and roommates.</p>
            <br/>
            <p>Best regards,<br/><strong>HostelEase Warden</strong></p>
          </div>
        `,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/allot/:studentId — Remove a student's room allotment
const removeAllotment = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    if (!student.roomId) {
      return res.status(400).json({ success: false, message: 'This student is not currently allotted to any room.' });
    }

    const room = await Room.findById(student.roomId);

    // Remove student from room's occupants
    if (room) {
      room.occupants = room.occupants.filter(
        (occupantId) => occupantId.toString() !== student._id.toString()
      );
      await room.save();
    }

    // Clear student's roomId
    student.roomId = null;
    await student.save();

    res.status(200).json({
      success: true,
      message: `Allotment removed. Student "${student.name}" has been unassigned from the room.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { allotRoom, removeAllotment };
