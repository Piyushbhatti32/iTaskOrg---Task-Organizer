import { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, CheckSquare, Users, X, Mail } from 'lucide-react';
import Image from 'next/image';

export default function EnhancedUserSearch({ 
  onAssignTask, 
  onAddToGroup, 
  onAddToTeam,
  placeholder = "Search users by email...",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowActions(false);
        setSelectedUser(null);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch users when search query changes
  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setAvailableUsers([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/users/search?email=${encodeURIComponent(searchQuery)}&limit=10&includePhoto=true`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setAvailableUsers(data.users || []);
      } catch (err) {
        setError(err.message);
        setAvailableUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowActions(true);
    setIsOpen(false);
  };

  const handleAction = (action, user) => {
    switch (action) {
      case 'assign_task':
        onAssignTask && onAssignTask(user);
        break;
      case 'add_to_group':
        onAddToGroup && onAddToGroup(user);
        break;
      case 'add_to_team':
        onAddToTeam && onAddToTeam(user);
        break;
    }
    
    // Reset state
    setSelectedUser(null);
    setShowActions(false);
    setSearchQuery('');
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setShowActions(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(true);
    setShowActions(false);
    setSelectedUser(null);
    setError(null);
  };

  const renderUserItem = (user) => (
    <div className="flex items-center gap-3">
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.name}
          width={32}
          height={32}
          className="rounded-full object-cover"
          unoptimized
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1">
        <p className="font-medium text-gray-900">{user.name}</p>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Mail className="w-3 h-3" />
          {user.email}
        </p>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Search Users
      </label>
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 transition-all duration-300 hover:bg-white"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching users...
            </div>
          )}
          
          {!loading && searchQuery.trim().length >= 2 && availableUsers.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No users found matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
          
          {!loading && searchQuery.trim().length < 2 && (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Type at least 2 characters to search users</p>
            </div>
          )}
          
          {!loading && availableUsers.length > 0 && (
            <div className="py-2">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  {renderUserItem(user)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Selection Modal */}
      {showActions && selectedUser && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-900">Select Action</h3>
                <span className="text-sm text-gray-500">for {selectedUser.name}</span>
              </div>
              <button
                onClick={() => {
                  setShowActions(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3">
              {renderUserItem(selectedUser)}
            </div>
          </div>
          
          <div className="p-4 space-y-2">
            {onAssignTask && (
              <button
                onClick={() => handleAction('assign_task', selectedUser)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-blue-200"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Assign Task</p>
                  <p className="text-sm text-gray-500">Create or assign a task to this user</p>
                </div>
              </button>
            )}
            
            {onAddToGroup && (
              <button
                onClick={() => handleAction('add_to_group', selectedUser)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-green-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-green-200"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add to Group</p>
                  <p className="text-sm text-gray-500">Add this user to a group</p>
                </div>
              </button>
            )}
            
            {onAddToTeam && (
              <button
                onClick={() => handleAction('add_to_team', selectedUser)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-purple-200"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add to Team</p>
                  <p className="text-sm text-gray-500">Add this user to a team</p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
