import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Avatar, Chip, Divider,
  Alert, Skeleton, LinearProgress, Button,
} from "@mui/material";
import {
  HomeOutlined, PaymentOutlined,
  EmailOutlined, MeetingRoomOutlined,
  CheckCircleOutlined, ErrorOutlined, PendingOutlined,
  ArrowForward, CalendarMonthOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

// ── Stat Card ──────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, bg, sub }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "grey.100",
      display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 140,
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", borderColor: `${color}40` },
      cursor: "default",
    }}
  >
    <Box sx={{ width: 44, height: 44, borderRadius: 2, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Box sx={{ color, fontSize: 22, display: "flex" }}>{icon}</Box>
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>{value}</Typography>
      {sub && <Typography variant="caption" color="text.disabled">{sub}</Typography>}
    </Box>
  </Paper>
);

const StatCardSkeleton = () => (
  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "grey.100", display: "flex", gap: 2, flex: 1, minWidth: 140 }}>
    <Skeleton variant="rounded" width={44} height={44} />
    <Box sx={{ flex: 1 }}>
      <Skeleton width="60%" height={12} sx={{ mb: 0.5 }} />
      <Skeleton width="40%" height={28} />
    </Box>
  </Paper>
);

// ── Payment Row ────────────────────────────────────────────────
const PaymentRow = ({ payment, idx }) => {
  const paid = payment.status === "Paid";
  return (
    <Box
      sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        py: 1.5, borderBottom: "1px solid", borderColor: "grey.100",
        "&:last-child": { borderBottom: "none" },
        animation: "fadeIn 0.3s ease both", animationDelay: `${idx * 60}ms`,
        "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
        borderRadius: 1, px: 0.5, mx: -0.5,
        transition: "background 0.15s",
        "&:hover": { backgroundColor: "grey.50" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: paid ? "#E8F5E9" : "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {paid
            ? <CheckCircleOutlined sx={{ color: "#2E7D32", fontSize: 18 }} />
            : <PendingOutlined sx={{ color: "#E65100", fontSize: 18 }} />}
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={600}>₹{payment.amount?.toLocaleString()}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarMonthOutlined sx={{ fontSize: 11, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              {new Date(payment.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Chip
        label={payment.status} size="small"
        sx={{
          backgroundColor: paid ? "#E8F5E9" : "#FFF3E0",
          color: paid ? "#2E7D32" : "#E65100",
          fontWeight: 700, fontSize: 11, height: 24,
          border: `1px solid ${paid ? "#A5D6A7" : "#FFCC80"}`,
        }}
      />
    </Box>
  );
};

// ── Main ───────────────────────────────────────────────────────
const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [payments, setPayments] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [room,     setRoom]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [payRes, roomRes] = await Promise.all([
          fetch(`${API}/api/payments/${user.email}`, { credentials: "include" }),
          fetch(`${API}/api/rooms`, { credentials: "include" }),
        ]);
        if (payRes.ok) {
          const payData = await payRes.json();
          setPayments(payData.data || []);
          setSummary(payData.summary || null);
        }
        if (roomRes.ok) {
          const roomData = await roomRes.json();
          const myRoom = roomData.data?.find((r) =>
            r.occupants?.some((o) => o?.email === user.email)
          );
          setRoom(myRoom || null);
        }
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id, user?.email]);

  const paidCount    = payments.filter(p => p.status === "Paid").length;
  const pendingCount = payments.filter(p => p.status !== "Paid").length;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>

      {/* ── Welcome Banner ── */}
      <Paper elevation={0}
        sx={{
          mb: 3, p: 3, borderRadius: 3,
          background: "linear-gradient(135deg, #312e81 0%, #4338ca 100%)",
          position: "relative", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 24, fontWeight: 700, border: "2px solid rgba(255,255,255,0.3)" }}>
            {user?.username?.[0]?.toUpperCase() || "S"}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#fff">
              Welcome back, {user?.username || "Student"}!
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <EmailOutlined sx={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }} />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>{user?.email || "—"}</Typography>
              <Chip label={user?.role || "Student"} size="small"
                sx={{ ml: 0.5, height: 18, fontSize: 10, fontWeight: 600, backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }} />
            </Box>
          </Box>
        </Box>
        {room && (
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>My Room</Typography>
            <Typography variant="h4" fontWeight={900} color="#fff">{room.roomNumber}</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {room.occupants?.length}/{room.capacity} occupants
            </Typography>
          </Box>
        )}
        <Box sx={{ position: "absolute", top: -30, right: 160, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <Box sx={{ position: "absolute", bottom: -20, right: 60, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* ── Stat cards ── */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {loading ? (
          [0,1,2,3].map(i => <StatCardSkeleton key={i} />)
        ) : summary ? (
          <>
            <StatCard icon={<PaymentOutlined />}      label="Total Paid"     value={`₹${summary.totalPaid?.toLocaleString() ?? "0"}`}    color="#2E7D32" bg="#E8F5E9" />
            <StatCard icon={<ErrorOutlined />}        label="Pending Dues"   value={`₹${summary.pendingDues?.toLocaleString() ?? "0"}`}  color="#C62828" bg="#FFEBEE" />
            <StatCard icon={<CheckCircleOutlined />}  label="Payments Made"  value={paidCount}                                            color="#1565C0" bg="#E3F2FD" sub={`${pendingCount} pending`} />
            {room && (
              <StatCard icon={<HomeOutlined />} label="Room Capacity" value={`${room.occupants?.length ?? 0} / ${room.capacity}`} color="#6A1B9A" bg="#F3E5F5" />
            )}
          </>
        ) : null}
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>

        {/* ── Room Details ── */}
        {(loading || room) && (
          <Paper elevation={0}
            sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", minWidth: 260, flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>Room Details</Typography>
              <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                onClick={() => navigate("/student/room")}
                sx={{ fontSize: 12, textTransform: "none", color: "#4338ca", fontWeight: 600, p: 0, minWidth: 0 }}>
                View
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {[0,1,2,3].map(i => (
                  <Box key={i}>
                    <Skeleton width={70} height={12} sx={{ mb: 0.5 }} />
                    <Skeleton width={50} height={22} />
                  </Box>
                ))}
              </Box>
            ) : room ? (
              <>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 2 }}>
                  {[
                    { k: "Room Number", v: room.roomNumber },
                    { k: "Capacity",    v: room.capacity },
                    { k: "Occupants",   v: room.occupants?.length ?? 0 },
                  ].map(({ k, v }) => (
                    <Box key={k}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>{k}</Typography>
                      <Typography fontWeight={700} fontSize={18}>{v}</Typography>
                    </Box>
                  ))}
                </Box>
                {/* Occupancy bar */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Room fill level</Typography>
                    <Typography variant="caption" fontWeight={700} color="text.primary">
                      {Math.round(((room.occupants?.length ?? 0) / room.capacity) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.round(((room.occupants?.length ?? 0) / room.capacity) * 100)}
                    sx={{
                      height: 6, borderRadius: 99, backgroundColor: "grey.100",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #4338ca, #6366f1)",
                        borderRadius: 99,
                      },
                    }}
                  />
                </Box>
                <Chip
                  label={room.occupants?.length >= room.capacity ? "Room Full" : "Space Available"} size="small"
                  sx={{ mt: 2, backgroundColor: room.occupants?.length >= room.capacity ? "#FFEBEE" : "#E8F5E9", color: room.occupants?.length >= room.capacity ? "#C62828" : "#2E7D32", fontWeight: 700, fontSize: 11 }}
                />
              </>
            ) : (
              <Box sx={{ py: 3, textAlign: "center" }}>
                <MeetingRoomOutlined sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No room assigned yet</Typography>
                <Typography variant="caption" color="text.disabled">Contact your warden for room allotment</Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* ── Recent Payments ── */}
        <Paper elevation={0}
          sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200", flex: 2, minWidth: 300 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Recent Payments</Typography>
            <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
              onClick={() => navigate("/student/payments")}
              sx={{ fontSize: 12, textTransform: "none", color: "#4338ca", fontWeight: 600, p: 0, minWidth: 0 }}>
              View all
            </Button>
          </Box>

          {loading ? (
            [0,1,2,3].map(i => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.5 }}>
                <Skeleton variant="rounded" width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="40%" height={14} sx={{ mb: 0.5 }} />
                  <Skeleton width="60%" height={12} />
                </Box>
                <Skeleton width={50} height={22} sx={{ borderRadius: 2 }} />
              </Box>
            ))
          ) : payments.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <PaymentOutlined sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography fontWeight={700} color="text.secondary">No payment records</Typography>
              <Typography variant="caption" color="text.disabled">Your payment history will appear here</Typography>
            </Box>
          ) : (
            payments.slice(0, 5).map((p, idx) => <PaymentRow key={p._id} payment={p} idx={idx} />)
          )}

          {!loading && payments.length > 0 && (
            <>
              <Divider sx={{ mt: 2, mb: 1.5 }} />
              <Button fullWidth variant="outlined" size="small"
                onClick={() => navigate("/student/payments")}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, fontSize: 13, borderColor: "grey.300", color: "text.secondary", "&:hover": { borderColor: "#4338ca", color: "#4338ca", backgroundColor: "#EEF2FF" } }}>
                See all {payments.length} payments
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default StudentDashboard;