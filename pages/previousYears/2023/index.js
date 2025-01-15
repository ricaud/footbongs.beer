import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import loserTitle from "../../../public/2023/FBandB-2023-LOOOSSEERRR.gif";
import loserName from "../../../public/2023/kyle-text.gif";
import loser from "../../../public/2023/kyle-teletubby.png";

import footbongsAndBeerBallAnthem from "../../../public/footbongs-and-beerball.mp3";
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
        <div className="center audioControls">
          <button class="play" onClick={play}>
            Play
          </button>
          <button class="pause" onClick={pause}>
            Pause
          </button>
        </div>
        <div className="header center">
          <h1 className="tab blink intro">FootBongs and Beerball</h1>
          <div className="navLinks">
            <Link href="/" className="link">
              Home
            </Link>
            <Link href="/constitution" className="link">
              Constitution
            </Link>
            <Link href="/previousYears/2022" className="link">
              2022 Loser (Trent)
            </Link>
            <Link href="/golf" className="link">
              Golf
            </Link>
            <Link href="/haloSoundBong" className="link">
              Halo Soundboard
            </Link>
          </div>
        </div>
        <br />
        <div className="content-2023 center">
          <div className="image-continaer center imageText">
            <Image
              src={loserTitle}
              alt="your 2022 league loser"
              fill
              className={"image"}
            />
          </div>
          <div className="image-continaer center imagePic">
            <Image
              src={loser}
              alt="a picture of the league loser"
              fill
              className={"image"}
            />
          </div>
          <div className="image-continaer center imageText">
            <Image
              src={loserName}
              alt="glitter text that says the losers name"
              fill
              className={"image"}
            />
          </div>
        </div>
      </main>
    </>
  );
}
