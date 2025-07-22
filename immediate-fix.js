// IMMEDIATE FIX - Run this in browser console RIGHT NOW
// This will clear everything and force reload the correct tasks

console.log('🚨 IMMEDIATE TASK SYNC FIX 🚨');

// Step 1: Clear ALL localStorage
console.log('Step 1: Clearing localStorage...');
localStorage.clear();
console.log('✅ localStorage cleared');

// Step 2: Clear sessionStorage  
console.log('Step 2: Clearing sessionStorage...');
sessionStorage.clear();
console.log('✅ sessionStorage cleared');

// Step 3: Clear current browser cache for this domain
console.log('Step 3: Attempting to clear browser cache...');
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
    });
  });
}

// Step 4: Show what we found
console.log('🔍 Checking current state...');
console.log('Current URL:', window.location.href);
console.log('LocalStorage length:', localStorage.length);
console.log('SessionStorage length:', sessionStorage.length);

// Step 5: Force hard reload
console.log('⚡ FORCING HARD RELOAD...');
console.log('This will reload the page with no cache');

// Use location.reload with forceReload parameter
setTimeout(() => {
  window.location.reload(true);
}, 1000);

console.log('✅ Fix initiated - page will reload in 1 second');
console.log('📝 After reload, you should only see your 8 real Firestore tasks');
console.log('🎯 Tasks from Firestore: Breakfast, Bath, dinner, Dinner (x4), His');
