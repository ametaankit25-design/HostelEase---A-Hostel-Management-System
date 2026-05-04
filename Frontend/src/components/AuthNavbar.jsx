import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HolidayVillage } from "@mui/icons-material";

const AuthNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === "/login";

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: 1201, 
        backgroundColor: "#ffffff", 
        borderBottom: "1px solid", 
        borderColor: "grey.200" 
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 6 } }}>
        <Box 
          sx={{ display: "flex", alignItems: "center", gap: 1.5, textDecoration: "none", color: "text.primary" }} 
          component={Link} 
          to="/"
        >
          <Box sx={{ 
            backgroundColor: "primary.main", 
            p: 0.75, 
            borderRadius: 2, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)"
          }}>
            <HolidayVillage sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} letterSpacing={0.5}>
            HostelEase
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button 
            onClick={() => navigate("/login")}
            variant={isLogin ? "contained" : "text"}
            sx={{ 
              fontWeight: 600, 
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              color: isLogin ? "white" : "text.primary",
              "&:hover": {
                backgroundColor: isLogin ? "primary.dark" : "rgba(0,0,0,0.05)"
              }
            }}
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate("/signup")}
            variant={!isLogin ? "contained" : "text"}
            sx={{ 
              fontWeight: 600, 
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              color: !isLogin ? "white" : "text.primary",
              "&:hover": {
                backgroundColor: !isLogin ? "primary.dark" : "rgba(0,0,0,0.05)"
              }
            }}
          >
            Create Account
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AuthNavbar;
