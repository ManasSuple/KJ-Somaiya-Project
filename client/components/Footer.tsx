import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* College Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F88fbaeb505cf4da7b2e44fd58d340f90%2F1f6d71fb3abc4f60b2e5333d3d1aedbb?format=webp&width=800"
                alt="KJ Somaiya Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="font-bold text-xl">Somaiya IV Portal</span>
            </div>
            <p className="text-gray-300 mb-4">
              Bridging the gap between academic learning and industry practice through comprehensive industrial visits and real-world exposure for our students.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-red-400" />
                <span className="text-gray-300">iv.coordinator@college.edu</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-red-400" />
                <span className="text-gray-300">+91 88794 68111</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-red-400" />
                <span className="text-gray-300">K J Somaiya Institute of Technology Ayurvihar, Sion Mumbai 400022</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Departments</h3>
            <div className="space-y-2">
              <p className="text-gray-300 hover:text-red-300 cursor-pointer transition-colors">Computer Science</p>
              <p className="text-gray-300 hover:text-red-300 cursor-pointer transition-colors">Information Technology</p>
              <p className="text-gray-300 hover:text-red-300 cursor-pointer transition-colors">Electronics & Comm.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} College Industrial Visits Portal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
