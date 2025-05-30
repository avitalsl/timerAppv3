import React, { useState } from 'react';
import { LinkIcon, PlusIcon, TrashIcon, ExternalLinkIcon } from 'lucide-react';

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

/**
 * LinksSetup component for managing meeting links
 */
const LinksSetup: React.FC = () => {
  // State for links
  const [links, setLinks] = useState<LinkItem[]>([
    { id: '1', title: 'Sprint Board', url: 'https://example.com/sprint-board' },
    { id: '2', title: 'Design Documents', url: 'https://example.com/design-docs' },
    { id: '3', title: 'Team Wiki', url: 'https://example.com/team-wiki' },
  ]);
  
  // State for new link form
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Handle adding a new link
  const handleAddLink = () => {
    // Validate inputs
    if (!newLinkTitle.trim()) {
      setFormError('Link title is required');
      return;
    }
    
    if (!newLinkUrl.trim()) {
      setFormError('Link URL is required');
      return;
    }
    
    // Simple URL validation
    try {
      new URL(newLinkUrl); // Will throw if invalid URL
    } catch (e) {
      setFormError('Please enter a valid URL (include http:// or https://)');
      return;
    }
    
    // Add new link
    const newLink: LinkItem = {
      id: Date.now().toString(), // Simple unique ID
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim(),
    };
    
    setLinks([...links, newLink]);
    
    // Reset form
    setNewLinkTitle('');
    setNewLinkUrl('');
    setFormError('');
  };
  
  // Handle removing a link
  const handleRemoveLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-[1200px] mx-auto" data-testid="screen-links-setup">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <LinkIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-700">Meeting Links</h3>
        </div>
      </div>

      {/* Links List */}
      <section className="mb-8" data-testid="links-list-section">
        <h4 className="text-md font-medium text-gray-600 mb-2">Saved Links</h4>
        
        {links.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">No links added yet. Add your first link below.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {links.map(link => (
              <li 
                key={link.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                data-testid={`link-item-${link.id}`}
              >
                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-700">{link.title}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
                    data-testid={`link-url-${link.id}`}
                  >
                    <span className="mr-1">{link.url}</span>
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                  
                  <button 
                    onClick={() => handleRemoveLink(link.id)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200"
                    aria-label="Remove link"
                    data-testid={`remove-link-${link.id}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add New Link Form */}
      <section className="mb-4" data-testid="add-link-section">
        <h4 className="text-md font-medium text-gray-600 mb-2">Add New Link</h4>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="link-title" className="block text-sm font-medium text-gray-700 mb-1">
                Link Title
              </label>
              <input
                id="link-title"
                type="text"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="Sprint Board"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="new-link-title-input"
              />
            </div>
            
            <div>
              <label htmlFor="link-url" className="block text-sm font-medium text-gray-700 mb-1">
                Link URL
              </label>
              <input
                id="link-url"
                type="text"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://example.com/sprint-board"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="new-link-url-input"
              />
            </div>
            
            {formError && (
              <p className="text-red-500 text-sm" data-testid="link-form-error">{formError}</p>
            )}
            
            <div>
              <button
                onClick={handleAddLink}
                className="flex items-center px-4 py-2 bg-primary-medium text-white rounded-md hover:bg-primary-secondaryButtonColorHover transition-colors"
                data-testid="add-link-button"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Link
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LinksSetup;
