"use client";

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export function BirdsAnimation() {
  const [animationData, setAnimationData] = useState(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    // Load the Birds.json animation data
    fetch('/Birds.json')
      .then(res => res.json())
      .then(data => {
        console.log('Birds animation loaded');
        setAnimationData(data);
      })
      .catch(err => console.error('Failed to load Birds.json:', err));

    // Start animation after 10 seconds
    const timer = setTimeout(() => {
      setShouldPlay(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!animationData || !shouldPlay) return null;

  return (
    <div
      className="birds-fly-animation"
      style={{
        position: 'fixed',
        top: '2rem',
        right: 0,
        zIndex: 50,
        width: '400px',
        height: '400px',
        opacity: 0.9,
        pointerEvents: 'none',
        filter: 'brightness(0) saturate(100%) invert(29%) sepia(99%) saturate(7469%) hue-rotate(356deg) brightness(101%) contrast(97%)'
      }}
    >
      <Lottie
        animationData={animationData}
        loop={false}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
