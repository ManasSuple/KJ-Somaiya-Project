import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  Users as UsersIcon,
  Eye,
  MoreVertical
} from 'lucide-react';
import supabase from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


interface ContentAreaProps {
  activeSection: string;
  userRole: 'faculty' | 'super';
}

const ContentArea: React.FC<ContentAreaProps> = ({ activeSection, userRole }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [registrationSearchTerm, setRegistrationSearchTerm] = useState('');
  const [selectedVisitFilter, setSelectedVisitFilter] = useState('all');
  
  type VisitItem = {
    id: string;
    title: string;
    date: string; // ISO date string (YYYY-MM-DD)
    location: string;
    department: string;
    industry: string;
    studentsCount: number;
  };

  const [upcomingVisits, setUpcomingVisits] = useState<VisitItem[]>([]);
  const [pastVisits, setPastVisits] = useState<VisitItem[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<VisitItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching visits data...');
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const currentDate = `${yyyy}-${mm}-${dd}`;

      const [{ data: upcoming, error: upErr }, { data: past, error: pastErr }] = await Promise.all([
        supabase
          .from('iv_visits')
          .select('*')
          .gte('visit_date', currentDate)
          .order('visit_date', { ascending: true }),
        supabase
          .from('iv_visits')
          .select('*')
          .lt('visit_date', currentDate)
          .order('visit_date', { ascending: false })
      ]);

      console.log('Fetch results:', { upcoming, upErr, past, pastErr });

      if (!upErr && upcoming) {
        const mappedUpcoming: VisitItem[] = upcoming.map((row: any) => ({
          id: row.id,
          title: row.title,
          date: row.visit_date,
          location: `${row.location_city}, ${row.location_state}`,
          department: row.department,
          industry: row.industry,
          studentsCount: row.available_seats,
        }));
        setUpcomingVisits(mappedUpcoming);
      }

      if (!pastErr && past) {
        const mappedPast: VisitItem[] = past.map((row: any) => ({
          id: row.id,
          title: row.title,
          date: row.visit_date,
          location: `${row.location_city}, ${row.location_state}`,
          department: row.department,
          industry: row.industry,
          studentsCount: row.available_seats,
        }));
        setPastVisits(mappedPast);
      }
    };
    fetchData();
  }, []);

  const handleDeleteClick = (visit: VisitItem) => {
    console.log('Delete button clicked for visit:', visit);
    setVisitToDelete(visit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!visitToDelete) return;
    
    console.log('Attempting to delete visit:', visitToDelete);
    setIsDeleting(true);
    
    try {
      console.log('Sending delete request to Supabase for ID:', visitToDelete.id);
      
      const { data, error } = await supabase
        .from('iv_visits')
        .delete()
        .eq('id', visitToDelete.id)
        .select(); // Add select() to see what was deleted

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Error deleting visit:', error);
        toast({
          title: "Error",
          description: `Failed to delete visit: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Successfully deleted visit from database');
        // Remove the deleted visit from both upcoming and past visits states
        setUpcomingVisits(prev => prev.filter(v => v.id !== visitToDelete.id));
        setPastVisits(prev => prev.filter(v => v.id !== visitToDelete.id));
        setDeleteDialogOpen(false);
        setVisitToDelete(null);
        toast({
          title: "Success",
          description: "Visit deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Exception during delete:', error);
      toast({
        title: "Error",
        description: "Failed to delete visit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setVisitToDelete(null);
  };

  const fetchRegistrations = async () => {
    setIsLoadingRegistrations(true);
    try {
      const { data, error } = await supabase
        .from('student_registrations')
        .select('*');

      if (error) {
        console.error('Error fetching registrations:', error);
      } else {
        setRegistrations(data || []);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

  const updateRegistrationStatus = async (registrationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('student_registrations')
        .update({ status: newStatus })
        .eq('id', registrationId);

      if (error) {
        console.error('Error updating status:', error);
      } else {
        // Refresh the registrations to show the updated status
        fetchRegistrations();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const downloadExcel = () => {
    // Filter registrations based on current filter and status
    let filteredData = registrations.filter(registration => {
      // First filter by status - only approved students
      if (registration.status !== 'approved') {
        return false;
      }

      // Then apply the visit filter
      if (selectedVisitFilter === 'all') {
        return true; // Show all approved students from all visits
      } else {
        return registration.visit_id === selectedVisitFilter;
      }
    });

    if (filteredData.length === 0) {
      alert('No approved students found for the selected criteria.');
      return;
    }

    // Prepare CSV data
    const headers = ['Student Name', 'Email', 'Roll Number', 'Department', 'Division', 'Visit', 'Status', 'Registration Date'];
    const csvData = filteredData.map(registration => [
      registration.student_name,
      registration.email,
      registration.roll_number,
      registration.department,
      registration.division || '',
      registration.visit_id,
      registration.status,
      new Date(registration.registration_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    ]);

    // Create CSV content
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Generate filename based on filter
    let filename = 'approved_students';
    if (selectedVisitFilter !== 'all') {
      // Clean the visit name for filename
      const cleanVisitName = selectedVisitFilter.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      filename += `_${cleanVisitName}`;
    }
    filename += `_${new Date().toISOString().split('T')[0]}.csv`;

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (activeSection === 'registrations' || activeSection === 'download') {
      fetchRegistrations();
    }
  }, [activeSection]);

  // Also fetch registrations on component mount if we're on the registrations section
  useEffect(() => {
    if (activeSection === 'registrations' || activeSection === 'download') {
      fetchRegistrations();
    }
  }, []);

  const renderUpcomingVisits = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Visits</h2>
        <button 
          onClick={() => navigate('/admin/add-visit')}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Visit</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search visits..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {upcomingVisits
            .filter((v) => {
              const q = searchTerm.toLowerCase();
              return (
                v.title.toLowerCase().includes(q) ||
                v.location.toLowerCase().includes(q) ||
                v.industry.toLowerCase().includes(q)
              );
            })
            .map((visit) => (
            <div key={visit.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{visit.title}</h3>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(visit.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>—</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{visit.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UsersIcon className="w-4 h-4" />
                      <span>{visit.studentsCount} seats</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(visit)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPastVisits = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Past Visits</h2>
        <div className="flex items-center space-x-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search past visits..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option>All Years</option>
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {pastVisits.map((visit) => (
            <div key={visit.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{visit.title}</h3>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(visit.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{visit.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UsersIcon className="w-4 h-4" />
                      <span>{visit.studentsCount} attended</span>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(visit)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGallery = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Images</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((image) => (
            <div key={image} className="relative group">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={`https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=400`}
                  alt={`Gallery image ${image}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  <button className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRegistrations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">View Registrations</h2>
        <button 
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Excel</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search registrations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={registrationSearchTerm}
                onChange={(e) => setRegistrationSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={selectedVisitFilter}
              onChange={(e) => setSelectedVisitFilter(e.target.value)}
            >
              <option value="all">All Visits</option>
              {Array.from(new Set(registrations.map(r => r.visit_id))).map((visitName, index) => (
                <option key={index} value={visitName}>{visitName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingRegistrations ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading registrations...</span>
                    </div>
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No registrations found
                  </td>
                </tr>
              ) : (
                registrations
                  .filter(registration => {
                    const matchesSearch = 
                      registration.student_name.toLowerCase().includes(registrationSearchTerm.toLowerCase()) ||
                      registration.email.toLowerCase().includes(registrationSearchTerm.toLowerCase()) ||
                      registration.roll_number.toLowerCase().includes(registrationSearchTerm.toLowerCase()) ||
                      registration.department.toLowerCase().includes(registrationSearchTerm.toLowerCase());
                    
                    const matchesFilter = selectedVisitFilter === 'all' || registration.visit_id === selectedVisitFilter;
                    
                    return matchesSearch && matchesFilter;
                  })
                  .map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-red-600">
                            {registration.student_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{registration.student_name}</div>
                          <div className="text-sm text-gray-500">{registration.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{registration.roll_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{registration.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={registration.visit_id}>
                        {registration.visit_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={registration.status}
                        onChange={(e) => updateRegistrationStatus(registration.id, e.target.value)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-red-500 ${
                          registration.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : registration.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : registration.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderManageAdmins = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Manage Admins</h2>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add New Admin</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3].map((admin) => (
                <tr key={admin} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">AD</span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">Admin User</div>
                        <div className="text-sm text-gray-500">admin@university.edu</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Faculty Admin
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Computer Science</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'upcoming':
        return renderUpcomingVisits();
      case 'past':
        return renderPastVisits();
      case 'gallery':
        return renderGallery();
      case 'registrations':
        return renderRegistrations();
      case 'download':
        return renderRegistrations(); // Same as registrations but with download focus
      case 'admins':
        return userRole === 'super' ? renderManageAdmins() : renderUpcomingVisits();
      case 'roles':
        return userRole === 'super' ? renderManageAdmins() : renderUpcomingVisits();
      default:
        return renderUpcomingVisits();
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">
      {renderContent()}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Visit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{visitToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentArea;