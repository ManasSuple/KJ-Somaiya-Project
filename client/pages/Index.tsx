import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar, MapPin, BookOpen, Building2, Zap, Award } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

const Index = () => {
  const [latestVisits, setLatestVisits] = useState<Array<{
    id: string;
    title: string;
    location: string;
    date: string;
    description: string | null;
    department: string;
    industry: string;
    studentsCount: number;
  }>>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<Array<{
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
      const currentDate = `${yyyy}-${mm}-${dd}`;

      // Fetch latest visits (past visits)
      const { data: latestData, error: latestError } = await supabase
        .from("iv_visits")
        .select("*")
        .lt("visit_date", currentDate)
        .order("visit_date", { ascending: false })
        .limit(3);

      if (!latestError && latestData) {
        const mappedLatest = latestData.map((row: any) => ({
          id: row.id,
          title: row.title,
          location: `${row.location_city}, ${row.location_state}`,
          date: row.visit_date,
          description: row.description ?? null,
          department: row.department,
          industry: row.industry,
          studentsCount: row.available_seats,
        }));
        setLatestVisits(mappedLatest);
      }

      // Fetch upcoming visits
      const { data: upcomingData, error: upcomingError } = await supabase
        .from("iv_visits")
        .select("*")
        .gte("visit_date", currentDate)
        .order("visit_date", { ascending: true })
        .limit(2);

      if (!upcomingError && upcomingData) {
        const mappedUpcoming = upcomingData.map((row: any) => ({
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
        setUpcomingVisits(mappedUpcoming);
      }
    };
    fetchVisits();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-700 via-red-800 to-red-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Bridging Academia with
              <span className="text-red-300 block">Industry Excellence</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100 max-w-3xl mx-auto">
              Discover real-world applications through our comprehensive Industrial Visits program, connecting students with leading industries across various sectors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white border-0">
                <Link to="/upcoming" className="flex items-center">
                  Explore Upcoming Visits
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white bg-white text-red-600 hover:bg-red-50 hover:text-red-700">
                <Link to="/gallery">View Gallery</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">50+</h3>
              <p className="text-gray-600">Industry Partners</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">20+</h3>
              <p className="text-gray-600">Students Benefited</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10+</h3>
              <p className="text-gray-600">Visits Organized</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">4</h3>
              <p className="text-gray-600">Departments</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Initiative */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Transforming Learning Through Industry Exposure
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Our Industrial Visits program is designed to provide students with hands-on experience and real-world insights into their chosen fields. We partner with leading companies across various sectors to offer comprehensive learning opportunities.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <BookOpen className="h-6 w-6 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Practical Learning</h4>
                    <p className="text-gray-600">Bridge the gap between theoretical knowledge and practical application.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="h-6 w-6 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Industry Networks</h4>
                    <p className="text-gray-600">Build valuable connections with industry professionals and potential employers.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Career Guidance</h4>
                    <p className="text-gray-600">Gain insights into career paths and industry expectations.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="relative lg:left-[-20px] md:left-[-10px] left-0">
                <div
                  className="aspect-video rounded-2xl overflow-hidden bg-gray-200"
                  style={{ height: "auto", minHeight: "220px" }}
                >
                  <div className="flex animate-scroll h-full">
                    {/* Industrial Visit Images - Auto Scrolling */}
                    <div className="min-w-full relative">
                      <img
                        src="https://images.pexels.com/photos/3184396/pexels-photo-3184396.jpeg"
                        alt="Students visiting manufacturing plant"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="text-white p-6">
                          <h3 className="text-xl font-semibold mb-2">Manufacturing Plant Visit</h3>
                          <p className="text-sm opacity-90">Students exploring real-world production processes</p>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-full relative">
                      <img
                        src="https://images.pexels.com/photos/3182782/pexels-photo-3182782.jpeg"
                        alt="Technology company visit"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="text-white p-6">
                          <h3 className="text-xl font-semibold mb-2">Tech Company Experience</h3>
                          <p className="text-sm opacity-90">Learning about cutting-edge technology solutions</p>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-full relative">
                      <img
                        src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg"
                        alt="Engineering facility tour"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="text-white p-6">
                          <h3 className="text-xl font-semibold mb-2">Engineering Excellence</h3>
                          <p className="text-sm opacity-90">Hands-on experience with industry standards</p>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-full relative">
                      <img
                        src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg"
                        alt="Student interaction with industry experts"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="text-white p-6">
                          <h3 className="text-xl font-semibold mb-2">Industry Mentorship</h3>
                          <p className="text-sm opacity-90">Direct interaction with industry professionals</p>
                        </div>
                      </div>
                    </div>

                    {/* Duplicate first image for seamless loop */}
                    <div className="min-w-full relative">
                      <img
                        src="https://images.pexels.com/photos/3184396/pexels-photo-3184396.jpeg"
                        alt="Students visiting manufacturing plant"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="text-white p-6">
                          <h3 className="text-xl font-semibold mb-2">Manufacturing Plant Visit</h3>
                          <p className="text-sm opacity-90">Students exploring real-world production processes</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scroll indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Visits Highlights */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recent Visit Highlights
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our recent industrial visits and the valuable learning experiences they provided to our students.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {latestVisits.map((visit) => (
              <Link key={visit.id} to={`/visit/${visit.id}`} className="group">
                <Card className="hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{visit.department}</Badge>
                      <span className="text-sm text-gray-500">{new Date(visit.date).toLocaleDateString()}</span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-red-600 transition-colors">{visit.title}</CardTitle>
                    <CardDescription className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {visit.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">{visit.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {visit.studentsCount} students
                      </div>
                      <Badge variant="outline">{visit.industry}</Badge>
                    </div>
                    <div className="mt-3 text-sm text-red-600 group-hover:text-red-700 font-medium">
                      View Details →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/past">View All Past Visits</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Visits Preview */}
      <section className="py-16 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Opportunities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't miss out on these exciting upcoming industrial visits. Register now to secure your spot!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {upcomingVisits.map((visit) => (
              <Card key={visit.id} className="border-red-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-green-500 hover:bg-green-600">Upcoming</Badge>
                    <span className="text-sm font-medium text-red-600">{new Date(visit.date).toLocaleDateString()}</span>
                  </div>
                  <CardTitle className="text-xl">{visit.title}</CardTitle>
                  <CardDescription className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {visit.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{visit.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {visit.studentsCount} seats available
                    </div>
                    <Badge variant="outline">{visit.department}</Badge>
                  </div>
                  {visit.registrationLink && (
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Register Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link to="/upcoming" className="flex items-center">
                View All Upcoming Visits
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
