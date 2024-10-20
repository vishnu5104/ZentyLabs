import { EventBus } from '../app/gamebuilder/EventBus'; // Adjust the path to your EventBus

const SaveMainMenuButton = () => {
  const handleSaveMainMenu = () => {
    EventBus.emit('save-main-menu'); // Emit save-main-menu event
  };

  return <button onClick={handleSaveMainMenu}>Add NFT to Play</button>;
};

export default SaveMainMenuButton;
