import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Check, X, Clock, Filter, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { mockApi } from '../utils/mockApi';
import { useAuth } from '../contexts/AuthContext';
import ProfilePicture from '../components/ProfilePicture';

interface Leave {
  _id: string;
  employee: {
    _id: string;
    fullName: string;
  };
  leaveType: 'annual' | 'sick' | 'casual' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: {
    _id: string;
    fullName: string;
  };
  rejectionReason?: string;
  createdAt: string;
}

interface LeaveForm {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0
  });

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<LeaveForm>();
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    fetchLeaves();
  }, [currentPage, statusFilter]);

  const fetchLeaves = async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: 10
      };

      if (statusFilter) params.status = statusFilter;

      const response = await mockApi.leaves.get(params);
      setLeaves(response.data.leaves);
      setTotalPages(response.data.totalPages);

      // Calculate stats
      const allLeaves = response.data.leaves;
      setStats({
        totalLeaves: allLeaves.length,
        pendingLeaves: allLeaves.filter((l: any) => l.status === 'pending').length,
        approvedLeaves: allLeaves.filter((l: any) => l.status === 'approved').length,
        rejectedLeaves: allLeaves.filter((l: any) => l.status === 'rejected').length
      });
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to fetch leave records');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LeaveForm) => {
    try {
      await mockApi.leaves.create(data);
      toast.success('Leave application submitted successfully');
      setShowModal(false);
      reset();
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit leave application');
    }
  };

  const handleApproveReject = async (leaveId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      await mockApi.leaves.updateStatus(leaveId, {
        status,
        rejectionReason
      });
      toast.success(`Leave ${status} successfully`);
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} leave`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'annual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'sick':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'casual':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'emergency':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading leave records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-xl shadow-orange-500/25 mb-6">
          <Calendar className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
          Leave Management
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {user?.role === 'admin' ? 'Manage employee leave requests and approvals' : 'Apply for and track your leave requests'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Leaves</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {stats.totalLeaves}
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
                    {stats.pendingLeaves}
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
                  <Check className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Approved</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    {stats.approvedLeaves}
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
                  <X className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Rejected</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                    {stats.rejectedLeaves}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
          {user?.role === 'employee' && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Apply for Leave
            </button>
          )}
        </div>
      </div>

      {/* Leave Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leaves.map((leave) => (
          <div key={leave._id} className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {user?.role === 'admin' && (
                  <ProfilePicture 
                    user={{ fullName: leave.employee.fullName }} 
                    size="md"
                  />
                )}
                <div>
                  {user?.role === 'admin' && (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {leave.employee.fullName}
                    </h3>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                      {leave.leaveType} leave
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{leave.days}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">days</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Reason:</strong> {leave.reason}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Applied on {format(new Date(leave.createdAt), 'MMM dd, yyyy')}
              </div>
              {leave.approvedBy && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {leave.status === 'approved' ? 'Approved' : 'Rejected'} by {leave.approvedBy.fullName}
                </div>
              )}
              {leave.rejectionReason && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  <strong>Rejection reason:</strong> {leave.rejectionReason}
                </div>
              )}
            </div>

            {user?.role === 'admin' && leave.status === 'pending' && (
              <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleApproveReject(leave._id, 'approved')}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason (optional):');
                    handleApproveReject(leave._id, 'rejected', reason || undefined);
                  }}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </button>
              </div>
            )}
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

      {/* Leave Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative card-gradient rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-purple-100 dark:border-purple-800/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Apply for Leave</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Leave Type
                </label>
                <select
                  {...register('leaveType', { required: 'Leave type is required' })}
                  className="input-field"
                >
                  <option value="">Select leave type</option>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="emergency">Emergency Leave</option>
                </select>
                {errors.leaveType && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.leaveType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                  className="input-field"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  {...register('endDate', { required: 'End date is required' })}
                  className="input-field"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate.message}</p>
                )}
              </div>

              {startDate && endDate && (
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Total days: {calculateDays()}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason
                </label>
                <textarea
                  {...register('reason', {
                    required: 'Reason is required',
                    minLength: {
                      value: 10,
                      message: 'Reason must be at least 10 characters'
                    }
                  })}
                  rows={3}
                  className="input-field"
                  placeholder="Please provide a reason for your leave..."
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reason.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
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
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;