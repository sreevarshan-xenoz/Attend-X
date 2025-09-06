// MDM Tracking Page Component
const { createElement: h } = React;

window.MDMTracking = () => { // export const MDMTracking ku badhila window.MDMTracking
  const mdmData = [
    { id: 1, school: 'Green Valley Primary', item: 'Rice', allocated: 500, delivered: 350, remaining: 150, status: 'Delivered', lastUpdate: '2025-01-15' },
    { id: 2, school: 'Blue Mountain School', item: 'Lentils', allocated: 300, delivered: 100, remaining: 200, status: 'Pending Delivery', lastUpdate: '2025-01-14' },
    { id: 3, school: 'Sunrisedge Academy', item: 'Oil', allocated: 200, delivered: 200, remaining: 0, status: 'Delivered', lastUpdate: '2025-01-15' },
    { id: 4, school: 'Riverdale High', item: 'Rice', allocated: 800, delivered: 600, remaining: 200, status: 'Partial', lastUpdate: '2025-01-15' },
    { id: 5, school: 'Lotus Public School', item: 'Lentils', allocated: 400, delivered: 400, remaining: 0, status: 'Delivered', lastUpdate: '2025-01-14' },
    { id: 6, school: 'Oakwood Elementary', item: 'Oil', allocated: 150, delivered: 0, remaining: 150, status: 'Pending', lastUpdate: '2025-01-13' },
    { id: 7, school: 'Pinecrest Middle', item: 'Rice', allocated: 600, delivered: 450, remaining: 150, status: 'Partial', lastUpdate: '2025-01-15' },
    { id: 8, school: 'Cedar Grove High', item: 'Lentils', allocated: 500, delivered: 500, remaining: 0, status: 'Delivered', lastUpdate: '2025-01-15' }
  ];

  const columns = [
    {
      key: 'school',
      header: 'School Name',
      render: (value) => h('div', { className: 'font-medium text-white' }, value)
    },
    {
      key: 'item',
      header: 'Item',
      render: (value) => h('span', { 
        className: `px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Rice' ? 'bg-yellow-100 text-yellow-800' :
          value === 'Lentils' ? 'bg-orange-100 text-orange-800' :
          'bg-green-100 text-green-800'
        }` 
      }, value)
    },
    {
      key: 'allocated',
      header: 'Allocated (KG)',
      render: (value) => h('div', { className: 'text-center font-semibold text-blue-400' }, value)
    },
    {
      key: 'delivered',
      header: 'Delivered (KG)',
      render: (value) => h('div', { className: 'text-center font-semibold text-green-400' }, value)
    },
    {
      key: 'remaining',
      header: 'Remaining (KG)',
      render: (value) => h('div', { className: 'text-center font-semibold text-orange-400' }, value)
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => h('span', { 
        className: `px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Delivered' ? 'bg-green-100 text-green-800' :
          value === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
          value === 'Pending Delivery' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }` 
      }, value)
    }
  ];

  const totalAllocated = mdmData.reduce((sum, item) => sum + item.allocated, 0);
  const totalDelivered = mdmData.reduce((sum, item) => sum + item.delivered, 0);
  const totalRemaining = mdmData.reduce((sum, item) => sum + item.remaining, 0);
  const deliveryRate = ((totalDelivered / totalAllocated) * 100).toFixed(1);

  return h('div', { className: 'flex' },
    // Sidebar
    h('div', { className: 'w-72' }, h(window.Sidebar)),
    
    // Main Content
    h('div', { className: 'flex-1 flex flex-col' },
      // Header
      h(window.Header, { 
        title: 'MDM Ration Tracking',
        subtitle: 'Mid-Day Meal allocation and delivery monitoring'
      }),
      
      // Content
      h('div', { className: 'flex-1 p-6 space-y-6' },
        // Overview Cards
        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' },
          h(window.KPICard, { 
            title: 'Total Allocated',
            value: `${totalAllocated.toLocaleString()} KG`,
            icon: '📦',
            color: 'blue'
          }),
          h(window.KPICard, { 
            title: 'Total Delivered',
            value: `${totalDelivered.toLocaleString()} KG`,
            icon: '✅',
            color: 'green'
          }),
          h(window.KPICard, { 
            title: 'Delivery Rate',
            value: `${deliveryRate}%`,
            icon: '📊',
            color: 'purple'
          }),
          h(window.KPICard, { 
            title: 'Pending',
            value: `${totalRemaining.toLocaleString()} KG`,
            icon: '⏳',
            color: 'orange'
          })
        ),
        
        // Progress Overview
        h('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
          h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
            h('h2', { className: 'text-xl font-semibold text-white mb-6' }, 'Delivery Progress'),
            h('div', { className: 'space-y-4' },
              h('div', null,
                h('div', { className: 'flex justify-between text-sm text-slate-400 mb-2' },
                  h('span', null, 'Overall Progress'),
                  h('span', null, `${deliveryRate}%`)
                ),
                h('div', { className: 'w-full bg-slate-700 rounded-full h-3' },
                  h('div', { 
                    className: 'bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000',
                    style: { width: `${deliveryRate}%` }
                  })
                )
              ),
              h('div', { className: 'grid grid-cols-3 gap-4 mt-6' },
                h('div', { className: 'text-center' },
                  h('div', { className: 'text-2xl font-bold text-green-400' }, mdmData.filter(item => item.status === 'Delivered').length),
                  h('div', { className: 'text-sm text-slate-400' }, 'Completed')
                ),
                h('div', { className: 'text-center' },
                  h('div', { className: 'text-2xl font-bold text-yellow-400' }, mdmData.filter(item => item.status === 'Partial').length),
                  h('div', { className: 'text-sm text-slate-400' }, 'Partial')
                ),
                h('div', { className: 'text-center' },
                  h('div', { className: 'text-2xl font-bold text-red-400' }, mdmData.filter(item => item.status === 'Pending' || item.status === 'Pending Delivery').length),
                  h('div', { className: 'text-sm text-slate-400' }, 'Pending')
                )
              )
            )
          ),
          
          h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
            h('h2', { className: 'text-xl font-semibold text-white mb-6' }, 'Item Distribution'),
            h('div', { className: 'space-y-4' },
              ['Rice', 'Lentils', 'Oil'].map(item => {
                const itemData = mdmData.filter(d => d.item === item);
                const allocated = itemData.reduce((sum, d) => sum + d.allocated, 0);
                const delivered = itemData.reduce((sum, d) => sum + d.delivered, 0);
                const rate = ((delivered / allocated) * 100).toFixed(1);
                
                return h('div', { key: item, className: 'space-y-2' },
                  h('div', { className: 'flex justify-between text-sm' },
                    h('span', { className: 'text-white font-medium' }, item),
                    h('span', { className: 'text-slate-400' }, `${rate}%`)
                  ),
                  h('div', { className: 'w-full bg-slate-700 rounded-full h-2' },
                    h('div', { 
                      className: 'bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000',
                      style: { width: `${rate}%` }
                    })
                  )
                );
              })
            )
          )
        ),
        
        // MDM Tracking Table
        h(window.DataTable, { 
          columns, 
          data: mdmData, 
          title: 'MDM Ration Tracking Details',
          className: 'mt-6'
        })
      )
    )
  );
};