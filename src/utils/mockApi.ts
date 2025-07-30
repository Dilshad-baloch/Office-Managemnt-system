import { supabase } from './supabase';
import { toast } from 'react-toastify';

// Storage keys for localStorage fallback
const STORAGE_KEYS = {
  USERS: 'office_users',
  DEPARTMENTS: 'office_departments',
  DESIGNATIONS: 'office_designations',
  ATTENDANCE: 'office_attendance',
  LEAVES: 'office_leaves',
  SALARIES: 'office_salaries',
  DOCUMENTS: 'office_documents',
  TASKS: 'office_tasks'
};

// Helper function to get current user
const getCurrentUser = () => {
  const userStr = localStorage.getItem('office_current_user');
  return userStr ? JSON.parse(userStr) : null;
};

// Helper function to format Supabase user data
const formatUserData = (user: any) => ({
  _id: user.id,
  fullName: user.full_name,
  email: user.email,
  cnic: user.cnic,
  phoneNumber: user.phone_number,
  role: user.role,
  designation: user.designations ? {
    _id: user.designations.id,
    title: user.designations.title
  } : null,
  department: user.departments ? {
    _id: user.departments.id,
    name: user.departments.name
  } : null,
  dateOfJoining: user.date_of_joining,
  salary: user.salary,
  isActive: user.is_active,
  leaveBalance: user.leave_balance,
  createdAt: user.created_at
});

export const mockApi = {
  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      try {
        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) throw new Error(authError.message);

        // Get user profile data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            *,
            departments(id, name),
            designations(id, title)
          `)
          .eq('id', authData.user.id)
          .single();

        if (userError) throw new Error('Failed to fetch user profile');

        const formattedUser = formatUserData(userData);
        
        // Store in localStorage
        localStorage.setItem('office_current_user', JSON.stringify(formattedUser));
        localStorage.setItem('token', authData.session.access_token);

        return { data: { user: formattedUser, token: authData.session.access_token } };
      } catch (error: any) {
        throw new Error(error.message || 'Login failed');
      }
    },

    register: async (userData: any) => {
      try {
        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error('Registration failed');

        // Create user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            full_name: userData.fullName,
            email: userData.email,
            cnic: userData.cnic,
            phone_number: userData.phoneNumber,
            role: userData.role || 'employee',
            designation_id: userData.designation,
            department_id: userData.department,
            date_of_joining: userData.dateOfJoining,
            salary: userData.salary || 0
          })
          .select(`
            *,
            departments(id, name),
            designations(id, title)
          `)
          .single();

        if (profileError) throw new Error(profileError.message);

        const formattedUser = formatUserData(profileData);
        
        // Store in localStorage
        localStorage.setItem('office_current_user', JSON.stringify(formattedUser));
        if (authData.session) {
          localStorage.setItem('token', authData.session.access_token);
        }

        return { data: { user: formattedUser, token: authData.session?.access_token } };
      } catch (error: any) {
        throw new Error(error.message || 'Registration failed');
      }
    },

    me: async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw new Error('Not authenticated');

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            *,
            departments(id, name),
            designations(id, title)
          `)
          .eq('id', user.id)
          .single();

        if (userError) throw new Error('Failed to fetch user profile');

        const formattedUser = formatUserData(userData);
        return { data: formattedUser };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to get user');
      }
    }
  },

  // Departments
  departments: {
    get: async (params: any = {}) => {
      try {
        let query = supabase
          .from('departments')
          .select('*')
          .eq('is_active', true)
          .order('name');

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return { 
          data: data.map(dept => ({
            _id: dept.id,
            name: dept.name,
            description: dept.description,
            isActive: dept.is_active,
            createdAt: dept.created_at
          }))
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch departments');
      }
    },

    create: async (deptData: any) => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .insert({
            name: deptData.name,
            description: deptData.description
          })
          .select()
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            name: data.name,
            description: data.description,
            isActive: data.is_active,
            createdAt: data.created_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to create department');
      }
    },

    update: async (id: string, deptData: any) => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .update({
            name: deptData.name,
            description: deptData.description
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            name: data.name,
            description: data.description,
            isActive: data.is_active,
            createdAt: data.created_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update department');
      }
    },

    delete: async (id: string) => {
      try {
        const { error } = await supabase
          .from('departments')
          .update({ is_active: false })
          .eq('id', id);

        if (error) throw new Error(error.message);

        return { data: { message: 'Department deleted successfully' } };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to delete department');
      }
    }
  },

  // Designations
  designations: {
    get: async (params: any = {}) => {
      try {
        let query = supabase
          .from('designations')
          .select('*')
          .eq('is_active', true)
          .order('title');

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return { 
          data: data.map(desig => ({
            _id: desig.id,
            title: desig.title,
            description: desig.description,
            isActive: desig.is_active,
            createdAt: desig.created_at
          }))
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch designations');
      }
    },

    create: async (desigData: any) => {
      try {
        const { data, error } = await supabase
          .from('designations')
          .insert({
            title: desigData.title,
            description: desigData.description
          })
          .select()
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            title: data.title,
            description: data.description,
            isActive: data.is_active,
            createdAt: data.created_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to create designation');
      }
    },

    update: async (id: string, desigData: any) => {
      try {
        const { data, error } = await supabase
          .from('designations')
          .update({
            title: desigData.title,
            description: desigData.description
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            title: data.title,
            description: data.description,
            isActive: data.is_active,
            createdAt: data.created_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update designation');
      }
    },

    delete: async (id: string) => {
      try {
        const { error } = await supabase
          .from('designations')
          .update({ is_active: false })
          .eq('id', id);

        if (error) throw new Error(error.message);

        return { data: { message: 'Designation deleted successfully' } };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to delete designation');
      }
    }
  },

  // Employees
  employees: {
    get: async (params: any = {}) => {
      try {
        let query = supabase
          .from('users')
          .select(`
            *,
            departments(id, name),
            designations(id, title)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (params.search) {
          query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return { 
          data: {
            employees: data.map(formatUserData),
            totalPages: 1,
            currentPage: 1,
            total: data.length
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch employees');
      }
    },

    create: async (employeeData: any) => {
      try {
        // First create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: employeeData.email,
          password: employeeData.password
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error('Failed to create user');

        // Then create profile
        const { data, error } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            full_name: employeeData.fullName,
            email: employeeData.email,
            cnic: employeeData.cnic,
            phone_number: employeeData.phoneNumber,
            role: employeeData.role || 'employee',
            designation_id: employeeData.designation,
            department_id: employeeData.department,
            date_of_joining: employeeData.dateOfJoining,
            salary: employeeData.salary || 0
          })
          .select(`
            *,
            departments(id, name),
            designations(id, title)
          `)
          .single();

        if (error) throw new Error(error.message);

        return { data: formatUserData(data) };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to create employee');
      }
    },

    update: async (id: string, employeeData: any) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({
            full_name: employeeData.fullName,
            email: employeeData.email,
            cnic: employeeData.cnic,
            phone_number: employeeData.phoneNumber,
            designation_id: employeeData.designation,
            department_id: employeeData.department,
            salary: employeeData.salary
          })
          .eq('id', id)
          .select(`
            *,
            departments(id, name),
            designations(id, title)
          `)
          .single();

        if (error) throw new Error(error.message);

        return { data: formatUserData(data) };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update employee');
      }
    },

    delete: async (id: string) => {
      try {
        const { error } = await supabase
          .from('users')
          .update({ is_active: false })
          .eq('id', id);

        if (error) throw new Error(error.message);

        return { data: { message: 'Employee deactivated successfully' } };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to deactivate employee');
      }
    }
  },

  // Attendance
  attendance: {
    get: async (params: any = {}) => {
      try {
        let query = supabase
          .from('attendance')
          .select(`
            *,
            users(id, full_name)
          `)
          .order('date', { ascending: false });

        const currentUser = getCurrentUser();
        if (currentUser?.role !== 'admin') {
          query = query.eq('employee_id', currentUser?._id);
        }

        if (params.startDate && params.endDate) {
          query = query.gte('date', params.startDate).lte('date', params.endDate);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return { 
          data: {
            attendance: data.map(record => ({
              _id: record.id,
              employee: {
                _id: record.users.id,
                fullName: record.users.full_name
              },
              date: record.date,
              checkIn: record.check_in,
              checkOut: record.check_out,
              status: record.status,
              workingHours: record.working_hours
            })),
            totalPages: 1,
            currentPage: 1,
            total: data.length
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch attendance');
      }
    },

    checkIn: async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error('User not authenticated');

        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        // Check if already checked in today
        const { data: existing } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', currentUser._id)
          .eq('date', today)
          .single();

        if (existing) throw new Error('Already checked in today');

        // Determine status based on time
        const checkInTime = new Date();
        const standardTime = new Date();
        standardTime.setHours(9, 0, 0, 0);
        const status = checkInTime > standardTime ? 'late' : 'present';

        const { data, error } = await supabase
          .from('attendance')
          .insert({
            employee_id: currentUser._id,
            date: today,
            check_in: now,
            status
          })
          .select(`
            *,
            users(id, full_name)
          `)
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            employee: {
              _id: data.users.id,
              fullName: data.users.full_name
            },
            date: data.date,
            checkIn: data.check_in,
            checkOut: data.check_out,
            status: data.status,
            workingHours: data.working_hours
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to check in');
      }
    },

    checkOut: async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error('User not authenticated');

        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        // Find today's attendance record
        const { data: attendance, error: findError } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', currentUser._id)
          .eq('date', today)
          .single();

        if (findError || !attendance) throw new Error('No check-in found for today');
        if (attendance.check_out) throw new Error('Already checked out today');

        // Calculate working hours
        const checkInTime = new Date(attendance.check_in);
        const checkOutTime = new Date(now);
        const workingHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

        const { data, error } = await supabase
          .from('attendance')
          .update({
            check_out: now,
            working_hours: Math.round(workingHours * 100) / 100
          })
          .eq('id', attendance.id)
          .select(`
            *,
            users(id, full_name)
          `)
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            employee: {
              _id: data.users.id,
              fullName: data.users.full_name
            },
            date: data.date,
            checkIn: data.check_in,
            checkOut: data.check_out,
            status: data.status,
            workingHours: data.working_hours
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to check out');
      }
    },

    getToday: async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error('User not authenticated');

        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', currentUser._id)
          .eq('date', today)
          .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);

        return { 
          data: data ? {
            _id: data.id,
            date: data.date,
            checkIn: data.check_in,
            checkOut: data.check_out,
            status: data.status,
            workingHours: data.working_hours
          } : null
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to get today\'s attendance');
      }
    }
  },

  // Leaves
  leaves: {
    get: async (params: any = {}) => {
      try {
        let query = supabase
          .from('leaves')
          .select(`
            *,
            employee:users!leaves_employee_id_fkey(id, full_name),
            approved_by_user:users!leaves_approved_by_fkey(id, full_name)
          `)
          .order('created_at', { ascending: false });

        const currentUser = getCurrentUser();
        if (currentUser?.role !== 'admin') {
          query = query.eq('employee_id', currentUser._id);
        }

        if (params.status) {
          query = query.eq('status', params.status);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return { 
          data: {
            leaves: data.map(leave => ({
              _id: leave.id,
              employee: {
                _id: leave.employee.id,
                fullName: leave.employee.full_name
              },
              leaveType: leave.leave_type,
              startDate: leave.start_date,
              endDate: leave.end_date,
              days: leave.days,
              reason: leave.reason,
              status: leave.status,
              approvedBy: leave.approved_by_user ? {
                _id: leave.approved_by_user.id,
                fullName: leave.approved_by_user.full_name
              } : null,
              rejectionReason: leave.rejection_reason,
              createdAt: leave.created_at
            })),
            totalPages: 1,
            currentPage: 1,
            total: data.length
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch leaves');
      }
    },

    create: async (leaveData: any) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error('User not authenticated');

        // Calculate days
        const startDate = new Date(leaveData.startDate);
        const endDate = new Date(leaveData.endDate);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const { data, error } = await supabase
          .from('leaves')
          .insert({
            employee_id: currentUser._id,
            leave_type: leaveData.leaveType,
            start_date: leaveData.startDate,
            end_date: leaveData.endDate,
            days,
            reason: leaveData.reason
          })
          .select(`
            *,
            employee:users!leaves_employee_id_fkey(id, full_name)
          `)
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            employee: {
              _id: data.employee.id,
              fullName: data.employee.full_name
            },
            leaveType: data.leave_type,
            startDate: data.start_date,
            endDate: data.end_date,
            days: data.days,
            reason: data.reason,
            status: data.status,
            createdAt: data.created_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to create leave request');
      }
    },

    updateStatus: async (id: string, statusData: any) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
          throw new Error('Only admins can update leave status');
        }

        const updateData: any = {
          status: statusData.status,
          approved_by: currentUser._id,
          approved_at: new Date().toISOString()
        };

        if (statusData.rejectionReason) {
          updateData.rejection_reason = statusData.rejectionReason;
        }

        const { data, error } = await supabase
          .from('leaves')
          .update(updateData)
          .eq('id', id)
          .select(`
            *,
            employee:users!leaves_employee_id_fkey(id, full_name),
            approved_by_user:users!leaves_approved_by_fkey(id, full_name)
          `)
          .single();

        if (error) throw new Error(error.message);

        // Update user leave balance if approved
        if (statusData.status === 'approved') {
          const { error: balanceError } = await supabase.rpc('update_leave_balance', {
            user_id: data.employee_id,
            leave_type: data.leave_type,
            days: data.days
          });

          if (balanceError) console.error('Failed to update leave balance:', balanceError);
        }

        return { 
          data: {
            _id: data.id,
            employee: {
              _id: data.employee.id,
              fullName: data.employee.full_name
            },
            leaveType: data.leave_type,
            startDate: data.start_date,
            endDate: data.end_date,
            days: data.days,
            reason: data.reason,
            status: data.status,
            approvedBy: data.approved_by_user ? {
              _id: data.approved_by_user.id,
              fullName: data.approved_by_user.full_name
            } : null,
            rejectionReason: data.rejection_reason,
            createdAt: data.created_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update leave status');
      }
    }
  },

  // Salaries
  salaries: {
    get: async (params: any = {}) => {
      try {
        let query = supabase
          .from('salaries')
          .select(`
            *,
            employee:users(id, full_name, cnic)
          `)
          .order('year', { ascending: false })
          .order('month', { ascending: false });

        const currentUser = getCurrentUser();
        if (currentUser?.role !== 'admin') {
          query = query.eq('employee_id', currentUser._id);
        }

        if (params.month) {
          query = query.eq('month', parseInt(params.month));
        }

        if (params.year) {
          query = query.eq('year', parseInt(params.year));
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return { 
          data: {
            salaries: data.map(salary => ({
              _id: salary.id,
              employee: {
                _id: salary.employee.id,
                fullName: salary.employee.full_name,
                cnic: salary.employee.cnic
              },
              month: salary.month,
              year: salary.year,
              basicSalary: salary.basic_salary,
              allowances: salary.allowances,
              deductions: salary.deductions,
              totalDays: salary.total_days,
              workingDays: salary.working_days,
              grossSalary: salary.gross_salary,
              netSalary: salary.net_salary,
              isPaid: salary.is_paid,
              paidAt: salary.paid_at,
              createdAt: salary.created_at
            })),
            totalPages: 1,
            currentPage: 1,
            total: data.length
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch salaries');
      }
    },

    generate: async (salaryData: any) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
          throw new Error('Only admins can generate salaries');
        }

        // Get employee data
        const { data: employee, error: empError } = await supabase
          .from('users')
          .select('*')
          .eq('id', salaryData.employeeId)
          .single();

        if (empError || !employee) throw new Error('Employee not found');

        // Calculate working days from attendance
        const monthStart = new Date(salaryData.year, salaryData.month - 1, 1);
        const monthEnd = new Date(salaryData.year, salaryData.month, 0);
        const totalDays = monthEnd.getDate();

        const { data: attendanceData, error: attError } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', salaryData.employeeId)
          .gte('date', monthStart.toISOString().split('T')[0])
          .lte('date', monthEnd.toISOString().split('T')[0])
          .in('status', ['present', 'late']);

        const workingDays = attendanceData?.length || 0;

        // Calculate salary components
        const basicSalary = employee.salary;
        const allowances = {
          transport: basicSalary * 0.1,
          medical: basicSalary * 0.05,
          bonus: 0
        };
        const deductions = {
          tax: basicSalary * 0.02,
          insurance: basicSalary * 0.01,
          other: 0
        };

        const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
        const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);

        // Pro-rated salary based on attendance
        const dailySalary = basicSalary / totalDays;
        const earnedBasicSalary = dailySalary * workingDays;

        const grossSalary = earnedBasicSalary + totalAllowances;
        const netSalary = grossSalary - totalDeductions;

        const { data, error } = await supabase
          .from('salaries')
          .insert({
            employee_id: salaryData.employeeId,
            month: salaryData.month,
            year: salaryData.year,
            basic_salary: earnedBasicSalary,
            allowances,
            deductions,
            total_days: totalDays,
            working_days: workingDays,
            gross_salary: grossSalary,
            net_salary: netSalary
          })
          .select(`
            *,
            employee:users(id, full_name, cnic)
          `)
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            employee: {
              _id: data.employee.id,
              fullName: data.employee.full_name,
              cnic: data.employee.cnic
            },
            month: data.month,
            year: data.year,
            basicSalary: data.basic_salary,
            allowances: data.allowances,
            deductions: data.deductions,
            totalDays: data.total_days,
            workingDays: data.working_days,
            grossSalary: data.gross_salary,
            netSalary: data.net_salary,
            isPaid: data.is_paid,
            createdAt: data.created_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to generate salary');
      }
    },

    markPaid: async (id: string) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
          throw new Error('Only admins can mark salaries as paid');
        }

        const { data, error } = await supabase
          .from('salaries')
          .update({
            is_paid: true,
            paid_at: new Date().toISOString()
          })
          .eq('id', id)
          .select(`
            *,
            employee:users(id, full_name, cnic)
          `)
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            employee: {
              _id: data.employee.id,
              fullName: data.employee.full_name,
              cnic: data.employee.cnic
            },
            month: data.month,
            year: data.year,
            basicSalary: data.basic_salary,
            allowances: data.allowances,
            deductions: data.deductions,
            totalDays: data.total_days,
            workingDays: data.working_days,
            grossSalary: data.gross_salary,
            netSalary: data.net_salary,
            isPaid: data.is_paid,
            paidAt: data.paid_at,
            createdAt: data.created_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to mark salary as paid');
      }
    }
  },

  // Documents
  documents: {
    get: async (params: any = {}) => {
      try {
        let query = supabase
          .from('documents')
          .select(`
            *,
            uploaded_by_user:users(id, full_name)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (params.category) {
          query = query.eq('category', params.category);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return { 
          data: {
            documents: data.map(doc => ({
              _id: doc.id,
              title: doc.title,
              description: doc.description,
              fileName: doc.file_name,
              fileSize: doc.file_size,
              uploadedBy: {
                _id: doc.uploaded_by_user.id,
                fullName: doc.uploaded_by_user.full_name
              },
              category: doc.category,
              createdAt: doc.created_at
            })),
            totalPages: 1,
            currentPage: 1,
            total: data.length
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch documents');
      }
    },

    create: async (docData: any) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
          throw new Error('Only admins can upload documents');
        }

        // In a real implementation, you would upload the file to Supabase Storage
        // For now, we'll just store the metadata
        const { data, error } = await supabase
          .from('documents')
          .insert({
            title: docData.title,
            description: docData.description,
            file_name: docData.fileName,
            file_path: docData.filePath || `/documents/${docData.fileName}`,
            file_size: docData.fileSize || 0,
            file_type: docData.fileType || 'application/octet-stream',
            uploaded_by: currentUser._id,
            category: docData.category
          })
          .select(`
            *,
            uploaded_by_user:users(id, full_name)
          `)
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            title: data.title,
            description: data.description,
            fileName: data.file_name,
            fileSize: data.file_size,
            uploadedBy: {
              _id: data.uploaded_by_user.id,
              fullName: data.uploaded_by_user.full_name
            },
            category: data.category,
            createdAt: data.created_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to upload document');
      }
    },

    delete: async (id: string) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
          throw new Error('Only admins can delete documents');
        }

        const { error } = await supabase
          .from('documents')
          .update({ is_active: false })
          .eq('id', id);

        if (error) throw new Error(error.message);

        return { data: { message: 'Document deleted successfully' } };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to delete document');
      }
    }
  },

  // Tasks
  tasks: {
    get: async (params: any = {}) => {
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

        const currentUser = getCurrentUser();
        if (currentUser?.role !== 'admin') {
          if (params.view === 'created') {
            query = query.eq('assigned_by', currentUser._id);
          } else {
            query = query.eq('assigned_to', currentUser._id);
          }
        }

        if (params.status) query = query.eq('status', params.status);
        if (params.priority) query = query.eq('priority', params.priority);
        if (params.category) query = query.eq('category', params.category);
        if (params.search) {
          query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return { 
          data: {
            tasks: data.map(task => ({
              _id: task.id,
              title: task.title,
              description: task.description,
              assignedTo: {
                _id: task.assigned_to_user.id,
                fullName: task.assigned_to_user.full_name,
                email: task.assigned_to_user.email
              },
              assignedBy: {
                _id: task.assigned_by_user.id,
                fullName: task.assigned_by_user.full_name,
                email: task.assigned_by_user.email
              },
              priority: task.priority,
              status: task.status,
              category: task.category,
              dueDate: task.due_date,
              startDate: task.start_date,
              completedAt: task.completed_at,
              estimatedHours: task.estimated_hours,
              actualHours: task.actual_hours,
              progress: task.progress,
              tags: task.tags,
              comments: task.task_comments.map((comment: any) => ({
                _id: comment.id,
                user: {
                  _id: comment.user.id,
                  fullName: comment.user.full_name
                },
                comment: comment.comment,
                createdAt: comment.created_at
              })),
              createdAt: task.created_at,
              updatedAt: task.updated_at
            })),
            totalPages: 1,
            currentPage: 1,
            total: data.length
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch tasks');
      }
    },

    create: async (taskData: any) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('tasks')
          .insert({
            title: taskData.title,
            description: taskData.description,
            assigned_to: taskData.assignedTo,
            assigned_by: currentUser._id,
            priority: taskData.priority || 'medium',
            category: taskData.category || 'other',
            due_date: taskData.dueDate,
            estimated_hours: taskData.estimatedHours || 0,
            tags: taskData.tags || []
          })
          .select(`
            *,
            assigned_to_user:users!tasks_assigned_to_fkey(id, full_name, email),
            assigned_by_user:users!tasks_assigned_by_fkey(id, full_name, email)
          `)
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            title: data.title,
            description: data.description,
            assignedTo: {
              _id: data.assigned_to_user.id,
              fullName: data.assigned_to_user.full_name,
              email: data.assigned_to_user.email
            },
            assignedBy: {
              _id: data.assigned_by_user.id,
              fullName: data.assigned_by_user.full_name,
              email: data.assigned_by_user.email
            },
            priority: data.priority,
            status: data.status,
            category: data.category,
            dueDate: data.due_date,
            startDate: data.start_date,
            estimatedHours: data.estimated_hours,
            actualHours: data.actual_hours,
            progress: data.progress,
            tags: data.tags,
            comments: [],
            createdAt: data.created_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to create task');
      }
    },

    getById: async (id: string) => {
      try {
        const { data, error } = await supabase
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
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            title: data.title,
            description: data.description,
            assignedTo: {
              _id: data.assigned_to_user.id,
              fullName: data.assigned_to_user.full_name,
              email: data.assigned_to_user.email
            },
            assignedBy: {
              _id: data.assigned_by_user.id,
              fullName: data.assigned_by_user.full_name,
              email: data.assigned_by_user.email
            },
            priority: data.priority,
            status: data.status,
            category: data.category,
            dueDate: data.due_date,
            startDate: data.start_date,
            completedAt: data.completed_at,
            estimatedHours: data.estimated_hours,
            actualHours: data.actual_hours,
            progress: data.progress,
            tags: data.tags,
            comments: data.task_comments.map((comment: any) => ({
              _id: comment.id,
              user: {
                _id: comment.user.id,
                fullName: comment.user.full_name
              },
              comment: comment.comment,
              createdAt: comment.created_at
            })),
            createdAt: data.created_at,
            updatedAt: data.updated_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch task');
      }
    },

    update: async (id: string, updateData: any) => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', id)
          .select(`
            *,
            assigned_to_user:users!tasks_assigned_to_fkey(id, full_name, email),
            assigned_by_user:users!tasks_assigned_by_fkey(id, full_name, email)
          `)
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            title: data.title,
            description: data.description,
            assignedTo: {
              _id: data.assigned_to_user.id,
              fullName: data.assigned_to_user.full_name,
              email: data.assigned_to_user.email
            },
            assignedBy: {
              _id: data.assigned_by_user.id,
              fullName: data.assigned_by_user.full_name,
              email: data.assigned_by_user.email
            },
            priority: data.priority,
            status: data.status,
            category: data.category,
            dueDate: data.due_date,
            startDate: data.start_date,
            completedAt: data.completed_at,
            estimatedHours: data.estimated_hours,
            actualHours: data.actual_hours,
            progress: data.progress,
            tags: data.tags,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update task');
      }
    },

    delete: async (id: string) => {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ is_active: false })
          .eq('id', id);

        if (error) throw new Error(error.message);

        return { data: { message: 'Task deleted successfully' } };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to delete task');
      }
    },

    addComment: async (taskId: string, comment: string) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('task_comments')
          .insert({
            task_id: taskId,
            user_id: currentUser._id,
            comment
          })
          .select(`
            *,
            user:users(id, full_name)
          `)
          .single();

        if (error) throw new Error(error.message);

        return { 
          data: {
            _id: data.id,
            user: {
              _id: data.user.id,
              fullName: data.user.full_name
            },
            comment: data.comment,
            createdAt: data.created_at
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to add comment');
      }
    },

    getStats: async () => {
      try {
        const currentUser = getCurrentUser();
        let query = supabase
          .from('tasks')
          .select('status, priority, due_date')
          .eq('is_active', true);

        if (currentUser?.role !== 'admin') {
          query = query.or(`assigned_to.eq.${currentUser._id},assigned_by.eq.${currentUser._id}`);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        const now = new Date();
        const stats = {
          totalTasks: data.length,
          pendingTasks: data.filter(t => t.status === 'pending').length,
          inProgressTasks: data.filter(t => t.status === 'in-progress').length,
          completedTasks: data.filter(t => t.status === 'completed').length,
          overdueTasks: data.filter(t => 
            new Date(t.due_date) < now && 
            t.status !== 'completed' && 
            t.status !== 'cancelled'
          ).length,
          highPriorityTasks: data.filter(t => 
            (t.priority === 'high' || t.priority === 'urgent') &&
            t.status !== 'completed' && 
            t.status !== 'cancelled'
          ).length
        };

        return { data: stats };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch task statistics');
      }
    }
  },

  // Dashboard
  dashboard: {
    adminStats: async () => {
      try {
        // Get basic counts
        const [usersResult, attendanceResult, leavesResult, salariesResult] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact' }).eq('role', 'employee').eq('is_active', true),
          supabase.from('attendance').select('id', { count: 'exact' }).eq('date', new Date().toISOString().split('T')[0]).in('status', ['present', 'late']),
          supabase.from('leaves').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('salaries').select('id', { count: 'exact' }).eq('month', new Date().getMonth() + 1).eq('year', new Date().getFullYear()).eq('is_paid', false)
        ]);

        // Get recent activities
        const [recentLeaves, recentAttendance] = await Promise.all([
          supabase.from('leaves').select(`
            *,
            employee:users(id, full_name)
          `).eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
          supabase.from('attendance').select(`
            *,
            employee:users(id, full_name)
          `).eq('date', new Date().toISOString().split('T')[0]).order('check_in', { ascending: false }).limit(5)
        ]);

        return {
          data: {
            totalEmployees: usersResult.count || 0,
            todayAttendance: attendanceResult.count || 0,
            pendingLeaves: leavesResult.count || 0,
            monthlySalaries: salariesResult.count || 0,
            recentLeaves: recentLeaves.data?.map(leave => ({
              _id: leave.id,
              employee: {
                fullName: leave.employee.full_name
              },
              leaveType: leave.leave_type,
              startDate: leave.start_date,
              endDate: leave.end_date,
              days: leave.days
            })) || [],
            recentAttendance: recentAttendance.data?.map(att => ({
              _id: att.id,
              employee: {
                fullName: att.employee.full_name
              },
              checkIn: att.check_in,
              status: att.status
            })) || []
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch admin stats');
      }
    },

    employeeStats: async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error('User not authenticated');

        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // Get today's attendance
        const { data: todayAttendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', currentUser._id)
          .eq('date', today)
          .single();

        // Get monthly attendance count
        const monthStart = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
        const monthEnd = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

        const { count: monthlyAttendance } = await supabase
          .from('attendance')
          .select('id', { count: 'exact' })
          .eq('employee_id', currentUser._id)
          .gte('date', monthStart)
          .lte('date', monthEnd)
          .in('status', ['present', 'late']);

        // Get pending leaves count
        const { count: pendingLeaves } = await supabase
          .from('leaves')
          .select('id', { count: 'exact' })
          .eq('employee_id', currentUser._id)
          .eq('status', 'pending');

        // Get recent leaves
        const { data: recentLeaves } = await supabase
          .from('leaves')
          .select('*')
          .eq('employee_id', currentUser._id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Get user data for leave balance
        const { data: userData } = await supabase
          .from('users')
          .select('leave_balance')
          .eq('id', currentUser._id)
          .single();

        return {
          data: {
            todayAttendance: todayAttendance ? {
              checkIn: todayAttendance.check_in,
              checkOut: todayAttendance.check_out,
              workingHours: todayAttendance.working_hours,
              status: todayAttendance.status
            } : null,
            monthlyAttendance: monthlyAttendance || 0,
            leaveBalance: userData?.leave_balance || { annual: 0, sick: 0, casual: 0 },
            pendingLeaves: pendingLeaves || 0,
            recentLeaves: recentLeaves?.map(leave => ({
              _id: leave.id,
              leaveType: leave.leave_type,
              startDate: leave.start_date,
              endDate: leave.end_date,
              days: leave.days,
              reason: leave.reason,
              status: leave.status
            })) || [],
            workingDays: new Date(currentYear, currentMonth, 0).getDate()
          }
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch employee stats');
      }
    }
  }
};