import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UpcomingVisits from "./pages/UpcomingVisits";
import PastVisits from "./pages/PastVisits";
import VisitDetails from "./pages/VisitDetails";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import StudentRegistration from "./pages/StudentRegistration";
import ScrollToTop from "@/components/ScrollToTop";
import AdminPanel from "./components/AdminPanel";
import AddVisit from "./pages/admin/AddVisit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/upcoming" element={<UpcomingVisits />} />
          <Route path="/past" element={<PastVisits />} />
          <Route path="/visit/:id" element={<VisitDetails />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/add-visit" element={<AddVisit />} />
          <Route path="/register-visit" element={<StudentRegistration />} />


          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Ensure we only create the root once
const container = document.getElementById("root")!;

// Check if root already exists to prevent duplicate createRoot calls
if (!(container as any)._reactRoot) {
  const root = createRoot(container);
  (container as any)._reactRoot = root;
  root.render(<App />);
} else {
  (container as any)._reactRoot.render(<App />);
}
