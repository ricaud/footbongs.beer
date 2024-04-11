// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import HTMLParser from "node-html-parser";
import fetch from 'node-fetch';

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

export default function handler(req, res) {
    let data = {};

    console.log("Fetching scores from ESPN...");

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

          console.log(data[name])

        } 

        console.log("==========")
        console.log(JSON.stringify(data))


    });

    res.status(200).json(data)
}


const getPlayerScore = (scoreString) => {
    if (scoreString === "-") {
      return 0;
    } else if (scoreString === "E") {
      return 0;
    } else {
      return scoreString;
    }
  };