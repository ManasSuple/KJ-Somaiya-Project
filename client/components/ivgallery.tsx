import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Upload, X, Trash2, Eye, Search, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Adjust path as needed
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface IVVisit {
  id: string;
  title: string;
  location_city: string;
  location_state: string;
  visit_date: string;
  description?: string;
  department: string;
  industry: string;
  available_seats: number;
  image_urls?: string[]; // Changed to array to support multiple images
}

const IVGallery = () => {
  const [ivVisits, setIvVisits] = useState<IVVisit[]>([]);
  const [expandedIV, setExpandedIV] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showUploadDialog, setShowUploadDialog] = useState<boolean>(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [detailsVisit, setDetailsVisit] = useState<IVVisit | null>(null);

  useEffect(() => {
    const fetchIVVisits = async () => {
      const { data, error } = await supabase
        .from("iv_visits")
        .select("*")
        .order("visit_date", { ascending: false });

      if (error) {
        console.error("Error fetching IV visits:", error);
      } else {
        // Parse image_urls if it's stored as JSON string, otherwise treat as array
        const processedData = data?.map(visit => ({
          ...visit,
          image_urls: visit.image_url ? 
            (typeof visit.image_url === 'string' ? 
              (visit.image_url.startsWith('[') ? JSON.parse(visit.image_url) : [visit.image_url]) 
              : visit.image_url) 
            : []
        })) || [];
        setIvVisits(processedData);
      }

      setLoading(false);
    };

    fetchIVVisits();
  }, []);

  const toggleIV = (id: string) => {
    setExpandedIV(expandedIV === id ? null : id);
  };

  const departments = useMemo(() => {
    return Array.from(new Set(ivVisits.map(v => v.department))).sort();
  }, [ivVisits]);

  const filteredVisits = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return ivVisits.filter((iv) => {
      const matchesQ = !q || iv.title.toLowerCase().includes(q) ||
        iv.location_city.toLowerCase().includes(q) ||
        iv.location_state.toLowerCase().includes(q) ||
        iv.industry.toLowerCase().includes(q);
      const matchesDept = selectedDepartment === "all" || iv.department === selectedDepartment;
      return matchesQ && matchesDept;
    });
  }, [ivVisits, searchTerm, selectedDepartment]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const deleteImage = async (visitId: string, imageUrl: string, imageIndex: number) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    setDeletingImage(`${visitId}-${imageIndex}`);

    try {
      // Get current visit data
      const { data: currentVisit, error: fetchError } = await supabase
        .from('iv_visits')
        .select('image_url')
        .eq('id', visitId)
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      // Parse current image URLs
      let existingUrls: string[] = [];
      if (currentVisit.image_url) {
        existingUrls = typeof currentVisit.image_url === 'string' 
          ? (currentVisit.image_url.startsWith('[') ? JSON.parse(currentVisit.image_url) : [currentVisit.image_url])
          : currentVisit.image_url;
      }

      // Remove the specific image URL
      const updatedUrls = existingUrls.filter((url, index) => index !== imageIndex);

      // Extract filename from URL for storage deletion
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from Supabase Storage (optional - comment out if you want to keep files in storage)
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('gallery')
          .remove([fileName]);
        
        if (storageError) {
          console.warn('Storage deletion error (file may not exist):', storageError);
          // Continue with database update even if storage deletion fails
        }
      }

      // Update the database with remaining image URLs
      const { error: updateError } = await supabase
        .from('iv_visits')
        .update({ 
          image_url: updatedUrls.length > 0 ? JSON.stringify(updatedUrls) : null
        })
        .eq('id', visitId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Update local state
      setIvVisits(prevVisits => 
        prevVisits.map(visit => 
          visit.id === visitId 
            ? { ...visit, image_urls: updatedUrls }
            : visit
        )
      );

      alert("Image deleted successfully!");

    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image. Please try again.");
    } finally {
      setDeletingImage(null);
    }
  };

  const uploadImages = async () => {
    if (!selectedVisitId || selectedFiles.length === 0) {
      alert("Please select a visit and at least one image.");
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      // Upload each file to Supabase Storage
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedVisitId}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('gallery')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      // Get current images for the visit
      const { data: currentVisit, error: fetchError } = await supabase
        .from('iv_visits')
        .select('image_url')
        .eq('id', selectedVisitId)
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      // Combine existing and new image URLs
      let existingUrls: string[] = [];
      if (currentVisit.image_url) {
        existingUrls = typeof currentVisit.image_url === 'string' 
          ? (currentVisit.image_url.startsWith('[') ? JSON.parse(currentVisit.image_url) : [currentVisit.image_url])
          : currentVisit.image_url;
      }

      const allImageUrls = [...existingUrls, ...uploadedUrls];

      // Update the database with all image URLs
      const { error: updateError } = await supabase
        .from('iv_visits')
        .update({ 
          image_url: JSON.stringify(allImageUrls) // Store as JSON array string
        })
        .eq('id', selectedVisitId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Refresh the visits data
      const { data: refreshedData, error: refreshError } = await supabase
        .from("iv_visits")
        .select("*")
        .order("visit_date", { ascending: false });

      if (!refreshError && refreshedData) {
        const processedData = refreshedData.map(visit => ({
          ...visit,
          image_urls: visit.image_url ? 
            (typeof visit.image_url === 'string' ? 
              (visit.image_url.startsWith('[') ? JSON.parse(visit.image_url) : [visit.image_url]) 
              : visit.image_url) 
            : []
        }));
        setIvVisits(processedData);
      }

      // Reset form
      setShowUploadDialog(false);
      setSelectedVisitId("");
      setSelectedFiles([]);
      
      alert(`Successfully uploaded ${uploadedUrls.length} image(s)!`);

    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">IV Gallery</h2>
        {/* <div className="text-sm text-gray-600">{filteredVisits.length} of {ivVisits.length} visits</div> */}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search past visits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-600">
            {filteredVisits.length} of {ivVisits.length} visits
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading visits...</p>
      ) : filteredVisits.length === 0 ? (
        <p className="text-gray-500">No visits found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisits.map((iv) => (
            <div key={iv.id} className="border rounded-lg shadow-sm overflow-hidden group">
              {/* Image header like PastVisits */}
              <div className="relative aspect-video bg-gray-200">
                <img
                  src={(iv.image_urls && iv.image_urls[0]) || "/placeholder.svg"}
                  alt={iv.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <button
                    className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => setDetailsVisit(iv)}
                    title="View details"
                  >
                    <Eye className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Top meta similar to PastVisits */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{iv.title}</div>
                    <div className="text-sm text-gray-600">
                      {iv.location_city}, {iv.location_state} • {formatDate(iv.visit_date)}
                    </div>
                  </div>
                </div>

                {/* Details moved to dialog */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Images to Visit</h3>
                <button
                  onClick={() => {
                    setShowUploadDialog(false);
                    setSelectedVisitId("");
                    setSelectedFiles([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Visit Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Visit
                </label>
                <select
                  value={selectedVisitId}
                  onChange={(e) => setSelectedVisitId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a visit...</option>
                  {ivVisits.map((visit) => (
                    <option key={visit.id} value={visit.id}>
                      {visit.title} - {visit.location_city}, {visit.location_state}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700"
                  >
                    Click to select images
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Selected Files ({selectedFiles.length})
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm text-gray-600 truncate">{file.name}</span>
                        <button
                          onClick={() => removeSelectedFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUploadDialog(false);
                    setSelectedVisitId("");
                    setSelectedFiles([]);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={uploadImages}
                  disabled={uploading || !selectedVisitId || selectedFiles.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Images
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={!!detailsVisit} onOpenChange={(open) => setDetailsVisit(open ? detailsVisit : null)}>
        <DialogContent className="sm:max-w-3xl z-[90]">
          {detailsVisit && (
            <>
              <DialogHeader>
                <DialogTitle>{detailsVisit.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  {detailsVisit.location_city}, {detailsVisit.location_state} • {formatDate(detailsVisit.visit_date)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Department:</span> <span className="font-medium text-gray-800">{detailsVisit.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Industry:</span> <span className="font-medium text-gray-800">{detailsVisit.industry}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Available Seats:</span> <span className="font-medium text-gray-800">{detailsVisit.available_seats}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Visit Date:</span> <span className="font-medium text-gray-800">{formatDate(detailsVisit.visit_date)}</span>
                  </div>
                </div>
                {detailsVisit.description && (
                  <p className="text-sm text-gray-600">{detailsVisit.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Gallery ({detailsVisit.image_urls?.length || 0})</h4>
                  <button
                    onClick={() => { setSelectedVisitId(detailsVisit.id); setDetailsVisit(null); setShowUploadDialog(true); }}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Images
                  </button>
                </div>
                {detailsVisit.image_urls && detailsVisit.image_urls.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {detailsVisit.image_urls.map((imageUrl, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden bg-gray-100 relative group">
                        <img src={imageUrl} alt={`${detailsVisit.title} ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => deleteImage(detailsVisit.id, imageUrl, index)}
                          disabled={deletingImage === `${detailsVisit.id}-${index}`}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete image"
                        >
                          {deletingImage === `${detailsVisit.id}-${index}` ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-100 p-6 text-center text-sm text-gray-500">No images available</div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IVGallery;