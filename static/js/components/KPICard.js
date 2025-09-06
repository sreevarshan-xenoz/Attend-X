// KPI Card Component
const { createElement: h, useState, useEffect } = React;
const { clsx } = window; // clsx-a window object-la irundhu eduthu use panrom

window.KPICard = ({ // export const ku badhila window.
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  color = 'blue',
  className = '',
  animated = true 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    cyan: 'from-cyan-500 to-cyan-600'
  };

  useEffect(() => {
    setIsVisible(true);
    
    if (animated && typeof value === 'number') {
      const duration = 2000;
      const start = performance.now();
      const startValue = 0;
      const endValue = value;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeOutCubic;
        
        setDisplayValue(Math.floor(currentValue));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  return h('div', { 
    className: clsx(
      'group relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl',
      className
    )
  },
    // Background Gradient
    h('div', { 
      className: clsx(
        'absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300',
        colorClasses[color] || colorClasses.blue
      )
    }),
    
    // Content
    h('div', { className: 'relative z-10' },
      h('div', { className: 'flex items-center justify-between mb-4' },
        h('div', { className: 'flex-1' },
          h('h3', { 
            className: 'text-sm font-medium text-slate-400 uppercase tracking-wide mb-1' 
          }, title),
          h('div', { 
            className: clsx(
              'text-3xl font-bold text-white transition-all duration-500',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )
          }, typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue)
        ),
        h('div', { 
          className: clsx(
            'text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300',
            isVisible ? 'opacity-80' : 'opacity-0'
          )
        }, icon)
      ),
      
      // Trend Indicator
      trend && h('div', { 
        className: clsx(
          'flex items-center space-x-1 text-sm font-medium',
          trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
        )
      },
        h('span', { className: 'text-lg' }, 
          trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→'
        ),
        h('span', null, trendValue || '0%')
      )
    ),
    
    // Hover Effect
    h('div', { 
      className: 'absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000'
    })
  );
};