import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Building2, Eye, EyeOff, UserPlus, Sparkles, Building, Briefcase, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { mockApi } from '../utils/mockApi';
import { toast } from 'react-toastify';


interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  cnic: string;
  phoneNumber: string;
  designation: string;
  department: string;
  dateOfJoining: string;
  salary: number;
}

interface Department {
  _id: string;
  name: string;
  description?: string;
}

interface Designation {
  _id: string;
  title: string;
  description?: string;
}

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [showNewDeptModal, setShowNewDeptModal] = useState(false);
  const [showNewDesigModal, setShowNewDesigModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDesigTitle, setNewDesigTitle] = useState('');
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RegisterForm>();
  const password = watch('password');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [deptResponse, desigResponse] = await Promise.all([
        mockApi.departments.get(),
        mockApi.designations.get()
      ]);
      setDepartments(deptResponse.data);
      setDesignations(desigResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load departments and designations');
    } finally {
      setDataLoading(false);
    }
  };

  const createNewDepartment = async () => {
    if (!newDeptName.trim()) {
      toast.error('Please enter a department name');
      return;
    }

    try {
      const response = await mockApi.departments.create({
        name: newDeptName.trim(),
        description: `${newDeptName.trim()} department`
      });
      
      setDepartments(prev => [...prev, response.data]);
      setValue('department', response.data._id);
      setNewDeptName('');
      setShowNewDeptModal(false);
      toast.success('Department created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create department');
    }
  };

  const createNewDesignation = async () => {
    if (!newDesigTitle.trim()) {
      toast.error('Please enter a designation title');
      return;
    }

    try {
      const response = await mockApi.designations.create({
        title: newDesigTitle.trim(),
        description: `${newDesigTitle.trim()} position`
      });
      
      setDesignations(prev => [...prev, response.data]);
      setValue('designation', response.data._id);
      setNewDesigTitle('');
      setShowNewDesigModal(false);
      toast.success('Designation created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create designation');
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/25 mb-6 transform hover:scale-105 transition-transform duration-300 border border-white/20">
            <Building2 className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Create Account
          </h2>
          <p className="text-purple-100 text-lg">
            Join American Web Arena
          </p>
          <div className="flex items-center justify-center mt-4">
            <Sparkles className="h-5 w-5 text-purple-200 mr-2" />
            <span className="text-sm text-purple-200 font-medium">
              Office Management System
            </span>
          </div>
        </div>
        
        {/* Registration Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20">
          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
              <span className="text-white">Loading departments and designations...</span>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                    Full Name
                  </label>
                  <input
                    {...register('fullName', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Full name must be at least 2 characters'
                      }
                    })}
                    type="text"
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-300">{errors.fullName.message}</p>
                  )}
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    type="email"
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-300">{errors.email.message}</p>
                  )}
                </div>
                
                {/* CNIC */}
                <div>
                  <label htmlFor="cnic" className="block text-sm font-medium text-white mb-2">
                    CNIC (13 digits)
                  </label>
                  <input
                    {...register('cnic', {
                      required: 'CNIC is required',
                      pattern: {
                        value: /^\d{13}$/,
                        message: 'CNIC must be exactly 13 digits'
                      }
                    })}
                    type="text"
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your CNIC (e.g., 1234567890123)"
                    maxLength={13}
                  />
                  {errors.cnic && (
                    <p className="mt-1 text-sm text-red-300">{errors.cnic.message}</p>
                  )}
                </div>
                
                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-white mb-2">
                    Phone Number (11 digits)
                  </label>
                  <input
                    {...register('phoneNumber', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^\d{11}$/,
                        message: 'Phone number must be exactly 11 digits'
                      }
                    })}
                    type="text"
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your phone number (e.g., 03001234567)"
                    maxLength={11}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-300">{errors.phoneNumber.message}</p>
                  )}
                </div>
                
                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-white mb-2">
                    <Building className="h-4 w-4 inline mr-1" />
                    Department
                  </label>
                  <div className="flex gap-2">
                    <select
                      {...register('department', { required: 'Department is required' })}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 flex-1"
                    >
                      <option value="" className="bg-purple-800 text-white">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id} className="bg-purple-800 text-white">
                          {dept.name}
                          {dept.description && ` - ${dept.description}`}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewDeptModal(true)}
                      className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center shadow-lg"
                      title="Add new department"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-300">{errors.department.message}</p>
                  )}
                  {departments.length === 0 && (
                    <div className="mt-2 flex items-center text-sm text-yellow-300">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      No departments available. Create one using the + button.
                    </div>
                  )}
                </div>
                
                {/* Designation */}
                <div>
                  <label htmlFor="designation" className="block text-sm font-medium text-white mb-2">
                    <Briefcase className="h-4 w-4 inline mr-1" />
                    Designation
                  </label>
                  <div className="flex gap-2">
                    <select
                      {...register('designation', { required: 'Designation is required' })}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 flex-1"
                    >
                      <option value="" className="bg-purple-800 text-white">Select Designation</option>
                      {designations.map((desig) => (
                        <option key={desig._id} value={desig._id} className="bg-purple-800 text-white">
                          {desig.title}
                          {desig.description && ` - ${desig.description}`}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewDesigModal(true)}
                      className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center shadow-lg"
                      title="Add new designation"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-300">{errors.designation.message}</p>
                  )}
                  {designations.length === 0 && (
                    <div className="mt-2 flex items-center text-sm text-yellow-300">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      No designations available. Create one using the + button.
                    </div>
                  )}
                </div>
                
                {/* Date of Joining */}
                <div>
                  <label htmlFor="dateOfJoining" className="block text-sm font-medium text-white mb-2">
                    Date of Joining
                  </label>
                  <input
                    {...register('dateOfJoining', { required: 'Date of joining is required' })}
                    type="date"
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dateOfJoining && (
                    <p className="mt-1 text-sm text-red-300">{errors.dateOfJoining.message}</p>
                  )}
                </div>
                
                {/* Salary */}
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-white mb-2">
                    Monthly Salary (PKR)
                  </label>
                  <input
                    {...register('salary', {
                      required: 'Salary is required',
                      min: {
                        value: 1,
                        message: 'Salary must be greater than 0'
                      }
                    })}
                    type="number"
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                    placeholder="Enter monthly salary"
                    min="1"
                  />
                  {errors.salary && (
                    <p className="mt-1 text-sm text-red-300">{errors.salary.message}</p>
                  )}
                </div>
                
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-200 hover:text-white transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-300">{errors.password.message}</p>
                  )}
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 pr-12"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-200 hover:text-white transition-colors duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-300">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Create Account
                    </div>
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-purple-200">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-white hover:text-purple-200 transition-colors duration-200 underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-purple-300">
            © 2024 American Web Arena. All rights reserved.
          </p>
        </div>
      </div>

      {/* New Department Modal */}
      {showNewDeptModal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 w-96 mx-4 border border-white/20">
            <h3 className="text-lg font-medium text-white mb-4">
              <Building className="h-5 w-5 inline mr-2" />
              Add New Department
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  placeholder="Enter department name"
                  onKeyPress={(e) => e.key === 'Enter' && createNewDepartment()}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewDeptModal(false);
                    setNewDeptName('');
                  }}
                  className="px-4 py-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createNewDepartment}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 shadow-lg"
                >
                  Create Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Designation Modal */}
      {showNewDesigModal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 w-96 mx-4 border border-white/20">
            <h3 className="text-lg font-medium text-white mb-4">
              <Briefcase className="h-5 w-5 inline mr-2" />
              Add New Designation
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Designation Title
                </label>
                <input
                  type="text"
                  value={newDesigTitle}
                  onChange={(e) => setNewDesigTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  placeholder="Enter designation title"
                  onKeyPress={(e) => e.key === 'Enter' && createNewDesignation()}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewDesigModal(false);
                    setNewDesigTitle('');
                  }}
                  className="px-4 py-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createNewDesignation}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 shadow-lg"
                >
                  Create Designation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;