import { useEffect } from 'react';

const soundFiles = [
  './halo-sounds/bongtacular.mp3',
'./halo-sounds/Bongtrocity.mp3',
'./halo-sounds/bing-bong.mp3',
'./halo-sounds/bonging-riot-2.mp3',
'./halo-sounds/bonging-riot.mp3',
'./halo-sounds/capture-the-bong.mp3',
'./halo-sounds/play-bong.mp3',
'./halo-sounds/Bongamanjaro.mp3',
'./halo-sounds/bonging-spree-2.mp3',
'./halo-sounds/bongpocalypse.mp3',
'./halo-sounds/bongtastrophy.mp3',
'./halo-sounds/tripple-bong.mp3',
'./halo-sounds/bong-armed.mp3',
'./halo-sounds/bonging-spree-3.mp3',
'./halo-sounds/bonging-frenzy.mp3',
'./halo-sounds/bong-stolen.mp3',
'./halo-sounds/over-bong.mp3',
'./halo-sounds/bongionare.mp3',
'./halo-sounds/bonging-spree-1.mp3',
'./halo-sounds/double-bong.mp3',
'./halo-sounds/sunday-bonger.mp3'
];

const Home = () => {
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play();
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Soundboard</h1>
      <div>
        {soundFiles.map((sound, index) => (
          <button
            key={index}
            onClick={() => playSound(sound)}
            style={{
              margin: '10px',
              padding: '10px 20px',
              fontSize: '16px',
            }}
          >
            Sound {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;