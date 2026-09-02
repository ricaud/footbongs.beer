import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import loserTitle from "../public/2025/2025-LOSER-THIS-GUY-STINKS.gif";
import loserName from "../public/2025/2025-BROOKS-DA-BIG-RIG-DANAHY.gif";
import loser from "../public/2025/brooks-x-venom.gif";

import footbongsAndBeerBallAnthem from "../public/footbongs-and-beerball.mp3";
import { useEffect } from "react";
import styles from "./index.module.css";

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
      <main className={`center top ${styles.top} ${styles.homePageMain}`}>
        <audio
          id="audioPlayer"
          src={footbongsAndBeerBallAnthem}
          autoPlay
        ></audio>
        <div className={`header center ${styles.header}`}>
          <div className="center">
            <button className="play" onClick={play}>
              Play
            </button>
            <button className="pause" onClick={pause}>
              Pause
            </button>
          </div>
          <h1 className="blink intro center">FootBongs and Beerball</h1>
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
              <Link href="/previousYears/2024" className="link">
                2024 Loser (Kyle)
              </Link>
            </div>
            <div>
              <Link href="/golf" className="link">
                Golf
              </Link>
            </div>
            <div>
              <Link href="/stonks" className="link">
                Stonks
              </Link>
            </div>
            <div>
              <Link href="/haloSoundBong" className="link">
                Halo Soundboard
              </Link>
            </div>
          </div>
        </div>
        <div className={`image-container center imagePic ${styles.imagePic}`}>
          <br />
          <Image
            src={loser}
            alt="a picture of the league loser"
            className={`image ${styles.imagePicFill}`}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <br />
        <div className={`content center ${styles.content}`}>
        <br />
        <br />
        <br />
        <br />
          <div className={`image-container center imageText ${styles.imageText}`}>
            <Image
              src={loserTitle}
              alt="your 2025 league loser"
              className={"image"}
            />
          </div>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <div className={`image-container center imageText ${styles.imageText}`}>
            <Image
              src={loserName}
              alt="glitter text that says the losers name"
              className={"image"}
            />
          </div>
        </div>

        <div className="snowflakes" aria-hidden="true">
          <div className="snowflake">
            <div className="inner">🍌</div>
          </div>
          <div className="snowflake">
            <div className="inner">🍌</div>
          </div>
          <div className="snowflake">
            <div className="inner">🍌</div>
          </div>
          <div className="snowflake">
            <div className="inner">🍌</div>
          </div>
          <div className="snowflake">
            <div className="inner">🍌</div>
          </div>
          <div className="snowflake">
            <div className="inner">🍌</div>
          </div>
          <div className="snowflake">
            <div className="inner">🍌</div>
          </div>
          <div className="snowflake">
            <div className="inner">🍌</div>
          </div>
          <div className="snowflake">
            <div className="inner">🍌</div>
          </div>
          <div className="snowflake">
            <div className="inner">🍌</div>
          </div>
          <div className="snowflake">
            <div className="inner">🍌</div>
          </div>
          <div className="snowflake">
            <div className="inner">🍌</div>
          </div>
        </div>
      </main>
    </>
  );
}
