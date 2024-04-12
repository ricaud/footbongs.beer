// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import HTMLParser from "node-html-parser";
import fetch from 'node-fetch';


export default async function handler(req, res) {
    return new Promise((resolve) => {
      let data = []
      fetch("https://www.espn.com/golf/leaderboard")
        .then((httpResponse) => httpResponse.text())
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
            data.push({
              position: position,
              name: name,
              score: score,
              scoreString: scoreString,
              todayScore: todayScore,
              thru: thru,
            });
          } 
  
          res.status(200).end(JSON.stringify(data))
          resolve()
      }).catch((reason) => console.log(reason));
    })
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