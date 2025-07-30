import React, { useState, useEffect } from 'react';
import { Upload, Download, FileText, Eye, Trash2, Filter, File, Users, Calendar, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { mockApi } from '../utils/mockApi';
import { useAuth } from '../contexts/AuthContext';

interface Document {
  _id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  uploadedBy: {
    _id: string;
    fullName: string;
  };
  category: 'notice' | 'circular' | 'policy' | 'form' | 'other';
  createdAt: string;
}

interface DocumentForm {
  title: string;
  description: string;
  category: string;
  file: FileList;
}

const DocumentManagement: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');

  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalSize: 0,
    categories: 0
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DocumentForm>();

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, categoryFilter]);

  const fetchDocuments = async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: 10
      };

      if (categoryFilter) params.category = categoryFilter;

      const response = await mockApi.documents.get(params);
      setDocuments(response.data.documents);
      setTotalPages(response.data.totalPages);

      // Calculate stats
      const docs = response.data.documents;
      setStats({
        totalDocuments: docs.length,
        totalSize: docs.reduce((sum: number, doc: any) => sum + doc.fileSize, 0),
        categories: new Set(docs.map((doc: any) => doc.category)).size
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: DocumentForm) => {
    try {
      const file = data.file[0];
      await mockApi.documents.create({
        title: data.title,
        description: data.description,
        category: data.category,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      toast.success('Document uploaded successfully');
      setShowModal(false);
      reset();
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      // In a real implementation, this would download from Supabase Storage
      toast.info('Download functionality would be implemented with Supabase Storage');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download document');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await mockApi.documents.delete(documentId);
        toast.success('Document deleted successfully');
        fetchDocuments();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete document');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'notice':
        return 'bg-blue-100 text-blue-800';
      case 'circular':
        return 'bg-green-100 text-green-800';
      case 'policy':
        return 'bg-purple-100 text-purple-800';
      case 'form':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/25 mb-6">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Document Management
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {user?.role === 'admin' ? 'Upload and manage company documents' : 'Access company documents and resources'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-gradient overflow-hidden shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <File className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Documents</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {stats.totalDocuments}
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
                  <HardDrive className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Size</dt>
                  <dd className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    {formatFileSize(stats.totalSize)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Company Documents</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Browse and manage organizational documents</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="notice">Notice</option>
              <option value="circular">Circular</option>
              <option value="policy">Policy</option>
              <option value="form">Form</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setCategoryFilter('');
                setCurrentPage(1);
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document) => (
          <div key={document._id} className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{document.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{document.fileName}</p>
                </div>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleDelete(document._id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                  {document.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(document.fileSize)}</span>
              </div>
              
              {document.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{document.description}</p>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>Uploaded by: {document.uploadedBy.fullName}</p>
                <p>Date: {format(new Date(document.createdAt), 'MMM dd, yyyy')}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleDownload(document._id, document.fileName)}
                className="flex-1 btn-secondary text-sm py-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card-gradient shadow-xl rounded-2xl border border-purple-100 dark:border-purple-800/30 px-6 py-4">
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
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative card-gradient rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-purple-100 dark:border-purple-800/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload Document</h3>
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
                    Document Title
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className="input-field"
                    placeholder="Enter document title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    <option value="notice">Notice</option>
                    <option value="circular">Circular</option>
                    <option value="policy">Policy</option>
                    <option value="form">Form</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="input-field"
                    placeholder="Enter document description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    File
                  </label>
                  <input
                    {...register('file', { required: 'File is required' })}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    className="input-field"
                  />
                  {errors.file && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.file.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF (Max 10MB)
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
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
                    Upload
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;