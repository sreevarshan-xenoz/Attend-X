// Chart Components
const { createElement: h, useRef, useEffect } = React;
const { useChart } = window; // useChart-a window object-la irundhu eduthu use panrom

window.BarChart = ({ data, options = {}, className = '' }) => { // export const ku badhila window.
  const canvasRef = useRef(null);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      }
    },
    ...options
  };
  
  useChart(canvasRef, 'bar', data, chartOptions);
  
  return h('div', { className: `relative ${className}` },
    h('canvas', { ref: canvasRef })
  );
};

window.LineChart = ({ data, options = {}, className = '' }) => { // export const ku badhila window.
  const canvasRef = useRef(null);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      }
    },
    ...options
  };
  
  useChart(canvasRef, 'line', data, chartOptions);
  
  return h('div', { className: `relative ${className}` },
    h('canvas', { ref: canvasRef })
  );
};

window.PieChart = ({ data, options = {}, className = '' }) => { // export const ku badhila window.
  const canvasRef = useRef(null);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { color: '#94a3b8' }
      }
    },
    ...options
  };
  
  useChart(canvasRef, 'pie', data, chartOptions);
  
  return h('div', { className: `relative ${className}` },
    h('canvas', { ref: canvasRef })
  );
};

window.DoughnutChart = ({ data, options = {}, className = '' }) => { // export const ku badhila window.
  const canvasRef = useRef(null);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { color: '#94a3b8' }
      }
    },
    ...options
  };
  
  useChart(canvasRef, 'doughnut', data, chartOptions);
  
  return h('div', { className: `relative ${className}` },
    h('canvas', { ref: canvasRef })
  );
};

window.HorizontalBarChart = ({ data, options = {}, className = '' }) => { // export const ku badhila window.
  const canvasRef = useRef(null);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      }
    },
    ...options
  };
  
  useChart(canvasRef, 'bar', data, chartOptions);
  
  return h('div', { className: `relative ${className}` },
    h('canvas', { ref: canvasRef })
  );
};