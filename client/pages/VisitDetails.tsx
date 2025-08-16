import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, BookOpen, Building2, ExternalLink, Share2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

const VisitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedVisits, setRelatedVisits] = useState<any[]>([]);

  useEffect(() => {
    const fetchVisitDetails = async () => {
      if (id) {
        try {
          const { data, error } = await supabase
            .from("iv_visits")
            .select("*")
            .eq("id", id)
            .single();

          if (error) {
            throw error;
          }

          setVisit(data);

          // Fetch related visits from the same department
          if (data) {
            const { data: relatedData } = await supabase
              .from("iv_visits")
              .select("*")
              .eq("department", data.department)
              .neq("id", id)
              .limit(3);

            if (relatedData) {
              setRelatedVisits(relatedData);
            }
          }
        } catch (error) {
          console.error('Error fetching visit details:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchVisitDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visit details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Visit Not Found</h1>
          <p className="text-gray-600 mb-8">The industrial visit you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge 
                  className={new Date(visit.visit_date) >= new Date() ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}
                >
                  {new Date(visit.visit_date) >= new Date() ? 'Upcoming' : 'Completed'}
                </Badge>
                <Badge variant="outline">{visit.department}</Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {visit.title}
              </h1>
              
              <div className="flex flex-wrap gap-6 text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-red-600" />
                  <span className="font-medium">
                    {new Date(visit.visit_date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  <span>{visit.location_city}, {visit.location_state}</span>
                </div>
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-red-600" />
                  <span>{visit.industry}</span>
                </div>
                {visit.available_seats && (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-red-600" />
                    <span>{visit.available_seats} students</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {visit.registration_url && new Date(visit.visit_date) >= new Date() && (
                <Button className="bg-red-600 hover:bg-red-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Register Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Image Gallery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-red-600" />
                    Visit Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visit.image_url ? (
                      <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={visit.image_url} 
                          alt={`${visit.title} - Visit Image`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">No image available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-red-600" />
                    About This Visit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {visit.description}
                  </p>
                </CardContent>
              </Card>

              {/* Learning Outcomes */}
              {visit.learning_outcomes && visit.learning_outcomes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-red-600" />
                      Learning Outcomes
                    </CardTitle>
                    <CardDescription>
                      Key skills and knowledge gained from this industrial visit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {visit.learning_outcomes.map((outcome: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <div className="bg-red-100 rounded-full p-1 mr-3 mt-1">
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                          </div>
                          <span className="text-gray-700">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Visit Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Department</h4>
                    <p className="text-gray-600">{visit.department}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Industry Sector</h4>
                    <p className="text-gray-600">{visit.industry}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                    <p className="text-gray-600">{visit.location_city}, {visit.location_state}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Date</h4>
                    <p className="text-gray-600">
                      {new Date(visit.visit_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  {visit.available_seats && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Students Participated</h4>
                        <p className="text-gray-600">{visit.available_seats} students</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Action Button */}
              {new Date(visit.visit_date) >= new Date() && visit.registration_url && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">Ready to Join?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Register now to secure your spot for this industrial visit.
                    </p>
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Register for Visit
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Related Visits */}
              <Card>
                <CardHeader>
                  <CardTitle>Related Visits</CardTitle>
                  <CardDescription>Other visits from {visit.department}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedVisits.map(relatedVisit => (
                      <Link 
                        key={relatedVisit.id}
                        to={`/visit/${relatedVisit.id}`}
                        className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                          {relatedVisit.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(relatedVisit.visit_date).toLocaleDateString()}
                        </p>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VisitDetails;
