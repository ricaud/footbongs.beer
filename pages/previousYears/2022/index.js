import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import loserTitle from "./assets/2022-league-loser.gif";
import loserName from "./assets/trent-glitter.gif";
import loser from "./assets/trent-smaller.png";

function img({ src, width, height }) {
  const style = { paddingBottom: `min(350px, ${100 / (width / height)}%)` };
  return (
    <div className={`next-image-wrapper`} style={style}>
      <Image className="next-image" src={src} fill />
    </div>
  );
}

export default function Year2022() {
  return (
    <>
      <Head>
        <title>fOotBoNgS n B3eRbalL</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="center">
        <div>
          <h1 className="tab blink intro">FootBongs and Beerball</h1>
          <Link href="/constitution" className="link">Constitution</Link>
          <Link href="/masters" className="link">Masters</Link>
          <Link href="/" className="link">Home</Link>
        </div>
        <br/>
        <div className="content center">
          <div className="image-container center imageText">
            <Image src={loserTitle} alt="your 2022 league loser" fill className={"image"} />
          </div>
          <div className="image-container center imagePic">
            <Image src={loser} alt="a picture of the league loser" fill className={"image"} />
          </div>
          <div className="image-container center imageText">
            <Image src={loserName} alt="glitter text that says the losers name" fill className={"image"} />
          </div>
        </div>
      </main>
    </>
  );
}
