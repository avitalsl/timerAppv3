import React, { useState } from 'react';
import { ListIcon, CheckIcon, PlusIcon } from 'lucide-react';
import Checkbox from '../Checkbox';

interface AgendaWidgetProps {
  mode?: "setup" | "meeting";
}

const AgendaWidget: React.FC<AgendaWidgetProps> = ({ mode = "setup" }) => {
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
              <span className="text-4xl text-primary-light mr-2">•</span>
              <span 
                className={`text-sm pl-2 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
              >
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>


    </div>
  );
};

export default AgendaWidget;
