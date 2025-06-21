import React, { useState } from 'react';
import { ListIcon, PlusIcon } from 'lucide-react';
import Checkbox from '../Checkbox';

interface AgendaWidgetProps {
  mode?: "setup" | "meeting";
}

const AgendaWidget: React.FC<AgendaWidgetProps> = ({ mode = "setup" }) => {
  // Using mode to set a conditional class for different style in meeting vs setup
  const containerClass = mode === "meeting" ? "h-full flex flex-col meeting-mode" : "h-full flex flex-col setup-mode";
  
  const [items, setItems] = useState([
    { id: 1, text: 'Review sprint progress', checked: true },
    { id: 2, text: 'Discuss blockers', checked: false },
    { id: 3, text: 'Plan next sprint', checked: false }
  ]);
  const [newItemText, setNewItemText] = useState('');

  const toggleItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addNewItem = () => {
    if (newItemText.trim()) {
      setItems([
        ...items, 
        { 
          id: Math.max(...items.map(i => i.id), 0) + 1, 
          text: newItemText, 
          checked: false 
        }
      ]);
      setNewItemText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addNewItem();
    }
  };

  return (
    <div className={containerClass} data-testid="layout-component-agenda">
      <div className="flex items-center mb-3">
        <ListIcon className="h-4 w-4 text-gray-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-700">Meeting Agenda</h3>
      </div>
      
      <div className="flex-grow overflow-auto">
        <ul className="space-y-2">
          {items.map(item => (
            <li 
              key={item.id}
              className="flex items-center p-2 bg-gray-50 rounded-md"
            >
              <Checkbox
                checked={item.checked}
                onChange={() => toggleItem(item.id)}
                className="mr-2"
                aria-label={item.checked ? 'Mark as incomplete' : 'Mark as complete'}
              />
              <span 
                className={`text-sm pl-2 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
              >
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add new agenda item..."
          className="flex-grow p-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          data-testid="add-agenda-item-input"
        />
        <button
          onClick={addNewItem}
          className="px-3 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-700"
          data-testid="add-agenda-item-button"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AgendaWidget;
