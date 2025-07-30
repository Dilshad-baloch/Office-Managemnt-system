import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, XCircle, Play, Square } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { mockApi } from '../utils/mockApi';

interface EmployeeStats {
  todayAttendance: any;
  monthlyAttendance: number;
  leaveBalance: {
    annual: number;
    sick: number;
    casual: number;
  };
  pendingLeaves: number;
  recentLeaves: any[];
  workingDays: number;
}

const EmployeeDashboard: React.FC = () => {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await mockApi.dashboard.employeeStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await mockApi.attendance.checkIn();
      toast.success('Checked in successfully!');
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await mockApi.attendance.checkOut();
      toast.success('Checked out successfully!');
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Track your attendance and manage your work</p>
      </div>

      {/* Attendance Action */}
      <div className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Today's Attendance</h3>
        <div className="flex items-center justify-between">
          <div>
            {stats?.todayAttendance ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Checked in at {format(new Date(stats.todayAttendance.checkIn), 'HH:mm')}
                  </span>
                </div>
                {stats.todayAttendance.checkOut && (
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Checked out at {format(new Date(stats.todayAttendance.checkOut), 'HH:mm')}
                    </span>
                  </div>
                )}
                {stats.todayAttendance.workingHours && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Working hours: {stats.todayAttendance.workingHours} hours
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Not checked in yet today</p>
            )}
          </div>
          <div className="flex space-x-3">
            {!stats?.todayAttendance ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4 mr-2" />
                Check In
              </button>
            ) : !stats.todayAttendance.checkOut ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <Square className="h-4 w-4 mr-2" />
                Check Out
              </button>
            ) : (
              <span className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Day Complete
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Monthly Attendance</dt>
                  <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.monthlyAttendance || 0}/{stats?.workingDays || 0}
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
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Leaves</dt>
                  <dd className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.pendingLeaves || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Attendance Rate</dt>
                  <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.workingDays ? Math.round((stats.monthlyAttendance / stats.workingDays) * 100) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balance */}
      <div className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Leave Balance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats?.leaveBalance?.annual || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Annual Leave</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats?.leaveBalance?.sick || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sick Leave</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats?.leaveBalance?.casual || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Casual Leave</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leave Applications */}
      <div className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Leave Applications</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {stats?.recentLeaves?.length ? (
            stats.recentLeaves.slice(0, 5).map((leave) => (
              <div key={leave._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize mr-2">
                        {leave.leaveType} Leave
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        leave.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : leave.status === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {format(new Date(leave.startDate), 'MMM dd, yyyy')} - 
                      {format(new Date(leave.endDate), 'MMM dd, yyyy')} ({leave.days} days)
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{leave.reason}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-600" />
              <p>No leave applications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;