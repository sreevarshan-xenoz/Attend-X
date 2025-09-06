// 3D Scene Component using Spline
const { createElement: h, useRef, useEffect, useState } = React; // useState-a inga add panrom

window.Spline3DScene = ({ // export const Spline3DScene ku badhila window.Spline3DScene
  url, 
  className = '',
  loadingText = "Loading 3D Scene...",
  onLoad = () => {}
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (containerRef.current && url) {
      setIsLoading(true);
      setError(null);
      
      // Create spline-viewer element
      const splineViewer = document.createElement('spline-viewer');
      splineViewer.setAttribute('url', url);
      splineViewer.setAttribute('loading-anim-type', 'spinner-small-light');
      splineViewer.style.width = '100%';
      splineViewer.style.height = '100%';
      splineViewer.style.borderRadius = '1rem';
      
      // Clear container and add viewer
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(splineViewer);
      
      // Handle load events
      splineViewer.addEventListener('load', () => {
        setIsLoading(false);
        onLoad();
      });
      
      splineViewer.addEventListener('error', (e) => {
        setError('Failed to load 3D scene');
        setIsLoading(false);
        console.error('Spline viewer error:', e);
      });
    }
  }, [url, onLoad]);

  return h('div', { 
    className: `relative bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden ${className}` 
  },
    h('div', { 
      ref: containerRef,
      className: 'w-full h-full min-h-[300px] flex items-center justify-center'
    }),
    
    // Loading overlay
    isLoading && h('div', { 
      className: 'absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center' 
    },
      h('div', { className: 'text-center' },
        h('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4' }),
        h('p', { className: 'text-slate-300' }, loadingText)
      )
    ),
    
    // Error overlay
    error && h('div', { 
      className: 'absolute inset-0 bg-red-900/80 backdrop-blur-sm flex items-center justify-center' 
    },
      h('div', { className: 'text-center' },
        h('div', { className: 'text-red-400 text-4xl mb-4' }, '⚠️'),
        h('p', { className: 'text-red-300' }, error)
      )
    )
  );
};

window.Floating3DIcon = ({ // export const Floating3DIcon ku badhila window.Floating3DIcon
  icon, 
  position = 'bottom-right',
  onClick,
  className = ''
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return h('button', {
    onClick,
    className: `fixed ${positionClasses[position]} z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-white text-2xl ${className}`
  }, icon);
};