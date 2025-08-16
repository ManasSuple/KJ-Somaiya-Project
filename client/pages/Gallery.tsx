import PlaceholderPage from "./PlaceholderPage";
import { Image } from "lucide-react";

const Gallery = () => {
  return (
    <PlaceholderPage
      title="Industrial Visits Gallery"
      description="Browse through our extensive photo gallery organized by department and year, showcasing memorable moments from industrial visits across various sectors."
      icon={<Image className="h-24 w-24 text-gray-400 mx-auto mb-6" />}
    />
  );
};

export default Gallery;
