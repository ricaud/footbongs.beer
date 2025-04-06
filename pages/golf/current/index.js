"use client";
import { Box, ThemeProvider } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import GolfTournament from "../../../components/GolfTournament";
import GolfTournamentDraftMode from "../../../components/GolfTournamentDraftMode";
import theme from "../theme";

export default function Masters() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDraftMode, setIsDraftMode] = useState(false);

  useEffect(() => {
    fetchTournament("masters_2025").then((response) => {
      setIsDraftMode(response.isDraftMode);
      setIsLoading(false);
    });
  }, []);

  const fetchTournament = async (tournamentId) => {
    // Replace this with a real API call
    return {
      isDraftMode: true,
    };
  };

  const renderGolfTournament = () => {
    if (isLoading) {
      return (
        <Box
          sx={{
            width: "100dvw",
            height: "var(--app-height)",
            padding: "20px 20px 20px 20px",
            background: "primary.main",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress sx={{ color: "secondary.main" }} />
        </Box>
      );
    }

    return isDraftMode ? (
      <GolfTournamentDraftMode id="current" title="Masters 2025" />
    ) : (
      <GolfTournament id="current" title="Masters 2025" />
    );
  };

  return <ThemeProvider theme={theme}>{renderGolfTournament()}</ThemeProvider>;
}
