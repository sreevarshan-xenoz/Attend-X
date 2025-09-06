// Main Layout Component
const { createElement: h } = React;
const { Outlet } = window.ReactRouterDOM; // Outlet-a window.ReactRouterDOM-la irundhu edukkum

window.Layout = () => { // export const Layout ku badhila window.Layout
  return h('div', { className: 'min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' },
    h('div', { className: 'flex w-full' },
      h('div', { className: 'flex-1 flex flex-col' },
        h(Outlet)
      )
    )
  );
};