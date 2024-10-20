import React from 'react';
import { EventBus } from '../app/gamebuilder/EventBus';

const AddNodeButton = () => {
  const handleAddNode = () => {
    console.log('Add Node button clicked.'); // Debug log
    EventBus.emit('add-node'); // Emit the event to add a node
  };

  return <button onClick={handleAddNode}>Add Node</button>;
};

export default AddNodeButton;
