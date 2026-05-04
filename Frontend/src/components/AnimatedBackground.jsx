import { Box } from "@mui/material";
import GridDistortion from "./GridDistortion";

const AnimatedBackground = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 0,
        background: "#000000",
      }}
    >
      <GridDistortion 
        imageSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
        grid={12} 
        mouse={0.1} 
        strength={0.15} 
        relaxation={0.9} 
      />
    </Box>
  );
};

export default AnimatedBackground;
