import React, { useState } from 'react';
import { FileTextIcon } from 'lucide-react';

interface NotesWidgetProps {
  mode?: "setup" | "meeting";
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ mode = "setup" }) => {
  const [notes, setNotes] = useState<string>('');

  return (
    <div className="h-full flex flex-col" data-testid="layout-component-notes">
      <div className="flex items-center mb-3">
        <FileTextIcon className="h-4 w-4 text-gray-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-700">Meeting Notes</h3>
      </div>
      
      <div className="flex-grow">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Type your meeting notes here..."
          className="w-full h-full min-h-[120px] p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4a9fff] resize-none"
          data-testid="notes-textarea"
        />
      </div>
    </div>
  );
};

export default NotesWidget;
