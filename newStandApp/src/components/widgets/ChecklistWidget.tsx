import React, { useState } from 'react';
import { CheckSquareIcon, CheckIcon } from 'lucide-react';

interface ChecklistWidgetProps {
  mode?: "setup" | "meeting";
}

const ChecklistWidget: React.FC<ChecklistWidgetProps> = ({ mode = "setup" }) => {
  const [items, setItems] = useState([
    { id: 1, text: 'Is everyone present?', checked: false },
    { id: 2, text: 'Are there any urgent issues to discuss?', checked: false },
    { id: 3, text: 'Has the agenda been reviewed?', checked: false },
    { id: 4, text: 'Are all necessary documents prepared?', checked: false }
  ]);

  const toggleItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const allChecked = items.every(item => item.checked);

  return (
    <div className="h-full flex flex-col" data-testid="layout-component-checklist">
      <div className="flex items-center mb-3">
        <CheckSquareIcon className="h-4 w-4 text-gray-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-700">Pre-Meeting Checklist</h3>
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
                className={`h-5 w-5 mr-2 rounded flex items-center justify-center ${
                  item.checked ? 'bg-[#4a9fff]' : 'border border-gray-300'
                }`}
                aria-label={item.checked ? "Mark as incomplete" : "Mark as complete"}
              >
                {item.checked && <CheckIcon className="h-3 w-3 text-white" />}
              </button>
              <span className="text-sm text-gray-700">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {allChecked && (
        <div className="mt-3 p-2 bg-green-50 text-green-700 text-sm rounded-md border border-green-100">
          All checklist items are complete. Ready to start the meeting!
        </div>
      )}
    </div>
  );
};

export default ChecklistWidget;
