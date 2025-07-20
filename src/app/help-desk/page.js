'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Plus, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  X,
  Send
} from 'lucide-react';

export default function HelpDeskPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });

  const priorities = [
    { value: 'low', label: 'Low', color: 'green', icon: '🟢' },
    { value: 'medium', label: 'Medium', color: 'yellow', icon: '🟡' },
    { value: 'high', label: 'High', color: 'orange', icon: '🟠' },
    { value: 'urgent', label: 'Urgent', color: 'red', icon: '🔴' }
  ];

  const categories = [
    { value: 'general', label: 'General Support', icon: '❓' },
    { value: 'bug', label: 'Bug Report', icon: '🐛' },
    { value: 'feature', label: 'Feature Request', icon: '💡' },
    { value: 'account', label: 'Account Issues', icon: '👤' },
    { value: 'performance', label: 'Performance', icon: '⚡' },
    { value: 'security', label: 'Security', icon: '🔒' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Tickets' },
    { value: 'open', label: 'Open', icon: '🔓', color: 'blue' },
    { value: 'in-progress', label: 'In Progress', icon: '⏳', color: 'yellow' },
    { value: 'resolved', label: 'Resolved', icon: '✅', color: 'green' },
    { value: 'closed', label: 'Closed', icon: '🔒', color: 'gray' }
  ];

  // Fetch tickets
  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter tickets
  useEffect(() => {
    // Ensure tickets is an array before filtering
    if (!Array.isArray(tickets)) {
      setFilteredTickets([]);
      return;
    }
    
    let filtered = tickets.filter(ticket => 
      ticket.userId === user?.uid &&
      (statusFilter === 'all' || ticket.status === statusFilter) &&
      (ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       ticket.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, user]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/help-desk');
      const data = await response.json();
      
      // Check if the response is an error or if data is not an array
      if (data.error || !Array.isArray(data)) {
        console.error('API returned an error or invalid data:', data);
        setTickets([]);
      } else {
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/help-desk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTicket,
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || user.email
        }),
      });

      if (response.ok) {
        setNewTicket({ title: '', description: '', priority: 'medium', category: 'general' });
        setShowCreateModal(false);
        fetchTickets();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setCreating(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await fetch(`/api/help-desk/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityInfo = (priority) => priorities.find(p => p.value === priority) || priorities[1];
  const getCategoryInfo = (category) => categories.find(c => c.value === category) || categories[0];
  const getStatusInfo = (status) => statusOptions.find(s => s.value === status) || statusOptions[1];

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${isDark ? 'border-gray-800' : 'border-gray-200'} mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                🎫 Help Desk
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                Get help with any issues or submit feature requests
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              New Ticket
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              />
            </div>
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`pl-10 pr-8 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-12 text-center shadow-sm border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              No tickets found
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
              {tickets.length === 0 
                ? "You haven't created any tickets yet. Create your first ticket to get started!" 
                : "No tickets match your current filters."}
            </p>
            {tickets.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              >
                Create First Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.map((ticket) => {
              const priorityInfo = getPriorityInfo(ticket.priority);
              const categoryInfo = getCategoryInfo(ticket.category);
              const statusInfo = getStatusInfo(ticket.status);

              return (
                <div
                  key={ticket.id}
                  className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${isDark ? 'border-gray-800' : 'border-gray-200'} hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryInfo.icon}</span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {categoryInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{priorityInfo.icon}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'} line-clamp-2`}>
                    {ticket.title}
                  </h3>
                  
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4 line-clamp-3`}>
                    {ticket.description}
                  </p>

                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                    Created: {formatDate(ticket.createdAt)}
                    {ticket.updatedAt && (
                      <div>Updated: {formatDate(ticket.updatedAt)}</div>
                    )}
                  </div>

                  {ticket.status !== 'closed' && (
                    <div className="flex gap-2">
                      {ticket.status === 'open' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'in-progress')}
                          className="flex-1 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-xs font-medium hover:bg-yellow-200 transition-colors"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {(ticket.status === 'open' || ticket.status === 'in-progress') && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                          className="flex-1 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {ticket.status === 'resolved' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'closed')}
                          className="flex-1 bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                          Close Ticket
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  Create New Ticket
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Category
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Priority
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.icon} {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Description *
                  </label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    rows={6}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none`}
                    placeholder="Please provide detailed information about the issue, including steps to reproduce if it's a bug..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${
                      isDark 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createTicket}
                    disabled={creating || !newTicket.title.trim() || !newTicket.description.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Create Ticket
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
