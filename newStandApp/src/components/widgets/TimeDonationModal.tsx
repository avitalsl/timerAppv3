import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../contexts/MeetingContext';
import { X, Clock } from 'lucide-react';
import type { Participant } from '../../contexts/MeetingContext';

interface TimeDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorId: string;
  recipientId: string;
  maxDonationSeconds: number;
  onDonationSubmit: (donorId: string, recipientId: string, seconds: number) => void;
}

/**
 * Modal dialog for donating time from one participant to another
 */
const TimeDonationModal: React.FC<TimeDonationModalProps> = ({
  isOpen,
  onClose,
  donorId,
  recipientId,
  maxDonationSeconds,
  onDonationSubmit
}) => {
  const { state } = useMeeting();
  const [donationSeconds, setDonationSeconds] = useState<number>(30); // Default to 30 seconds
  
  // Find the donor and recipient participants
  const donor = state.participants.find(p => p.id === donorId);
  const recipient = state.participants.find(p => p.id === recipientId);
  
  // Reset donation amount when the modal opens or max changes
  useEffect(() => {
    if (isOpen) {
      // Default to either 30 seconds or the maximum available, whichever is less
      setDonationSeconds(Math.min(30, maxDonationSeconds));
    }
  }, [isOpen, maxDonationSeconds]);
  
  // Format seconds to minutes:seconds format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString()}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDonationSubmit(donorId, recipientId, donationSeconds);
    onClose();
  };
  
  // Don't render anything if the modal is not open
  if (!isOpen || !donor || !recipient) {
    return null;
  }
  
  // Generate time donation options (increments of 15 seconds up to max)
  const donationOptions = [];
  for (let time = 15; time <= maxDonationSeconds; time += 15) {
    donationOptions.push(time);
  }
  // Add the max value if it's not already included (and not 0)
  if (maxDonationSeconds > 0 && !donationOptions.includes(maxDonationSeconds)) {
    donationOptions.push(maxDonationSeconds);
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="time-donation-modal">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          aria-label="Close"
          data-testid="modal-close-btn"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Modal header */}
        <div className="text-center mb-6">
          <Clock className="w-8 h-8 mx-auto text-amber-500 mb-2" />
          <h3 className="text-xl font-semibold text-gray-800">Donate Time</h3>
        </div>
        
        {/* Modal content */}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <div className="flex justify-between mb-1">
              <span className="font-medium">From:</span>
              <span>{donor.name}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-medium">To:</span>
              <span>{recipient.name}</span>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Donation Amount (seconds)
              </label>
              
              {/* Time selection options */}
              <div className="flex flex-wrap gap-2 mb-3">
                {donationOptions.map((seconds) => (
                  <button
                    key={`time-${seconds}`}
                    type="button"
                    onClick={() => setDonationSeconds(seconds)}
                    className={`py-1 px-3 rounded text-sm ${
                      donationSeconds === seconds
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    data-testid={`time-option-${seconds}`}
                  >
                    {formatTime(seconds)}
                  </button>
                ))}
              </div>
              
              {/* Custom slider input */}
              <div className="mb-2">
                <input
                  type="range"
                  min={15}
                  max={maxDonationSeconds}
                  step={15}
                  value={donationSeconds}
                  onChange={(e) => setDonationSeconds(parseInt(e.target.value))}
                  className="w-full"
                  data-testid="donation-slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>15s</span>
                  <span>{formatTime(donationSeconds)}</span>
                  <span>{formatTime(maxDonationSeconds)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              data-testid="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-amber-500 text-white rounded hover:bg-amber-600"
              data-testid="donate-btn"
            >
              Donate {formatTime(donationSeconds)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeDonationModal;
