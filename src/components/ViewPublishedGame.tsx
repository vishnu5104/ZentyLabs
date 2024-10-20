import React from 'react';
import { useRouter } from 'next/navigation';
const ViewGame = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        router.push('/cubegame');
      }}
    >
      View Published Game
    </button>
  );
};

export default ViewGame;
