// Live Feed Component with Real-time Recognition
const { createElement: h, useState, useEffect, useRef } = React;

window.LiveFeed = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [recognitions, setRecognitions] = useState([]);
  const [attendanceMarked, setAttendanceMarked] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io();
    
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to live feed');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from live feed');
    });

    // Listen for real-time recognition events
    socketRef.current.on('recognition', (data) => {
      setRecognitions(prev => {
        const newRecognitions = [data, ...prev.slice(0, 9)]; // Keep last 10
        return newRecognitions;
      });
    });

    // Listen for attendance marked events
    socketRef.current.on('attendance_marked', (data) => {
      setAttendanceMarked(prev => {
        const newMarked = [data, ...prev.slice(0, 4)]; // Keep last 5
        return newMarked;
      });
      
      // Show notification
      if (window.Notification && Notification.permission === 'granted') {
        new Notification(`Attendance Marked: ${data.name}`, {
          body: `Status: ${data.status} at ${data.time}`,
          icon: '/static/favicon.ico'
        });
      }
    });

    // Request notification permission
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const getStatusColor = (status) => {
    return status === 'Present' ? 'text-green-400' : 'text-orange-400';
  };

  const getStatusBg = (status) => {
    return status === 'Present' ? 'bg-green-500/20' : 'bg-orange-500/20';
  };

  return h('div', { className: 'space-y-6' },
    // Connection Status
    h('div', { className: 'flex items-center justify-between' },
      h('h2', { className: 'text-2xl font-bold text-white' }, 'Live Recognition Feed'),
      h('div', { className: 'flex items-center space-x-2' },
        h('div', { 
          className: `w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse` 
        }),
        h('span', { className: 'text-sm text-slate-300' }, 
          isConnected ? 'Connected' : 'Disconnected'
        )
      )
    ),

    // Live Camera Feed
    h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
      h('h3', { className: 'text-lg font-semibold text-white mb-4' }, 'Live Camera Feed'),
      h('div', { className: 'relative bg-black rounded-lg overflow-hidden' },
        h('img', {
          src: '/video_feed',
          alt: 'Live Camera Feed',
          className: 'w-full h-auto max-h-96 object-contain',
          style: { minHeight: '300px' }
        }),
        // Overlay for connection status
        !isConnected && h('div', { 
          className: 'absolute inset-0 bg-black/50 flex items-center justify-center' 
        },
          h('div', { className: 'text-center' },
            h('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2' }),
            h('p', { className: 'text-white' }, 'Connecting to camera...')
          )
        )
      )
    ),

    // Real-time Recognition Panel
    h('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      // Current Recognitions
      h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
        h('h3', { className: 'text-lg font-semibold text-white mb-4' }, 'Current Recognitions'),
        h('div', { className: 'space-y-3 max-h-80 overflow-y-auto' },
          recognitions.length === 0 ? 
            h('p', { className: 'text-slate-400 text-center py-8' }, 'No faces detected yet...') :
            recognitions.map((recognition, index) => 
              h('div', { 
                key: index,
                className: `p-3 rounded-lg ${getStatusBg(recognition.status)} border border-slate-600/50 animate-fade-in`
              },
                h('div', { className: 'flex items-center justify-between' },
                  h('div', null,
                    h('p', { className: 'font-medium text-white' }, recognition.name),
                    h('p', { className: `text-sm ${getStatusColor(recognition.status)}` }, 
                      `${recognition.status} • ${recognition.timestamp}`
                    )
                  ),
                  h('div', { className: 'text-right' },
                    h('p', { className: 'text-xs text-slate-400' }, 
                      `Confidence: ${(recognition.confidence * 100).toFixed(1)}%`
                    )
                  )
                )
              )
            )
        )
      ),

      // Attendance Marked
      h('div', { className: 'bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6' },
        h('h3', { className: 'text-lg font-semibold text-white mb-4' }, 'Attendance Marked'),
        h('div', { className: 'space-y-3 max-h-80 overflow-y-auto' },
          attendanceMarked.length === 0 ? 
            h('p', { className: 'text-slate-400 text-center py-8' }, 'No attendance marked yet...') :
            attendanceMarked.map((marked, index) => 
              h('div', { 
                key: index,
                className: 'p-3 rounded-lg bg-green-500/20 border border-green-500/30 animate-slide-up'
              },
                h('div', { className: 'flex items-center justify-between' },
                  h('div', null,
                    h('p', { className: 'font-medium text-white' }, marked.name),
                    h('p', { className: `text-sm ${getStatusColor(marked.status)}` }, 
                      `${marked.status} • ${marked.time}`
                    )
                  ),
                  h('div', { className: 'text-green-400' },
                    h('svg', { 
                      className: 'w-5 h-5',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20'
                    },
                      h('path', {
                        fillRule: 'evenodd',
                        d: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
                        clipRule: 'evenodd'
                      })
                    )
                  )
                )
              )
            )
        )
      )
    )
  );
};