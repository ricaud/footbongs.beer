import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>fOotBoNgS n B3eRbalL</title>
      </Head>
      <body class="center bg2 max">
        <div id="main">
        <h1 class="tab blink intro">FootBongs and Beerball</h1>

        <Image
          src="/2022-league-loser.gif"
          width={650}
          height={150}
          priority
        />
        <br></br>
        <Image
          src="/trent.png"
          width={600}
          height={700}
          priority
        />
        <br></br>
        <Image
          src="/trent-glitter.gif"
          width={650}
          height={150}
          priority
        />
        
      </div>
      </body>
    </>
  )
}
