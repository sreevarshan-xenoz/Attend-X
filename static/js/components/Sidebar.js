// Sidebar Navigation Component
const { createElement: h } = React;
const { NavLink, useLocation } = window.ReactRouterDOM; // NavLink, useLocation-a window.ReactRouterDOM-la irundhu edukkum
const { clsx } = window; // clsx-a window object-la irundhu edukkum

window.Sidebar = () => { // export const Sidebar ku badhila window.Sidebar
  const location = useLocation();
  
  const navigationItems = [
    { 
      label: 'Dashboard', 
      icon: '🏠', 
      path: '/dashboard',
      description: 'Overview & Analytics'
    },
    { 
      label: 'Live Feed', 
      icon: '📹', 
      path: '/live-feed',
      description: 'Real-time Recognition'
    },
    { 
      label: 'Manage Districts', 
      icon: '🧭', 
      path: '/manage-districts',
      description: 'District Management'
    },
    { 
      label: 'Schools', 
      icon: '🏫', 
      path: '/schools',
      description: 'School Information'
    },
    { 
      label: 'Reports & Analytics', 
      icon: '📈', 
      path: '/reports',
      description: 'Advanced Reports'
    },
    { 
      label: 'Users', 
      icon: '👥', 
      path: '/users',
      description: 'User Management'
    },
    { 
      label: 'MDM Tracking', 
      icon: '🍽️', 
      path: '/mdm-tracking',
      description: 'Mid-Day Meal Tracking'
    }
  ];

  return h('aside', { 
    className: 'w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 min-h-screen sticky top-0 z-40' 
  },
    h('div', { className: 'p-6' },
      // Logo Section
      h('div', { className: 'mb-8' },
        h('div', { className: 'flex items-center space-x-3 mb-2' },
          h('div', { className: 'w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center' },
            h('span', { className: 'text-white text-xl font-bold' }, '🏛️')
          ),
          h('div', null,
            h('h1', { className: 'text-xl font-bold text-white' }, 'AMS District'),
            h('p', { className: 'text-slate-400 text-sm' }, 'Education Office')
          )
        )
      ),
      
      // Navigation
      h('nav', { className: 'space-y-2' },
        navigationItems.map((item, index) => 
          h(NavLink, {
            key: index,
            to: item.path,
            className: ({ isActive }) => clsx(
              'group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
              isActive 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            )
          },
            h('span', { className: 'text-2xl' }, item.icon),
            h('div', { className: 'flex-1' },
              h('div', { className: 'font-medium' }, item.label),
              h('div', { className: 'text-xs text-slate-500 group-hover:text-slate-400' }, item.description)
            ),
            h('div', { 
              className: clsx(
                'w-2 h-2 rounded-full transition-all duration-200',
                location.pathname === item.path ? 'bg-blue-400' : 'bg-transparent'
              )
            })
          )
        )
      ),
      
      // Bottom Section
      h('div', { className: 'mt-8 pt-6 border-t border-slate-700/50' },
        h('div', { className: 'text-xs text-slate-500 text-center' },
          h('p', null, '© 2025 AMS District'),
          h('p', null, 'Smart Attendance System')
        )
      )
    )
  );
};