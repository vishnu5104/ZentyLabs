import { EventBus } from '../app/gamebuilder/EventBus'; // Adjust the path to your EventBus

const SavePlayerButton = () => {
  const handleSave = () => {
    EventBus.emit('save'); // Emit save-player event
  };

  return <button onClick={handleSave}>Save Player Position</button>;
};

export default SavePlayerButton;
