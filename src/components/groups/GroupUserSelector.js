import { useState, useEffect, useRef } from 'react';
import { Search, X, Mail, Shield, Users, User, ChevronDown, UserPlus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const GROUP_ROLES = [
  { value: 'member', label: 'Member', icon: User, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'moderator', label: 'Moderator', icon: Shield, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'admin', label: 'Admin', icon: Users, color: 'bg-green-100 text-green-800 border-green-200' }
];

export default function GroupUserSelector({ 
  selectedUsers = [], 
  onUsersChange, 
  placeholder = "Search users by email or name...",
  maxUsers = 20
}) {
  const { isDark } = useTheme();
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
    return GROUP_ROLES.find(r => r.value === role) || GROUP_ROLES[0];
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

  return (
    <div className="relative" ref={dropdownRef}>
      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
        Add Group Members
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
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-medium text-sm transition-all duration-200 hover:shadow-sm ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : roleInfo.color
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDark ? 'bg-gray-600 text-gray-200' : 'bg-current opacity-20 text-current'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user.name}</span>
                  {user.isManual && (
                    <Mail className="w-3 h-3 opacity-60" title="Manually added" />
                  )}
                </div>
                
                {/* Role Selector */}
                <div className="relative">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.email, e.target.value)}
                    className={`text-xs border-none pr-5 pl-1 py-1 focus:outline-none appearance-none cursor-pointer font-medium ${
                      isDark 
                        ? 'bg-transparent text-gray-200' 
                        : 'bg-transparent'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {GROUP_ROLES.map((role) => (
                      <option key={role.value} value={role.value} className={isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-900'}>
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
                  className={`transition-opacity ${
                    isDark ? 'text-red-400 hover:text-red-300' : 'text-current hover:opacity-80'
                  }`}
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
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDark 
              ? 'border-gray-600 bg-gray-800/50 text-white placeholder-gray-400' 
              : 'border-gray-200 bg-white/50 text-gray-900 placeholder-gray-500'
          }`}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className={`mt-2 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto ${
          isDark ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
        }`}>
          {loading && (
            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching users...
            </div>
          )}
          
          {!loading && searchQuery.trim().length >= 2 && availableUsers.length === 0 && (
            <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-sm mb-3">No registered users found matching &ldquo;{searchQuery}&rdquo;</p>
              <button
                onClick={() => setShowManualEntry(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mx-auto"
              >
                <UserPlus className="w-4 h-4" />
                Add email manually
              </button>
            </div>
          )}
          
          {!loading && searchQuery.trim().length < 2 && (
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
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
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
          
          {!loading && availableUsers.length > 0 && (
            <div className="py-2">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full px-4 py-3 text-left transition-colors duration-200 flex items-center gap-3 ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    isDark ? 'bg-gray-600' : 'bg-gray-600'
                  }`}>
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
