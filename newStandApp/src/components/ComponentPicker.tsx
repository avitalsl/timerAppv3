import React from 'react';
import Checkbox from './Checkbox';
import type { ComponentDefinition } from '../types/layoutTypes';
interface ComponentPickerProps {
  components: ComponentDefinition[];
  selectedComponents: string[];
  onToggleComponent: (componentId: string, selected: boolean) => void;
}

const ComponentPicker: React.FC<ComponentPickerProps> = ({
  components,
  selectedComponents,
  onToggleComponent
}) => {
  return (
    <div className="bg-white rounded-lg p-3" data-testid="component-picker">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">
          Layout Components
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {components.map((component) => (
          <div 
            key={component.id}
            className="flex items-center p-1.5 border border-gray-200 rounded-md bg-primary-sandLight"
            data-testid={`component-picker-item-${component.id}`}
          >
            <Checkbox
  id={`component-${component.id}`}
  checked={selectedComponents.includes(component.id)}
  onChange={(e) => onToggleComponent(component.id, e.target.checked)}
  disabled={component.isRequired}
  className="h-3.5 w-3.5 text-[#4a9fff] focus:ring-[#4a9fff] border-gray-300 rounded"
  data-testid={`component-picker-checkbox-${component.id}`}
/>
            <label
              htmlFor={`component-${component.id}`}
              className="ml-2 text-xs font-medium text-gray-700"
              data-testid={`component-picker-label-${component.id}`}
            >
              {component.label}
              {component.isRequired && (
                <span className="ml-1 text-xs text-gray-500">(Required)</span>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentPicker;
