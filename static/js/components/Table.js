// Table Components
const { createElement: h } = React;
const { clsx, getStatusColor } = window; // clsx and getStatusColor-a window object-la irundhu edukkum

window.DataTable = ({ // export const DataTable ku badhila window.DataTable
  columns, 
  data, 
  title, 
  className = '',
  showHeader = true,
  striped = true 
}) => {
  return h('div', { 
    className: `bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden ${className}` 
  },
    showHeader && h('div', { className: 'px-6 py-4 border-b border-slate-700/50' },
      h('h3', { className: 'text-lg font-semibold text-white' }, title)
    ),
    h('div', { className: 'overflow-x-auto' },
      h('table', { className: 'min-w-full' },
        h('thead', { className: 'bg-slate-700/30' },
          h('tr', null,
            columns.map((column, index) => 
              h('th', { 
                key: index,
                className: 'px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider'
              }, column.header)
            )
          )
        ),
        h('tbody', { className: 'divide-y divide-slate-700/30' },
          data.map((row, rowIndex) => 
            h('tr', { 
              key: rowIndex,
              className: clsx(
                'hover:bg-slate-700/20 transition-colors duration-200',
                striped && rowIndex % 2 === 0 ? 'bg-slate-800/20' : ''
              )
            },
              columns.map((column, colIndex) => 
                h('td', { 
                  key: colIndex,
                  className: 'px-6 py-4 whitespace-nowrap text-sm text-slate-300'
                }, 
                  column.render ? column.render(row[column.key], row) : row[column.key]
                )
              )
            )
          )
        )
      )
    )
  );
};

window.StatusBadge = ({ status, className = '' }) => { // export const StatusBadge ku badhila window.StatusBadge
  return h('span', { 
    className: clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      getStatusColor(status),
      className
    )
  }, status);
};

window.AttendanceTable = ({ data, title = "Today's Live Attendance Log" }) => { // export const AttendanceTable ku badhila window.AttendanceTable
  const columns = [
    {
      key: 'student_name',
      header: 'Student Name',
      render: (value) => h('div', { className: 'font-medium text-white' }, value)
    },
    {
      key: 'timestamp',
      header: 'Time',
      render: (value) => h('div', { className: 'text-slate-400' }, value)
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => h(window.StatusBadge, { status: value }) // StatusBadge-a window.StatusBadge nu maathitom
    }
  ];

  return h(window.DataTable, { // DataTable-a window.DataTable nu maathitom
    columns, 
    data: data || [], 
    title,
    className: 'mt-6'
  });
};

window.LeaderboardTable = ({ data, title = "School Attendance Leaderboard" }) => { // export const LeaderboardTable ku badhila window.LeaderboardTable
  const columns = [
    {
      key: 'rank',
      header: 'Rank',
      render: (value) => h('div', { 
        className: 'flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white font-bold text-sm' 
      }, value)
    },
    {
      key: 'school',
      header: 'School Name',
      render: (value) => h('div', { className: 'font-medium text-white' }, value)
    },
    {
      key: 'attendance',
      header: 'Attendance %',
      render: (value) => h('div', { 
        className: 'text-lg font-bold text-green-400' 
      }, `${value}%`)
    },
    {
      key: 'students',
      header: 'Total Students',
      render: (value) => h('div', { className: 'text-slate-400' }, value.toLocaleString())
    }
  ];

  return h(window.DataTable, { // DataTable-a window.DataTable nu maathitom
    columns, 
    data: data || [], 
    title,
    className: 'mt-6'
  });
};