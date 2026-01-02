// Utility functions for safe date handling
export const isValidDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const safeFormatDate = (date, options = {}) => {
  if (!isValidDate(date)) {
    return options.fallback || 'Invalid Date';
  }
  
  try {
    const d = new Date(date);
    return d.toLocaleDateString(options.locale || 'en-US', options.dateStyle || {});
  } catch (error) {
    console.error('Error formatting date:', error);
    return options.fallback || 'Invalid Date';
  }
};

export const safeFormatDateTime = (date, options = {}) => {
  if (!isValidDate(date)) {
    return options.fallback || 'Invalid Date';
  }
  
  try {
    const d = new Date(date);
    return d.toLocaleString(options.locale || 'en-US', options.dateTimeStyle || {});
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return options.fallback || 'Invalid Date';
  }
};

export const safeFormatTime = (date, options = {}) => {
  if (!isValidDate(date)) {
    return options.fallback || 'Invalid Time';
  }
  
  try {
    const d = new Date(date);
    return d.toLocaleTimeString(options.locale || 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      ...options.timeStyle
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return options.fallback || 'Invalid Time';
  }
};

export const formatRelativeDate = (date, options = {}) => {
  if (!isValidDate(date)) {
    return options.fallback || 'Invalid Date';
  }
  
  try {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days ago`;
    if (diffDays < 0) return `In ${Math.abs(diffDays)} days`;
    
    return safeFormatDate(date, options);
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return options.fallback || 'Invalid Date';
  }
};

export const isOverdue = (dueDate) => {
  if (!isValidDate(dueDate)) return false;
  return new Date(dueDate) < new Date();
};

export const getCurrentISOString = () => {
  try {
    return new Date().toISOString();
  } catch (error) {
    console.error('Error getting current ISO string:', error);
    return null;
  }
};

export const parseDateSafely = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return isValidDate(date) ? date : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (date) => {
  if (!isValidDate(date)) return '';
  
  try {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

// Format time for input fields (HH:MM)
export const formatTimeForInput = (date) => {
  if (!isValidDate(date)) return '';
  
  try {
    const d = new Date(date);
    return d.toTimeString().slice(0, 5);
  } catch (error) {
    console.error('Error formatting time for input:', error);
    return '';
  }
};
