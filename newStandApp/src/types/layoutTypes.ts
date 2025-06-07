// Using a const object with string literals for better TypeScript compatibility
export const ComponentType = {
  TIMER: 'timer',
  PARTICIPANTS: 'participants', 
  LINKS: 'links',
  NOTES: 'notes',
  AGENDA: 'agenda',
  SPRINT_GOALS: 'sprintGoals',
  CHECKLIST: 'checklist',
  STORY: 'storyWidget'
} as const;

// Type derived from the const object values
export type ComponentType = typeof ComponentType[keyof typeof ComponentType];

export interface ComponentDefinition {
  id: string;
  type: ComponentType;
  label: string;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  maxSize?: { w: number; h: number };
  isRequired?: boolean; // Timer will be true
  lifecycle?: 'permanent' | 'temporary'; // Added lifecycle property
  renderPriority?: number; // Added renderPriority, lower means higher priority
}

export interface LayoutConfiguration {
  components: {
    [id: string]: {
      type: ComponentType;
      visible: boolean;
      config?: any;  // Component-specific configuration
    }
  };
}

// Default component definitions with preset sizes and constraints
export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    id: 'timer',
    type: ComponentType.TIMER,
    label: 'Timer',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 4, h: 3 },
    isRequired: true,
    renderPriority: 10 // Default priority for existing components
  },
  {
    id: 'participants',
    type: ComponentType.PARTICIPANTS,
    label: 'Meeting participant list',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 2 },
    renderPriority: 10 // Default priority for existing components
  },
  {
    id: 'links',
    type: ComponentType.LINKS,
    label: 'List of links',
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 4, h: 2 },
    renderPriority: 10 // Default priority for existing components
  },
  {
    id: 'notes',
    type: ComponentType.NOTES,
    label: 'Area for notes',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 2 },
    renderPriority: 10 // Default priority for existing components
  },
  {
    id: 'agenda',
    type: ComponentType.AGENDA,
    label: 'Meeting agenda',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 4, h: 2 },
    renderPriority: 10 // Default priority for existing components
  },
  {
    id: 'sprintGoals',
    type: ComponentType.SPRINT_GOALS,
    label: 'Sprint goals',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 4, h: 2 },
    renderPriority: 10 // Default priority for existing components
  },
  {
    id: 'checklist',
    type: ComponentType.CHECKLIST,
    label: 'Checklist time',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 4, h: 2 },
    renderPriority: 10 // Default priority for existing components
  },
  {
    id: ComponentType.STORY, // 'storyWidget'
    type: ComponentType.STORY,
    label: 'Story Time',
    defaultSize: { w: 12, h: 2 }, // Example size, can be adjusted. Full width likely.
    minSize: { w: 8, h: 1 },
    lifecycle: 'temporary',
    renderPriority: 1 // High priority to appear at the top
  }
];

// Default configuration with just timer visible
export const DEFAULT_LAYOUT_CONFIG: LayoutConfiguration = {
  components: {
    timer: { type: ComponentType.TIMER, visible: true }
  }
};
