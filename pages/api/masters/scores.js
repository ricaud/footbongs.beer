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
            if (player.childNodes.length >= 6) {
              const position = player.childNodes[1].text;
              const name = player.childNodes[3].text;
              const totalScore = parseInt(player.childNodes[11].text)
              const score = parseInt(getPlayerScore(player.childNodes[4].text, totalScore));
              const scoreString = getScoreString(player.childNodes[4].text, score);
              const todayScore = parseInt(getPlayerScore(player.childNodes[5].text));
              const thru = player.childNodes[6].text;
              
              data.push({
                position: position,
                name: name,
                score: score,
                scoreString: scoreString,
                todayScore: todayScore,
                thru: thru,
              });
            }
          } 
  
          res.status(200).end(JSON.stringify(data))
          resolve()
      }).catch((reason) => console.log(reason));
    })
}

const getPlayerScore = (scoreString, totalScore) => {
    if (scoreString === "-") {
      return 0;
    } else if (scoreString === "E") {
      return 0;
    } else if (scoreString === "CUT"){
      return totalScore - 144; //144 = par after 2 rounds
    } else {
      return scoreString;
    }
  };

  const getScoreString = (scoreString, score) => {
    if (scoreString === "CUT") {
      return scoreString +" (+" + score + ")";
    } else {
      return scoreString;
    }
  }