"use client";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { initializeSearchIndex, searchPlayers } from "../util/searchPlayers";
// import SlideUpTransition from "./fundamentals/SlideUpTransition";

const MAX_PLAYER_PICKS = 6;

export default function GolfTournament(props) {
  const isDesktopView = useMediaQuery("(min-width:1024px)");
  const [data, setData] = useState(null);
  const [searchedPlayers, setSearchedPlayers] = useState(null);
  const [activeFriend, setActiveFriend] = useState(null);
  const [whosTurn, setWhosTurn] = useState(null);
  const [isPickHistoryExpanded, setIsPickHistoryExpanded] = useState(false);
  const [isDraftComplete, setIsDraftComplete] = useState(false);
  const [isWhosTurnOpen, setIsWhosTurnOpen] = useState(true);
  const [currentlySelectedPlayer, setCurrentlySelectedPlayer] = useState(null);

  useEffect(() => {
    fetchTournamentData(props.id);
  }, []);

  useEffect(() => {
    if (data) {
      runDraft();
    }
  }, [data]);

  const mock = async () => {
    return JSON.stringify({
      friends: {
        Josh: [
          {
            name: "Aaron Rai",
            avatar: "aaron_rai.png",
          },
          null,
          null,
          null,
          null,
          null,
        ],
        Brendan: [
          {
            name: "Akshay Bhatia",
            avatar: "akshay_bhatia.png",
          },
          null,
          null,
          null,
          null,
          null,
        ],
        // Trent: [
        //   {
        //     name: "Brooks Koepka",
        //     avatar: "brooks_koepka.png",
        //   },
        //   null,
        //   null,
        //   null,
        //   null,
        //   null,
        // ],
        // David: [
        //   {
        //     name: "Cameron Smith",
        //     avatar: "cameron_smith.png",
        //   },
        //   null,
        //   null,
        //   null,
        //   null,
        //   null,
        // ],
        George: [null, null, null, null, null, null],
        // Mike: [null, null, null, null, null, null],
        // Kyle: [null, null, null, null, null, null],
        // Colby: [null, null, null, null, null, null],
      },
      players: [
        {
          name: "Aaron Rai",
          avatar: "aaron_rai.png",
        },
        {
          name: "Akshay Bhatia",
          avatar: "akshay_bhatia.png",
        },
        {
          name: "Brooks Koepka",
          avatar: "brooks_koepka.png",
        },
        {
          name: "Cameron Smith",
          avatar: "cameron_smith.png",
        },
        {
          name: "Fred Couples",
          avatar: "fred_couples.png",
        },
        {
          name: "Jon Rahm",
          avatar: "jon_rahm.png",
        },
        {
          name: "Scottie Scheffler",
          avatar: "scottie_scheffler.png",
        },
      ],
    });
  };

  const fetchTournamentData = (id) => {
    // fetch(`/api/masters/scores?id=${id}`)
    //   .then((res) => res.text())
    mock().then((response) => {
      let scores = JSON.parse(response);
      setData(scores);
      initializeSearchIndex(scores.players);
      setSearchedPlayers(scores.players);
      const player = window.localStorage.getItem("activeFriend");
      if (player) {
        setActiveFriend(player);
      }
    });
  };

  const applySearch = (searchedPlayers) => {
    setSearchedPlayers(searchedPlayers);
  };

  const handleSearchTextChange = (event) => {
    searchPlayers(event.target.value, applySearch);
  };

  const selectPlayer = (selectedPlayer) => {
    let newData = { ...data };
    let rosterIdx = 0;
    for (const player of data.friends[activeFriend]) {
      if (!player) {
        newData.friends[activeFriend][rosterIdx] = selectedPlayer;
        setData(newData);
        // TODO: is this where a backend data call will be made?
        return;
      }
      rosterIdx += 1;
    }
  };

  const runDraft = () => {
    if (getIsDraftComplete()) return;

    const maxPlayers = getCurrentMaxPlayers();
    const totalPicks = getTotalPickCount();
    const roundNumber = Math.floor(totalPicks / Object.keys(data.friends).length);
    const friends = Object.keys(data.friends);
    const draftOrder = roundNumber % 2 === 0 ? friends : [...friends].reverse();

    for (const friend of draftOrder) {
      const pickCount = getPickCount(friend);
      if (maxPlayers === 0 || pickCount < maxPlayers) {
        setWhosTurn(friend);
        return friend;
      }
    }
  };

  const getIsDraftComplete = () => {
    for (const friend of Object.keys(data.friends)) {
      let pickCount = getPickCount(friend);
      if (pickCount !== MAX_PLAYER_PICKS) {
        setIsDraftComplete(false);
        return false;
      }
    }
    setIsDraftComplete(true);
    // TODO: update payload with isDraftMode = false
    return true;
  };

  const getCurrentMaxPlayers = () => {
    let currentMaxPlayers = 0;
    for (const friend of Object.keys(data.friends)) {
      let pickCount = getPickCount(friend);
      if (pickCount > currentMaxPlayers) {
        currentMaxPlayers = pickCount;
      }
    }
    return currentMaxPlayers;
  };

  const getTotalPickCount = () => {
    let totalPickCount = 0;
    for (const friend of Object.keys(data.friends)) {
      totalPickCount += getPickCount(friend);
    }
    return totalPickCount;
  };

  const getPickCount = (friend) => {
    let pickCount = 0;
    for (const player of data.friends[friend]) {
      if (player) {
        pickCount += 1;
      }
    }
    return pickCount;
  };

  const getPickHistory = () => {
    let pickHistory = [];
    for (const friend of Object.keys(data.friends)) {
      for (const player of data.friends[friend]) {
        if (player) {
          pickHistory.push(`${friend} picked ${player.name}`);
        }
      }
    }
    return pickHistory;
  };

  const buildTournamentDataSortedList = () => {
    let sorted = [];
    for (const friend of Object.keys(data.friends)) {
      const players = data.friends[friend];
      sorted.push({ friend: friend, players: players });
    }
    // sorted = sorted.sort((a, b) => a.friend - b.friend);
    return sorted.map((obj) => obj.friend);
  };

  const isPlayerAlreadyPicked = (player) => {
    for (const friend of Object.keys(data.friends)) {
      for (const currPlayer of data.friends[friend]) {
        if (currPlayer && currPlayer.name === player.name) {
          return true;
        }
      }
    }
    return false;
  };

  const handlePickHistoryExpand = () => {
    setIsPickHistoryExpanded(!isPickHistoryExpanded);
  };

  const handlePlayerClicked = (player) => {
    setCurrentlySelectedPlayer(player);
  };

  const handlePlayerSelectCancel = () => {
    setCurrentlySelectedPlayer(null);
  };

  const handlePlayerSelectConfirmation = (player) => {
    selectPlayer(player);
    setIsWhosTurnOpen(true);
    setCurrentlySelectedPlayer(null);
  };

  const handleSelectFriend = (teamName) => {
    setActiveFriend(teamName);
    window.localStorage.setItem("activeFriend", teamName);
  };

  const renderTournamentDraftMode = () => {
    if (isDraftComplete) {
      return (
        <>
          <Typography variant="h4" textAlign="center" sx={{ color: "secondary.main" }}>
            {props.title} Draft
          </Typography>
          <Typography variant="h4" sx={{ color: "secondary.main" }}>
            Draft Complete!
          </Typography>
          <Button
            variant="contained"
            color="warning"
            size="large"
            onClick={() => {
              location.reload();
            }}
            sx={{ width: "100%", marginTop: "10px" }}
          >
            Go To Scoreboard
          </Button>
        </>
      );
    } else {
      if (activeFriend) {
        return (
          <Grid container>
            <Grid item xs={12} md={6}>
              {renderPlayerRoster(activeFriend)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderPickHistory()}
            </Grid>
            <Grid item xs={12}>
              {renderPlayerList()}
            </Grid>

            {renderWhosTurn()}
            {renderAreYouSureDialog()}
          </Grid>
        );
      } else {
        return (
          <Box sx={{ margin: "auto" }}>
            <Typography variant="h4" textAlign="center" sx={{ color: "secondary.main" }}>
              {props.title} Draft
            </Typography>
            <Typography variant="body1">Click on YOUR name below to get into the draft. Don't be a prick.</Typography>
            {buildTournamentDataSortedList().map((teamName) => {
              return (
                <Grid
                  container
                  key={teamName}
                  sx={{
                    margin: "auto",
                    marginTop: "15px",
                    marginBottom: "15px",
                    backgroundColor: "secondary.main",
                    borderRadius: "5px",
                    padding: "10px",
                    maxWidth: "400px",
                  }}
                  onClick={() => handleSelectFriend(teamName)}
                >
                  <Typography variant="h5" sx={{ margin: "auto" }}>
                    {teamName}
                  </Typography>
                </Grid>
              );
            })}
          </Box>
        );
      }
    }
  };

  const getWhoTurnAlertColor = () => {
    if (whosTurn === activeFriend) {
      return "error";
    } else {
      return "success";
    }
  };

  const getNumberOfPicksAway = () => {
    const friends = Object.keys(data.friends);
    const totalPlayers = friends.length;
    const totalPicks = getTotalPickCount();

    const roundNumber = Math.floor(totalPicks / totalPlayers);
    const draftOrder = roundNumber % 2 === 0 ? friends : [...friends].reverse();

    // Find the current position in the draft
    const nextPickIndex = totalPicks % totalPlayers;
    // Determine how far away the active player is from that next pick
    for (let i = 0; i < draftOrder.length; i++) {
      if (draftOrder[(nextPickIndex + i) % totalPlayers] === activeFriend) {
        return i;
      }
    }

    // fallback
    return Infinity;
  };

  const getWhosTurnText = () => {
    if (whosTurn === activeFriend) {
      return "It's YOUR turn!";
    } else {
      const numPicksAway = getNumberOfPicksAway();
      return `It's ${whosTurn}'s turn! You are ${numPicksAway} pick${numPicksAway > 1 ? "s" : ""} away!`;
    }
  };

  const handleWhosTurnClosed = () => {
    setIsWhosTurnOpen(false);
  };

  const handleChangeTeamClicked = () => {
    location.reload();
    window.localStorage.clear();
  };

  const handleSearchTextFocus = () => {
    const playerListTitleEl = document.getElementById("player-list-title");
    scrollToInput(playerListTitleEl);
  };

  const scrollToInput = (inputElement, offset = 80) => {
    // TODO: test if this actually works on mobile.. seems to be decent on ios sim
    setTimeout(() => {
      const rect = inputElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - offset;

      window.scrollTo({
        top: targetY,
        behavior: "smooth",
      });
    }, 300); // Delay gives time for keyboard/layout shifts
  };

  const renderWhosTurn = () => {
    return (
      <Snackbar open={isWhosTurnOpen}>
        <Alert
          icon={false}
          variant="filled"
          color={getWhoTurnAlertColor()}
          sx={{ marginBottom: "10px", width: "100%" }}
          action={
            <IconButton size="small" aria-label="close" onClick={handleWhosTurnClosed}>
              <CloseIcon fontSize="small" sx={{ color: "primary.white" }} />
            </IconButton>
          }
        >
          {getWhosTurnText()}
        </Alert>
      </Snackbar>
    );
  };

  const renderPlayerRoster = (friend) => {
    return (
      <Grid container sx={{ maxWidth: "450px", margin: "auto" }}>
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ color: "secondary.main" }}>
            {activeFriend}'s Roster
          </Typography>
        </Grid>
        {data.friends[friend].map((player, idx) => {
          if (player) {
            return (
              <Grid key={player.name} item xs={4}>
                {renderPlayerImage(player)}
              </Grid>
            );
          } else {
            return (
              <Grid key={`Unk${idx}`} item xs={4} sx={{ color: "secondary.main" }}>
                <Box sx={{ width: "100%", maxWidth: 200, mx: "auto" }}>
                  <Image
                    src={`/golf/ghibli_headshots/unknown.png`}
                    alt="unpicked"
                    width={100}
                    height={100}
                    style={{ width: "90%", height: "auto", borderRadius: "5px", margin: "5px" }}
                  />
                </Box>
              </Grid>
            );
          }
        })}
      </Grid>
    );
  };

  const renderPickHistory = () => {
    return (
      <Accordion
        expanded={isPickHistoryExpanded}
        onChange={handlePickHistoryExpand}
        sx={{ backgroundColor: "primary.main", marginTop: "10px", maxWidth: "450px", margin: "auto" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon color="secondary" />}>
          <Typography>Pick History</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {getPickHistory().map((pickHistoryLine) => {
            return (
              <Typography key={pickHistoryLine} sx={{ textAlign: "left" }}>
                {pickHistoryLine}
              </Typography>
            );
          })}
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderPlayerList = () => {
    return (
      <Grid container sx={{ margin: "auto" }}>
        <Grid xs={12}>
          <Typography variant="h6" sx={{ color: "secondary.main", margin: "10px" }} id="player-list-title">
            Player List
          </Typography>
        </Grid>
        <Grid xs={12}>
          <TextField
            onChange={(event) => handleSearchTextChange(event)}
            onFocus={(event) => handleSearchTextFocus(event)}
            label="Search"
            variant="outlined"
            color="secondary"
            sx={{
              marginBottom: "10px",
              width: "100%",
              maxWidth: "350px",
              "& .MuiInputBase-input": {
                color: "secondary.main", // text color
              },
              "& .MuiInputLabel-root": {
                color: "secondary.main", // label color
              },
              "& .Mui-focused": {
                color: "secondary.main", // label color
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "secondary.main", // default border
                },
                "&:hover fieldset": {
                  borderColor: "secondary.main", // hover border
                },
                "&.Mui-focused fieldset": {
                  borderColor: "secondary.main", // focused border
                },
              },
            }}
          />
        </Grid>

        {searchedPlayers.map((player) => {
          const isPicked = isPlayerAlreadyPicked(player);
          return (
            <Grid
              key={player.name}
              item
              xs={6}
              md={1.5}
              onClick={() => whosTurn === activeFriend && !isPicked && handlePlayerClicked(player)}
            >
              {renderPlayer(player, isPicked)}
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderPlayerImage = (player) => {
    return (
      <Box sx={{ width: "100%", maxWidth: 200, mx: "auto" }}>
        <Image
          src={`/golf/ghibli_headshots/${player.avatar}`}
          alt={player.name}
          width={200}
          height={200}
          style={{ width: "90%", height: "auto", borderRadius: "5px", margin: "5px" }}
        />
      </Box>
    );
  };

  const renderPlayer = (player, isPicked) => {
    return (
      <Paper
        sx={{
          display: "flex",
          justifyContent: "start",
          borderRadius: "5px",
          margin: "10px",
          backgroundColor: "#E4E9ED",
        }}
      >
        <Grid container>
          <Grid item xs={12}>
            {isPicked ? (
              <div style={{ filter: "grayscale(100%)" }}>{renderPlayerImage(player)}</div>
            ) : (
              renderPlayerImage(player)
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="body1"
              sx={
                isPicked
                  ? { textAlign: "left", marginLeft: "10px", color: "#000", textDecoration: "line-through" }
                  : { textAlign: "left", marginLeft: "10px", color: "#000" }
              }
            >
              {player.name}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderAreYouSureDialog = () => {
    return (
      currentlySelectedPlayer !== null && (
        <Dialog
          //   maxWidth="md"
          open={currentlySelectedPlayer !== null}
          keepMounted
          aria-labelledby="are-you-sure-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="are-you-sure-title" sx={{ color: "primary.main" }}>
            Confirmation
          </DialogTitle>
          <DialogContent>
            <DialogContentText component={"div"} id="are-you-sure-description">
              Are you sure you want to pick {currentlySelectedPlayer.name}?
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Image
                  src={`/golf/ghibli_headshots/${currentlySelectedPlayer.avatar}`}
                  alt={currentlySelectedPlayer.name}
                  width={200}
                  height={200}
                  style={{ borderRadius: "5px", marginTop: "10px" }}
                />
              </Box>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handlePlayerSelectCancel}
              variant="outlined"
              color="primary"
              size="large"
              sx={{ width: "100px" }}
            >
              No
            </Button>
            <Button
              onClick={() => {
                handlePlayerSelectConfirmation(currentlySelectedPlayer);
              }}
              variant="contained"
              color="primary"
              size="large"
              sx={{ width: "100px" }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      )
    );
  };

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        padding: "20px 20px 20px 20px",
        backgroundColor: "primary.main",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      {/* <Button variant="contained" onClick={() => setActiveFriend(null)} sx={{ margin: "5px", width: "100%" }}>
        Back
      </Button> */}
      {data && renderTournamentDraftMode()}
      {!isDraftComplete && (
        <>
          {activeFriend && (
            <div className="link">
              <Link href="" onClick={handleChangeTeamClicked}>
                Change Team
              </Link>
            </div>
          )}
          <div className="link">
            <Link href="/golf">Golf Home</Link>
          </div>
        </>
      )}
    </Box>
  );
}

GolfTournament.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
