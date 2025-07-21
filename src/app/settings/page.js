'use client';

import React, { useState, useMemo } from 'react';
import { useSettings, useUpdateSettings } from '../../store';
import { useTheme } from '../../contexts/ThemeContext';
import { auth } from '../../config/firebase';

// Theme settings component
function ThemeSettings({ settings, onUpdate }) {
  const { isDark, accentColors } = useTheme();
  
  return (
    <div className={`${isDark ? 'bg-gray-900/70' : 'bg-white/70'} backdrop-blur-sm p-6 rounded-2xl shadow-lg border ${isDark ? 'border-gray-700/50' : 'border-white/20'} mb-6 transition-all duration-300 hover:shadow-xl ${isDark ? 'hover:bg-gray-900/80' : 'hover:bg-white/80'}`}>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Theme</h2>
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-3`}>Color Scheme</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={settings.theme === 'light'}
                onChange={(e) => onUpdate({ theme: e.target.value })}
                className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              Light
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={settings.theme === 'dark'}
                onChange={(e) => onUpdate({ theme: e.target.value })}
                className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              Dark
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="system"
                checked={settings.theme === 'system'}
                onChange={(e) => onUpdate({ theme: e.target.value })}
                className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              System
            </label>
          </div>
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-3`}>Accent Color</label>
          <select
            value={settings.accentColor}
            onChange={(e) => onUpdate({ accentColor: e.target.value })}
            className={`w-full border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white/50 text-gray-900'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
          >
            {Object.keys(accentColors).map(colorName => (
              <option key={colorName} value={colorName}>
                {colorName.charAt(0).toUpperCase() + colorName.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// Notification settings component
function NotificationSettings({ settings, onUpdate }) {
  const { isDark } = useTheme();
  
  return (
    <div className={`${isDark ? 'bg-gray-900/70' : 'bg-white/70'} backdrop-blur-sm p-6 rounded-2xl shadow-lg border ${isDark ? 'border-gray-700/50' : 'border-white/20'} mb-6 transition-all duration-300 hover:shadow-xl ${isDark ? 'hover:bg-gray-900/80' : 'hover:bg-white/80'}`}>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Notifications</h2>
      <div className="space-y-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => onUpdate({ emailNotifications: e.target.checked })}
              className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            Email Notifications
          </label>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} ml-6`}>
            Receive task updates and reminders via email
          </p>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => onUpdate({ pushNotifications: e.target.checked })}
              className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            Push Notifications
          </label>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} ml-6`}>
            Receive browser notifications for task updates
          </p>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdate({ soundEnabled: e.target.checked })}
              className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            Sound Effects
          </label>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} ml-6`}>
            Play sounds for notifications and timer completion
          </p>
        </div>
      </div>
    </div>
  );
}

// Pomodoro settings component
function PomodoroSettings({ settings, onUpdate }) {
  const { isDark } = useTheme();
  
  return (
    <div className={`${isDark ? 'bg-gray-900/70' : 'bg-white/70'} backdrop-blur-sm p-6 rounded-2xl shadow-lg border ${isDark ? 'border-gray-700/50' : 'border-white/20'} mb-6 transition-all duration-300 hover:shadow-xl ${isDark ? 'hover:bg-gray-900/80' : 'hover:bg-white/80'}`}>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pomodoro Timer</h2>
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-3`}>
            Focus Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={settings.focusDuration}
            onChange={(e) => onUpdate({ focusDuration: parseInt(e.target.value) })}
            className={`w-full border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white/50 text-gray-900'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-3`}>
            Short Break Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.shortBreakDuration}
            onChange={(e) => onUpdate({ shortBreakDuration: parseInt(e.target.value) })}
            className={`w-full border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white/50 text-gray-900'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-3`}>
            Long Break Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={settings.longBreakDuration}
            onChange={(e) => onUpdate({ longBreakDuration: parseInt(e.target.value) })}
            className={`w-full border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white/50 text-gray-900'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-3`}>
            Sessions Before Long Break
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={settings.sessionsBeforeLongBreak}
            onChange={(e) => onUpdate({ sessionsBeforeLongBreak: parseInt(e.target.value) })}
            className={`w-full border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100' : 'border-gray-200 bg-white/50 text-gray-900'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
          />
        </div>
      </div>
    </div>
  );
}

// Main Settings page component
export default function SettingsPage() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const { isDark } = useTheme();
  const defaultSettings = useMemo(() => ({
    theme: 'system',
    accentColor: 'blue',
    emailNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4
  }), []);
  const [currentSettings, setCurrentSettings] = useState(settings || defaultSettings);

  // Sync currentSettings with store settings
  React.useEffect(() => {
    setCurrentSettings(settings || defaultSettings);
  }, [settings, defaultSettings]); // Include defaultSettings as dependency

  const handleUpdate = async (updates) => {
    const newSettings = { ...currentSettings, ...updates };
    setCurrentSettings(newSettings);
    
    // Get current user and call updateSettings with userId
    const user = auth.currentUser;
    if (user && user.uid) {
      try {
        await updateSettings(user.uid, newSettings);
        console.log('Settings updated successfully');
      } catch (error) {
        console.error('Failed to update settings:', error);
        // Could show a toast notification here
      }
    } else {
      console.warn('No authenticated user, settings saved locally only');
      // Settings are still updated in local state
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="relative mb-8">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800/50 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50'} rounded-3xl -z-10`} />
        <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(#374151_1px,transparent_1px)]' : 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]'} [background-size:16px_16px] opacity-40 -z-10`} />
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Settings</h1>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-8`}>Configure your preferences and customize your task management experience.</p>
      </div>
      <ThemeSettings
        settings={currentSettings}
        onUpdate={handleUpdate}
      />
      <NotificationSettings
        settings={currentSettings}
        onUpdate={handleUpdate}
      />
      <PomodoroSettings
        settings={currentSettings}
        onUpdate={handleUpdate}
      />
      <div className={`mt-8 text-center text-sm ${isDark ? 'text-gray-400 bg-gray-900/70 border-gray-700/50' : 'text-gray-500 bg-white/70 border-white/20'} backdrop-blur-sm rounded-2xl shadow-lg border p-6`}>
        <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>iTaskOrg v1.0.0</p>
        <p className="mt-1">© 2025 iTaskOrg. All rights reserved.</p>
      </div>
    </div>
  );
}