import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <Head>
        <title>fOotBoNgS n B3eRbalL</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="center max">
          <div id="main">
          <h1 className="tab blink intro">FootBongs and Beerball</h1>

          <Image
            src="/2022-league-loser.gif"
            alt='your 2022 league loser'
            width={650}
            height={150}
            priority
          />
          <br></br>
          <Image
            src="/trent.png"
            alt='a picture of the league loser (trent)'
            width={600}
            height={700}
            priority
          />
          <br></br>
          <Image
            src="/trent-glitter.gif"
            alt='glitter text that says trent bailey'
            width={650}
            height={150}
            priority
          />
          
        </div>
      </main>
    </>
  )
}
