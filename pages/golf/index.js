"use client";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
    <Box sx={{ width: "100vw", height: "100vh", padding: "20px 20px 20px 20px", background: "#1D4832" }}>
      <Typography variant="h3">GOLF</Typography>
      <Link href="/golf/current" className="link" style={{ padding: "10px", display: "block" }}>
        Current (Masters 2025)
      </Link>
      <Link href="/golf/the_open_2024" className="link" style={{ padding: "10px", display: "block" }}>
        The Open 2024
      </Link>
      <Link href="/golf/masters_2024" className="link" style={{ padding: "10px", display: "block" }}>
        Masters 2024
      </Link>
    </Box>
  );
}
