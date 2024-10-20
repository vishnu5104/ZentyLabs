import React from 'react';

import SavePlayerButton from './SavePlayer';
import SaveMainMenuButton from './SaveMainMenuButton';
import AddplayerButton from './AddplayerButton';
import ViewGame from './ViewPublishedGame';

const RightSideBar = () => {
  return (
    <div className="flex gap-[30px]">
      <AddplayerButton />

      <SavePlayerButton />
      <SaveMainMenuButton />
      <ViewGame />
    </div>
  );
};

export default RightSideBar;
