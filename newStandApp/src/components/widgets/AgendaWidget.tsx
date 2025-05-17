import React, { useState } from 'react';
import { ListIcon, CheckIcon, PlusIcon } from 'lucide-react';

const AgendaWidget: React.FC = () => {
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
    <div className="h-full flex flex-col" data-testid="layout-component-agenda">
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
              <button
                onClick={() => toggleItem(item.id)}
                className={`h-4 w-4 mr-2 rounded flex items-center justify-center ${
                  item.checked ? 'bg-[#4a9fff]' : 'border border-gray-300'
                }`}
              >
                {item.checked && <CheckIcon className="h-3 w-3 text-white" />}
              </button>
              <span 
                className={`text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
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
          placeholder="Add agenda item..."
          className="flex-grow p-2 text-sm border border-gray-200 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#4a9fff]"
        />
        <button
          onClick={addNewItem}
          className="px-2 bg-[#4a9fff] text-white rounded-r-md hover:bg-[#3a8fee]"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AgendaWidget;
