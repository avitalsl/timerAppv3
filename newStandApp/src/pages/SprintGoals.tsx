/**
 * SprintGoals component.
 * Allows users to manage sprint goals for the meeting.
 */
import React, { useState } from 'react';
import { TargetIcon, PlusIcon, TrashIcon } from 'lucide-react';

interface SprintGoal {
  id: string;
  text: string;
  completed: boolean;
}

const SprintGoals: React.FC = () => {
  // State for sprint goals
  const [goals, setGoals] = useState<SprintGoal[]>([
    { id: '1', text: 'Complete user authentication flow', completed: false },
    { id: '2', text: 'Implement dashboard analytics', completed: false },
    { id: '3', text: 'Fix critical bugs from last sprint', completed: false },
  ]);
  
  // State for new goal form
  const [newGoalText, setNewGoalText] = useState('');
  const [formError, setFormError] = useState('');

  // Handle adding a new goal
  const handleAddGoal = () => {
    // Validate input
    if (!newGoalText.trim()) {
      setFormError('Goal text is required');
      return;
    }
    
    // Add new goal
    const newGoal: SprintGoal = {
      id: Date.now().toString(), // Simple unique ID
      text: newGoalText.trim(),
      completed: false,
    };
    
    setGoals([...goals, newGoal]);
    
    // Reset form
    setNewGoalText('');
    setFormError('');
  };
  
  // Handle removing a goal
  const handleRemoveGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  // Handle toggling goal completion
  const handleToggleComplete = (id: string) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  // Handle input key press (for Enter key)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddGoal();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-[1200px] mx-auto" data-testid="screen-sprint-goals">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <TargetIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-700">Sprint Goals</h3>
        </div>
      </div>

      {/* Sprint Goals List */}
      <section className="mb-8" data-testid="sprint-goals-section">
        <h4 className="text-md font-medium text-gray-600 mb-2">Current Goals</h4>
        
        {goals.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">No sprint goals added yet. Add your first goal below.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {goals.map(goal => (
              <li 
                key={goal.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  goal.completed ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-200'
                }`}
                data-testid={`sprint-goal-${goal.id}`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => handleToggleComplete(goal.id)}
                    className="h-4 w-4 text-primary-medium focus:ring-primary-medium border-gray-300 rounded mr-3"
                    data-testid={`checkbox-goal-${goal.id}`}
                  />
                  <span className={`font-medium ${
                    goal.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                  }`}>
                    {goal.text}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleRemoveGoal(goal.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200"
                  aria-label="Remove goal"
                  data-testid={`remove-goal-${goal.id}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add New Goal Form */}
      <section className="mb-4" data-testid="add-goal-section">
        <h4 className="text-md font-medium text-gray-600 mb-2">Add New Goal</h4>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="goal-text" className="block text-sm font-medium text-gray-700 mb-1">
                Goal Text
              </label>
              <input
                id="goal-text"
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Enter a new sprint goal"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="new-goal-text-input"
              />
            </div>
            
            {formError && (
              <p className="text-red-500 text-sm" data-testid="goal-form-error">{formError}</p>
            )}
            
            <div>
              <button
                onClick={handleAddGoal}
                className="flex items-center px-4 py-2 bg-primary-medium text-white rounded-md hover:bg-primary-secondaryButtonColorHover transition-colors"
                data-testid="add-goal-button"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Goal
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SprintGoals;
