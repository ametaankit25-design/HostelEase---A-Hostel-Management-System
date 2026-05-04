import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Avatar, Chip, IconButton,
  TextField, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Tooltip, InputAdornment,
  Collapse,
} from "@mui/material";
import {
  AddOutlined, DeleteOutlined, EditOutlined,
  SearchOutlined, PersonOutlined, EmailOutlined,
  PhoneOutlined, SchoolOutlined, CloseOutlined, WarningAmberOutlined,
} from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL;

const EMPTY_FORM = { name: "", email: "", phone: "", course: "" };

// ── Add/Edit Dialog ──────────────────────────────────────────
const StudentDialog = ({ open, onClose, onSave, initial, loading, apiError, onClearError }) => {
  const [form,   setForm]   = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const t = setTimeout(() => {
      setForm(initial || EMPTY_FORM);
      setErrors({});
    }, 0);
    return () => clearTimeout(t);
  }, [initial, open]);

  const change = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setErrors(p => ({ ...p, [f]: "" }));
    if (onClearError) onClearError(); // clear server error when user starts typing
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name   = "Required";
    if (!form.email.trim())  e.email  = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim())  e.phone  = "Required";
    else if (!/^\d{10}$/.test(form.phone)) e.phone = "10 digits required";
    if (!form.course.trim()) e.course = "Required";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  const isEdit = !!initial?._id;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box>
          <Typography fontWeight={700}>{isEdit ? "Edit Student" : "Add Student"}</Typography>
          <Typography variant="caption" color="text.secondary">
            {isEdit ? "Update the student's details below" : "Fill in the details to register a new student"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseOutlined fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
        {/* Server-side error shown INSIDE the dialog */}
        <Collapse in={!!apiError}>
          <Alert
            severity="error"
            icon={<WarningAmberOutlined fontSize="small" />}
            onClose={onClearError}
            sx={{ borderRadius: 2, fontSize: 13, alignItems: "flex-start" }}
          >
            {apiError}
          </Alert>
        </Collapse>

        {[
          { field: "name",   label: "Full Name",    icon: <PersonOutlined fontSize="small" /> },
          { field: "email",  label: "Email",        icon: <EmailOutlined  fontSize="small" /> },
          { field: "phone",  label: "Phone Number", icon: <PhoneOutlined  fontSize="small" /> },
          { field: "course", label: "Course",       icon: <SchoolOutlined fontSize="small" /> },
        ].map(({ field, label, icon }) => (
          <TextField key={field} label={label} value={form[field]}
            onChange={change(field)} error={!!errors[field]}
            helperText={errors[field]} size="small" fullWidth
            slotProps={{ input: { startAdornment: <InputAdornment position="start">{icon}</InputAdornment> } }}
          />
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small"
          sx={{ borderRadius: 2, textTransform: "none", borderColor: "grey.300", color: "text.secondary" }}>
          Cancel
        </Button>
        <Button onClick={submit} variant="contained" size="small" disabled={loading}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#1565C0", "&:hover": { bgcolor: "#0D47A1" } }}>
          {loading ? "Saving…" : isEdit ? "Update" : "Add Student"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Delete Confirm Dialog ────────────────────────────────────
const DeleteDialog = ({ open, onClose, onConfirm, name, loading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
    PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle><Typography fontWeight={700}>Delete Student</Typography></DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary">
        Are you sure you want to delete <strong>{name}</strong>? This cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button onClick={onClose} variant="outlined" size="small"
        sx={{ borderRadius: 2, textTransform: "none", borderColor: "grey.300", color: "text.secondary" }}>
        Cancel
      </Button>
      <Button onClick={onConfirm} variant="contained" size="small" disabled={loading}
        sx={{ borderRadius: 2, textTransform: "none", bgcolor: "#C62828", "&:hover": { bgcolor: "#B71C1C" } }}>
        {loading ? "Deleting…" : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

// ── Main ─────────────────────────────────────────────────────
const Students = () => {
  const [students,  setStudents]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [search,    setSearch]    = useState("");
  const [addOpen,   setAddOpen]   = useState(false);
  const [editData,  setEditData]  = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Dialog-level API errors (shown inside the dialog, not on the page)
  const [dialogError, setDialogError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/students`, { credentials: "include" });
      const data = await res.json();
      setStudents(data.data || []);
    } catch {
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); };

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/api/students`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        // Show error inside dialog, not behind it
        setDialogError(data.message || "Failed to add student.");
        return;
      }
      setDialogError("");
      setAddOpen(false);
      flash("Student added successfully.");
      load();
    } catch { setDialogError("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/api/students/${editData._id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setDialogError(data.message || "Failed to update student.");
        return;
      }
      setDialogError("");
      setEditData(null);
      flash("Student updated.");
      load();
    } catch { setDialogError("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/api/students/${deleteTarget._id}`, {
        method: "DELETE", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setDeleteTarget(null);
      flash("Student deleted.");
      load();
    } catch { setError("Failed to delete student."); }
    finally { setSaving(false); }
  };

  const filtered = students.filter(s => {
    const searchLower = search.toLowerCase();
    const nameMatch = s.name?.toLowerCase().includes(searchLower) || s.username?.toLowerCase().includes(searchLower) || false;
    const emailMatch = s.email?.toLowerCase().includes(searchLower) || false;
    const courseMatch = s.course?.toLowerCase().includes(searchLower) || false;
    return nameMatch || emailMatch || courseMatch;
  });

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>

      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Students</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {students.length} registered student{students.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setAddOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#1565C0", "&:hover": { bgcolor: "#0D47A1" } }}>
          Add Student
        </Button>
      </Box>

      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      {/* ── Search ── */}
      <TextField
        placeholder="Search by name, email or course…"
        value={search} onChange={e => setSearch(e.target.value)}
        size="small" fullWidth
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" sx={{ color: "text.disabled" }} /></InputAdornment>,
          },
        }}
      />

      {/* ── Table ── */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography color="text.secondary">
              {search ? "No students match your search." : "No students yet. Add one!"}
            </Typography>
          </Box>
        ) : (
          filtered.map((s, idx) => (
            <Box key={s._id}
              sx={{
                display: "flex", alignItems: "center", gap: 2, px: 3, py: 1.75,
                borderBottom: "1px solid", borderColor: "grey.100",
                "&:last-child": { borderBottom: "none" },
                "&:hover": { backgroundColor: "grey.50" },
                transition: "background 0.15s",
                animation: "fadeIn 0.3s ease both",
                animationDelay: `${idx * 30}ms`,
                "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
              }}
            >
              <Avatar sx={{ bgcolor: "#E3F2FD", color: "#1565C0", width: 38, height: 38, fontWeight: 700, fontSize: 15 }}>
                {s.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap>{s.name}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>{s.email} · {s.phone}</Typography>
              </Box>
              <Chip label={s.course} size="small"
                sx={{ fontSize: 11, fontWeight: 600, bgcolor: "#F3E5F5", color: "#6A1B9A", display: { xs: "none", sm: "flex" } }} />
              <Chip
                label={s.roomId ? `Room ${s.roomId.roomNumber}` : "No Room"}
                size="small"
                sx={{
                  fontSize: 11, fontWeight: 700,
                  bgcolor: s.roomId ? "#E8F5E9" : "#F5F5F5",
                  color: s.roomId ? "#2E7D32" : "text.secondary",
                }}
              />
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => setEditData(s)}
                    sx={{ color: "text.secondary", "&:hover": { color: "#1565C0", bgcolor: "#E3F2FD" } }}>
                    <EditOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => setDeleteTarget(s)}
                    sx={{ color: "text.secondary", "&:hover": { color: "#C62828", bgcolor: "#FFEBEE" } }}>
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))
        )}
      </Paper>

      {/* ── Dialogs ── */}
      <StudentDialog
        open={addOpen}
        onClose={() => { setAddOpen(false); setDialogError(""); }}
        onSave={handleAdd}
        loading={saving}
        apiError={dialogError}
        onClearError={() => setDialogError("")}
      />
      <StudentDialog
        open={!!editData}
        onClose={() => { setEditData(null); setDialogError(""); }}
        onSave={handleEdit}
        loading={saving}
        initial={editData}
        apiError={dialogError}
        onClearError={() => setDialogError("")}
      />
      <DeleteDialog  open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} name={deleteTarget?.name} loading={saving} />
    </Box>
  );
};

export default Students;