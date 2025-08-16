import PlaceholderPage from "./PlaceholderPage";
import { Mail } from "lucide-react";

const Contact = () => {
  return (
    <PlaceholderPage
      title="Contact Our Coordinators"
      description="Get in touch with our Industrial Visits coordinators for queries, feedback, or assistance with upcoming visit registrations."
      icon={<Mail className="h-24 w-24 text-gray-400 mx-auto mb-6" />}
    />
  );
};

export default Contact;
