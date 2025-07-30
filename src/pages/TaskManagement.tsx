import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Clock, User, Flag, CheckCircle, AlertCircle, MessageSquare, Paperclip, Eye, Edit, Trash2, Grid, List } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { mockApi } from '../utils/mockApi';
import { useAuth } from '../contexts/AuthContext';
import ProfilePicture from '../components/ProfilePicture';

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: {
    _id: string;
    fullName: string;
    email: string;
  };
  assignedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: 'development' | 'design' | 'testing' | 'documentation' | 'meeting' | 'review' | 'other';
  dueDate: string;
  startDate: string;
  completedAt?: string;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  tags: string[];
  comments: Array<{
    _id: string;
    user: { _id: string; fullName: string };
    comment: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface TaskForm {
  title: string;
  description: string;
  assignedTo: string;
  priority: string;
  category: string;
  dueDate: string;
  estimatedHours: number;
  tags: string;
}

interface TaskStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
}

const TaskManagement: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewFilter, setViewFilter] = useState('assigned'); // 'assigned' or 'created'
  const [employees, setEmployees] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<TaskForm>();

  useEffect(() => {
    fetchTasks();
    fetchStats();
    fetchEmployees();
  }, [currentPage, searchTerm, statusFilter, priorityFilter, categoryFilter, viewFilter]);

  const fetchTasksFromSupabase = async () => {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_user:users!tasks_assigned_to_fkey(id, full_name, email),
          assigned_by_user:users!tasks_assigned_by_fkey(id, full_name, email),
          task_comments(
            id,
            comment,
            created_at,
            user:users(id, full_name)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply filters based on user role and view
      if (user?.role !== 'admin') {
        if (viewFilter === 'created') {
          query = query.eq('assigned_by', user?.id);
        } else {
          query = query.eq('assigned_to', user?.id);
        }
      }

      if (statusFilter) query = query.eq('status', statusFilter);
      if (priorityFilter) query = query.eq('priority', priorityFilter);
      if (categoryFilter) query = query.eq('category', categoryFilter);
      if (searchTerm) query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tasks from Supabase:', error);
      throw error;
    }
  };

  const fetchTasks = async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
        view: viewFilter
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;

      const response = await mockApi.tasks.get(params);
      setTasks(response.data.tasks);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await mockApi.tasks.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching task stats:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await mockApi.employees.get({ limit: 100 });
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const onSubmit = async (data: TaskForm) => {
    try {
      const taskData = {
        ...data,
        estimatedHours: Number(data.estimatedHours),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
      };

      await mockApi.tasks.create(taskData);
      toast.success('Task created successfully');
      setShowModal(false);
      reset();
      fetchTasks();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleStatusUpdate = async (taskId: string, status: string) => {
    try {
      await mockApi.tasks.update(taskId, { status });
      toast.success('Task status updated successfully');
      fetchTasks();
      fetchStats();
      if (selectedTask && selectedTask._id === taskId) {
        const updatedTask = await mockApi.tasks.getById(taskId);
        setSelectedTask(updatedTask.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task status');
    }
  };

  const handleProgressUpdate = async (taskId: string, progress: number) => {
    try {
      await mockApi.tasks.update(taskId, { progress });
      toast.success('Task progress updated successfully');
      fetchTasks();
      if (selectedTask && selectedTask._id === taskId) {
        const updatedTask = await mockApi.tasks.getById(taskId);
        setSelectedTask(updatedTask.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task progress');
    }
  };

  const handleAddComment = async (taskId: string) => {
    if (!newComment.trim()) return;

    try {
      await mockApi.tasks.addComment(taskId, newComment.trim());
      toast.success('Comment added successfully');
      setNewComment('');
      if (selectedTask && selectedTask._id === taskId) {
        const updatedTask = await mockApi.tasks.getById(taskId);
        setSelectedTask(updatedTask.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    }
  };

  const handleViewDetails = async (taskId: string) => {
    try {
      const response = await mockApi.tasks.getById(taskId);
      setSelectedTask(response.data);
      setShowDetailsModal(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch task details');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await mockApi.tasks.delete(taskId);
        toast.success('Task deleted successfully');
        fetchTasks();
        fetchStats();
        setShowDetailsModal(false);
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete task');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'development':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'design':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      case 'testing':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'documentation':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'meeting':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
      case 'review':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'completed' && status !== 'cancelled';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/25 mb-6">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Task Management
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Organize, track, and manage your team's tasks efficiently
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Tasks</dt>
                    <dd className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      {stats.totalTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending</dt>
                    <dd className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                      {stats.pendingTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">In Progress</dt>
                    <dd className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                      {stats.inProgressTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Completed</dt>
                    <dd className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                      {stats.completedTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Overdue</dt>
                    <dd className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                      {stats.overdueTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Flag className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">High Priority</dt>
                    <dd className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                      {stats.highPriorityTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={viewFilter}
                onChange={(e) => setViewFilter(e.target.value)}
                className="input-field"
              >
                <option value="assigned">Assigned to Me</option>
                <option value="created">Created by Me</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="testing">Testing</option>
                <option value="documentation">Documentation</option>
                <option value="meeting">Meeting</option>
                <option value="review">Review</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPriorityFilter('');
                setCategoryFilter('');
                setCurrentPage(1);
              }}
              className="btn-secondary"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="btn-secondary"
            >
              {viewMode === 'grid' ? (
                <><List className="h-4 w-4 mr-2" />List View</>
              ) : (
                <><Grid className="h-4 w-4 mr-2" />Grid View</>
              )}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
        {tasks.map((task) => (
          <div key={task._id} className={`card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 p-6 hover:shadow-2xl transition-all duration-300 ${viewMode === 'list' ? 'flex items-center space-x-6' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {task.description}
                </p>
              </div>
              {isOverdue(task.dueDate, task.status) && (
                <div className="ml-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            
            {viewMode === 'list' && (
              <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <ProfilePicture user={task.assignedTo} size="sm" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {task.assignedTo.fullName}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </span>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Due: {format(new Date(task.dueDate), 'MMM dd')}
                </div>
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ProfilePicture user={task.assignedTo} size="sm" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {task.assignedTo.fullName}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                  {task.category}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
              </div>

              {task.progress > 0 && (
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {task.comments.length}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {task.estimatedHours}h
                </div>
              </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => handleViewDetails(task._id)}
                className="flex-1 btn-secondary text-sm py-2"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </button>
              {(task.assignedTo._id === user?._id || task.assignedBy._id === user?._id || user?.role === 'admin') && (
                <div className="flex space-x-1">
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusUpdate(task._id, task.status === 'pending' ? 'in-progress' : 'completed')}
                      className="px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-300"
                      title={task.status === 'pending' ? 'Start Task' : 'Complete Task'}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  {(task.assignedBy._id === user?._id || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 rounded-l-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 rounded-r-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative card-gradient rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 border border-purple-100 dark:border-purple-800/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Task</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Title
                  </label>
                  <input
                    {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Title must be at least 3 characters' } })}
                    type="text"
                    className="input-field"
                    placeholder="Enter task title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Description must be at least 10 characters' } })}
                    rows={3}
                    className="input-field"
                    placeholder="Enter task description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assign To
                  </label>
                  <select
                    {...register('assignedTo', { required: 'Please select an employee' })}
                    className="input-field"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.fullName} - {employee.designation.title}
                      </option>
                    ))}
                  </select>
                  {errors.assignedTo && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.assignedTo.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    {...register('category')}
                    className="input-field"
                  >
                    <option value="other">Other</option>
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="testing">Testing</option>
                    <option value="documentation">Documentation</option>
                    <option value="meeting">Meeting</option>
                    <option value="review">Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    {...register('dueDate', { required: 'Due date is required' })}
                    type="date"
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dueDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    {...register('estimatedHours')}
                    type="number"
                    min="0"
                    step="0.5"
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    {...register('tags')}
                    type="text"
                    className="input-field"
                    placeholder="e.g., frontend, urgent, bug-fix"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    reset();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showDetailsModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative card-gradient rounded-2xl shadow-2xl p-8 w-full max-w-4xl mx-4 border border-purple-100 dark:border-purple-800/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Task Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Task Header */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedTask.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedTask.description}
                </p>
              </div>

              {/* Task Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</p>
                      <div className="flex items-center space-x-2">
                        <ProfilePicture user={selectedTask.assignedTo} size="sm" />
                        <span className="text-gray-900 dark:text-white">{selectedTask.assignedTo.fullName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</p>
                      <div className="flex items-center space-x-2">
                        <ProfilePicture user={selectedTask.assignedBy} size="sm" />
                        <span className="text-gray-900 dark:text-white">{selectedTask.assignedBy.fullName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</p>
                      <p className={`text-gray-900 dark:text-white ${isOverdue(selectedTask.dueDate, selectedTask.status) ? 'text-red-600 dark:text-red-400' : ''}`}>
                        {format(new Date(selectedTask.dueDate), 'MMMM dd, yyyy')}
                        {isOverdue(selectedTask.dueDate, selectedTask.status) && ' (Overdue)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selectedTask.category)}`}>
                      {selectedTask.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Hours</span>
                    <span className="text-gray-900 dark:text-white">{selectedTask.estimatedHours}h</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Actual Hours</span>
                    <span className="text-gray-900 dark:text-white">{selectedTask.actualHours}h</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{selectedTask.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${selectedTask.progress}%` }}
                  ></div>
                </div>
                {(selectedTask.assignedTo._id === user?._id || user?.role === 'admin') && (
                  <div className="mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedTask.progress}
                      onChange={(e) => handleProgressUpdate(selectedTask._id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              {selectedTask.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Comments</h5>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {selectedTask.comments.map((comment) => (
                    <div key={comment._id} className="flex space-x-3">
                      <ProfilePicture user={comment.user} size="sm" />
                      <div className="flex-1">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {comment.user.fullName}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {format(new Date(comment.createdAt), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{comment.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="mt-4">
                  <div className="flex space-x-3">
                    <ProfilePicture user={user || { fullName: 'User' }} size="sm" />
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        className="input-field"
                        placeholder="Add a comment..."
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleAddComment(selectedTask._id)}
                          disabled={!newComment.trim()}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                {(selectedTask.assignedTo._id === user?._id || selectedTask.assignedBy._id === user?._id || user?.role === 'admin') && (
                  <>
                    {selectedTask.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedTask._id, selectedTask.status === 'pending' ? 'in-progress' : 'completed')}
                        className="btn-primary"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {selectedTask.status === 'pending' ? 'Start Task' : 'Complete Task'}
                      </button>
                    )}
                    {(selectedTask.assignedBy._id === user?._id || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteTask(selectedTask._id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Task
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;