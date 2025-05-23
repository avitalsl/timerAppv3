import React from 'react';
import { LinkIcon, ExternalLinkIcon } from 'lucide-react';

interface LinksListWidgetProps {
  mode?: "setup" | "meeting";
}

const LinksListWidget: React.FC<LinksListWidgetProps> = ({ mode = "setup" }) => {
  // Sample links, would typically come from props or state
  const links = [
    { title: 'Sprint Board', url: 'https://example.com/board' },
    { title: 'Design Documents', url: 'https://example.com/design' },
    { title: 'Team Wiki', url: 'https://example.com/wiki' }
  ];

  return (
    <div className="h-full flex flex-col" data-testid="layout-component-links">
      <div className="flex items-center mb-3">
        <LinkIcon className="h-4 w-4 text-gray-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-700">Useful Links</h3>
      </div>
      
      <div className="flex-grow overflow-auto">
        <ul className="space-y-2">
          {links.map((link, index) => (
            <li key={index}>
              <a 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 text-sm text-gray-700"
              >
                <span className="flex-grow">{link.title}</span>
                <ExternalLinkIcon className="h-3.5 w-3.5 text-gray-400" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LinksListWidget;
