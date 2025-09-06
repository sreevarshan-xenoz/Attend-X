// Main entry point - Initialize the React application
// ReactDOM is globally available
const { createRoot } = ReactDOM;

// Wait for all modules (including your components) to load
// window.App will be available after all <script type="text/babel"> tags are processed
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the app
  const root = createRoot(document.getElementById('root'));
  
  // Render window.App (your main App component is now on the window object)
  root.render(React.createElement(window.App)); // window.App nu maathitom
  
  // Add global error handling
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
  
  console.log('AMS District Dashboard initialized successfully');
});