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
  CircularProgress,
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
import { useEffect, useRef, useState } from "react";
import { initializeSearchIndex, searchPlayers } from "../util/searchPlayers";

export default function GolfTournament(props) {
  const isDesktopView = useMediaQuery("(min-width:1024px)");
  const [data, setData] = useState(null);
  const [draftLog, setDraftLog] = useState([]);
  const [searchedPlayers, setSearchedPlayers] = useState(null);
  const [activeDrafter, setActiveDrafter] = useState(null);
  const [whosTurn, setWhosTurn] = useState(null);
  const [isPickHistoryExpanded, setIsPickHistoryExpanded] = useState(false);
  const [isDraftComplete, setIsDraftComplete] = useState(false);
  const [isWhosTurnAlertOpen, setIsWhosTurnAlertOpen] = useState(true);
  const [isLastPickAlertOpen, setIsLastPickAlertOpen] = useState(true);
  const [isPlayerPickConfirmLoading, setIsPlayerPickConfirmLoading] = useState(false);
  const [playerPickConfirmError, setPlayerPickConfirmError] = useState("");
  const [searchText, setSearchText] = useState("");

  // Drafter select - Retard Protection Dialog state
  const [currentlySelectedDrafter, setCurrentlySelectedDrafter] = useState(null);
  const [retardProtectionText, setRetardProtectionText] = useState("");
  const [retardConfirmedError, setRetardConfirmedError] = useState("");

  // Golfer select - Are you sure? Dialog state
  const [currentlySelectedGolfer, setCurrentlySelectedGolfer] = useState(null);

  const prevDraftLogRef = useRef();

  useEffect(() => {
    fetchTournamentData(props.id);
    fetchDraftLog(props.id);
    setInterval(() => {
      refreshTournamentData(props.id);
      fetchDraftLog(props.id);
    }, 5000);
  }, []);

  useEffect(() => {
    if (data) {
      runDraft();
    }
  }, [data]);

  useEffect(() => {
    const prevDraftLog = prevDraftLogRef.current;
    if (prevDraftLog && draftLog.length !== prevDraftLog.length) {
      setIsLastPickAlertOpen(true);
    }

    prevDraftLogRef.current = draftLog;
  }, [draftLog]);

  const fetchTournamentData = (id) => {
    setSearchText("");
    fetch(`/api/draft/getState?tournament=${id}`)
      .then((res) => res.text())
      .then((response) => {
        let draftState = JSON.parse(response);
        setData(draftState);
        initializeSearchIndex(draftState.players);
        setSearchedPlayers(draftState.players);
        const player = window.localStorage.getItem("activeDrafter");
        if (player) {
          setActiveDrafter(player);
        }
      });
  };

  const refreshTournamentData = (id) => {
    fetch(`/api/draft/getState?tournament=${id}`)
      .then((res) => res.text())
      .then((response) => {
        let draftState = JSON.parse(response);
        setData(draftState);
      });
  };

  const fetchDraftLog = (id) => {
    fetch(`/api/draft/draftLog?tournament=${id}`)
      .then((res) => res.text())
      .then((response) => {
        let draftLog = JSON.parse(response);
        setDraftLog(draftLog);
      });
  };

  const postDraftGolfer = (tournamentId, drafter, golfer) => {
    setIsPlayerPickConfirmLoading(true);
    fetch(`/api/draft/draftGolfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tournament: tournamentId,
        drafter: drafter,
        golfer: golfer,
      }),
    })
      .then((res) => res.text())
      .then((response) => {
        // console.log(response);
        const payload = JSON.parse(response);
        if (payload[0].id) {
          // Success response
          setIsPlayerPickConfirmLoading(false);
          setIsWhosTurnAlertOpen(true);
          setCurrentlySelectedGolfer(null);
          fetchTournamentData(props.id);
          fetchDraftLog(props.id);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })
      .catch((e) => {
        console.log(e);
        setPlayerPickConfirmError("UH OH, STINKY");
      });
  };

  const applySearch = (searchedPlayers) => {
    setSearchedPlayers(searchedPlayers);
  };

  const runDraft = () => {
    if (getIsDraftComplete()) return;

    const maxPicks = getCurrentMaxPicks();
    const totalPicks = getTotalPickCount();
    const roundNumber = Math.floor(totalPicks / Object.keys(data.friends).length);
    const friends = Object.keys(data.friends);
    const draftOrder = roundNumber % 2 === 0 ? friends : [...friends].reverse();

    for (const friend of draftOrder) {
      const pickCount = getPickCount(friend);
      if (maxPicks === 0 || pickCount < maxPicks) {
        setWhosTurn(friend);
        return friend;
      }
    }
    // If we get here then it's the first person in the draftOrder's turn
    setWhosTurn(draftOrder[0]);
    return draftOrder[0];
  };

  const getIsDraftComplete = () => {
    for (const friend of Object.keys(data.friends)) {
      let pickCount = getPickCount(friend);
      if (pickCount !== data.teamSize) {
        setIsDraftComplete(false);
        return false;
      }
    }
    setIsDraftComplete(true);
    return true;
  };

  const getCurrentMaxPicks = () => {
    let currentMaxPicks = 0;
    for (const friend of Object.keys(data.friends)) {
      let pickCount = getPickCount(friend);
      if (pickCount > currentMaxPicks) {
        currentMaxPicks = pickCount;
      }
    }
    return currentMaxPicks;
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
      for (const currPlayerName of data.friends[friend]) {
        if (currPlayerName && currPlayerName === player.name) {
          return true;
        }
      }
    }
    return false;
  };

  const getWhoTurnAlertColor = () => {
    if (whosTurn === activeDrafter) {
      return "secondary.red";
    } else {
      return "primary.dark";
    }
  };

  const getNumberOfPicksAway = () => {
    const friends = Object.keys(data.friends);
    const totalPlayers = friends.length;
    const totalPicks = getTotalPickCount();

    // Build the entire upcoming pick sequence until we loop back to the same number of picks as players
    const lookaheadPicks = totalPlayers * 2; // Look ahead 2 full rounds to be safe
    const pickSequence = [];

    for (let i = 0; i < lookaheadPicks; i++) {
      const pickNumber = totalPicks + i;
      const roundNumber = Math.floor(pickNumber / totalPlayers);
      const indexInRound = pickNumber % totalPlayers;

      const draftOrder = roundNumber % 2 === 0 ? friends : [...friends].slice().reverse();
      pickSequence.push(draftOrder[indexInRound]);
    }

    // Now find when the active friend is next in line
    for (let i = 0; i < pickSequence.length; i++) {
      if (pickSequence[i] === activeDrafter) {
        return i;
      }
    }

    return Infinity; // should not happen unless the activeDrafter is missing
  };

  const getWhosTurnText = () => {
    if (whosTurn === activeDrafter) {
      return "It's YOUR turn!";
    } else {
      const numPicksAway = getNumberOfPicksAway();
      return `It's ${whosTurn}'s turn! You are ${numPicksAway} pick${numPicksAway > 1 ? "s" : ""} away!`;
    }
  };

  const getFontSize = (text) => {
    if (!isDesktopView) {
      if (text.length > 20) return "0.7rem";
      if (text.length > 16) return "0.8rem";
    }
    return "1rem";
  };

  const scrollToPlayerList = () => {
    const playerListTitleEl = document.getElementById("player-list-title");
    const rect = playerListTitleEl.getBoundingClientRect();
    const absoluteY = rect.top + window.scrollY;

    // Timeout gives iOS time to settle keyboard shift
    setTimeout(() => {
      window.scrollTo({
        top: absoluteY,
        behavior: "smooth",
      });
    }, 300); // tweak as needed
  };

  const handlePickHistoryExpand = () => {
    setIsPickHistoryExpanded(!isPickHistoryExpanded);
  };

  const handlePlayerClicked = (player) => {
    setCurrentlySelectedGolfer(player);
  };

  const handlePlayerSelectCancel = () => {
    setCurrentlySelectedGolfer(null);
  };

  const handlePlayerSelectConfirmation = (player) => {
    postDraftGolfer(props.id, activeDrafter, player.name);
  };

  const handleSelectDrafter = (teamName) => {
    setCurrentlySelectedDrafter(teamName);
  };

  const handleSelectDrafterConfirm = (teamName) => {
    if (teamName.toUpperCase() !== retardProtectionText) {
      setRetardConfirmedError("Don't make me say it!!!");
    } else {
      setActiveDrafter(teamName);
      window.localStorage.setItem("activeDrafter", teamName);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectDrafterCancel = () => {
    setCurrentlySelectedDrafter(null);
  };

  const handleWhosTurnClosed = () => {
    setIsWhosTurnAlertOpen(false);
  };

  const handleLastPickAlertClosed = () => {
    setIsLastPickAlertOpen(false);
  };

  const handleChangeTeamClicked = () => {
    location.reload();
    window.localStorage.clear();
  };

  const handleSearchTextFocus = () => {
    scrollToPlayerList();
  };

  const handleSearchTextChange = (event) => {
    setSearchText(event.target.value);
    searchPlayers(event.target.value, applySearch);
    scrollToPlayerList();
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
      if (activeDrafter) {
        return (
          <Grid container>
            <Grid item xs={12} md={6}>
              {renderPlayerRoster(activeDrafter)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderPickHistory()}
            </Grid>
            <Grid item xs={12}>
              {renderPlayerList()}
            </Grid>

            {renderLastPickAlert()}
            {renderWhosTurnAlert()}
            {renderGolferSelectAreYouSureDialog()}
          </Grid>
        );
      } else {
        return (
          <Box sx={{ margin: "auto" }}>
            <Typography variant="h4" textAlign="center" sx={{ color: "secondary.main" }}>
              {props.title} Draft
            </Typography>
            <Typography variant="body1">
              Click on YOUR name below to get into the draft. Don&apos;t be a prick.
            </Typography>
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
                  onClick={() => handleSelectDrafter(teamName)}
                >
                  <Typography variant="h5" sx={{ margin: "auto" }}>
                    {teamName}
                  </Typography>
                </Grid>
              );
            })}
            {renderDrafterSelectRetardProtectionDialog()}
          </Box>
        );
      }
    }
  };

  const renderLastPickAlert = () => {
    if (draftLog.length === 0) {
      return;
    }
    const lastPick = draftLog[draftLog.length - 1];
    return (
      <Snackbar open={isLastPickAlertOpen} sx={{ display: "flex", justifyContent: "center" }}>
        <Alert
          icon={false}
          variant="filled"
          sx={{
            marginBottom: "65px",
            width: "350px",
            maxWidth: "100vw",
            backgroundColor: "secondary.main",
            color: "primary.black",
          }}
          action={
            <IconButton size="small" aria-label="close" onClick={handleLastPickAlertClosed}>
              <CloseIcon fontSize="small" sx={{ color: "primary.black" }} />
            </IconButton>
          }
        >
          {`Last Pick: ${lastPick.drafter} picked ${lastPick.golfer}`}
        </Alert>
      </Snackbar>
    );
  };

  const renderWhosTurnAlert = () => {
    return (
      <Snackbar open={isWhosTurnAlertOpen} sx={{ display: "flex", justifyContent: "center" }}>
        <Alert
          icon={false}
          variant="filled"
          sx={{ width: "350px", maxWidth: "100vw", marginBottom: "10px", backgroundColor: getWhoTurnAlertColor() }}
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
            {activeDrafter}&apos;s Roster
          </Typography>
        </Grid>
        {data.friends[friend].map((playerName, idx) => {
          if (playerName) {
            const player = data.players.find((p) => p.name === playerName);
            return (
              <Grid key={playerName} item xs={4}>
                {renderPlayerImage(player)}
              </Grid>
            );
          } else {
            return (
              <Grid key={`Unk${idx}`} item xs={4} sx={{ color: "secondary.main" }}>
                <Box sx={{ width: "100%", maxWidth: 200, mx: "auto" }}>
                  <Image
                    src={`https://masters-ghibli-headshots.s3.us-east-1.amazonaws.com/unknown.png`}
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
    const picksPerRound = Object.keys(data.friends).length; // one pick per drafter per round
    return (
      <Accordion
        expanded={isPickHistoryExpanded}
        onChange={handlePickHistoryExpand}
        sx={{
          backgroundColor: "primary.dark",
          marginTop: "10px",
          maxWidth: "450px",
          margin: "auto",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon color="secondary" />}>
          <Typography>Pick History</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {draftLog.length === 0
            ? <Typography>No picks yet</Typography>
            : draftLog.map((logLine, index) => {
                const isNewRound = index % picksPerRound === 0;
                const roundNumber = Math.floor(index / picksPerRound) + 1;

                return (
                  <div key={logLine.id}>
                    {isNewRound && (
                      <Typography sx={{ fontWeight: "bold", marginTop: index === 0 ? 0 : 2 }}>
                        Round {roundNumber}
                      </Typography>
                    )}
                    <Typography
                      sx={{ textAlign: "left" }}
                    >{`- ${logLine.drafter} picked ${logLine.golfer}`}</Typography>
                  </div>
                );
              })}
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderPlayerList = () => {
    return (
      <Grid container sx={{ margin: "auto" }}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ color: "secondary.main", margin: "10px" }} id="player-list-title">
            Player List
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            value={searchText}
            onChange={(event) => handleSearchTextChange(event)}
            onFocus={() => handleSearchTextFocus()}
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

        {searchedPlayers
          .sort((a, b) => a.last_name.localeCompare(b.last_name))
          .map((player) => {
            const isPicked = isPlayerAlreadyPicked(player);
            return (
              <Grid
                key={player.name}
                item
                xs={6}
                md={1.5}
                onClick={() => whosTurn === activeDrafter && !isPicked && handlePlayerClicked(player)}
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
          src={player.image_url ? player.image_url : `/golf/ghibli_headshots/unknown.png`}
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
          minHeight: "175px",
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
                  ? {
                      textAlign: "left",
                      marginLeft: "10px",
                      color: "#000",
                      textDecoration: "line-through",
                      fontSize: getFontSize(player.name),
                    }
                  : { textAlign: "left", marginLeft: "10px", color: "#000", fontSize: getFontSize(player.name) }
              }
            >
              {player.name}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderDrafterSelectRetardProtectionDialog = () => {
    return (
      currentlySelectedDrafter !== null && (
        <Dialog
          open={currentlySelectedDrafter !== null}
          keepMounted
          aria-labelledby="are-you-sure-retard-title"
          aria-describedby="are-you-sure-retard-description"
          PaperProps={{
            sx: {
              marginTop: "20px",
              alignSelf: "flex-start",
            },
          }}
        >
          <DialogTitle id="are-you-sure-retard-title" sx={{ color: "primary.main" }}>
            Confirmation
          </DialogTitle>
          <DialogContent>
            <DialogContentText component={"div"} id="are-you-sure-retard-description">
              Are you sure you want to draft as {currentlySelectedDrafter}?
              <Box sx={{ display: "flex", justifyContent: "center" }}>PROVE IT. Write your name in this box:</Box>
              <TextField
                value={retardProtectionText}
                onChange={(event) => setRetardProtectionText(event.target.value.toUpperCase())}
                label="YOUR NAME HERE"
                variant="outlined"
                color="primary"
                sx={{
                  marginTop: "10px",
                  width: "100%",
                  maxWidth: "350px",
                  "& .MuiInputBase-input": {
                    color: "primary.main", // text color
                  },
                  "& .MuiInputLabel-root": {
                    color: "primary.main", // label color
                  },
                  "& .Mui-focused": {
                    color: "primary.main", // label color
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "primary.main", // default border
                    },
                    "&:hover fieldset": {
                      borderColor: "primary.main", // hover border
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main", // focused border
                    },
                  },
                }}
              />
              {retardConfirmedError !== "" && (
                <Alert variant="filled" severity="error" sx={{ marginTop: "10px" }}>
                  {retardConfirmedError}
                </Alert>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleSelectDrafterCancel}
              variant="outlined"
              color="primary"
              size="large"
              sx={{ width: "100px" }}
            >
              No
            </Button>
            <Button
              onClick={() => {
                handleSelectDrafterConfirm(currentlySelectedDrafter);
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

  const renderGolferSelectAreYouSureDialog = () => {
    return (
      currentlySelectedGolfer !== null && (
        <Dialog
          open={currentlySelectedGolfer !== null}
          keepMounted
          aria-labelledby="are-you-sure-title"
          aria-describedby="alert-dialog-slide-description"
          PaperProps={{
            sx: {
              marginTop: "20px",
              alignSelf: "flex-start",
            },
          }}
        >
          <DialogTitle id="are-you-sure-title" sx={{ color: "primary.main" }}>
            Confirmation
          </DialogTitle>
          <DialogContent>
            <DialogContentText component={"div"} id="are-you-sure-description">
              Are you sure you want to pick {currentlySelectedGolfer.name}?
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Image
                  src={
                    currentlySelectedGolfer.image_url
                      ? currentlySelectedGolfer.image_url
                      : `/golf/ghibli_headshots/unknown.png`
                  }
                  alt={currentlySelectedGolfer.name}
                  width={200}
                  height={200}
                  style={{ borderRadius: "5px", marginTop: "10px" }}
                />
              </Box>
              {playerPickConfirmError !== "" && (
                <Alert variant="filled" severity="error" sx={{ margin: "10px" }}>
                  {playerPickConfirmError}
                </Alert>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={isPlayerPickConfirmLoading ? undefined : handlePlayerSelectCancel}
              variant="outlined"
              color="primary"
              size="large"
              sx={{ width: "100px" }}
            >
              No
            </Button>
            <Button
              onClick={
                isPlayerPickConfirmLoading
                  ? undefined
                  : () => {
                      handlePlayerSelectConfirmation(currentlySelectedGolfer);
                    }
              }
              variant="contained"
              color="primary"
              size="large"
              sx={{ width: "100px" }}
            >
              {isPlayerPickConfirmLoading ? <CircularProgress size="26px" color="secondary" /> : "Yes"}
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
      {data && renderTournamentDraftMode()}
      {!isDraftComplete && (
        <>
          {activeDrafter && (
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
      <Box height="100px"></Box>
    </Box>
  );
}

GolfTournament.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
