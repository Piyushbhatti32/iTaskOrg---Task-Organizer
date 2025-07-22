// Manual sync fix - Run this in your browser console
// This will clear local tasks and reload from Firestore

console.log('🚀 Starting manual task sync fix...');

// Step 1: Get current user
const getCurrentUser = () => {
  return new Promise((resolve) => {
    if (window.firebase?.auth?.currentUser) {
      resolve(window.firebase.auth.currentUser);
    } else {
      // Try accessing through the store or auth context
      const user = document.querySelector('[data-user-uid]')?.dataset?.userUid;
      if (user) resolve({ uid: user });
      else resolve(null);
    }
  });
};

// Step 2: Clear local tasks and reload from Firestore
const fixTaskSync = async () => {
  try {
    console.log('Step 1: Clearing local tasks...');
    
    // Access the Zustand store (assuming it's available globally)
    if (window.useStore) {
      const store = window.useStore.getState();
      
      // Clear local tasks
      window.useStore.setState({ tasks: [] });
      console.log('✅ Local tasks cleared');
      
      // Get current user UID
      const userId = 'wbX6J9xrAih1Rjhd5x3H5XZxiLa2'; // From your logs
      
      console.log('Step 2: Reloading from Firestore...');
      
      // Force reload from Firestore
      const response = await fetch(`/api/tasks?userId=${userId}`);
      const result = await response.json();
      
      if (response.ok) {
        window.useStore.setState({ tasks: result.tasks || [] });
        console.log(`✅ Success! Loaded ${result.tasks?.length || 0} tasks from Firestore`);
        console.log('🎉 Task sync fix completed successfully!');
        console.log('Tasks loaded:', result.tasks?.map(t => ({ id: t.id, title: t.title })));
      } else {
        console.error('❌ Failed to reload tasks:', result.error);
      }
    } else {
      console.error('❌ Store not accessible. Try using the TaskDebugger instead.');
    }
  } catch (error) {
    console.error('❌ Manual sync fix failed:', error);
  }
};

// Execute the fix
fixTaskSync();

// Alternative: If the above doesn't work, try this simple localStorage clear
const alternativeFix = () => {
  console.log('🧨 Alternative fix: Clearing localStorage...');
  localStorage.clear();
  console.log('✅ localStorage cleared. Please refresh the page.');
  
  if (confirm('LocalStorage cleared! Refresh page to complete the fix?')) {
    window.location.reload();
  }
};

console.log('💡 If the automatic fix doesn\'t work, run: alternativeFix()');
