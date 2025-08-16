import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, ExternalLink, Filter, Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import supabase from "@/lib/supabase";

const UpcomingVisits = () => {
  const navigate = useNavigate();
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
    registrationLink?: string | null;
  }>>([]);

  useEffect(() => {
    const fetchVisits = async () => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const currentDate = `${yyyy}-${mm}-${dd}`; // matches SQL current_date semantics

      const { data, error } = await supabase
        .from("iv_visits")
        .select("*")
        .gte("visit_date", currentDate)
        .order("visit_date", { ascending: true });

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
          registrationLink: row.registration_url ?? null,
        }));
        setVisits(mapped);
      }
    };
    fetchVisits();
  }, []);
  
  const departments = [...new Set(visits.map(visit => visit.department))];
  
  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || visit.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleRegisterClick = () => {
    navigate('/register-visit');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Upcoming Industrial Visits
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Explore exciting opportunities to visit leading industries and gain hands-on experience in your field of study.
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
                  placeholder="Search visits..."
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
              {filteredVisits.length} of {visits.length} visits
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
                <Card key={visit.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-green-500 hover:bg-green-600 text-white">
                        Upcoming
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium text-red-600">
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
                    <CardTitle className="text-xl leading-tight">
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
                        <span className="text-gray-500">Available Seats:</span>
                        <div className="flex items-center text-gray-700">
                          <Users className="h-4 w-4 mr-1" />
                          {visit.studentsCount}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      {visit.registrationLink ? (
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Register Now
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors" 
                          onClick={handleRegisterClick}
                        >
                          Register for Visit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay Updated with Latest Opportunities
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Don't miss out on upcoming industrial visits. Check back regularly for new opportunities and early registration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/past">View Past Visits</Link>
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

export default UpcomingVisits;
