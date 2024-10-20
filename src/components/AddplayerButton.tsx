// components/AddplayerButton.tsx
'use client'; // Ensure this runs on the client side

import { EventBus } from '../app/gamebuilder/EventBus'; // Import EventBus

export default function AddplayerButton() {
  const handleClick = () => {
    // Emit an event to add the player
    EventBus.emit('add-player');
  };

  return <button onClick={handleClick}>Add player</button>;
}
