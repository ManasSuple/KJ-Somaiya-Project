export interface IndustrialVisit {
  id: string;
  title: string;
  date: string;
  department: string;
  location: string;
  description: string;
  images: string[];
  status: 'upcoming' | 'completed';
  industry: string;
  studentsCount?: number;
  learningOutcomes?: string[];
  registrationLink?: string;
}

export const industrialVisits: IndustrialVisit[] = [
  {
    id: "1",
    title: "Visit to Tata Motors Manufacturing Plant",
    date: "2024-02-15",
    department: "Mechanical Engineering",
    location: "Pune, Maharashtra",
    description: "Students explored real-world automotive manufacturing processes, assembly line operations, and quality control systems. They gained insights into lean manufacturing, robotics integration, and sustainable production practices.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    status: "completed",
    industry: "Automotive",
    studentsCount: 45,
    learningOutcomes: [
      "Understanding of lean manufacturing principles",
      "Exposure to automated assembly lines",
      "Quality control processes in automotive industry",
      "Sustainable manufacturing practices"
    ]
  },
  {
    id: "2",
    title: "Microsoft India Development Center",
    date: "2024-03-10",
    department: "Computer Science Engineering",
    location: "Hyderabad, Telangana",
    description: "An immersive experience into software development lifecycle, cloud computing infrastructure, and emerging technologies like AI and ML implementations in enterprise solutions.",
    images: ["/placeholder.svg", "/placeholder.svg"],
    status: "completed",
    industry: "Technology",
    studentsCount: 50,
    learningOutcomes: [
      "Agile development methodologies",
      "Cloud infrastructure and Azure services",
      "AI/ML integration in software products",
      "Enterprise software architecture"
    ]
  },
  {
    id: "3",
    title: "NTPC Power Plant",
    date: "2024-04-05",
    department: "Electrical Engineering",
    location: "Korba, Chhattisgarh",
    description: "Comprehensive tour of thermal power generation, transmission systems, and grid management. Students learned about power plant operations, safety protocols, and renewable energy integration.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    status: "completed",
    industry: "Power & Energy",
    studentsCount: 40,
    learningOutcomes: [
      "Thermal power generation processes",
      "Electrical grid management",
      "Safety protocols in power plants",
      "Renewable energy integration"
    ]
  },
  {
    id: "4",
    title: "Larsen & Toubro Construction Site",
    date: "2024-05-20",
    department: "Civil Engineering",
    location: "Mumbai, Maharashtra",
    description: "On-site experience of large-scale construction project management, modern construction techniques, and project planning methodologies used in infrastructure development.",
    images: ["/placeholder.svg", "/placeholder.svg"],
    status: "completed",
    industry: "Construction",
    studentsCount: 35,
    learningOutcomes: [
      "Project management in construction",
      "Modern construction techniques",
      "Safety management on construction sites",
      "Quality assurance in civil projects"
    ]
  },
  {
    id: "5",
    title: "Samsung Electronics Facility",
    date: "2024-07-15",
    department: "Electronics & Communication",
    location: "Noida, Uttar Pradesh",
    description: "Detailed exploration of semiconductor manufacturing, PCB assembly processes, and quality testing procedures in consumer electronics production.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    status: "upcoming",
    industry: "Electronics",
    studentsCount: 42,
    registrationLink: "https://example.com/register/samsung"
  },
  {
    id: "6",
    title: "Infosys Global Technology Center",
    date: "2024-08-10",
    department: "Computer Science Engineering",
    location: "Bangalore, Karnataka",
    description: "Experience cutting-edge software development practices, client interaction processes, and global delivery models in IT services industry.",
    images: ["/placeholder.svg"],
    status: "upcoming",
    industry: "Information Technology",
    studentsCount: 55,
    registrationLink: "https://example.com/register/infosys"
  },
  {
    id: "7",
    title: "Bajaj Auto Manufacturing Unit",
    date: "2024-09-05",
    department: "Mechanical Engineering",
    location: "Aurangabad, Maharashtra",
    description: "Comprehensive tour of two-wheeler manufacturing, engine assembly, and supply chain management in automotive industry.",
    images: ["/placeholder.svg", "/placeholder.svg"],
    status: "upcoming",
    industry: "Automotive",
    studentsCount: 38,
    registrationLink: "https://example.com/register/bajaj"
  },
  {
    id: "8",
    title: "Reliance Jio Network Operations Center",
    date: "2024-10-12",
    department: "Electronics & Communication",
    location: "Mumbai, Maharashtra",
    description: "Insights into telecommunications infrastructure, 5G technology deployment, and network operations management.",
    images: ["/placeholder.svg"],
    status: "upcoming",
    industry: "Telecommunications",
    studentsCount: 48,
    registrationLink: "https://example.com/register/jio"
  }
];

export const getUpcomingVisits = () => {
  return industrialVisits.filter(visit => visit.status === 'upcoming');
};

export const getCompletedVisits = () => {
  return industrialVisits.filter(visit => visit.status === 'completed');
};

export const getVisitsByDepartment = (department: string) => {
  return industrialVisits.filter(visit => 
    visit.department.toLowerCase().includes(department.toLowerCase())
  );
};

export const getLatestVisits = (count: number = 3) => {
  return industrialVisits
    .filter(visit => visit.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};
