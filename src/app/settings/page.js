
'use client';
import React from 'react';

import { useState } from 'react';
import { useSettings, useUpdateSettings } from '../../store';

// Theme settings component
function ThemeSettings({ settings, onUpdate }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Theme</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Color Scheme</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={settings.theme === 'light'}
                onChange={(e) => onUpdate({ theme: e.target.value })}
                className="mr-2"
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
                className="mr-2"
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
                className="mr-2"
              />
              System
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Accent Color</label>
          <select
            value={settings.accentColor}
            onChange={(e) => onUpdate({ accentColor: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="blue">Blue</option>
            <option value="purple">Purple</option>
            <option value="green">Green</option>
            <option value="red">Red</option>
            <option value="orange">Orange</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Notification settings component
function NotificationSettings({ settings, onUpdate }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      <div className="space-y-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => onUpdate({ emailNotifications: e.target.checked })}
              className="mr-2"
            />
            Email Notifications
          </label>
          <p className="text-sm text-gray-500 ml-6">
            Receive task updates and reminders via email
          </p>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => onUpdate({ pushNotifications: e.target.checked })}
              className="mr-2"
            />
            Push Notifications
          </label>
          <p className="text-sm text-gray-500 ml-6">
            Receive browser notifications for task updates
          </p>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdate({ soundEnabled: e.target.checked })}
              className="mr-2"
            />
            Sound Effects
          </label>
          <p className="text-sm text-gray-500 ml-6">
            Play sounds for notifications and timer completion
          </p>
        </div>
      </div>
    </div>
  );
}

// Pomodoro settings component
function PomodoroSettings({ settings, onUpdate }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Pomodoro Timer</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Focus Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={settings.focusDuration}
            onChange={(e) => onUpdate({ focusDuration: parseInt(e.target.value) })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Short Break Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.shortBreakDuration}
            onChange={(e) => onUpdate({ shortBreakDuration: parseInt(e.target.value) })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Long Break Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={settings.longBreakDuration}
            onChange={(e) => onUpdate({ longBreakDuration: parseInt(e.target.value) })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Sessions Before Long Break
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={settings.sessionsBeforeLongBreak}
            onChange={(e) => onUpdate({ sessionsBeforeLongBreak: parseInt(e.target.value) })}
            className="w-full border rounded px-3 py-2"
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
  const defaultSettings = {
    theme: 'system',
    accentColor: 'blue',
    emailNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4
  };
  const [currentSettings, setCurrentSettings] = useState(settings || defaultSettings);

  // Sync currentSettings with store settings
  React.useEffect(() => {
    setCurrentSettings(settings || defaultSettings);
  }, [settings]);

  const handleUpdate = (updates) => {
    const newSettings = { ...currentSettings, ...updates };
    setCurrentSettings(newSettings);
    updateSettings(newSettings);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
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
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>iTaskOrg v1.0.0</p>
        <p className="mt-1">© 2024 iTaskOrg. All rights reserved.</p>
      </div>
    </div>
  );
}