'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroupChat } from '@/hooks/useGroupChat';

export default function GroupChat({ groupId }) {
  const { user } = useAuth();
  const { messages, isConnected, error, sendMessage, loadMessages } = useGroupChat(groupId);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [groupTasks, setGroupTasks] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Load initial messages and group tasks
  useEffect(() => {
    loadMessages();
    loadGroupTasks();
  }, [loadMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load group tasks for mentions
  const loadGroupTasks = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/tasks`, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load tasks');
      }

      const data = await response.json();
      setGroupTasks(data.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const success = sendMessage(newMessage, replyTo?.id);
    if (success) {
      setNewMessage('');
      setReplyTo(null);
      setShowTaskPicker(false);
    }
  };

  // Handle task mention
  const handleTaskMention = (task) => {
    setNewMessage((prev) => `${prev}@task${task.id} `);
    setShowTaskPicker(false);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Group Chat</h2>
          <div className="text-sm">
            {isConnected ? (
              <span className="text-green-600 flex items-center">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                Connected
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <span className="h-2 w-2 bg-red-600 rounded-full mr-2"></span>
                Disconnected
              </span>
            )}
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.createdBy === user.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] ${
                message.createdBy === user.uid
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              } rounded-lg p-3`}
            >
              {/* Reply Reference */}
              {message.replyTo && (
                <div
                  className={`text-sm mb-2 p-2 rounded ${
                    message.createdBy === user.uid
                      ? 'bg-blue-700'
                      : 'bg-gray-200'
                  }`}
                >
                  {messages.find(m => m.id === message.replyTo)?.content || 'Message not found'}
                </div>
              )}

              {/* Message Content */}
              <div className="space-y-1">
                <div className="break-words">
                  {/* Parse and render task mentions */}
                  {message.content.split(/(@task\d+)/).map((part, index) => {
                    if (part.match(/@task\d+/)) {
                      const taskId = part.replace('@task', '');
                      const task = message.mentions?.find(m => m.id === taskId);
                      return task ? (
                        <span
                          key={index}
                          className={`inline-flex items-center rounded px-2 py-0.5 text-sm ${
                            message.createdBy === user.uid
                              ? 'bg-blue-700'
                              : 'bg-gray-200 text-blue-600'
                          }`}
                        >
                          {task.title}
                          <span className="ml-1 text-xs">
                            ({task.status})
                          </span>
                        </span>
                      ) : part;
                    }
                    return part;
                  })}
                </div>
                <div className="flex items-center justify-between text-xs opacity-70">
                  <span>{formatTime(message.timestamp)}</span>
                  <button
                    onClick={() => setReplyTo(message)}
                    className="ml-2 hover:opacity-100"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">Replying to:</span>
            <span className="font-medium truncate max-w-[200px]">
              {replyTo.content}
            </span>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-20"
          />
          
          {/* Task Mention Button */}
          <button
            type="button"
            onClick={() => setShowTaskPicker(!showTaskPicker)}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            type="submit"
            disabled={!isConnected || !newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>

        {/* Task Picker */}
        {showTaskPicker && (
          <div className="absolute bottom-full mb-2 left-4 right-4 bg-white rounded-lg shadow-lg border max-h-48 overflow-y-auto">
            {groupTasks.length > 0 ? (
              <div className="p-2 space-y-1">
                {groupTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskMention(task)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                  >
                    <span className="font-medium">{task.title}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({task.status})
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No tasks available
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
} 