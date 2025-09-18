// Dashboard Page Component
const { createElement: h, useMemo } = React;
const { usePolling } = window; // usePolling-a window object-la irundhu edukkum

window.Dashboard = () => { // export const Dashboard ku badhila window.Dashboard
  const { data: summary } = usePolling('/api/summary', 5000);
  const { data: log } = usePolling('/api/log', 5000);
  
  const totalStudents = 500; // This should come from backend
  const present = summary?.Present || 0;
  const late = summary?.Late || 0;
  const absent = Math.max(0, totalStudents - (present + late));
  const attendanceRate = ((present + late) / Math.max(1, totalStudents) * 100).toFixed(1);

  // Monthly attendance data for chart
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Attendance %',
      data: [88, 85, 90, 92, 91, attendanceRate],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  // School leaderboard data
  const leaderboardData = [
    { rank: 1, school: 'Sunrisedge Academy', attendance: 94.2, students: 250 },
    { rank: 2, school: 'Blue Mountain School', attendance: 93.5, students: 180 },
    { rank: 3, school: 'Green Valley Primary', attendance: 92.8, students: 320 },
    { rank: 4, school: 'Riverdale High', attendance: 91.5, students: 280 },
    { rank: 5, school: 'Lotus Public School', attendance: 90.2, students: 200 }
  ];

  // MDM allocation data for donut chart
  const mdmData = {
    labels: ['Rice', 'Lentils', 'Oil & Others'],
    datasets: [{
      data: [45, 30, 25],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(245, 158, 11, 1)'
      ],
      borderWidth: 2
    }]
  };

  return h('div', { className: 'flex' },
    // Sidebar
    h('div', { className: 'w-72' }, h(window.Sidebar)),
    
    // Main Content
    h('div', { className: 'flex-1 flex flex-col' },
      // Header
      h(window.Header, { 
        title: 'District Education Office Dashboard',
        subtitle: 'Real-time attendance monitoring and analytics',
        showRefresh: true
      }),
      
      // Content
      h('div', { className: 'flex-1 p-6 space-y-6' },
        // KPI Cards
        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
          h(window.KPICard, { 
            title: 'Total Schools in District',
            value: 45,
            icon: '🏫',
            color: 'blue',
            trend: 'up',
            trendValue: '+2 this month'
          }),
          h(window.KPICard, { 
            title: 'Average District Attendance',
            value: `${attendanceRate}%`,
            icon: '👥',
            color: 'green',
            trend: present > 0 ? 'up' : 'down',
            trendValue: '+5.2% vs last week'
          }),
          h(window.KPICard, { 
            title: 'Total Students',
            value: totalStudents.toLocaleString(),
            icon: '🎓',
            color: 'purple',
            trend: 'up',
            trendValue: '+120 this year'
          })
        ),
        
        // Charts Section
        h('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
          // Monthly Attendance Chart
          h('div', { className: 'lg:col-span-2' },
            h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
              h('div', { className: 'flex items-center justify-between mb-6' },
                h('h2', { className: 'text-xl font-semibold text-white' }, 'District-Wide Attendance Analysis'),
                h('span', { className: 'text-sm text-slate-400' }, 'Last 6 months')
              ),
              h('div', { className: 'h-80' },
                h(window.BarChart, { data: monthlyData })
              )
            )
          ),
          
          // MDM Allocation Chart
          h('div', { className: 'lg:col-span-1' },
            h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
              h('h2', { className: 'text-xl font-semibold text-white mb-6' }, 'MDM Ratio Allocation'),
              h('div', { className: 'h-80' },
                h(window.DoughnutChart, { data: mdmData })
              )
            )
          )
        ),
        
        // Live Feed Section
        h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
          h(window.LiveFeed)
        ),

        // Tables Section
        h('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
          // School Leaderboard
          h('div', null,
            h(window.LeaderboardTable, { 
              data: leaderboardData,
              title: 'School Attendance Leaderboard - Last Month'
            })
          ),
          
          // Live Attendance Log
          h('div', null,
            h(window.AttendanceTable, { 
              data: log || [],
              title: "Today's Live Attendance Log"
            })
          )
        )
      )
    )
  );
};