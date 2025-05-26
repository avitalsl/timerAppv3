import React from 'react';
import TimerWidget from '../components/widgets/TimerWidget'; // Adjusted import path

const MeetingScreen: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
      {/* 
        For Phase 1, we are only displaying the TimerWidget.
        It's styled to be centered on the screen for now.
        In Phase 2, this screen will have a full fixed layout
        with conditionally rendered sections based on user settings.
      */}
      <TimerWidget />
    </div>
  );
};

export default MeetingScreen;
