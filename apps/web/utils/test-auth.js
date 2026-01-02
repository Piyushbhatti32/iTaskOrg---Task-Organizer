import { getFirebaseAuth } from "@/lib/firebase-client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut
} from 'firebase/auth';
import { createUserProfile } from './db';

const auth = getFirebaseAuth();

/**
 * Test user registration flow
 */
export const testRegistration = async () => {
  try {
    console.log('🧪 Testing user registration...');
    
    // Generate a random test email
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'Test123!';
    
    // Step 1: Create user account
    console.log('Step 1: Creating user account...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ User account created successfully');
    
    // Step 2: Send verification email
    console.log('Step 2: Sending verification email...');
    await sendEmailVerification(userCredential.user);
    console.log('✅ Verification email sent successfully');
    
    // Step 3: Update profile
    console.log('Step 3: Updating user profile...');
    await updateProfile(userCredential.user, {
      displayName: 'Test User'
    });
    console.log('✅ Profile updated successfully');
    
    // Step 4: Create user profile in Firestore
    console.log('Step 4: Creating user profile in Firestore...');
    await createUserProfile(userCredential.user.uid, {
      email: testEmail,
      displayName: 'Test User'
    });
    console.log('✅ User profile created in Firestore');
    
    // Step 5: Sign out
    console.log('Step 5: Signing out...');
    await signOut(auth);
    console.log('✅ Signed out successfully');
    
    return {
      success: true,
      email: testEmail,
      password: testPassword
    };
  } catch (error) {
    console.error('❌ Registration test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test user login flow
 */
export const testLogin = async (email, password) => {
  try {
    console.log('🧪 Testing user login...');
    
    // Step 1: Sign in
    console.log('Step 1: Signing in...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Signed in successfully');
    
    // Step 2: Check email verification
    console.log('Step 2: Checking email verification...');
    const isEmailVerified = userCredential.user.emailVerified;
    console.log('Email verification status:', isEmailVerified);
    
    // Step 3: Sign out
    console.log('Step 3: Signing out...');
    await signOut(auth);
    console.log('✅ Signed out successfully');
    
    return {
      success: true,
      emailVerified: isEmailVerified
    };
  } catch (error) {
    console.error('❌ Login test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Run all auth tests
 */
export const runAuthTests = async () => {
  console.log('🧪 Starting authentication tests...\n');
  
  // Test 1: Registration
  console.log('Test 1: Registration Flow');
  const regResult = await testRegistration();
  console.log('Registration result:', regResult);
  console.log('\n---\n');
  
  if (regResult.success) {
    // Test 2: Login
    console.log('Test 2: Login Flow');
    const loginResult = await testLogin(regResult.email, regResult.password);
    console.log('Login result:', loginResult);
  }
  
  console.log('\n🧪 Authentication tests completed');
}; 