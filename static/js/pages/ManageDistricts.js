// Manage Districts Page Component
const { createElement: h } = React;

export const ManageDistricts = () => {
  const districtsData = [
    { id: 1, name: 'Green Valley District', code: 'GV-01', schools: 18, coordinator: 'A. Sharma', status: 'Active', students: 3240 },
    { id: 2, name: 'Blue Mountain District', code: 'BM-02', schools: 12, coordinator: 'R. Singh', status: 'Active', students: 2160 },
    { id: 3, name: 'Sunrise Edge District', code: 'SE-03', schools: 15, coordinator: 'K. Devi', status: 'Active', students: 2700 },
    { id: 4, name: 'Riverdale District', code: 'RD-04', schools: 8, coordinator: 'M. Kumar', status: 'Maintenance', students: 1440 },
    { id: 5, name: 'Lotus Valley District', code: 'LV-05', schools: 22, coordinator: 'S. Patel', status: 'Active', students: 3960 }
  ];

  const columns = [
    {
      key: 'name',
      header: 'District Name',
      render: (value, row) => h('div', { className: 'font-medium text-white' }, value)
    },
    {
      key: 'code',
      header: 'Code',
      render: (value) => h('span', { className: 'px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono' }, value)
    },
    {
      key: 'schools',
      header: 'Schools',
      render: (value) => h('div', { className: 'text-center font-semibold text-green-400' }, value)
    },
    {
      key: 'students',
      header: 'Students',
      render: (value) => h('div', { className: 'text-slate-300' }, value.toLocaleString())
    },
    {
      key: 'coordinator',
      header: 'Coordinator',
      render: (value) => h('div', { className: 'text-slate-300' }, value)
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => h('span', { 
        className: `px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }` 
      }, value)
    }
  ];

  return h('div', { className: 'flex' },
    // Sidebar
    h('div', { className: 'w-72' }, h(window.Sidebar)),
    
    // Main Content
    h('div', { className: 'flex-1 flex flex-col' },
      // Header
      h(window.Header, { 
        title: 'Manage Districts',
        subtitle: 'District information and management'
      }),
      
      // Content
      h('div', { className: 'flex-1 p-6 space-y-6' },
        // Overview Cards
        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' },
          h(window.KPICard, { 
            title: 'Total Districts',
            value: districtsData.length,
            icon: '🏛️',
            color: 'blue'
          }),
          h(window.KPICard, { 
            title: 'Total Schools',
            value: districtsData.reduce((sum, d) => sum + d.schools, 0),
            icon: '🏫',
            color: 'green'
          }),
          h(window.KPICard, { 
            title: 'Total Students',
            value: districtsData.reduce((sum, d) => sum + d.students, 0).toLocaleString(),
            icon: '👥',
            color: 'purple'
          }),
          h(window.KPICard, { 
            title: 'Active Districts',
            value: districtsData.filter(d => d.status === 'Active').length,
            icon: '✅',
            color: 'green'
          })
        ),
        
        // Districts Table
        h(window.DataTable, { 
          columns, 
          data: districtsData, 
          title: 'District Information',
          className: 'mt-6'
        })
      )
    )
  );
};
