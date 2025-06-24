/**
 * ChecklistTime component.
 * Allows users to manage checklist items for the meeting.
 */
import React, { useState } from 'react';
import { CheckSquareIcon, PlusIcon, TrashIcon } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

const ChecklistTime: React.FC = () => {
  // State for checklist items
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', text: 'Review sprint goals', completed: false },
    { id: '2', text: 'Discuss blockers', completed: false },
    { id: '3', text: 'Assign action items', completed: false },
  ]);
  
  // State for new item form
  const [newItemText, setNewItemText] = useState('');
  const [formError, setFormError] = useState('');

  // Handle adding a new item
  const handleAddItem = () => {
    // Validate input
    if (!newItemText.trim()) {
      setFormError('Item text is required');
      return;
    }
    
    // Add new item
    const newItem: ChecklistItem = {
      id: Date.now().toString(), // Simple unique ID
      text: newItemText.trim(),
      completed: false,
    };
    
    setItems([...items, newItem]);
    
    // Reset form
    setNewItemText('');
    setFormError('');
  };
  
  // Handle removing an item
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Handle toggling item completion
  const handleToggleComplete = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // Handle input key press (for Enter key)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddItem();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-[1200px] mx-auto" data-testid="screen-checklist-time">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <CheckSquareIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-700">Checklist Time</h3>
        </div>
      </div>

      {/* Checklist Items */}
      <section className="mb-8" data-testid="checklist-items-section">
        <h4 className="text-md font-medium text-gray-600 mb-2">Current Items</h4>
        
        {items.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">No checklist items added yet. Add your first item below.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map(item => (
              <li 
                key={item.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  item.completed ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-200'
                }`}
                data-testid={`checklist-item-${item.id}`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleComplete(item.id)}
                    className="h-4 w-4 text-primary-medium focus:ring-primary-medium border-gray-300 rounded mr-3"
                    data-testid={`checkbox-item-${item.id}`}
                  />
                  <span className={`font-medium ${
                    item.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                  }`}>
                    {item.text}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200"
                  aria-label="Remove item"
                  data-testid={`remove-item-${item.id}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add New Item Form */}
      <section className="mb-4" data-testid="add-item-section">
        <h4 className="text-md font-medium text-gray-600 mb-2">Add New Item</h4>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="item-text" className="block text-sm font-medium text-gray-700 mb-1">
                Item Text
              </label>
              <input
                id="item-text"
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Enter a new checklist item"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="new-item-text-input"
              />
            </div>
            
            {formError && (
              <p className="text-red-500 text-sm" data-testid="item-form-error">{formError}</p>
            )}
            
            <div>
              <button
                onClick={handleAddItem}
                className="flex items-center px-4 py-2 bg-primary-medium text-white rounded-md hover:bg-primary-secondaryButtonColorHover transition-colors"
                data-testid="add-item-button"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChecklistTime;
