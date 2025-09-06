// Header Component
const { createElement: h, useState, useEffect } = React;
const { clsx } = window;

export const Header = ({ title, subtitle, showRefresh = false, onRefresh }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return h('header', { 
    className: 'bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4' 
  },
    h('div', { className: 'flex items-center justify-between' },
      h('div', { className: 'flex-1' },
        h('h1', { 
          className: 'text-3xl font-bold gradient-text mb-1' 
        }, title),
        h('p', { 
          className: 'text-slate-400 text-sm' 
        }, subtitle || currentTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }))
      ),
      
      h('div', { className: 'flex items-center space-x-4' },
        // Live Status Indicator
        h('div', { className: 'flex items-center space-x-2' },
          h('div', { className: 'w-2 h-2 bg-green-400 rounded-full animate-pulse' }),
          h('span', { className: 'text-sm text-slate-300' }, 'Live')
        ),
        
        // Refresh Button
        showRefresh && h('button', {
          onClick: onRefresh,
          className: 'p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-colors'
        },
          h('span', { className: 'text-lg' }, '🔄')
        ),
        
        // Time Display
        h('div', { className: 'text-right' },
          h('div', { className: 'text-lg font-mono text-white' },
            currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          ),
          h('div', { className: 'text-xs text-slate-400' }, 'Auto-refresh: 5s')
        )
      )
    )
  );
};
