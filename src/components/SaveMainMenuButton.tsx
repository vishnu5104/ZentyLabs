import { EventBus } from '../app/gamebuilder/EventBus'; // Adjust the path to your EventBus

const SaveMainMenuButton = () => {
  const handleSaveMainMenu = () => {
    EventBus.emit('save-main-menu'); // Emit save-main-menu event
  };

  return <button onClick={handleSaveMainMenu}>Save Main Menu</button>;
};

export default SaveMainMenuButton;
