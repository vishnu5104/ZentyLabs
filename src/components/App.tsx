'use client';
import React from 'react';
import { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from '@/app/gamebuilder/PhaserGame';
import LeftSideBar from './LeftSideBar';
import RightSideBar from './RightSideBar';

const App = () => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  return (
    <div id="app">
      <LeftSideBar />
      <PhaserGame ref={phaserRef} />
      <RightSideBar />
    </div>
  );
};

export default App;
