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
    fetchTournamentData("masters2025");
  }, []);

  const fetchTournamentData = (id) => {
    fetch(`/api/draft/getState?tournament=${id}`)
      .then((res) => res.text())
      .then((response) => {
        let draftState = JSON.parse(response);
        setIsDraftMode(!getIsDraftComplete(draftState));
        setIsLoading(false);
      });
  };

  const getIsDraftComplete = (data) => {
    for (const friend of Object.keys(data.friends)) {
      let pickCount = getPickCount(data, friend);
      if (pickCount !== data.teamSize) {
        return false;
      }
    }
    return true;
  };

  const getPickCount = (data, friend) => {
    let pickCount = 0;
    for (const player of data.friends[friend]) {
      if (player) {
        pickCount += 1;
      }
    }
    return pickCount;
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
      <GolfTournamentDraftMode id="masters2025" title="Masters 2025" />
    ) : (
      <GolfTournament id="masters2025" title="Masters 2025" />
    );
  };

  return <ThemeProvider theme={theme}>{renderGolfTournament()}</ThemeProvider>;
}
