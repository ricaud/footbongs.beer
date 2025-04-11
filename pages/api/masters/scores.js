// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fetch from "node-fetch";
import HTMLParser from "node-html-parser";
import { getState } from "../draft/getState";

const PLAYER_HEADER = "PLAYER";
const TEE_TIME_HEADER = "TEE TIME";
const TOTAL_SCORE_HEADER = "TOT";
const SCORE_HEADER = "SCORE";
const POSITION_HEADER = "POS";
const TODAY_SCORE_HEADER = "TODAY";
const THRU_HEADER = "THRU";

export default async function handler(req, res) {
  const tournamentData = await getTournamentData(req.query.id);
  return new Promise((resolve) => {
    let data = {
      players: Object.fromEntries(tournamentData.players.map((player) => [player.name, player])),
    };
    fetch(tournamentData.url)
      .then((httpResponse) => httpResponse.text())
      .then((response) => {
        let root = HTMLParser.parse(response);

        let par = getPar(root);
        let tableHeader = root.querySelector("thead");
        let tableBody = root.querySelector("tbody");

        let tableHeaderColumnList = [];
        if (tableHeader) {
          if (tableHeader?.childNodes.length > 0) {
            const tableHeaderRow = tableHeader.childNodes[0];
            for (const tableHeaderColumn of tableHeaderRow.childNodes) {
              tableHeaderColumnList.push(tableHeaderColumn.text.toUpperCase());
            }
          }
        }

        if (tableBody) {
          for (const playerRow of tableBody.childNodes) {
            try {
              if (playerRow) {
                const playerName = getCellValue(tableHeaderColumnList, playerRow, PLAYER_HEADER);
                if (playerName) {
                  const playerData = {};
                  playerData.name = playerName;
                  playerData.teeTime = getCellValue(tableHeaderColumnList, playerRow, TEE_TIME_HEADER);
                  playerData.totalScoreString = getCellValue(tableHeaderColumnList, playerRow, TOTAL_SCORE_HEADER);
                  playerData.totalScore = playerData.totalScoreString ? parseInt(playerData.totalScoreString) : null;
                  const scoreString = getCellValue(tableHeaderColumnList, playerRow, SCORE_HEADER);
                  playerData.score = scoreString
                    ? parseInt(getPlayerScore(par, scoreString, playerData.totalScore))
                    : null;
                  playerData.scoreString = getScoreString(scoreString, playerData.score);
                  playerData.position = getCellValue(tableHeaderColumnList, playerRow, POSITION_HEADER);
                  playerData.todayScore = getCellValue(tableHeaderColumnList, playerRow, TODAY_SCORE_HEADER);
                  playerData.thru = getCellValue(tableHeaderColumnList, playerRow, THRU_HEADER);

                  data.players[playerName] = { ...data.players[playerName], ...playerData };
                }
              }
            } catch (e) {
              console.error(e);
            }
          }
        }

        data.url = tournamentData.url;
        data.friends = tournamentData.friends;
        res.status(200).end(JSON.stringify(data));
        resolve();
      })
      .catch((reason) => console.log(reason));
  });
}

const getCellValue = (tableHeaderColumnList, row, headerName) => {
  if (tableHeaderColumnList.includes(headerName)) {
    const columnIdx = tableHeaderColumnList.findIndex((header) => header === headerName);
    if (row.childNodes.length - 1 >= columnIdx) {
      const cellValue = row.childNodes[columnIdx].text;
      return cellValue;
    }
  }
  return null;
};

const getPar = (root) => {
  const parElement = root.querySelector("span.label");
  if (parElement && parElement.text.trim() === "Par") {
    const parValue = parElement.nextSibling.rawText.trim();
    return parseInt(parValue);
  }
  throw Error("Par not found");
};

const getTournamentData = async (id) => {
  const draftState = await getState(id);
  return draftState;
};

const getPlayerScore = (par, scoreString, totalScore) => {
  if (scoreString === "-") {
    return 0;
  } else if (scoreString === "E") {
    return 0;
  } else if (scoreString === "CUT") {
    return totalScore - par * 2;
  } else {
    return scoreString;
  }
};

const getScoreString = (scoreString, score) => {
  if (scoreString === "CUT") {
    return scoreString + " (+" + score + ")";
  } else {
    return scoreString;
  }
};
