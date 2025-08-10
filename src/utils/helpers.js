import { format, parseISO, differenceInMinutes, addMinutes, differenceInYears } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { STATUS_VALUES, DEFAULT_SHOWER_DURATION } from './constants';

export const generateId = () => uuidv4();

// Timezone utilities
export const getBrowserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const formatDateInTimezone = (date, timezone) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj);
  } catch (error) {
    // Fallback to local timezone if specified timezone is invalid
    return format(dateObj, 'MM/dd/yyyy');
  }
};

export const formatTimeInTimezone = (date, timezone) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(dateObj);
  } catch (error) {
    // Fallback to local timezone if specified timezone is invalid
    return format(dateObj, 'h:mm a');
  }
};

export const formatDateTimeInTimezone = (date, timezone) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(dateObj);
  } catch (error) {
    // Fallback to local timezone if specified timezone is invalid
    return format(dateObj, 'MM/dd/yyyy HH:mm');
  }
};

// Legacy functions for backward compatibility - now use timezone-aware versions
export const formatDateTime = (date, timezone = getBrowserTimezone()) => {
  return formatDateTimeInTimezone(date, timezone);
};

export const formatTime = (date, timezone = getBrowserTimezone()) => {
  return formatTimeInTimezone(date, timezone);
};

export const formatDate = (date, timezone = getBrowserTimezone()) => {
  return formatDateInTimezone(date, timezone);
};

export const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = typeof dob === 'string' ? parseISO(dob) : dob;
  const today = new Date();
  return differenceInYears(today, birthDate);
};

export const calculateShowerDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  return differenceInMinutes(end, start);
};

export const calculateTimeBetween = (currentShowerStart, lastShowerEnd) => {
  if (!currentShowerStart || !lastShowerEnd) return 0;
  const current = typeof currentShowerStart === 'string' ? parseISO(currentShowerStart) : currentShowerStart;
  const last = typeof lastShowerEnd === 'string' ? parseISO(lastShowerEnd) : lastShowerEnd;
  return differenceInMinutes(current, last);
};

export const getNextQueueNumber = (guests) => {
  if (guests.length === 0) return 1;
  const maxNumber = Math.max(...guests.map(guest => guest.number || 0));
  return maxNumber + 1;
};

export const determineStatus = (guest) => {
  if (guest.banned) return STATUS_VALUES.BANNED;
  if (guest.left_at) return STATUS_VALUES.LEFT;
  if (guest.shower_ended_at) return STATUS_VALUES.SHOWERED;
  if (guest.shower_started_at) return STATUS_VALUES.SHOWERING;
  if (guest.action === 'guest_left') return STATUS_VALUES.LEFT;
  if (guest.action === 'standby') return STATUS_VALUES.STANDBY;
  if (guest.action === 'move_to_next') return STATUS_VALUES.NEXT_UP;
  return STATUS_VALUES.QUEUED;
};

export const sortGuestsByPriority = (guests) => {
  return [...guests].sort((a, b) => {
    const statusA = determineStatus(a);
    const statusB = determineStatus(b);
    
    // Priority order: Showering > Queued > Next up > Standby > Left > Banned
    const priorityOrder = {
      [STATUS_VALUES.SHOWERING]: 1,
      [STATUS_VALUES.QUEUED]: 2,
      [STATUS_VALUES.NEXT_UP]: 3,
      [STATUS_VALUES.STANDBY]: 4,
      [STATUS_VALUES.LEFT]: 5,
      [STATUS_VALUES.BANNED]: 6,
      [STATUS_VALUES.SHOWERED]: 7,
      [STATUS_VALUES.DONE]: 8
    };
    
    const priorityDiff = priorityOrder[statusA] - priorityOrder[statusB];
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, sort by check-in time (earlier first)
    if (a.checkin_at && b.checkin_at) {
      const timeA = typeof a.checkin_at === 'string' ? parseISO(a.checkin_at) : a.checkin_at;
      const timeB = typeof b.checkin_at === 'string' ? parseISO(b.checkin_at) : b.checkin_at;
      return timeA - timeB;
    }
    
    return 0;
  });
};

export const isGuestBanned = (firstName, lastName, bannedGuests) => {
  return bannedGuests.some(banned => 
    banned.first_name.toLowerCase() === firstName.toLowerCase() &&
    banned.last_name.toLowerCase() === lastName.toLowerCase()
  );
};

export const getBannedGuestInfo = (firstName, lastName, bannedGuests) => {
  return bannedGuests.find(banned => 
    banned.first_name.toLowerCase() === firstName.toLowerCase() &&
    banned.last_name.toLowerCase() === lastName.toLowerCase()
  );
};

export const calculateExpectedTimes = (checkinTime, queuePosition, availableShowers) => {
  const checkin = typeof checkinTime === 'string' ? parseISO(checkinTime) : checkinTime;
  const waitTimePerPerson = DEFAULT_SHOWER_DURATION + 5; // shower + cleaning time
  const estimatedWaitTime = (queuePosition - 1) * waitTimePerPerson;
  
  const expectedStartTime = addMinutes(checkin, estimatedWaitTime);
  const expectedEndTime = addMinutes(expectedStartTime, DEFAULT_SHOWER_DURATION);
  
  return {
    expected_start_time_at: expectedStartTime,
    expected_end_time_at: expectedEndTime
  };
};

export const filterGuestsBySearch = (guests, searchTerm) => {
  if (!searchTerm.trim()) return guests;
  
  const term = searchTerm.toLowerCase();
  return guests.filter(guest => 
    guest.first_name?.toLowerCase().includes(term) ||
    guest.last_name?.toLowerCase().includes(term) ||
    `${guest.first_name} ${guest.last_name}`.toLowerCase().includes(term)
  );
};
