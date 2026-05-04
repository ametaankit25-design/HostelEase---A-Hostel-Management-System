const Student = require('../models/Student.model');
const Room = require('../models/Room.model');

// POST /api/students — Add a new student
const addStudent = async (req, res) => {
  try {
    const { name, email, phone, course } = req.body;

    if (!name || !email || !phone || !course) {
      return res.status(400).json({ success: false, message: 'All fields (name, email, phone, course) are required.' });
    }

    const student = await Student.create({ name, email, phone, course });
    res.status(201).json({ success: true, message: 'Student added successfully.', data: student });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A student with this email already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/students — Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}).populate('roomId', 'roomNumber capacity');
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/students/:id — Update a student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating roomId directly through this route
    delete updates.roomId;

    const student = await Student.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.status(200).json({ success: true, message: 'Student updated successfully.', data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/students/:id — Delete a student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // If student is in a room, remove them from the room's occupants
    if (student.roomId) {
      await Room.findByIdAndUpdate(student.roomId, {
        $pull: { occupants: student._id },
      });
    }

    await Student.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Student deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addStudent, getAllStudents, updateStudent, deleteStudent };
