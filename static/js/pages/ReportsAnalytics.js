// Reports & Analytics Page Component
const { createElement: h, useMemo } = React;
const { usePolling } = window; // usePolling-a window object-la irundhu edukkum

window.ReportsAnalytics = () => { // export const ReportsAnalytics ku badhila window.ReportsAnalytics
  const { data: summary } = usePolling('/api/summary', 5000);
  const { data: log } = usePolling('/api/log', 5000);
  
  const present = summary?.Present || 0;
  const late = summary?.Late || 0;
  const absent = Math.max(0, 500 - (present + late));

  // Overall Attendance Trend (6 months)
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Attendance %',
      data: [88, 85, 90, 92, 91, 93],
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4
    }]
  };

  // School Attendance Leaderboard (Horizontal Bar)
  const leaderboardData = {
    labels: ['Green Valley Primary', 'Sunrisedge Academy', 'Blue Mountain School', 'Riverdale High', 'Lotus Public'],
    datasets: [{
      label: 'Attendance %',
      data: [96, 95, 94, 93, 92],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  // Present vs Late vs Absent (Pie Chart)
  const attendanceDistributionData = {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [{
      data: [present, late, absent],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 3
    }]
  };

  // Monthly comparison data
  const monthlyComparisonData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: '2024',
        data: [88, 85, 90, 92, 91, 93],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      },
      {
        label: '2023',
        data: [82, 80, 85, 87, 89, 88],
        backgroundColor: 'rgba(148, 163, 184, 0.6)',
        borderColor: 'rgba(148, 163, 184, 1)',
        borderWidth: 2
      }
    ]
  };

  return h('div', { className: 'flex' },
    // Sidebar
    h('div', { className: 'w-72' }, h(window.Sidebar)),
    
    // Main Content
    h('div', { className: 'flex-1 flex flex-col' },
      // Header
      h(window.Header, { 
        title: 'Reports & Analytics',
        subtitle: 'Advanced data visualization and insights'
      }),
      
      // Content
      h('div', { className: 'flex-1 p-6 space-y-6' },
        // Overview Cards
        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' },
          h(window.KPICard, { 
            title: 'Total Reports',
            value: 24,
            icon: '📊',
            color: 'blue'
          }),
          h(window.KPICard, { 
            title: 'Data Points',
            value: '12.5K',
            icon: '📈',
            color: 'green'
          }),
          h(window.KPICard, { 
            title: 'Accuracy Rate',
            value: '98.7%',
            icon: '🎯',
            color: 'purple'
          }),
          h(window.KPICard, { 
            title: 'Last Updated',
            value: '2 min ago',
            icon: '⏰',
            color: 'orange'
          })
        ),
        
        // Main Charts Grid
        h('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
          // Overall Attendance Trend
          h('div', { className: 'lg:col-span-2' },
            h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
              h('div', { className: 'flex items-center justify-between mb-6' },
                h('h2', { className: 'text-xl font-semibold text-white' }, 'Overall Attendance Trend (6 months)'),
                h('div', { className: 'flex space-x-4' },
                  h('div', { className: 'flex items-center space-x-2' },
                    h('div', { className: 'w-3 h-3 bg-blue-500 rounded-full' }),
                    h('span', { className: 'text-sm text-slate-400' }, '2024')
                  ),
                  h('div', { className: 'flex items-center space-x-2' },
                    h('div', { className: 'w-3 h-3 bg-slate-500 rounded-full' }),
                    h('span', { className: 'text-sm text-slate-400' }, '2023')
                  )
                )
              ),
              h('div', { className: 'h-80' },
                h(window.LineChart, { data: monthlyComparisonData })
              )
            )
          ),
          
          // School Attendance Leaderboard
          h('div', { className: 'lg:col-span-1' },
            h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
              h('h2', { className: 'text-xl font-semibold text-white mb-6' }, 'School Attendance Leaderboard (Top 5)'),
              h('div', { className: 'h-80' },
                h(window.HorizontalBarChart, { data: leaderboardData })
              )
            )
          ),
          
          // Present vs Late vs Absent Distribution
          h('div', { className: 'lg:col-span-1' },
            h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
              h('h2', { className: 'text-xl font-semibold text-white mb-6' }, 'Today\'s Attendance Distribution'),
              h('div', { className: 'h-80' },
                h(window.PieChart, { data: attendanceDistributionData })
              )
            )
          )
        ),
        
        // Additional Analytics
        h('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
          // Performance Metrics
          h('div', { className: 'lg:col-span-2' },
            h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
              h('h2', { className: 'text-xl font-semibold text-white mb-6' }, 'Performance Metrics'),
              h('div', { className: 'space-y-4' },
                h('div', { className: 'flex items-center justify-between p-4 bg-slate-700/30 rounded-xl' },
                  h('div', { className: 'flex items-center space-x-3' },
                    h('div', { className: 'w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center' },
                      h('span', { className: 'text-green-400 text-xl' }, '📈')
                    ),
                    h('div', null,
                      h('p', { className: 'text-white font-medium' }, 'Attendance Growth'),
                      h('p', { className: 'text-slate-400 text-sm' }, 'Compared to last month')
                    )
                  ),
                  h('div', { className: 'text-right' },
                    h('p', { className: 'text-2xl font-bold text-green-400' }, '+5.2%'),
                    h('p', { className: 'text-slate-400 text-sm' }, 'vs last month')
                  )
                ),
                h('div', { className: 'flex items-center justify-between p-4 bg-slate-700/30 rounded-xl' },
                  h('div', { className: 'flex items-center space-x-3' },
                    h('div', { className: 'w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center' },
                      h('span', { className: 'text-blue-400 text-xl' }, '🎯')
                    ),
                    h('div', null,
                      h('p', { className: 'text-white font-medium' }, 'Target Achievement'),
                      h('p', { className: 'text-slate-400 text-sm' }, 'Monthly attendance target')
                    )
                  ),
                  h('div', { className: 'text-right' },
                    h('p', { className: 'text-2xl font-bold text-blue-400' }, '94.2%'),
                    h('p', { className: 'text-slate-400 text-sm' }, 'of 90% target')
                  )
                ),
                h('div', { className: 'flex items-center justify-between p-4 bg-slate-700/30 rounded-xl' },
                  h('div', { className: 'flex items-center space-x-3' },
                    h('div', { className: 'w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center' },
                      h('span', { className: 'text-purple-400 text-xl' }, '⚡')
                    ),
                    h('div', null,
                      h('p', { className: 'text-white font-medium' }, 'System Efficiency'),
                      h('p', { className: 'text-slate-400 text-sm' }, 'Recognition accuracy')
                    )
                  ),
                  h('div', { className: 'text-right' },
                    h('p', { className: 'text-2xl font-bold text-purple-400' }, '98.7%'),
                    h('p', { className: 'text-slate-400 text-sm' }, 'accuracy rate')
                  )
                )
              )
            )
          ),
          
          // Quick Stats
          h('div', { className: 'lg:col-span-1' },
            h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
              h('h2', { className: 'text-xl font-semibold text-white mb-6' }, 'Quick Stats'),
              h('div', { className: 'space-y-4' },
                h('div', { className: 'text-center p-4 bg-slate-700/30 rounded-xl' },
                  h('p', { className: 'text-3xl font-bold text-green-400' }, present),
                  h('p', { className: 'text-slate-400' }, 'Present Today')
                ),
                h('div', { className: 'text-center p-4 bg-slate-700/30 rounded-xl' },
                  h('p', { className: 'text-3xl font-bold text-yellow-400' }, late),
                  h('p', { className: 'text-slate-400' }, 'Late Today')
                ),
                h('div', { className: 'text-center p-4 bg-slate-700/30 rounded-xl' },
                  h('p', { className: 'text-3xl font-bold text-red-400' }, absent),
                  h('p', { className: 'text-slate-400' }, 'Absent Today')
                )
              )
            )
          )
        )
      )
    )
  );
};