// Complete localStorage cleanup script
// Run this in your browser console to remove ALL task data from localStorage

console.log('🧹 Starting complete localStorage cleanup...');

// Step 1: Remove the main storage key
const STORAGE_KEY = 'itaskorg-storage';
if (localStorage.getItem(STORAGE_KEY)) {
  localStorage.removeItem(STORAGE_KEY);
  console.log(`✅ Removed ${STORAGE_KEY} from localStorage`);
}

// Step 2: Remove any task-related keys
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (
    key.includes('task') || 
    key.includes('Task') || 
    key.includes('itask') ||
    key.includes('iTask') ||
    key.includes('TASK')
  )) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ Removed ${key} from localStorage`);
});

// Step 3: Clear any Zustand state if available
try {
  if (window.useStore) {
    window.useStore.setState({ tasks: [] });
    console.log('✅ Cleared tasks from Zustand store');
  }
} catch (error) {
  console.log('ℹ️ Could not access Zustand store (this is normal)');
}

// Step 4: Clear sessionStorage too
const sessionKeysToRemove = [];
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && (
    key.includes('task') || 
    key.includes('Task') || 
    key.includes('itask') ||
    key.includes('snapshot')
  )) {
    sessionKeysToRemove.push(key);
  }
}

sessionKeysToRemove.forEach(key => {
  sessionStorage.removeItem(key);
  console.log(`✅ Removed ${key} from sessionStorage`);
});

// Step 5: Show summary
console.log('📊 Cleanup Summary:');
console.log(`   - Removed ${1 + keysToRemove.length} localStorage keys`);
console.log(`   - Removed ${sessionKeysToRemove.length} sessionStorage keys`);
console.log(`   - Cleared Zustand task state`);

console.log('🎉 Complete cleanup finished!');
console.log('💡 Tasks will now ONLY load from Firestore');
console.log('🔄 Refresh the page to see the changes');

// Ask user if they want to reload
if (confirm('✅ Cleanup complete! Refresh page to reload tasks from Firestore?')) {
  window.location.reload();
}
