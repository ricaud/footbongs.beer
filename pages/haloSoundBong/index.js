import React, { useState } from 'react';
import Link from "next/link";
import styles from './HaloUI.module.css';

export async function getStaticProps() {
  try {
    const path = require('path');
    const fs = require('fs/promises');
    
    const soundsDirectory = path.join(process.cwd(), 'public/halo-sounds');
    const fileNames = await fs.readdir(soundsDirectory);
    const soundFiles = fileNames
      .filter(file => file.toLowerCase().endsWith('.mp3'))
      .map(file => ({
        name: file.replace('.mp3', ''),
        path: `/halo-sounds/${file}`
      }));

    return {
      props: {
        soundFiles
      }
    };
  } catch (error) {
    console.error('Error reading sound directory:', error);
    return {
      props: {
        soundFiles: []
      }
    };
  }
}

export default function SoundGrid({ soundFiles }) {
  const [lastPlayed, setLastPlayed] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSound = (soundPath, soundName) => {
    if (isPlaying) return;
    setIsPlaying(true);
    const audio = new Audio(soundPath);
    
    audio.onended = () => {
      setIsPlaying(false);
    };

    audio.play();
    setLastPlayed(soundName);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>UNSC Bong Board</h1>
      
      {lastPlayed && (
        <p className={styles.status}>
          Last played: {lastPlayed}
        </p>
      )}

      <div className={styles.grid}>
        {soundFiles.map(({ name, path }) => (
          <button
            key={path}
            onClick={() => playSound(path, name)}
            disabled={isPlaying}
            className={`${styles.button} ${lastPlayed === name ? styles.playing : ''}`}
          >
            {name.split('-').join(' ')}
          </button>
        ))}
      </div>

      {soundFiles.length === 0 && (
        <p className={styles.status}>
          No sound files detected in database
        </p>
      )}
      <div className="center">
          <Link href="/">Home</Link>
          <Link href="/halo-bong-audio.zip" className={styles.halolink} download="halo-bong-audio">Download Sounds</Link>
      </div>
    </div>
  );
}