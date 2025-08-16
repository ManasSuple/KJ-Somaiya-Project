import { Link } from "react-router-dom";
import { Construction, ArrowLeft, Home } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const PlaceholderPage = ({ title, description, icon }: PlaceholderPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            {icon || <Construction className="h-24 w-24 text-gray-400 mx-auto mb-6" />}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {description}
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-blue-800 font-medium mb-2">
              🚧 This page is currently under development
            </p>
            <p className="text-blue-700">
              We're working hard to bring you this feature. Check back soon for updates, or contact us if you need immediate assistance.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/" className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/upcoming" className="flex items-center">
                View Upcoming Visits
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 text-sm text-gray-500">
            <p>Need immediate assistance? <Link to="/contact" className="text-blue-600 hover:text-blue-700 underline">Contact our coordinator</Link></p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PlaceholderPage;
