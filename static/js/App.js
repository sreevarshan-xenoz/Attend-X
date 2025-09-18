// Main App Component with Routing
// Note: 'h' is just an alias for React.createElement, which is already globally available
// when using UMD builds from CDNs.
// ReactRouterDOM components are also globally available via `window.ReactRouterDOM`.

const { HashRouter, Routes, Route, Navigate } = window.ReactRouterDOM;

window.App = () => { // "export const App" ku badhila "window.App" nu maathitom
  return React.createElement(HashRouter, null, // h ku badhila React.createElement
    React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' },
      React.createElement(Routes, null,
        React.createElement(Route, { path: '/', element: React.createElement(Navigate, { to: '/dashboard', replace: true }) }),
        React.createElement(Route, { path: '/dashboard', element: React.createElement(window.Dashboard) }), // window.Dashboard
        React.createElement(Route, { path: '/live-feed', element: React.createElement(window.LiveFeedPage) }), // window.LiveFeedPage
        React.createElement(Route, { path: '/manage-districts', element: React.createElement(window.ManageDistricts) }), // window.ManageDistricts
        React.createElement(Route, { path: '/schools', element: React.createElement(window.Schools) }), // window.Schools
        React.createElement(Route, { path: '/reports', element: React.createElement(window.ReportsAnalytics) }), // window.ReportsAnalytics
        React.createElement(Route, { path: '/users', element: React.createElement(window.Users) }), // window.Users
        React.createElement(Route, { path: '/mdm-tracking', element: React.createElement(window.MDMTracking) }) // window.MDMTracking
      )
    )
  );
};