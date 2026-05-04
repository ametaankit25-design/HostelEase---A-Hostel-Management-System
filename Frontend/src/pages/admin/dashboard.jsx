import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Avatar, Chip,
  Alert, LinearProgress, Skeleton,
  Button, Divider,
} from "@mui/material";
import {
  PeopleAltOutlined, MeetingRoomOutlined,
  DoorFrontOutlined, TrendingUpOutlined,
  SentimentSatisfiedAlt, ArrowForward, MeetingRoom,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

// ── Animated Stat Card ─────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, bg, delay = 0 }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "grey.100",
      flex: 1,
      minWidth: 180,
      position: "relative",
      overflow: "hidden",
      cursor: "default",
      animation: `fadeSlideUp 0.4s ease both`,
      animationDelay: `${delay}ms`,
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        borderColor: `${color}40`,
      },
      "@keyframes fadeSlideUp": {
        from: { opacity: 0, transform: "translateY(16px)" },
        to:   { opacity: 1, transform: "translateY(0)" },
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0, right: 0,
        width: 80, height: 80,
        borderRadius: "0 0 0 80px",
        backgroundColor: bg,
        opacity: 0.7,
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
      <Avatar sx={{ bgcolor: bg, color, width: 44, height: 44 }}>{icon}</Avatar>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}
          sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.1, mt: 0.3 }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
            {sub}
          </Typography>
        )}
      </Box>
    </Box>
  </Paper>
);

// ── Skeleton Stat Card ─────────────────────────────────────────
const StatCardSkeleton = () => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.100", flex: 1, minWidth: 180 }}>
    <Box sx={{ display: "flex", gap: 2 }}>
      <Skeleton variant="circular" width={44} height={44} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="60%" height={14} sx={{ mb: 1 }} />
        <Skeleton width="40%" height={36} />
        <Skeleton width="50%" height={12} sx={{ mt: 0.5 }} />
      </Box>
    </Box>
  </Paper>
);

// ── Room Row ───────────────────────────────────────────────────
const RoomRow = ({ room, idx }) => {
  const pct  = Math.round((room.occupants.length / room.capacity) * 100);
  const full = room.occupants.length >= room.capacity;
  return (
    <Box
      sx={{
        display: "flex", alignItems: "center", gap: 2,
        py: 1.5, borderBottom: "1px solid", borderColor: "grey.100",
        "&:last-child": { borderBottom: "none" },
        animation: "fadeIn 0.3s ease both",
        animationDelay: `${idx * 40}ms`,
        "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
        transition: "background 0.15s ease",
        borderRadius: 1,
        px: 1,
        mx: -1,
        "&:hover": { backgroundColor: "grey.50" },
      }}
    >
      <Avatar sx={{ bgcolor: full ? "#FFEBEE" : "#E8F5E9", color: full ? "#C62828" : "#2E7D32", width: 36, height: 36, fontSize: 13, fontWeight: 700 }}>
        {room.roomNumber}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" fontWeight={600}>Room {room.roomNumber}</Typography>
          <Typography variant="caption" color="text.secondary">{room.occupants.length}/{room.capacity}</Typography>
        </Box>
        <LinearProgress
          variant="determinate" value={pct}
          sx={{
            height: 5, borderRadius: 99,
            backgroundColor: "grey.100",
            "& .MuiLinearProgress-bar": {
              backgroundColor: full ? "#C62828" : pct > 70 ? "#F57C00" : "#2E7D32",
              borderRadius: 99,
            },
          }}
        />
      </Box>
      <Chip
        label={full ? "Full" : "Open"} size="small"
        sx={{ fontSize: 11, fontWeight: 700, height: 22, backgroundColor: full ? "#FFEBEE" : "#E8F5E9", color: full ? "#C62828" : "#2E7D32" }}
      />
    </Box>
  );
};

// ── Empty State ────────────────────────────────────────────────
const EmptyState = ({ icon, title, desc }) => (
  <Box sx={{ py: 5, textAlign: "center" }}>
    <Box sx={{ fontSize: 48, mb: 1, opacity: 0.3 }}>{icon}</Box>
    <Typography fontWeight={700} color="text.secondary" gutterBottom>{title}</Typography>
    <Typography variant="caption" color="text.disabled">{desc}</Typography>
  </Box>
);

// ── Main ───────────────────────────────────────────────────────
const WardenDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [rooms,    setRooms]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");



  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sRes, rRes] = await Promise.all([
          fetch(`${API}/api/students`, { credentials: "include" }),
          fetch(`${API}/api/rooms`,    { credentials: "include" }),
        ]);
        const [sData, rData] = await Promise.all([sRes.json(), rRes.json()]);
        setStudents(sData.data || []);
        setRooms(rData.data || []);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalRooms    = rooms.length;
  const occupiedRooms = rooms.filter(r => r.occupants.length > 0).length;
  const totalBeds     = rooms.reduce((s, r) => s + r.capacity, 0);
  const occupiedBeds  = rooms.reduce((s, r) => s + r.occupants.length, 0);
  const occupancyPct  = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>

      {/* ── Welcome Banner ── */}
      <Paper elevation={0}
        sx={{
          mb: 3, p: 3, borderRadius: 3,
          background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
          border: "none", overflow: "hidden", position: "relative",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} color="#fff" gutterBottom>
            Warden Dashboard 🏠
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h3" fontWeight={900} color="rgba(255,255,255,0.95)">{occupancyPct}%</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>Overall Occupancy</Typography>
        </Box>
        {/* Decorative circles */}
        <Box sx={{ position: "absolute", top: -30, right: 120, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <Box sx={{ position: "absolute", bottom: -20, right: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* ── Stat cards ── */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        {loading ? (
          [0,1,2,3].map(i => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={<PeopleAltOutlined />}  label="Total Students" value={students.length}         color="#1565C0" bg="#E3F2FD" delay={0} />
            <StatCard icon={<MeetingRoomOutlined />} label="Total Rooms"    value={totalRooms}              color="#6A1B9A" bg="#F3E5F5" delay={60} />
            <StatCard icon={<DoorFrontOutlined />}   label="Occupied Rooms" value={occupiedRooms}           color="#E65100" bg="#FFF3E0" delay={120} sub={`${totalRooms - occupiedRooms} vacant`} />
            <StatCard icon={<TrendingUpOutlined />}  label="Occupancy"      value={`${occupancyPct}%`}     color="#2E7D32" bg="#E8F5E9" delay={180} sub={`${occupiedBeds} of ${totalBeds} beds`} />
          </>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>

        {/* ── Room occupancy ── */}
        <Paper elevation={0}
          sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", flex: 2, minWidth: 300 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Room Occupancy</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip label={`${rooms.filter(r => r.occupants.length >= r.capacity).length} full`} size="small"
                sx={{ backgroundColor: "#FFEBEE", color: "#C62828", fontWeight: 700, fontSize: 11 }} />
              <Chip label={`${rooms.filter(r => r.occupants.length === 0).length} empty`} size="small"
                sx={{ backgroundColor: "#F5F5F5", color: "text.secondary", fontWeight: 700, fontSize: 11 }} />
            </Box>
          </Box>
          {loading ? (
            [0,1,2,3].map(i => (
              <Box key={i} sx={{ display: "flex", gap: 2, py: 1.5, borderBottom: "1px solid", borderColor: "grey.100" }}>
                <Skeleton variant="circular" width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="50%" height={14} sx={{ mb: 0.5 }} />
                  <Skeleton width="100%" height={5} />
                </Box>
                <Skeleton width={40} height={22} sx={{ borderRadius: 2 }} />
              </Box>
            ))
          ) : rooms.length === 0 ? (
            <EmptyState icon={<MeetingRoom sx={{ fontSize: 48 }} />} title="No rooms added yet" desc="Go to Rooms → Add your first room" />
          ) : (
            rooms.map((room, idx) => <RoomRow key={room._id} room={room} idx={idx} />)
          )}
        </Paper>

        {/* ── Recent Students ── */}
        <Paper elevation={0}
          sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", flex: 1, minWidth: 260 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Recent Students</Typography>
            <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
              onClick={() => navigate("/warden/students")}
              sx={{ fontSize: 12, textTransform: "none", color: "#1E3A8A", fontWeight: 600, p: 0, minWidth: 0 }}>
              View all
            </Button>
          </Box>

          {loading ? (
            [0,1,2,3,4].map(i => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.25 }}>
                <Skeleton variant="circular" width={34} height={34} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="80%" height={12} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
            ))
          ) : students.length === 0 ? (
            <EmptyState icon={<SentimentSatisfiedAlt sx={{ fontSize: 48 }} />} title="No students yet" desc="Students will appear here after registration" />
          ) : (
            students.slice(0, 6).map((s, idx) => (
              <Box key={s._id}
                sx={{
                  display: "flex", alignItems: "center", gap: 1.5, py: 1.25,
                  borderBottom: "1px solid", borderColor: "grey.100",
                  "&:last-child": { borderBottom: "none" },
                  animation: "fadeIn 0.3s ease both",
                  animationDelay: `${idx * 50}ms`,
                  "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
                  borderRadius: 1, px: 0.5, mx: -0.5,
                  transition: "background 0.15s",
                  "&:hover": { backgroundColor: "grey.50" },
                }}
              >
                <Avatar sx={{ width: 34, height: 34, bgcolor: "#E3F2FD", color: "#1565C0", fontSize: 13, fontWeight: 700 }}>
                  {s.name?.[0]?.toUpperCase() || s.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>{s.name || s.username}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{s.email}</Typography>
                </Box>
                <Chip
                  label={s.roomId ? `R-${s.roomId.roomNumber}` : "No Room"} size="small"
                  sx={{ fontSize: 10, fontWeight: 700, height: 20, backgroundColor: s.roomId ? "#E8F5E9" : "#F5F5F5", color: s.roomId ? "#2E7D32" : "text.secondary" }}
                />
              </Box>
            ))
          )}

          {!loading && students.length > 0 && (
            <>
              <Divider sx={{ mt: 2, mb: 1.5 }} />
              <Button fullWidth variant="outlined" size="small"
                onClick={() => navigate("/warden/students")}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, fontSize: 13, borderColor: "grey.300", color: "text.secondary", "&:hover": { borderColor: "#1E3A8A", color: "#1E3A8A", backgroundColor: "#EEF2FF" } }}>
                See all {students.length} students
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default WardenDashboard;