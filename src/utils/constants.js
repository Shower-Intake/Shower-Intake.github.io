export const ACTION_OPTIONS = [
  { value: 'guest_left', label: 'Guest Left' },
  { value: 'move_to_next', label: 'Shower Next' },
  { value: 'standby', label: 'Standby' },
  { value: 'guest_banned', label: 'Ban Guest' }
];

export const RACE_ETHNICITY_OPTIONS = [
  { value: 'W', label: 'White' },
  { value: 'AA', label: 'African American' },
  { value: 'NA', label: 'Native American' },
  { value: 'H', label: 'Hispanic' },
  { value: 'A', label: 'Asian' },
  { value: 'NH', label: 'Non-Hispanic' },
  { value: 'AO', label: 'All Other' }
];

export const STATUS_VALUES = {
  SHOWERING: 'Showering',
  SHOWERED: 'Showered',
  DONE: 'Done',
  LEFT: 'Left',
  BANNED: 'Banned',
  QUEUED: 'Queued',
  NEXT_UP: 'Next up',
  STANDBY: 'Standby'
};

export const SHOWER_STATUS_VALUES = {
  READY: 'ready',
  SHOWERING: 'showering',
  CLEANING: 'cleaning',
  WAITING: 'waiting'
};

export const STATUS_COLORS = {
  [STATUS_VALUES.SHOWERING]: 'status-showering',
  [STATUS_VALUES.QUEUED]: 'status-queued',
  [STATUS_VALUES.NEXT_UP]: 'status-queued',
  [STATUS_VALUES.STANDBY]: 'status-queued',
  [STATUS_VALUES.LEFT]: 'status-left',
  [STATUS_VALUES.BANNED]: 'status-banned',
  [STATUS_VALUES.SHOWERED]: 'status-showering',
  [STATUS_VALUES.DONE]: 'status-left'
};

export const SHOWER_STATUS_COLORS = {
  [SHOWER_STATUS_VALUES.READY]: 'shower-status-ready',
  [SHOWER_STATUS_VALUES.SHOWERING]: 'shower-status-showering',
  [SHOWER_STATUS_VALUES.CLEANING]: 'shower-status-cleaning',
  [SHOWER_STATUS_VALUES.WAITING]: 'shower-status-waiting'
};

export const DEFAULT_SHOWER_DURATION = 20; // minutes
export const CLEANING_DURATION = 5; // minutes
