import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import loserTitle from "../public/2024/2024-FB-B-LOOOOOSSSEEERRR.gif";
import loserSubTitle from "../public/2024/TWO-TIME-LOSER.gif";
import loserName from "../public/2024/KYLE-PECOT.gif";
import loser from "../public/2024/kyle-rice-hat.png";

import footbongsAndBeerBallAnthem from "../public/footbongs-and-beerball.mp3";
import { useEffect } from "react";

function play() {
  var audio = document.getElementById("audioPlayer");
  audio.play();
}

function pause() {
  var audio = document.getElementById("audioPlayer");
  audio.pause();
}

export default function Home() {
  useEffect(() => {
    play();
  }, []);

  return (
    <>
      <Head>
        <title>fOotBoNgS n B3eRbalL</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="center top">
        <audio
          id="audioPlayer"
          src={footbongsAndBeerBallAnthem}
          autoPlay
        ></audio>
        <div className="header center">
          <div className="center">
            <button className="play" onClick={play}>
              Play
            </button>
            <button className="pause" onClick={pause}>
              Pause
            </button>
          </div>
          <h1 className="tab blink intro">FootBongs and Beerball</h1>
          <div className="navLinks center">
            <div>
              <Link href="/" className="link">
                Home
              </Link>
            </div>
            <div>
              <Link href="/constitution" className="link">
                Constitution
              </Link>
            </div>
            <div>
              <Link href="/previousYears/2022" className="link">
                2022 Loser (Trent)
              </Link>
            </div>
            <div>
              <Link href="/previousYears/2023" className="link">
                2023 Loser (Kyle)
              </Link>
            </div>
            <div>
              <Link href="/golf" className="link">
                Golf
              </Link>
            </div>
            <div>
              <Link href="/haloSoundBong" className="link">
                Halo Soundboard
              </Link>
            </div>
          </div>
        </div>
        <br />
        <div className="content center">
          <div className="image-container center imageText">
            <Image
              src={loserTitle}
              alt="your 2022 league loser"
              className={"image"}
              width={500}
              height={100}
            />
          </div>
          <div className="image-containers center imageText">
            <Image
              src={loserSubTitle}
              alt="two time lozer!!"
              className={"image"}
              width={200}
            />
          </div>
          <div className="image-container center imagePic rotate">
            <Image
              src={loser}
              alt="a picture of the league loser"
              className={"image"}
              width={500}
            />
          </div>
          <div className="image-container center imageText">
            <Image
              src={loserName}
              alt="glitter text that says the losers name"
              className={"image"}
              width={400}
            />
          </div>
        </div>

        <div class="snowflakes" aria-hidden="true">
          <div class="snowflake">
            <div class="inner">🌭</div>
          </div>
          <div class="snowflake">
            <div class="inner">🌭</div>
          </div>
          <div class="snowflake">
            <div class="inner">🌭</div>
          </div>
          <div class="snowflake">
            <div class="inner">🌭</div>
          </div>
          <div class="snowflake">
            <div class="inner">🌭</div>
          </div>
          <div class="snowflake">
            <div class="inner">🌭</div>
          </div>
          <div class="snowflake">
            <div class="inner">🌭</div>
          </div>
          <div class="snowflake">
            <div class="inner">🌭</div>
          </div>
          <div class="snowflake">
            <div class="inner">🌭</div>
          </div>
          <div class="snowflake">
            <div class="inner">🌭</div>
          </div>
          <div class="snowflake">
            <div class="inner">🌭</div>
          </div>
          <div class="snowflake">
            <div class="inner">🌭</div>
          </div>
        </div>
      </main>
    </>
  );
}
