"use client";
import { Box, Chip, CircularProgress, Grid, Typography, useMediaQuery } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

export default function GolfTournament(props) {
  const isDesktopView = useMediaQuery("(min-width:1024px)");
  const [data, setData] = useState(null);

  useEffect(() => {
    let timeout;

    const poll = async () => {
      console.log(document.visibilityState)
      if (document.visibilityState === "visible") {
        fetchTournamentData(props.id);
      }
      timeout = setTimeout(poll, 10000);
    };

    poll();

    return () => clearTimeout(timeout);
  }, []);

  const fetchTournamentData = (id) => {
    fetch(`/api/masters/scores?id=${id}`)
      .then((res) => res.text())
      .then((response) => {
        let scores = JSON.parse(response);
        setData(scores);
      });
  };

  const renderTournament = () => {
    return (
      <Box sx={{ maxWidth: "95vw" }}>
        {buildTournamentDataSortedList().map((teamName, idx) => {
          const players = data.friends[teamName];

          return (
            <Grid
              container
              key={teamName}
              sx={{
                textAlign: "left",
                marginBottom: "10px",
                alignItems: "center",
                width: "500px",
                maxWidth: "100%",
                background: "#FDE200",
                color: "#000",
                borderRadius: "5px",
                padding: "10px",
              }}
            >
              <Grid container sx={{ height: "30px" }}>
                <Grid item xs={10}>
                  <Typography variant="h5" fontSize={30} display="flex" alignItems="center">
                    {idx === 0 && (
                      <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                        <Image
                          src="/crown.svg"
                          alt="crown"
                          width={33}
                          height={24}
                          style={{
                            display: "block",
                          }}
                        />
                      </Box>
                    )}
                    {teamName}
                  </Typography>
                </Grid>

                <Grid item xs={2}>
                  <Chip
                    label={getTotalScore(teamName)}
                    sx={{
                      color: "primary.white",
                      backgroundColor: "primary.main",
                      float: "right",
                      fontFamily: "'DM Serif Text', serif",
                      fontWeight: "bold",
                      fontSize: "24px",
                    }}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12} sx={{ marginTop: "10px" }}>
                {renderPlayers(players)}
              </Grid>
            </Grid>
          );
        })}
      </Box>
    );
  };

  const buildTournamentDataSortedList = () => {
    let sorted = [];
    for (const teamName of Object.keys(data.friends)) {
      const players = data.friends[teamName];
      sorted.push({ teamName: teamName, players: players, totalScore: getTotalScore(teamName) });
    }
    sorted = sorted.sort((a, b) => a.totalScore - b.totalScore);
    return sorted.map((obj) => obj.teamName);
  };

  const renderPlayers = (players) => {
    return (
      <Grid container>
        <Grid container sx={{ height: "22px" }}>
          <Grid item xs={7}>
            <Typography fontWeight="bold" color="primary.black" fontSize={20}>
              PLAYERS
            </Typography>
          </Grid>
          <Grid item xs={2.5}>
            <Typography fontWeight="bold" color="primary.black" fontSize={20}>
              SCORE
            </Typography>
          </Grid>
          <Grid item xs={2.5}>
            <Typography fontWeight="bold" color="primary.black" fontSize={20}>
              THRU
            </Typography>
          </Grid>
        </Grid>
        {players.map((playerName) => {
          const playerData = data.players[playerName];
          return (
            <Grid container key={playerName} sx={{ height: "17px" }}>
              <Grid item xs={7}>
                <Typography color="primary.black" fontSize={16} className="leaderboard-name">
                  {playerData?.name.toUpperCase()}
                </Typography>
              </Grid>
              <Grid item xs={2.5}>
                <Typography color="primary.black" fontSize={16} className="leaderboard-name">
                  {playerData?.scoreString ? playerData?.scoreString : playerData?.teeTime}
                </Typography>
              </Grid>
              {playerData?.scoreString && (
                <Grid item xs={2.5}>
                  <Typography color="primary.black" fontSize={16} className="leaderboard-name">
                    {playerData?.thru}
                  </Typography>
                </Grid>
              )}
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const getTotalScore = (friend) => {
    let score = 0;
    for (const player of data.friends[friend]) {
      score += data.players[player]?.score;
    }
    if (Number.isNaN(score)) {
      return "?";
    }
    return score;
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "primary.main",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px",
        boxSizing: "border-box", // prevents padding from expanding layout
        overflowX: "auto", // allows scroll if something breaks
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "secondary.main",
          marginBottom: "15px",
          textAlign: "center",
          width: "100%",
        }}
      >
        {props.title} Leaderboard
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        {data ? renderTournament() : <CircularProgress sx={{ color: "secondary.main", marginBottom: "20px" }} />}

        <Box sx={{ marginTop: "20px", textAlign: "center" }}>
          <div className="link">
            <Link href="/">Home</Link>
          </div>
          <div className="link">
            <Link href="/golf">Golf Home</Link>
          </div>
        </Box>
      </Box>
    </Box>
  );
}

GolfTournament.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
