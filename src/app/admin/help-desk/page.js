'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { isAdmin } from '../../../utils/roles';
import { useRouter } from 'next/navigation';
import { 
  Users,
  Search, 
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  UserX,
  Eye,
  Edit3,
  MessageCircle,
  User,
  Calendar,
  Tag,
  AlertTriangle,
  MoreVertical,
  X,
  Send,
  ChevronDown
} from 'lucide-react';

export default function AdminHelpDeskPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(null); // null = checking, true = authorized, false = not authorized

  // Admin users - in a real app, this would come from your user management system
  const adminUsers = [
    { uid: 'admin1', name: 'John Admin', email: 'john@company.com' },
    { uid: 'admin2', name: 'Jane Support', email: 'jane@company.com' },
    { uid: user?.uid, name: user?.displayName || user?.email, email: user?.email }
  ];

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

  const priorityFilterOptions = [
    { value: 'all', label: 'All Priorities' },
    ...priorities
  ];

  const assigneeFilterOptions = [
    { value: 'all', label: 'All Assignees' },
    { value: 'unassigned', label: 'Unassigned' },
    ...adminUsers.map(admin => ({ value: admin.uid, label: admin.name }))
  ];

  // Check if user is admin
  useEffect(() => {
    if (user) {
      if (isAdmin(user)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.push('/help-desk'); // Redirect non-admin users to regular help desk
      }
    } else {
      setIsAuthorized(null); // Still checking
    }
  }, [user, router]);

  // Fetch all tickets (admin can see all)
  useEffect(() => {
    if (isAuthorized === true) {
      fetchAllTickets();
    }
  }, [isAuthorized]);

  // Filter tickets
  useEffect(() => {
    let filtered = Array.isArray(tickets) ? tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || 
                             (assigneeFilter === 'unassigned' && !ticket.assignedTo) ||
                             ticket.assignedTo === assigneeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    }) : [];

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

  const fetchAllTickets = async () => {
    try {
      console.log('🔍 Fetching tickets from admin API...');
      
      const response = await fetch('/api/admin/help-desk');
      const data = await response.json();
      
      console.log('🔍 Admin API response type:', typeof data);
      console.log('🔍 Admin API response:', data);
      console.log('🔍 Is array:', Array.isArray(data));
      
      // Ensure we always have an array
      if (Array.isArray(data)) {
        console.log('✅ Got valid array with', data.length, 'tickets');
        setTickets(data);
      } else {
        console.log('⚠️ API did not return array, using empty array');
        setTickets([]);
      }
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await fetch(`/api/admin/help-desk/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, updatedBy: user.uid }),
      });
      fetchAllTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const assignTicket = async (ticketId, assigneeId) => {
    try {
      await fetch(`/api/admin/help-desk/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignedTo: assigneeId,
          assignedBy: user.uid,
          assignedAt: new Date().toISOString()
        }),
      });
      fetchAllTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, assignedTo: assigneeId });
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  const addInternalNote = async () => {
    if (!newNote.trim() || !selectedTicket) return;

    setAddingNote(true);
    try {
      await fetch(`/api/admin/help-desk/${selectedTicket.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: newNote,
          authorId: user.uid,
          authorName: user.displayName || user.email,
          isInternal: true
        }),
      });
      
      setNewNote('');
      // Refresh ticket details
      const response = await fetch(`/api/admin/help-desk/${selectedTicket.id}`);
      const updatedTicket = await response.json();
      setSelectedTicket(updatedTicket);
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
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
  const getAssigneeInfo = (uid) => adminUsers.find(admin => admin.uid === uid);

  const getTicketStats = () => {
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length
    };
    return stats;
  };

  const stats = getTicketStats();

  // Don't render anything while checking authorization or for non-admin users
  if (isAuthorized === null || isAuthorized === false || loading) {
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
                🛠️ Admin Help Desk
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                Manage all support tickets and help users resolve issues
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{stats.total}</p>
                </div>
                <Users className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Open</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.open}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-700">{stats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Urgent</p>
                  <p className="text-2xl font-bold text-red-700">{stats.urgent}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search tickets, users, emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-3 rounded-xl border ${
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
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className={`px-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              >
                {priorityFilterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className={`px-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              >
                {assigneeFilterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        {filteredTickets.length === 0 ? (
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-12 text-center shadow-sm border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              No tickets found
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {tickets.length === 0 
                ? "No tickets have been created yet." 
                : "No tickets match your current filters."}
            </p>
          </div>
        ) : (
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-sm border ${isDark ? 'border-gray-800' : 'border-gray-200'} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Ticket</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>User</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Priority</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Assigned</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Created</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-900' : 'bg-white'} divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
                  {filteredTickets.map((ticket) => {
                    const priorityInfo = getPriorityInfo(ticket.priority);
                    const categoryInfo = getCategoryInfo(ticket.category);
                    const statusInfo = getStatusInfo(ticket.status);
                    const assigneeInfo = getAssigneeInfo(ticket.assignedTo);

                    return (
                      <tr key={ticket.id} className={`hover:${isDark ? 'bg-gray-800' : 'bg-gray-50'} transition-colors`}>
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">{categoryInfo.icon}</span>
                            <div>
                              <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} line-clamp-1`}>
                                {ticket.title}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                {categoryInfo.label}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                              {ticket.userName}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {ticket.userEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{priorityInfo.icon}</span>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {priorityInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {assigneeInfo ? (
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {assigneeInfo.name}
                              </span>
                            </div>
                          ) : (
                            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(ticket.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowTicketModal(true);
                            }}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ticket Detail Modal */}
        {showTicketModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  Ticket Details
                </h2>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                      {selectedTicket.title}
                    </h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* Status Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {selectedTicket.status === 'open' && (
                      <button
                        onClick={() => updateTicketStatus(selectedTicket.id, 'in-progress')}
                        className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {(selectedTicket.status === 'open' || selectedTicket.status === 'in-progress') && (
                      <button
                        onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                        className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {selectedTicket.status === 'resolved' && (
                      <button
                        onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                        className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>

                  {/* Internal Notes */}
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                      Internal Notes
                    </h4>
                    
                    {/* Add Note */}
                    <div className="space-y-3">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add an internal note visible only to admin users..."
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          isDark 
                            ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none`}
                      />
                      <button
                        onClick={addInternalNote}
                        disabled={addingNote || !newNote.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {addingNote ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Add Note
                      </button>
                    </div>

                    {/* Notes List */}
                    <div className="mt-4 space-y-3">
                      {selectedTicket.notes?.filter(note => note.isInternal).map((note, index) => (
                        <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {note.authorName}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {formatDate(note.createdAt)}
                            </span>
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {note.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* User Info */}
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                      User Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Name:</span>
                        <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {selectedTicket.userName}
                        </p>
                      </div>
                      <div>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email:</span>
                        <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {selectedTicket.userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Meta */}
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                      Ticket Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Priority:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span>{getPriorityInfo(selectedTicket.priority).icon}</span>
                          <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            {getPriorityInfo(selectedTicket.priority).label}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Category:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span>{getCategoryInfo(selectedTicket.category).icon}</span>
                          <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            {getCategoryInfo(selectedTicket.category).label}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span>{getStatusInfo(selectedTicket.status).icon}</span>
                          <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            {getStatusInfo(selectedTicket.status).label}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Created:</span>
                        <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {formatDate(selectedTicket.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Assignment */}
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                      Assignment
                    </h4>
                    <select
                      value={selectedTicket.assignedTo || ''}
                      onChange={(e) => assignTicket(selectedTicket.id, e.target.value || null)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    >
                      <option value="">Unassigned</option>
                      {adminUsers.map(admin => (
                        <option key={admin.uid} value={admin.uid}>
                          {admin.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
