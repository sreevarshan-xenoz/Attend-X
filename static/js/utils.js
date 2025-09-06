// Utility functions

window.clsx = (...args) => { // export const ku badhila window.
  return args.filter(Boolean).join(' ');
};

window.formatNumber = (num) => { // export const ku badhila window.
  return new Intl.NumberFormat('en-IN').format(num);
};

window.formatDate = (date) => { // export const ku badhila window.
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

window.formatTime = (time) => { // export const ku badhila window.
  return new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

window.getStatusColor = (status) => { // export const ku badhila window.
  const statusColors = {
    'Present': 'bg-green-100 text-green-800 border-green-200',
    'Late': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Absent': 'bg-red-100 text-red-800 border-red-200',
    'Delivered': 'bg-green-100 text-green-800 border-green-200',
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Pending Delivery': 'bg-orange-100 text-orange-800 border-orange-200'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

window.generateId = () => { // export const ku badhila window.
  return Math.random().toString(36).substr(2, 9);
};

window.debounce = (func, wait) => { // export const ku badhila window.
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

window.throttle = (func, limit) => { // export const ku badhila window.
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};