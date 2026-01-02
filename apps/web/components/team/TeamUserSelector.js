import { useState, useEffect, useRef } from 'react';
import { Search, X, Mail, Shield, Users, User, ChevronDown, UserPlus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const DEFAULT_TEAM_ROLES = [
  { value: 'member', label: 'Member', icon: User, color: 'bg-blue-100 text-blue-800 border-blue-200', darkColor: 'bg-blue-900/30 text-blue-300 border-blue-600' },
  { value: 'admin', label: 'Admin', icon: Shield, color: 'bg-purple-100 text-purple-800 border-purple-200', darkColor: 'bg-purple-900/30 text-purple-300 border-purple-600' },
  { value: 'leader', label: 'Leader', icon: Users, color: 'bg-green-100 text-green-800 border-green-200', darkColor: 'bg-green-900/30 text-green-300 border-green-600' }
];

export default function TeamUserSelector({ 
  selectedUsers = [], 
  onUsersChange, 
  customRoles = [],
  onCustomRoleAdd,
  placeholder = "Search users by email or name...",
  maxUsers = 10
}) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [showCustomRoleEntry, setShowCustomRoleEntry] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Combine default roles with custom roles
  const TEAM_ROLES = [
    ...DEFAULT_TEAM_ROLES,
    ...customRoles.map(role => ({
      value: role.toLowerCase().replace(/\s+/g, '_'),
      label: role,
      icon: User,
      color: isDark ? 'bg-gray-800/30 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200',
      darkColor: 'bg-gray-800/30 text-gray-300 border-gray-600',
      isCustom: true
    }))
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
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
        const response = await fetch(`/api/users?q=${encodeURIComponent(searchQuery)}&limit=10`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        
        // Filter out already selected users
        const selectedEmails = selectedUsers.map(user => user.email);
        const filteredUsers = data.users.filter(user => !selectedEmails.includes(user.email));
        
        setAvailableUsers(filteredUsers);
      } catch (err) {
        setError(err.message);
        setAvailableUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedUsers]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleUserSelect = (user) => {
    if (selectedUsers.length >= maxUsers) {
      return;
    }

    const newUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'member' // Default role
    };

    onUsersChange([...selectedUsers, newUser]);
    setSearchQuery('');
    setIsOpen(false);
  };


  const handleUserRemove = (email) => {
    onUsersChange(selectedUsers.filter(user => user.email !== email));
  };

  const handleRoleChange = (email, newRole) => {
    onUsersChange(
      selectedUsers.map(user =>
        user.email === email ? { ...user, role: newRole } : user
      )
    );
  };

  const getRoleInfo = (role) => {
    return TEAM_ROLES.find(r => r.value === role) || TEAM_ROLES[0];
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(true);
    setError(null);
  };

  const handleCustomRoleAdd = () => {
    const role = customRoleInput.trim();
    
    if (!role) {
      setError('Please enter a role name');
      return;
    }

    if (TEAM_ROLES.some(r => r.label.toLowerCase() === role.toLowerCase())) {
      setError('This role already exists');
      return;
    }

    if (onCustomRoleAdd) {
      onCustomRoleAdd(role);
    }
    
    setCustomRoleInput('');
    setShowCustomRoleEntry(false);
    setError(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
        Add Team Members
      </label>
      
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedUsers.map((user) => {
            const roleInfo = getRoleInfo(user.role);
            const RoleIcon = roleInfo.icon;
            
            return (
              <div
                key={user.email}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-medium text-sm transition-all duration-200 hover:shadow-sm ${isDark ? roleInfo.darkColor || roleInfo.color : roleInfo.color}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-current opacity-20 flex items-center justify-center text-current text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
                
                {/* Role Selector */}
                <div className="relative">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.email, e.target.value)}
                    className="text-xs bg-transparent border-none pr-5 pl-1 py-1 focus:outline-none appearance-none cursor-pointer font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {TEAM_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none" />
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserRemove(user.email);
                  }}
                  className="text-current hover:opacity-80 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="relative cursor-pointer">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={selectedUsers.length >= maxUsers ? `Maximum ${maxUsers} users selected` : placeholder}
          disabled={selectedUsers.length >= maxUsers}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'border-gray-600 bg-gray-800/50 text-white placeholder-gray-400' : 'border-gray-200 bg-white/50 text-gray-900 placeholder-gray-500'}`}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className={`mt-2 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto ${isDark ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'}`}>
          {loading && (
            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching users...
            </div>
          )}
          
          {!loading && searchQuery.trim().length >= 2 && availableUsers.length === 0 && (
            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-sm">No registered users found matching &quot;{searchQuery}&quot;</p>
              <p className="text-xs mt-1 opacity-75">Only registered users can be added to teams</p>
            </div>
          )}
          
          {!loading && searchQuery.trim().length < 2 && (
            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-sm">Type at least 2 characters to search registered users</p>
            </div>
          )}
          
          
          {!loading && availableUsers.length > 0 && (
            <div className="py-2">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full px-4 py-3 text-left transition-colors duration-200 flex items-center gap-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{user.name}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Custom Role Management Section */}
      {onCustomRoleAdd && (
        <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'border-gray-600 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
          <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Custom Roles</h4>
          
          {customRoles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {customRoles.map((role, index) => (
                <span key={index} className={`px-2 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                  {role}
                </span>
              ))}
            </div>
          )}
          
          {!showCustomRoleEntry ? (
            <button
              onClick={() => setShowCustomRoleEntry(true)}
              className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
            >
              + Add Custom Role
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                placeholder="e.g., Designer, Tester, DevOps"
                className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCustomRoleAdd();
                  }
                }}
              />
              <button
                onClick={handleCustomRoleAdd}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCustomRoleEntry(false);
                  setCustomRoleInput('');
                }}
                className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Helper Text */}
      <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {selectedUsers.length > 0 ? (
          `${selectedUsers.length} of ${maxUsers} registered users selected`
        ) : (
          "Search for registered users by email or name"
        )}
      </p>
    </div>
  );
}
