import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { mockApi } from '../utils/mockApi';

interface Department {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface Designation {
  _id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface DepartmentForm {
  name: string;
  description: string;
}

interface DesignationForm {
  title: string;
  description: string;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'departments' | 'designations'>('departments');
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDesigModal, setShowDesigModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingDesig, setEditingDesig] = useState<Designation | null>(null);

  const deptForm = useForm<DepartmentForm>();
  const desigForm = useForm<DesignationForm>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptResponse, desigResponse] = await Promise.all([
        mockApi.departments.get(),
        mockApi.designations.get()
      ]);
      setDepartments(deptResponse.data);
      setDesignations(desigResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitDepartment = async (data: DepartmentForm) => {
    try {
      if (editingDept) {
        await mockApi.departments.update(editingDept._id, data);
        toast.success('Department updated successfully');
      } else {
        await mockApi.departments.create(data);
        toast.success('Department created successfully');
      }
      setShowDeptModal(false);
      setEditingDept(null);
      deptForm.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save department');
    }
  };

  const onSubmitDesignation = async (data: DesignationForm) => {
    try {
      if (editingDesig) {
        await mockApi.designations.update(editingDesig._id, data);
        toast.success('Designation updated successfully');
      } else {
        await mockApi.designations.create(data);
        toast.success('Designation created successfully');
      }
      setShowDesigModal(false);
      setEditingDesig(null);
      desigForm.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save designation');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await mockApi.departments.delete(id);
        toast.success('Department deleted successfully');
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  const handleDeleteDesignation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      try {
        await mockApi.designations.delete(id);
        toast.success('Designation deleted successfully');
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete designation');
      }
    }
  };

  const handleEditDepartment = (dept: Department) => {
    setEditingDept(dept);
    deptForm.setValue('name', dept.name);
    deptForm.setValue('description', dept.description);
    setShowDeptModal(true);
  };

  const handleEditDesignation = (desig: Designation) => {
    setEditingDesig(desig);
    desigForm.setValue('title', desig.title);
    desigForm.setValue('description', desig.description);
    setShowDesigModal(true);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department & Designation Management</h1>
          <p className="mt-2 text-gray-600">Manage organizational structure</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('departments')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'departments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className="h-4 w-4 inline mr-2" />
              Departments
            </button>
            <button
              onClick={() => setActiveTab('designations')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'designations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Briefcase className="h-4 w-4 inline mr-2" />
              Designations
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'departments' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Departments</h3>
                <button
                  onClick={() => setShowDeptModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <div key={dept._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{dept.name}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDepartment(dept)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{dept.description || 'No description'}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Designations</h3>
                <button
                  onClick={() => setShowDesigModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Designation
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {designations.map((desig) => (
                  <div key={desig._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{desig.title}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDesignation(desig)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDesignation(desig._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{desig.description || 'No description'}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        desig.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {desig.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDept ? 'Edit Department' : 'Add Department'}
              </h3>
              <form onSubmit={deptForm.handleSubmit(onSubmitDepartment)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name
                  </label>
                  <input
                    {...deptForm.register('name', { required: 'Department name is required' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter department name"
                  />
                  {deptForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{deptForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...deptForm.register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter department description"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeptModal(false);
                      setEditingDept(null);
                      deptForm.reset();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    {editingDept ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Designation Modal */}
      {showDesigModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDesig ? 'Edit Designation' : 'Add Designation'}
              </h3>
              <form onSubmit={desigForm.handleSubmit(onSubmitDesignation)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation Title
                  </label>
                  <input
                    {...desigForm.register('title', { required: 'Designation title is required' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter designation title"
                  />
                  {desigForm.formState.errors.title && (
                    <p className="mt-1 text-sm text-red-600">{desigForm.formState.errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...desigForm.register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter designation description"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDesigModal(false);
                      setEditingDesig(null);
                      desigForm.reset();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    {editingDesig ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;