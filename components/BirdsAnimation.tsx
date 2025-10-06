"use client";

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface BirdsAnimationProps {
  width?: string | number;
  height?: string | number;
  loop?: boolean;
  autoplay?: boolean;
}

export function BirdsAnimation({
  width = 300,
  height = 300,
  loop = true,
  autoplay = true
}: BirdsAnimationProps) {
  return (
    <DotLottieReact
      src="/Birds.lottie"
      loop={loop}
      autoplay={autoplay}
      style={{ width, height }}
    />
  );
}
