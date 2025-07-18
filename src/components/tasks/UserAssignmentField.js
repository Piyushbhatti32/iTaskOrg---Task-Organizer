import { useState, useEffect, useRef } from 'react';
import { Search, X, User, Shield, Users, ChevronDown, UserPlus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const USER_ROLES = [
  { value: 'member', label: 'Member', icon: User, color: 'text-blue-600' },
  { value: 'admin', label: 'Admin', icon: Shield, color: 'text-purple-600' },
  { value: 'leader', label: 'Leader', icon: Users, color: 'text-green-600' }
];

export default function UserAssignmentField({ 
  selectedUsers = [], 
  onUsersChange, 
  placeholder = "Search and assign users...",
  maxUsers = 5
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
        setShowManualEntry(false);
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
        
        // Filter out already selected users
        const selectedUserIds = selectedUsers.map(user => user.id);
        const filteredUsers = data.users.filter(user => !selectedUserIds.includes(user.id));
        
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

  const handleUserSelect = (user) => {
    if (selectedUsers.length >= maxUsers) {
      return;
    }

    const newUser = {
      ...user,
      role: 'member' // Default role
    };

    onUsersChange([...selectedUsers, newUser]);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleUserRemove = (userId) => {
    onUsersChange(selectedUsers.filter(user => user.id !== userId));
  };

  const handleRoleChange = (userId, newRole) => {
    onUsersChange(
      selectedUsers.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  const getRoleInfo = (role) => {
    return USER_ROLES.find(r => r.value === role) || USER_ROLES[0];
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleManualEmailAdd = () => {
    const email = emailInput.trim();
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (selectedUsers.some(user => user.email === email)) {
      setError('This email is already added');
      return;
    }

    if (selectedUsers.length >= maxUsers) {
      setError(`Maximum ${maxUsers} users allowed`);
      return;
    }

    // Extract name from email (simple heuristic)
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const newUser = {
      id: `manual-${Date.now()}`, // Temporary ID for manual entries
      name: name,
      email: email,
      role: 'member',
      isManual: true // Flag to indicate this was manually added
    };

    onUsersChange([...selectedUsers, newUser]);
    setEmailInput('');
    setShowManualEntry(false);
    setError(null);
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

  const { isDark } = useTheme();

  return (
    <div className="relative" ref={dropdownRef}>
      <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1.5`}>
        Assign to Team Members
      </label>
      
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedUsers.map((user) => {
            const roleInfo = getRoleInfo(user.role);
            const RoleIcon = roleInfo.icon;
            
            return (
              <div
                key={user.id}
                className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-2 rounded-xl border border-blue-200 transition-all duration-200 hover:bg-blue-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                
                {/* Role Selector */}
                <div className="relative">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-xs bg-transparent border-none pr-6 pl-1 py-1 focus:outline-none appearance-none cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {USER_ROLES.map((role) => (
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
                    handleUserRemove(user.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
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
          className={`w-full pl-10 pr-4 py-2.5 border ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-100 placeholder:text-gray-500' : 'border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-400'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto`}>
          {loading && (
            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching users...
            </div>
          )}
          
          {error && (
            <div className="p-4 text-center text-red-500">
              <p className="text-sm">Error: {error}</p>
            </div>
          )}
          
          {!loading && !error && searchQuery.trim().length >= 2 && availableUsers.length === 0 && (
            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-sm mb-3">No registered users found matching &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => setShowManualEntry(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mx-auto"
              >
                <UserPlus className="w-4 h-4" />
                Add email manually
              </button>
            </div>
          )}
          
          {!loading && !error && searchQuery.trim().length < 2 && (
            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-sm mb-3">Type at least 2 characters to search users</p>
              <button
                onClick={() => setShowManualEntry(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mx-auto"
              >
                <UserPlus className="w-4 h-4" />
                Add email manually
              </button>
            </div>
          )}
          
          {/* Manual Email Entry */}
          {showManualEntry && (
            <div className={`p-4 border-b ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Add user by email:</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="user@example.com"
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleManualEmailAdd();
                    }
                  }}
                />
                <button
                  onClick={handleManualEmailAdd}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}
          
          {!loading && !error && availableUsers.length > 0 && (
            <div className="py-2">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full px-4 py-3 text-left ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200 flex items-center gap-3`}
                >
                  {
                      user.photoURL ? (
                        <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )
                    }
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
      
      {/* Error Message */}
      {error && (
        <p className={`mt-2 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
      )}
      
      {/* Helper Text */}
      <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {selectedUsers.length > 0 ? (
          `${selectedUsers.length} of ${maxUsers} users selected`
        ) : (
          "Search for registered users or add emails manually"
        )}
      </p>
    </div>
  );
}
