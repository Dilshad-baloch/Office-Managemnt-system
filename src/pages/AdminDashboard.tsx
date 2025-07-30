import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle, Building2, Briefcase } from 'lucide-react';
import { mockApi } from '../utils/mockApi';
import { format } from 'date-fns';

interface DashboardStats {
  totalEmployees: number;
  todayAttendance: number;
  pendingLeaves: number;
  monthlySalaries: number;
  recentLeaves: any[];
  recentAttendance: any[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await mockApi.dashboard.adminStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl shadow-purple-500/25 mb-6">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Admin Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Welcome to your office management system
        </p>
        <div className="flex items-center justify-center mt-4">
          <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              🚀 System Status: All Systems Operational
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Employees</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {stats?.totalEmployees || 0}
                  </dd>
                  <dd className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Active employees
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Today's Attendance</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    {stats?.todayAttendance || 0}
                  </dd>
                  <dd className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {stats?.totalEmployees ? Math.round((stats.todayAttendance / stats.totalEmployees) * 100) : 0}% present
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Leaves</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                    {stats?.pendingLeaves || 0}
                  </dd>
                  <dd className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Needs review
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Salaries</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                    {stats?.monthlySalaries || 0}
                  </dd>
                  <dd className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Current month
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leave Requests */}
        <div className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-t-2xl">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Leave Requests</h3>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {stats?.recentLeaves?.length ? (
              stats.recentLeaves.map((leave) => (
                <div key={leave._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold text-white">
                            {leave.employee?.fullName?.split(' ').map((n: string) => n[0]).join('') || 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {leave.employee?.fullName || 'Unknown Employee'}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 ml-11">
                        <span className="capitalize font-medium text-purple-600 dark:text-purple-400">{leave.leaveType}</span> leave - {leave.days} day(s)
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-11 mt-1">
                        {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      Pending
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium">No recent leave requests</p>
                <p className="text-sm">All caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-2xl">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Check-ins</h3>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {stats?.recentAttendance?.length ? (
              stats.recentAttendance.map((attendance) => (
                <div key={attendance._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-white">
                          {attendance.employee?.fullName?.split(' ').map((n: string) => n[0]).join('') || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {attendance.employee?.fullName || 'Unknown Employee'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Check-in: {format(new Date(attendance.checkIn), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      attendance.status === 'present'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : attendance.status === 'late'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {attendance.status === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {attendance.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium">No check-ins today</p>
                <p className="text-sm">Waiting for employees to arrive</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Frequently used management tools</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                Manage Employees
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add, edit, or view employee details
              </p>
            </button>
            
            <button className="group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-300">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                Review Leaves
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Approve or reject leave requests
              </p>
            </button>
            
            <button className="group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-300">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                Process Salaries
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Generate and manage payroll
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;