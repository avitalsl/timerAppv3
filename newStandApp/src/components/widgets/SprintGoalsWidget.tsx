import React from 'react';
import { TargetIcon, CheckIcon } from 'lucide-react';

interface SprintGoalsWidgetProps {
  mode?: "setup" | "meeting";
}

const SprintGoalsWidget: React.FC<SprintGoalsWidgetProps> = ({ mode = "setup" }) => {
  // Sample sprint goals, would typically come from props or state
  const goals = [
    { id: 1, text: 'Complete the user authentication flow', completed: true },
    { id: 2, text: 'Implement meeting layout customization', completed: false },
    { id: 3, text: 'Add statistics dashboard', completed: false },
    { id: 4, text: 'Fix critical bugs in timer functionality', completed: false }
  ];

  return (
    <div className="h-full flex flex-col" data-testid="layout-component-sprint-goals">
      <div className="flex items-center mb-3">
        <TargetIcon className="h-4 w-4 text-gray-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-700">Sprint Goals</h3>
      </div>
      
      <div className="flex-grow overflow-auto">
        <div className="space-y-3">
          {goals.map(goal => (
            <div 
              key={goal.id}
              className="p-3 bg-primary-sandLightest rounded-md"
            >
              <div className="flex items-start">
                <div className="mt-1 flex-shrink-0 flex items-center justify-center">
                  <span className="text-4xl text-primary-light">•</span>
                </div>
                <span className="ml-2 text-sm text-gray-700">{goal.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SprintGoalsWidget;
