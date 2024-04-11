"use client";
import { useEffect, useState } from "react";
import HTMLParser from "node-html-parser";
import { Box, Chip, Grid, Typography, useMediaQuery } from "@mui/material";
import Link from "next/link";

export default function Home() {
  const isDesktopView = useMediaQuery("(min-width:1024px)");
  const [data, setData] = useState(null);

  const tournamentData = {
    Kyle: ["Scottie Scheffler", "Will Zalatoris", "Cameron Smith", "Patrick Reed"],
    Brendan: ["Jon Rahm", "Sahith Theegala", "Collin Morikawa", "Corey Conners"],
    David: ["Rory McIlroy", "Hideki Matsuyama", "Justin Thomas", "Shane Lowry"],
    Trent: ["Viktor Hovland", "Matt Fitzpatrick", "Jake Knapp", "Tyrrell Hatton"],
    George: ["Xander Schauffele", "Max Homa", "Cameron Young", "Tony Finau"],
    Mike: ["Jordan Spieth", "Patrick Cantlay", "Jason Day", "Sam Burns"],
    Josh: ["Brooks Koepka", "Joaquín Niemann", "Min Woo Lee", "Bryson DeChambeau"],
    Colby: ["Ludvig Åberg", "Wyndham Clark", "Brian Harman", "Dustin Johnson"],
  };

  useEffect(() => {
    console.log("useEffect");
    fetchMastersData();
    setInterval(() => {
      fetchMastersData();
    }, 5000);
  }, []);

  const fetchMastersData = () => {
    let data = {};
    console.log("fetching...");
    fetch("https://www.espn.com/golf/leaderboard")
      .then((res) => res.text())
      .then((response) => {
        let root = HTMLParser.parse(response);
        let table = root.querySelector(
          "#fittPageContainer > div:nth-child(3) > div > div > section:nth-child(3) > div > div > div > div.Button--group > div.competitors > div > div > div > div.Table__Scroller > table > tbody"
        );
        for (const player of table.childNodes) {
          const position = player.childNodes[1].text;
          const name = player.childNodes[2].text;
          const score = parseInt(getPlayerScore(player.childNodes[3].text));
          const scoreString = player.childNodes[3].text;
          const todayScore = parseInt(getPlayerScore(player.childNodes[4].text));
          const thru = player.childNodes[5].text;
          data[name] = {
            position: position,
            name: name,
            score: score,
            scoreString: scoreString,
            todayScore: todayScore,
            thru: thru,
          };
          setData(data);
        }
      });
  };

  const getPlayerScore = (scoreString) => {
    if (scoreString === "-") {
      return 0;
    } else if (scoreString === "E") {
      return 0;
    } else {
      return scoreString;
    }
  };

  const renderTournament = () => {
    return (
      <Box sx={{ margin: "auto", width: "100vw" }}>
        {buildTournamentDataSortedList().map((teamName) => {
          const players = tournamentData[teamName];

          return (
            <Grid
              container
              key={teamName}
              sx={{
                textAlign: "left",
                margin: "10px",
                alignItems: "center",
                width: "95vw",
                background: "#FDE200",
                color: "#000",
                borderRadius: "5px",
                padding: "10px",
              }}
            >
              <Grid item xs={12}>
                <Typography variant="h5">{teamName}</Typography>
              </Grid>
              <Grid item xs={9}>
                {renderPlayers(players)}
              </Grid>
              <Grid item xs={3}>
                <Chip label={getTotalScore(teamName)} sx={{ background: "white" }} />
              </Grid>
            </Grid>
          );
        })}
      </Box>
    );
  };

  const buildTournamentDataSortedList = () => {
    let sorted = [];
    for (const teamName of Object.keys(tournamentData)) {
      const players = tournamentData[teamName];
      sorted.push({ teamName: teamName, players: players, totalScore: getTotalScore(teamName) });
    }
    sorted = sorted.sort((a, b) => a.totalScore - b.totalScore);
    return sorted.map((obj) => obj.teamName);
  };

  const renderPlayers = (players) => {
    return (
      <Box>
        {players.map((playerName) => {
          const playerData = data[getPlayerName(playerName)];
          return (
            <Grid container key={playerName}>
              <Grid item xs={8}>
                {playerData?.name}
              </Grid>
              <Grid item xs={4}>
                {playerData?.scoreString}
              </Grid>
            </Grid>
          );
        })}
      </Box>
    );
  };

  const getTotalScore = (friend) => {
    let score = 0;
    for (const player of tournamentData[friend]) {
      score += data[getPlayerName(player)]?.score;
    }
    return score;
  };

  const getPlayerName = (playerName) => {
    if (isDesktopView) {
      return playerName;
    } else {
      const list = playerName.split(" ");
      const firstName = list[0];
      const lastName = list.slice(1).join(" ");
      const mobileName = firstName[0] + ".  " + lastName;
      return mobileName;
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", padding: "20px 20px 20px 20px", background: "#1D4832" }}>
      <Typography variant="h3">Masters Leaderboard</Typography>
      {data && renderTournament()}
      <div className="link">
        <Link href="/">Home</Link>
      </div>
    </Box>
  );
}
