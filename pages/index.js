import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import loserTitle from "../public/2022-league-loser.gif";
import loserName from "../public/trent-glitter.gif";
import loser from "../public/trent-smaller.png";

function img({ src, width, height }) {
  const style = { paddingBottom: `min(350px, ${100 / (width / height)}%)` };
  return (
    <div className={`next-image-wrapper`} style={style}>
      <Image className="next-image" src={src} fill />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>fOotBoNgS n B3eRbalL</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="center">
        <div>
          <h1 className="tab blink intro">FootBongs and Beerball</h1>
        </div>
        <div className="content center">
          <div className="image-container center imageText">
            <Image src={loserTitle} alt="your 2022 league loser" fill className={"image"} />
          </div>
          <div className="image-container center imagePic">
            <Image src={loser} alt="a picture of the league loser (trent)" fill className={"image"} />
          </div>
          <div className="image-container center imageText">
            <Image src={loserName} alt="glitter text that says trent bailey" fill className={"image"} />
          </div>
          <Link href="/constitution" className="link">Constitution</Link>
        </div>
      </main>
    </>
  );
}

/*
x<div className="image-container center">
              <Image
                src={loserTitle}
                alt='your 2022 league loser'
                fill
                className={'image'}
              />
            </div>
            <div className="image-container center">
              <Image
                src={loser}
                alt='a picture of the league loser (trent)'
                fill
                className={'image'}
              />
            </div>
            <div className="image-container center">
              <Image
                src={loserName}
                alt='glitter text that says trent bailey'
                fill
                className={'image'}
              />
            </div>
            */
