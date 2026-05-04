import { useState, useEffect } from "react";
import {
    Box, Typography, Paper, Avatar, Chip,
    CircularProgress, Alert, Divider,
} from "@mui/material";
import {
    MeetingRoomOutlined, PeopleOutlined,
    CheckCircleOutlined, ErrorOutlined,
} from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL;

const MyRoom = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRoom = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API}/api/rooms`, { credentials: "include" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to load rooms");

                // find the room this student occupies using email since Auth ID != Student ID
                const myRoom = data.data?.find((r) =>
                    r.occupants?.some((o) => o?.email === user.email)
                );
                setRoom(myRoom || null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchRoom();
    }, [user?.id, user?.email]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>My Room</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Your current hostel room assignment
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            {!room && !error && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No room has been assigned to you yet. Please contact the warden.
                </Alert>
            )}

            {room && (
                <Paper
                    elevation={0}
                    sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", overflow: "hidden" }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            px: 3, py: 3,
                            background: "linear-gradient(135deg, #1565C018 0%, #1565C008 100%)",
                            borderBottom: "1px solid", borderColor: "grey.100",
                            display: "flex", alignItems: "center", gap: 2,
                        }}
                    >
                        <Avatar sx={{ bgcolor: "#1565C0", width: 52, height: 52 }}>
                            <MeetingRoomOutlined />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="#1565C0">
                                Room {room.roomNumber}
                            </Typography>
                            <Chip
                                label={room.occupants?.length >= room.capacity ? "Full" : "Available"}
                                size="small"
                                icon={
                                    room.occupants?.length >= room.capacity
                                        ? <ErrorOutlined style={{ fontSize: 14 }} />
                                        : <CheckCircleOutlined style={{ fontSize: 14 }} />
                                }
                                sx={{
                                    mt: 0.5,
                                    backgroundColor: room.occupants?.length >= room.capacity ? "#FFEBEE" : "#E8F5E9",
                                    color: room.occupants?.length >= room.capacity ? "#C62828" : "#2E7D32",
                                    fontWeight: 700,
                                    fontSize: 11,
                                    "& .MuiChip-icon": { color: "inherit" },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Stats */}
                    <Box sx={{ display: "flex", px: 3, py: 2.5, gap: 4, borderBottom: "1px solid", borderColor: "grey.100" }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}>
                                Capacity
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>{room.capacity}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}>
                                Occupied
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>{room.occupants?.length || 0}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}>
                                Vacant
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                                {room.capacity - (room.occupants?.length || 0)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Roommates */}
                    <Box sx={{ px: 3, py: 2.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <PeopleOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
                            <Typography variant="subtitle2" fontWeight={700}>Roommates</Typography>
                        </Box>

                        {room.occupants?.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No occupants listed.</Typography>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {room.occupants?.map((occupant, idx) => {
                                    const isMe = occupant.email === user.email;
                                    const name = occupant.name || occupant.username || "Occupant";
                                    const email = occupant.email || "";
                                    return (
                                        <Box key={occupant._id || idx}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
                                                <Avatar sx={{ width: 36, height: 36, bgcolor: isMe ? "#1565C0" : "#E3F2FD", color: isMe ? "#fff" : "#1565C0", fontSize: 14, fontWeight: 700 }}>
                                                    {name[0]?.toUpperCase()}
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {name} {isMe && <Chip label="You" size="small" sx={{ ml: 0.5, height: 18, fontSize: 10, bgcolor: "#E3F2FD", color: "#1565C0", fontWeight: 700 }} />}
                                                    </Typography>
                                                    {email && (
                                                        <Typography variant="caption" color="text.secondary">{email}</Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                            {idx < room.occupants.length - 1 && <Divider />}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default MyRoom;