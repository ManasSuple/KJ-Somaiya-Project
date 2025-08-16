import React, { useState, useEffect } from 'react';
import { User, FileText, Send, ArrowLeft } from 'lucide-react';
import supabase from '@/lib/supabase';

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    div: '',
    rollNumber: '',
    email: '',
    selectedVisit: '',
    reason: ''
  });

  const [upcomingVisits, setUpcomingVisits] = useState<Array<{
    id: string;
    title: string;
    date: string;
    location: string;
    department: string;
    industry: string;
  }>>([]);

  const departments = [
    'Computer Science',
    'Electronics & Communication',
    'Information Technology',
    'Artificial Intelligence &Data Science',
  ];

  const divisions = ['A', 'B'];

  // Fetch upcoming visits from Supabase
  useEffect(() => {
    const fetchUpcomingVisits = async () => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const currentDate = `${yyyy}-${mm}-${dd}`;

      const { data, error } = await supabase
        .from("iv_visits")
        .select("*")
        .gte("visit_date", currentDate)
        .order("visit_date", { ascending: true });

      if (!error && data) {
        const mapped = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          date: row.visit_date,
          location: `${row.location_city}, ${row.location_state}`,
          department: row.department,
          industry: row.industry,
        }));
        setUpcomingVisits(mapped);
      }
    };
    fetchUpcomingVisits();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear any existing messages when user starts typing
    if (submitMessage) {
      setSubmitMessage(null);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Validate that a visit is selected
      if (!formData.selectedVisit) {
        throw new Error('Please select an industrial visit');
      }

             // Insert registration into Supabase
       const { data, error } = await supabase
         .from('student_registrations')
         .insert([
           {
             student_name: formData.name,
             department: formData.department,
             division: formData.div,
             roll_number: formData.rollNumber,
             email: formData.email,
             visit_id: formData.selectedVisit, // This will now store the visit title as text
             motivation_reason: formData.reason,
           }
         ])
         .select();

      if (error) {
        throw error;
      }

      // Success - show success message and reset form
      setSubmitMessage({
        type: 'success',
        message: 'Registration submitted successfully! You will receive a confirmation email shortly.'
      });

      // Reset form data
      setFormData({
        name: '',
        department: '',
        div: '',
        rollNumber: '',
        email: '',
        selectedVisit: '',
        reason: ''
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      
             // Handle specific database constraint errors
       let userMessage = 'Failed to submit registration. Please try again.';
       
       if (error.message) {
         if (error.message.includes('duplicate key value violates unique constraint "unique_student_per_visit"')) {
           userMessage = 'You have already registered for this industrial visit.';
         } else if (error.message.includes('duplicate key')) {
           userMessage = 'A registration with these details already exists. Please check your information and try again.';
         } else {
           userMessage = error.message;
         }
       }
      
      setSubmitMessage({
        type: 'error',
        message: userMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <a href="/upcoming" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Back to Upcoming Visits</span>
          </a>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Registration</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Register for Industrial Visit</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          {/* Success/Error Messages */}
          {submitMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">
                {submitMessage.message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                <span>Personal Information</span>
              </h3>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="div" className="block text-sm font-medium text-gray-700 mb-2">
                    Division *
                  </label>
                  <select
                    id="div"
                    name="div"
                    required
                    value={formData.div}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select Division</option>
                    {divisions.map((division) => (
                      <option key={division} value={division}>
                        Division {division}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

                             <div>
                 <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
                   Roll Number *
                 </label>
                 <input
                   type="text"
                   id="rollNumber"
                   name="rollNumber"
                   required
                   value={formData.rollNumber}
                   onChange={handleInputChange}
                   placeholder="Enter your roll number"
                   className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                 />
               </div>

                               <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                <span>Visit Selection</span>
              </h3>

              <div>
                <label htmlFor="selectedVisit" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Industrial Visit *
                </label>
                                 <select
                   id="selectedVisit"
                   name="selectedVisit"
                   required
                   value={formData.selectedVisit}
                   onChange={handleInputChange}
                   className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                 >
                   <option value="">Choose an industrial visit</option>
                   {upcomingVisits.map((visit) => (
                     <option key={visit.id} value={`${visit.title} - ${new Date(visit.date).toLocaleDateString('en-US', { 
                       month: 'short', 
                       day: 'numeric'
                       
                     })} `}>
                       {visit.title} - {new Date(visit.date).toLocaleDateString('en-US', { 
                         month: 'short', 
                         day: 'numeric',
                        
                       })} 
                     </option>
                   ))}
                 </select>
                {upcomingVisits.length === 0 && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">No upcoming visits available at the moment.</p>
                )}
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to be a part of this industrial visit?
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Please explain your motivation for attending this industrial visit..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
              <a href="/upcoming" className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center text-sm sm:text-base">
                Back
              </a>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 flex-shrink-0" />
                    <span>Submit Registration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
