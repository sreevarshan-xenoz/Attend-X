// Users Page Component
const { createElement: h } = React;

window.Users = () => { // export const Users ku badhila window.Users
  const usersData = [
    { id: 1, name: 'S. Kumar', role: 'Admin', email: 'admin@district.gov', department: 'IT', lastLogin: '2025-01-15 09:30', status: 'Active' },
    { id: 2, name: 'P. Rao', role: 'Teacher', email: 'prao@school.edu', department: 'Education', lastLogin: '2025-01-15 08:45', status: 'Active' },
    { id: 3, name: 'M. Khan', role: 'Operator', email: 'mkhan@district.gov', department: 'Operations', lastLogin: '2025-01-15 10:15', status: 'Active' },
    { id: 4, name: 'A. Sharma', role: 'Coordinator', email: 'asharma@district.gov', department: 'Coordination', lastLogin: '2025-01-14 16:20', status: 'Active' },
    { id: 5, name: 'R. Singh', role: 'Teacher', email: 'rsingh@school.edu', department: 'Education', lastLogin: '2025-01-15 07:30', status: 'Active' },
    { id: 6, name: 'K. Devi', role: 'Principal', email: 'kdevi@school.edu', department: 'Administration', lastLogin: '2025-01-15 09:00', status: 'Active' },
    { id: 7, name: 'L. Chen', role: 'Support', email: 'lchen@district.gov', department: 'IT', lastLogin: '2025-01-14 14:30', status: 'Inactive' },
    { id: 8, name: 'J. Wilson', role: 'Teacher', email: 'jwilson@school.edu', department: 'Education', lastLogin: '2025-01-15 08:00', status: 'Active' }
  ];

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (value, row) => h('div', null,
        h('div', { className: 'font-medium text-white' }, value),
        h('div', { className: 'text-sm text-slate-400' }, row.email)
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (value) => h('span', { 
        className: `px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Admin' ? 'bg-red-100 text-red-800' :
          value === 'Principal' ? 'bg-purple-100 text-purple-800' :
          value === 'Coordinator' ? 'bg-blue-100 text-blue-800' :
          value === 'Teacher' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }` 
      }, value)
    },
    {
      key: 'department',
      header: 'Department',
      render: (value) => h('div', { className: 'text-slate-300' }, value)
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (value) => h('div', { className: 'text-slate-400 text-sm' }, value)
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => h('span', { 
        className: `px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }` 
      }, value)
    }
  ];

  const roleStats = usersData.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  return h('div', { className: 'flex' },
    // Sidebar
    h('div', { className: 'w-72' }, h(window.Sidebar)),
    
    // Main Content
    h('div', { className: 'flex-1 flex flex-col' },
      // Header
      h(window.Header, { 
        title: 'Users',
        subtitle: 'User management and access control'
      }),
      
      // Content
      h('div', { className: 'flex-1 p-6 space-y-6' },
        // Overview Cards
        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' },
          h(window.KPICard, { 
            title: 'Total Users',
            value: usersData.length,
            icon: '👥',
            color: 'blue'
          }),
          h(window.KPICard, { 
            title: 'Active Users',
            value: usersData.filter(u => u.status === 'Active').length,
            icon: '✅',
            color: 'green'
          }),
          h(window.KPICard, { 
            title: 'Teachers',
            value: roleStats.Teacher || 0,
            icon: '👨‍🏫',
            color: 'purple'
          }),
          h(window.KPICard, { 
            title: 'Admins',
            value: roleStats.Admin || 0,
            icon: '👨‍💼',
            color: 'red'
          })
        ),
        
        // Role Distribution Chart
        h('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
          h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
            h('h2', { className: 'text-xl font-semibold text-white mb-6' }, 'Role Distribution'),
            h('div', { className: 'space-y-4' },
              Object.entries(roleStats).map(([role, count]) => 
                h('div', { key: role, className: 'flex items-center justify-between p-3 bg-slate-700/30 rounded-xl' },
                  h('div', { className: 'flex items-center space-x-3' },
                    h('div', { className: 'w-3 h-3 bg-blue-400 rounded-full' }),
                    h('span', { className: 'text-white font-medium' }, role)
                  ),
                  h('span', { className: 'text-2xl font-bold text-blue-400' }, count)
                )
              )
            )
          ),
          
          h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
            h('h2', { className: 'text-xl font-semibold text-white mb-6' }, 'Department Overview'),
            h('div', { className: 'space-y-4' },
              h('div', { className: 'flex items-center justify-between p-3 bg-slate-700/30 rounded-xl' },
                h('span', { className: 'text-white font-medium' }, 'Education'),
                h('span', { className: 'text-2xl font-bold text-green-400' }, usersData.filter(u => u.department === 'Education').length)
              ),
              h('div', { className: 'flex items-center justify-between p-3 bg-slate-700/30 rounded-xl' },
                h('span', { className: 'text-white font-medium' }, 'IT'),
                h('span', { className: 'text-2xl font-bold text-blue-400' }, usersData.filter(u => u.department === 'IT').length)
              ),
              h('div', { className: 'flex items-center justify-between p-3 bg-slate-700/30 rounded-xl' },
                h('span', { className: 'text-white font-medium' }, 'Operations'),
                h('span', { className: 'text-2xl font-bold text-purple-400' }, usersData.filter(u => u.department === 'Operations').length)
              ),
              h('div', { className: 'flex items-center justify-between p-3 bg-slate-700/30 rounded-xl' },
                h('span', { className: 'text-white font-medium' }, 'Administration'),
                h('span', { className: 'text-2xl font-bold text-orange-400' }, usersData.filter(u => u.department === 'Administration').length)
              )
            )
          )
        ),
        
        // Users Table
        h(window.DataTable, { 
          columns, 
          data: usersData, 
          title: 'User Information',
          className: 'mt-6'
        })
      )
    )
  );
};