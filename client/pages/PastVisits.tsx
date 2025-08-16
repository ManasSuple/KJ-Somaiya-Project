import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Search, Filter, Eye } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import supabase from "@/lib/supabase";

const PastVisits = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [visits, setVisits] = useState<Array<{
    id: string;
    title: string;
    location: string;
    date: string;
    description: string | null;
    department: string;
    industry: string;
    studentsCount: number;
    images: string[];
    learningOutcomes?: string[];
  }>>([]);

  useEffect(() => {
    const fetchPastVisits = async () => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const currentDate = `${yyyy}-${mm}-${dd}`;

      const { data, error } = await supabase
        .from("iv_visits")
        .select("*")
        .lt("visit_date", currentDate)
        .order("visit_date", { ascending: false });

      if (!error && data) {
        const mapped = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          location: `${row.location_city}, ${row.location_state}`,
          date: row.visit_date,
          description: row.description ?? null,
          department: row.department,
          industry: row.industry,
          studentsCount: row.available_seats,
          images: [row.image_url || "/placeholder.svg"],
          learningOutcomes: [],
        }));
        setVisits(mapped);
      }
    };
    fetchPastVisits();
  }, []);
  
  const departments = [...new Set(visits.map(visit => visit.department))];
  
  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || visit.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Past Industrial Visits Archive
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Explore our comprehensive archive of completed industrial visits with detailed reports, photos, and learning outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredVisits.length} of {visits.length} completed visits
            </div>
          </div>
        </div>
      </section>

      {/* Visits Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredVisits.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No visits found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVisits.map((visit) => (
                <Link 
                  key={visit.id} 
                  to={`/visit/${visit.id}`}
                  className="group"
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group-hover:scale-[1.02] cursor-pointer">
                    {/* Image */}
                    <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={visit.images[0]} 
                        alt={visit.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Eye className="h-5 w-5 text-gray-700" />
                        </div>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                          Completed
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-600">
                            {new Date(visit.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(visit.date).getFullYear()}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-xl leading-tight group-hover:text-red-600 transition-colors">
                        {visit.title}
                      </CardTitle>
                      <CardDescription className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        {visit.location}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {visit.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Department:</span>
                          <Badge variant="outline" className="text-xs">
                            {visit.department}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Industry:</span>
                          <span className="font-medium text-gray-700">{visit.industry}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Students:</span>
                          <div className="flex items-center text-gray-700">
                            <Users className="h-4 w-4 mr-1" />
                            {visit.studentsCount}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {visit.learningOutcomes?.length || 0} learning outcomes
                          </span>
                          <div className="text-red-600 text-sm font-medium group-hover:text-red-700">
                            View Details →
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Want to Participate in Future Visits?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Check out our upcoming industrial visits and register for new learning opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/upcoming">View Upcoming Visits</Link>
            </Button>
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link to="/contact">Contact Coordinator</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PastVisits;
