"use client";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
    <Box sx={{ width: "100%", height: "100%", padding: "20px 20px 20px 20px", background: "#1D4832" }}>
      <Typography variant="h3">GOLF</Typography>
          <Link href="/golf/current" className="link" style={{padding: "10px", display: "block"}}>
            Current (The Open 2024)
          </Link>
          <Link href="/golf/masters_2024" className="link" style={{padding: "10px", display: "block"}}>
            Masters 2024
          </Link>
    </Box>
  );
}
