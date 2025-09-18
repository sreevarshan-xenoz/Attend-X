// Live Feed Page Component
const { createElement: h } = React;

window.LiveFeedPage = () => {
  return h('div', { className: 'flex' },
    // Sidebar
    h('div', { className: 'w-72' }, h(window.Sidebar)),
    
    // Main Content
    h('div', { className: 'flex-1 flex flex-col' },
      // Header
      h(window.Header, { 
        title: 'Live Attendance Feed',
        subtitle: 'Real-time face recognition and attendance tracking',
        showRefresh: false
      }),
      
      // Content
      h('div', { className: 'flex-1 p-6' },
        h(window.LiveFeed)
      )
    )
  );
};