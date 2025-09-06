// Schools Page Component
const { createElement: h } = React;

window.Schools = () => { // export const Schools ku badhila window.Schools
  const schoolsData = [
    { id: 1, name: 'Green Valley Primary School', district: 'Green Valley', students: 910, attendance: 94.2, principal: 'Dr. A. Sharma', status: 'Active' },
    { id: 2, name: 'Sunrisedge Academy', district: 'Sunrise Edge', students: 780, attendance: 93.5, principal: 'Ms. K. Devi', status: 'Active' },
    { id: 3, name: 'Blue Mountain School', district: 'Blue Mountain', students: 680, attendance: 91.0, principal: 'Mr. R. Singh', status: 'Active' },
    { id: 4, name: 'Riverdale High School', district: 'Riverdale', students: 1200, attendance: 89.5, principal: 'Dr. M. Kumar', status: 'Active' },
    { id: 5, name: 'Lotus Public School', district: 'Lotus Valley', students: 850, attendance: 92.8, principal: 'Ms. S. Patel', status: 'Active' },
    { id: 6, name: 'Oakwood Elementary', district: 'Green Valley', students: 420, attendance: 88.3, principal: 'Mr. J. Wilson', status: 'Maintenance' },
    { id: 7, name: 'Pinecrest Middle School', district: 'Blue Mountain', students: 650, attendance: 90.7, principal: 'Dr. L. Chen', status: 'Active' },
    { id: 8, name: 'Cedar Grove High', district: 'Sunrise Edge', students: 950, attendance: 87.9, principal: 'Ms. R. Johnson', status: 'Active' }
  ];

  const columns = [
    {
      key: 'name',
      header: 'School Name',
      render: (value, row) => h('div', null,
        h('div', { className: 'font-medium text-white' }, value),
        h('div', { className: 'text-sm text-slate-400' }, row.district)
      )
    },
    {
      key: 'students',
      header: 'Students',
      render: (value) => h('div', { className: 'text-center font-semibold text-blue-400' }, value.toLocaleString())
    },
    {
      key: 'attendance',
      header: 'Attendance %',
      render: (value) => h('div', { 
        className: `text-center font-bold ${
          value >= 90 ? 'text-green-400' : value >= 80 ? 'text-yellow-400' : 'text-red-400'
        }` 
      }, `${value}%`)
    },
    {
      key: 'principal',
      header: 'Principal',
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
        title: 'Schools',
        subtitle: 'School information and performance metrics'
      }),
      
      // Content
      h('div', { className: 'flex-1 p-6 space-y-6' },
        // Overview Cards
        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' },
          h(window.KPICard, { 
            title: 'Total Schools',
            value: schoolsData.length,
            icon: '🏫',
            color: 'blue'
          }),
          h(window.KPICard, { 
            title: 'Total Students',
            value: schoolsData.reduce((sum, s) => sum + s.students, 0).toLocaleString(),
            icon: '👥',
            color: 'green'
          }),
          h(window.KPICard, { 
            title: 'Average Attendance',
            value: `${(schoolsData.reduce((sum, s) => sum + s.attendance, 0) / schoolsData.length).toFixed(1)}%`,
            icon: '📊',
            color: 'purple'
          }),
          h(window.KPICard, { 
            title: 'Active Schools',
            value: schoolsData.filter(s => s.status === 'Active').length,
            icon: '✅',
            color: 'green'
          })
        ),
        
        // Schools Table
        h(window.DataTable, { 
          columns, 
          data: schoolsData, 
          title: 'School Information',
          className: 'mt-6'
        })
      )
    )
  );
};