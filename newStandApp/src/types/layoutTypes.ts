// Using a const object with string literals for better TypeScript compatibility
export const ComponentType = {
  TIMER: 'timer',
  PARTICIPANTS: 'participants', 
  LINKS: 'links',
  NOTES: 'notes',
  AGENDA: 'agenda',
  SPRINT_GOALS: 'sprintGoals',
  CHECKLIST: 'checklist'
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
}

export interface LayoutItem {
  i: string;        // Component ID
  x: number;        // Grid position X
  y: number;        // Grid position Y
  w: number;        // Width in grid units
  h: number;        // Height in grid units
  minW?: number;    // Min width
  minH?: number;    // Min height
  maxW?: number;    // Max width
  maxH?: number;    // Max height
  static?: boolean; // If true, not draggable or resizable
}

export interface LayoutConfiguration {
  layouts: {
    [key: string]: LayoutItem[]  // Different breakpoints (xs, sm, md, lg)
  };
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
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 2, h: 2 },
    isRequired: true
  },
  {
    id: 'participants',
    type: ComponentType.PARTICIPANTS,
    label: 'Meeting participant list',
    defaultSize: { w: 3, h: 4 },
    minSize: { w: 2, h: 2 }
  },
  {
    id: 'links',
    type: ComponentType.LINKS,
    label: 'List of links',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 }
  },
  {
    id: 'notes',
    type: ComponentType.NOTES,
    label: 'Area for notes',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 2, h: 2 }
  },
  {
    id: 'agenda',
    type: ComponentType.AGENDA,
    label: 'Meeting agenda',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 2, h: 2 }
  },
  {
    id: 'sprintGoals',
    type: ComponentType.SPRINT_GOALS,
    label: 'Sprint goals',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 2, h: 2 }
  },
  {
    id: 'checklist',
    type: ComponentType.CHECKLIST,
    label: 'Checklist time',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 2, h: 2 }
  }
];

// Default empty layout with just timer
export const DEFAULT_LAYOUT_CONFIG: LayoutConfiguration = {
  layouts: {
    lg: [
      { i: 'timer', x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2, static: false }
    ]
  },
  components: {
    timer: { type: ComponentType.TIMER, visible: true }
  }
};
