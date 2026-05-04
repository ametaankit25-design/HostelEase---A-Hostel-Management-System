import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Avatar, Chip, Button,
  MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, LinearProgress, Divider, Skeleton,
} from "@mui/material";
import {
  MeetingRoomOutlined,
  CheckCircleOutlined, ErrorOutlined, AddOutlined,
  CloseOutlined, PeopleAlt, PersonRemoveOutlined,
} from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ── Add Room Dialog ───────────────────────────────────────────
const AddRoomDialog = ({ open, onClose, onSave, saving }) => {
  const [form, setForm]     = useState({ roomNumber: "", capacity: "" });
  const [errors, setErrors] = useState({});

  const reset = () => { setForm({ roomNumber: "", capacity: "" }); setErrors({}); };

  const validate = () => {
    const e = {};
    if (!form.roomNumber.trim())      e.roomNumber = "Room number is required";
    if (!form.capacity)               e.capacity   = "Capacity is required";
    else if (Number(form.capacity) < 1) e.capacity = "Must be at least 1";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ roomNumber: form.roomNumber.trim(), capacity: Number(form.capacity) });
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box>
          <Typography fontWeight={700} fontSize={16}>Add New Room</Typography>
          <Typography variant="caption" color="text.secondary">Room will be immediately available for allotment</Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}><CloseOutlined fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
        <TextField
          label="Room Number"
          placeholder="e.g. 101, A-203"
          value={form.roomNumber}
          onChange={e => { setForm(p => ({ ...p, roomNumber: e.target.value })); setErrors(p => ({ ...p, roomNumber: "" })); }}
          error={!!errors.roomNumber}
          helperText={errors.roomNumber}
          size="small" fullWidth autoFocus
          InputProps={{ startAdornment: <MeetingRoomOutlined fontSize="small" sx={{ mr: 1, color: "text.disabled" }} /> }}
        />
        <TextField
          label="Capacity (beds)"
          placeholder="e.g. 2, 4"
          type="number"
          value={form.capacity}
          onChange={e => { setForm(p => ({ ...p, capacity: e.target.value })); setErrors(p => ({ ...p, capacity: "" })); }}
          error={!!errors.capacity}
          helperText={errors.capacity}
          size="small" fullWidth
          InputProps={{ startAdornment: <PeopleAlt fontSize="small" sx={{ mr: 1, color: "text.disabled" }} />, inputProps: { min: 1, max: 20 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" size="small"
          sx={{ borderRadius: 2, textTransform: "none", borderColor: "grey.300", color: "text.secondary" }}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" size="small" disabled={saving}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#1E3A8A", "&:hover": { bgcolor: "#1e40af" } }}>
          {saving ? "Adding…" : "Add Room"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Room Card ─────────────────────────────────────────────────
const RoomCard = ({ room, onRemove, removing }) => {
  const full = room.occupants.length >= room.capacity;
  const pct  = room.capacity > 0 ? Math.round((room.occupants.length / room.capacity) * 100) : 0;

  return (
    <Paper elevation={0}
      sx={{
        borderRadius: 3, border: "1px solid", borderColor: "grey.200",
        overflow: "hidden", minWidth: 240, flex: 1,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.07)" },
      }}
    >
      {/* Card Header */}
      <Box sx={{
        px: 2.5, py: 2,
        background: full
          ? "linear-gradient(135deg, #FFEBEE, #FFCDD2)"
          : "linear-gradient(135deg, #EEF2FF, #dbeafe)",
        display: "flex", alignItems: "center", gap: 1.5,
      }}>
        <Avatar sx={{ bgcolor: full ? "#C62828" : "#1E3A8A", width: 40, height: 40 }}>
          <MeetingRoomOutlined fontSize="small" />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={800} fontSize={15}>Room {room.roomNumber}</Typography>
          <Typography variant="caption" color="text.secondary">
            {room.occupants.length} / {room.capacity} occupied
          </Typography>
        </Box>
        <Chip
          label={full ? "Full" : "Available"}
          size="small"
          icon={full ? <ErrorOutlined sx={{ fontSize: "14px !important" }} /> : <CheckCircleOutlined sx={{ fontSize: "14px !important" }} />}
          sx={{ bgcolor: full ? "#C62828" : "#2E7D32", color: "#fff", fontWeight: 700, fontSize: 11 }}
        />
      </Box>

      {/* Occupancy bar */}
      <Box sx={{ px: 2.5, pt: 1.5, pb: 0.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">Fill level</Typography>
          <Typography variant="caption" fontWeight={700}>{pct}%</Typography>
        </Box>
        <LinearProgress
          variant="determinate" value={pct}
          sx={{
            height: 5, borderRadius: 99, backgroundColor: "grey.100",
            "& .MuiLinearProgress-bar": {
              backgroundColor: full ? "#C62828" : pct > 70 ? "#F57C00" : "#1E3A8A",
              borderRadius: 99,
            },
          }}
        />
      </Box>

      {/* Occupants list */}
      <Box sx={{ px: 2.5, py: 1.5 }}>
        {room.occupants.length === 0 ? (
          <Box sx={{ py: 2, textAlign: "center" }}>
            <PeopleAlt sx={{ fontSize: 28, color: "text.disabled", mb: 0.5 }} />
            <Typography variant="caption" color="text.disabled" display="block">No occupants yet</Typography>
          </Box>
        ) : (
          room.occupants.map((occ) => (
            <Box key={occ._id}
              sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                py: 1, borderBottom: "1px solid", borderColor: "grey.100",
                "&:last-child": { borderBottom: "none" },
                "&:hover": { backgroundColor: "grey.50" },
                borderRadius: 1, px: 0.5, mx: -0.5,
                transition: "background 0.1s",
              }}
            >
              <Avatar sx={{ width: 28, height: 28, bgcolor: "#E3F2FD", color: "#1565C0", fontSize: 12, fontWeight: 700 }}>
                {occ.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>{occ.name}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>{occ.email}</Typography>
              </Box>
              <Tooltip title="Remove from room">
                <IconButton size="small" onClick={() => onRemove(occ._id)}
                  sx={{ color: "text.disabled", "&:hover": { color: "#C62828", bgcolor: "#FFEBEE" } }}>
                  {removing === occ._id
                    ? <CircularProgress size={14} />
                    : <PersonRemoveOutlined fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
};

// ── Main ──────────────────────────────────────────────────────
const RoomAllot = () => {
  const [rooms,      setRooms]      = useState([]);
  const [students,   setStudents]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [selStudent, setSelStudent] = useState("");
  const [selRoom,    setSelRoom]    = useState("");
  const [removing,   setRemoving]   = useState(null);
  const [allotting,  setAllotting]  = useState(false);
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addingRoom,  setAddingRoom]  = useState(false);

  const flash = (msg, type = "success") => {
    if (type === "success") { setSuccess(msg); setTimeout(() => setSuccess(""), 3500); }
    else                   { setError(msg);   setTimeout(() => setError(""), 4000); }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, rRes] = await Promise.all([
        fetch(`${API}/api/students`, { credentials: "include" }),
        fetch(`${API}/api/rooms`,    { credentials: "include" }),
      ]);
      if (!sRes.ok || !rRes.ok) throw new Error("API error");
      const [sData, rData] = await Promise.all([sRes.json(), rRes.json()]);
      setStudents(sData.data || []);
      setRooms(rData.data || []);
    } catch {
      flash("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddRoom = async ({ roomNumber, capacity }) => {
    setAddingRoom(true);
    try {
      const res  = await fetch(`${API}/api/rooms`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomNumber, capacity }),
      });
      const data = await res.json();
      if (!res.ok) { flash(data.message || "Failed to add room", "error"); return; }
      setAddRoomOpen(false);
      flash(`Room ${roomNumber} added successfully!`);
      load();
    } catch {
      flash("Failed to add room", "error");
    } finally {
      setAddingRoom(false);
    }
  };

  const handleAllot = async () => {
    if (!selStudent || !selRoom) return;
    setAllotting(true);
    try {
      const res  = await fetch(`${API}/api/allot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selStudent, roomId: selRoom }),
      });
      const data = await res.json();
      if (!res.ok) { flash(data.message || "Allotment failed", "error"); return; }
      setSelStudent("");
      setSelRoom("");
      flash("Room assigned successfully!");
      load();
    } catch {
      flash("Allotment failed", "error");
    } finally {
      setAllotting(false);
    }
  };

  const handleRemove = async (studentId) => {
    setRemoving(studentId);
    try {
      const res = await fetch(`${API}/api/allot/${studentId}`, { method: "DELETE" });
      if (!res.ok) { flash("Failed to remove student from room", "error"); return; }
      flash("Student removed from room");
      load();
    } catch {
      flash("Remove failed", "error");
    } finally {
      setRemoving(null);
    }
  };

  // Students without a room (available to allot)
  const unallottedStudents = students.filter(s => !s.roomId);
  const availableRooms     = rooms.filter(r => r.occupants.length < r.capacity);
  const totalBeds          = rooms.reduce((s, r) => s + r.capacity, 0);
  const occupiedBeds       = rooms.reduce((s, r) => s + r.occupants.length, 0);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>

      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Rooms & Allotment</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage rooms and assign students to beds
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<AddOutlined />}
          onClick={() => setAddRoomOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#1E3A8A", "&:hover": { bgcolor: "#1e40af" } }}
        >
          Add Room
        </Button>
      </Box>

      {/* ── Alerts ── */}
      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* ── Quick Stats ── */}
      {!loading && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {[
            { label: "Total Rooms",      value: rooms.length,          color: "#1E3A8A", bg: "#EEF2FF" },
            { label: "Available Rooms",  value: availableRooms.length, color: "#2E7D32", bg: "#E8F5E9" },
            { label: "Beds Occupied",    value: `${occupiedBeds}/${totalBeds}`, color: "#E65100", bg: "#FFF3E0" },
            { label: "Awaiting Allotment", value: unallottedStudents.length, color: "#6A1B9A", bg: "#F3E5F5" },
          ].map(({ label, value, color }) => (
            <Paper key={label} elevation={0}
              sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "grey.100", flex: 1, minWidth: 140,
                    display: "flex", flexDirection: "column", gap: 0.25,
                    transition: "transform 0.2s", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 6px 20px rgba(0,0,0,0.07)" } }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color, mb: 0.5 }} />
              <Typography variant="h5" fontWeight={800} color={color}>{value}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
            </Paper>
          ))}
        </Box>
      )}

      {/* ── Allotment Form ── */}
      <Paper elevation={0}
        sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={0.5}>Assign Student to Room</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Only students without a room and rooms with available beds are shown
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start" }}>
          <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
            <InputLabel>Select Student</InputLabel>
            <Select value={selStudent} onChange={e => setSelStudent(e.target.value)} label="Select Student">
              {unallottedStudents.length === 0 ? (
                <MenuItem disabled value=""><em>All students have rooms</em></MenuItem>
              ) : (
                unallottedStudents.map(s => (
                  <MenuItem key={s._id} value={s._id}>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.email}</Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
            <InputLabel>Select Room</InputLabel>
            <Select value={selRoom} onChange={e => setSelRoom(e.target.value)} label="Select Room">
              {availableRooms.length === 0 ? (
                <MenuItem disabled value=""><em>No rooms available</em></MenuItem>
              ) : (
                availableRooms.map(r => (
                  <MenuItem key={r._id} value={r._id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>Room {r.roomNumber}</Typography>
                      <Chip label={`${r.capacity - r.occupants.length} free`} size="small"
                        sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: "#E8F5E9", color: "#2E7D32" }} />
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleAllot}
            disabled={!selStudent || !selRoom || allotting}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3, py: 1, bgcolor: "#2E7D32", "&:hover": { bgcolor: "#1B5E20" }, minWidth: 120 }}
          >
            {allotting ? "Assigning…" : "Assign Room"}
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ mb: 3 }}>
        <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}>
          All Rooms ({rooms.length})
        </Typography>
      </Divider>

      {/* ── Rooms Grid ── */}
      {loading ? (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {[0, 1, 2].map(i => (
            <Paper key={i} elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", overflow: "hidden", minWidth: 240, flex: 1 }}>
              <Box sx={{ px: 2.5, py: 2, bgcolor: "grey.50", display: "flex", gap: 1.5 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="50%" height={18} sx={{ mb: 0.5 }} />
                  <Skeleton width="40%" height={14} />
                </Box>
              </Box>
              <Box sx={{ p: 2.5 }}>
                <Skeleton width="100%" height={5} sx={{ mb: 2 }} />
                {[0, 1].map(j => (
                  <Box key={j} sx={{ display: "flex", gap: 1.5, mb: 1 }}>
                    <Skeleton variant="circular" width={28} height={28} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="60%" height={14} />
                      <Skeleton width="80%" height={12} sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>
      ) : rooms.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: "1px solid", borderColor: "grey.200", textAlign: "center" }}>
          <MeetingRoomOutlined sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary" gutterBottom>No rooms added yet</Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>
            Add your first room using the button above to get started.
          </Typography>
          <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setAddRoomOpen(true)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#1E3A8A", "&:hover": { bgcolor: "#1e40af" } }}>
            Add First Room
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
          {rooms.map(r => (
            <RoomCard key={r._id} room={r} onRemove={handleRemove} removing={removing} />
          ))}
        </Box>
      )}

      {/* ── Add Room Dialog ── */}
      <AddRoomDialog
        open={addRoomOpen}
        onClose={() => setAddRoomOpen(false)}
        onSave={handleAddRoom}
        saving={addingRoom}
      />
    </Box>
  );
};

export default RoomAllot;