import React from 'react';

import SavePlayerButton from './SavePlayer';
import SaveMainMenuButton from './SaveMainMenuButton';
import AddplayerButton from './AddplayerButton';

const RightSideBar = () => {
  return (
    <div>
      <AddplayerButton />

      <SavePlayerButton />
      <SaveMainMenuButton />
    </div>
  );
};

export default RightSideBar;
