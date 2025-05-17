# UI Component Screen Documentation

This document outlines all screens and components of the Meeting Timer application, along with their data-testid attributes for testing.

## Layouts

### MainLayout
Main application layout containing the sidebar and header.
- Component: `layouts/MainLayout.tsx`
- data-testid: `layout-main`

## Components

### Sidebar 
Application navigation sidebar.
- Component: `components/Sidebar.tsx`
- data-testid: `component-sidebar`
- Child elements:
  - Logo container: `sidebar-logo`
  - Navigation links: `sidebar-nav-link-{path}` (e.g., `sidebar-nav-link-home`, `sidebar-nav-link-meeting`)

### Header
Application top header bar.
- Component: `components/Header.tsx`
- data-testid: `component-header`
- Child elements:
  - Title: `header-title`
  - Start Meeting button: `start-meeting-button`
  - Notification button: `header-notification-button`
  - User profile: `header-user-profile`

## Pages

### SetupScreen
Meeting configuration screen.
- Component: `pages/SetupScreen.tsx`
- data-testid: `screen-setup`
- Child elements:
  - Meeting name input: `setup-meeting-name-input`
  - Duration input: `setup-duration-input`
  - Time per person input: `setup-time-per-person-input`
  - Components section: `setup-components-section`
  - Participants section: `setup-participants-section`
  - Start meeting button: `setup-start-meeting-button`
  - Layout configuration section: `setup-layout-config-section`

### Meeting Layout Components
Components for the configurable meeting layout feature.

#### ComponentPicker
Toggleable checkboxes for selecting meeting layout components.
- Component: `components/meetingLayout/ComponentPicker.tsx`
- data-testid: `component-picker`
- Child elements:
  - Component checkbox container: `component-picker-item-{componentId}`
  - Component checkbox input: `component-picker-checkbox-{componentId}`
  - Component label: `component-picker-label-{componentId}`

#### GridLayout
Drag and drop grid layout for arranging meeting components.
- Component: `components/meetingLayout/GridLayout.tsx`
- data-testid: `grid-layout`
- Child elements:
  - Grid container: `grid-layout-container`
  - Grid item: `grid-layout-item-{componentId}`

#### Layout Components
Individual components that can be added to the meeting layout.

##### Timer (Always visible)
- Component: `components/meetingLayout/layoutComponents/Timer.tsx`
- data-testid: `layout-component-timer`
- Child elements:
  - Timer display: `timer-display`
  - Timer controls: `timer-controls`

##### ParticipantList
- Component: `components/meetingLayout/layoutComponents/ParticipantList.tsx`
- data-testid: `layout-component-participants`

##### LinksList
- Component: `components/meetingLayout/layoutComponents/LinksList.tsx`
- data-testid: `layout-component-links`

##### Notes
- Component: `components/meetingLayout/layoutComponents/Notes.tsx`
- data-testid: `layout-component-notes`

##### Agenda
- Component: `components/meetingLayout/layoutComponents/Agenda.tsx`
- data-testid: `layout-component-agenda`

##### SprintGoals
- Component: `components/meetingLayout/layoutComponents/SprintGoals.tsx`
- data-testid: `layout-component-sprint-goals`

##### ChecklistTime
- Component: `components/meetingLayout/layoutComponents/ChecklistTime.tsx`
- data-testid: `layout-component-checklist`

### MeetingScreen
Active meeting management screen.
- Component: `pages/MeetingScreen.tsx`
- data-testid: `screen-meeting`
- Child elements:
  - Timer display: `meeting-timer-display`
  - Play/pause button: `meeting-timer-toggle-button`
  - Skip button: `meeting-timer-skip-button`
  - Current speaker section: `meeting-current-speaker-section`
  - Next speaker section: `meeting-next-speaker-section`
  - Meeting notes: `meeting-notes-textarea`
  - Participants list: `meeting-participants-list`
  - Meeting stats section: `meeting-stats-section`

## Overlay Components

### MeetingOverlay
Full-screen overlay for the active meeting display.
- Component: `components/MeetingOverlay.tsx`
- data-testid: `meeting-overlay`
- Child elements:
  - Close button: `meeting-overlay-close`

### TopBarMeetingButton
Persistent button in the top bar to start a meeting.
- Component: `components/TopBarMeetingButton.tsx`
- data-testid: `start-meeting-button`
