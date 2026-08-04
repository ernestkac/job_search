import React from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Briefcase,
  GraduationCap,
  Star,
  FileText,
  Trophy,
  UserCircle2,
} from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const developerProfile = {
    email: "ernestagkachigwe@gmail.com",
    phone: "0881 475 631 / 0994 544 873",
    github: "",
    summary:
      "Looking for a position that could build on my skills and provide me with ample scope for growth and contribute to the organization goal by effectively using my engineering skills and knowledge.",
    fullName: "Ernest Kachingwe",
    linkedIn: "",
    location: "Blantyre, Malawi",
    photoUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocKpfD-frkTLR5WzETLgjLOMwrI9FF-KsyQTGEcAYmxdKS9uAlGw=s96-c",
    projects: [
      {
        link: "",
        title: "MALAWIAN DEAF TRANSLATOR",
        description:
          "An android application project which translates spoken speech to sign language in real time. Engineered and implemented as part of fulfillment of a degree in Bachelor of Engineering in Computer Science.",
        technologiesUsed: ["Android", "Java", "Kotlin", "Speech Recognition"],
      },
    ],
    education: [
      {
        degree: "Bachelors of Engineering",
        institution: "DMI St John the Baptist University",
        fieldOfStudy: "Computer Science",
        graduationYear: "2020",
      },
      {
        degree: "MSCE",
        institution: "Orama Secondary School",
        fieldOfStudy: "Secondary Education",
        graduationYear: "2014",
      },
    ],
    references: [
      {
        name: "Mr. A. Kaunda",
        email: "alick.kaunda@admarc.co.mw",
        phone: "+265 999 928 207 / +265 887 075 605",
        position: "Assistant IT Manager",
        organization: "ADMARC Limited Head Office",
      },
      {
        name: "Mr. Owen Gama",
        email: "owen.gama@admarc.co.mw",
        phone: "+265 997 646 484 / +265 881 335 972",
        position: "Senior Accountant",
        organization: "ADMARC Limited Head Office",
      },
    ],
    achievements: [
      "Improved ADMARC Payroll system by 80% in its efficiency.",
      "Introduced ADMARC self-service portal for employees to access system reports and pay slips.",
    ],
    certifications: [],
    workExperience: [
      {
        company: "ADMARC HEADQUARTERS",
        endDate: "NOW",
        jobTitle: "IT Officer",
        location: "Blantyre",
        isCurrent: true,
        startDate: "Mar 2021",
        responsibilities: [
          "Operate and maintain IT infrastructures and software.",
          "Development of New Software if needed.",
          "Microsoft database management.",
          "Windows server management.",
          "Graphic designing and Social Media management.",
          "Network installation and troubleshooting.",
          "Introduced and Implemented wireless Network access points for easy Network access through laptops and Smart Phones.",
          "Improved ADMARC Payroll system by 80% in its efficiency.",
          "Introduced ADMARC portal where employees can get self-services like producing system reports for finance and HR, getting their pay slips and more.",
          "Developed System Addons to the ADMARC system to improve its efficiency on how ADMARC data is processed.",
        ],
      },
      {
        company: "AIEM LIMITED COMPANY",
        endDate: "Jan 2021",
        jobTitle: "Head of AI and Software Development",
        location: "",
        isCurrent: false,
        startDate: "Feb 2020",
        responsibilities: [
          "Head of AI and Software Development department.",
          "Offered solutions to clients by developing business management software and IT consultancy.",
        ],
      },
      {
        company: "DCS OFFICE MANGOCHI",
        endDate: "Dec 2019",
        jobTitle: "Network and Database Administrator (Intern)",
        location: "Mangochi",
        isCurrent: false,
        startDate: "Oct 2017",
        responsibilities: [
          "Performed network troubleshooting and installation using Windows 2012 server.",
          "Managed users using IFMIS.",
          "Handled database security setup and webcam installation.",
        ],
      },
    ],
    technicalSkills: {
      networking: [
        "Wireless Network access points",
        "Network installation and troubleshooting",
        "Network configuration, setup, and maintenance",
        "Fiber optic installation and maintenance",
        "Structured cabling and network connectivity setup",
      ],
      systemsAndOS: [
        "Microsoft Windows Server administration",
        "Windows Server 2012",
      ],
      cybersecurity: [
        "Network security fundamentals and practices",
        "System hardening and access control management",
        "Security monitoring and basic threat analysis",
        "Secure software development principles",
        "Database security setup",
      ],
      databasesAndSQL: [
        "SQLite",
        "Firebase",
        "SQL",
        "Microsoft SQL Server database management",
        "Microsoft database management",
      ],
      toolsAndFrameworks: [
        "Microsoft Power BI",
        "Microsoft Excel",
        "Adobe Photoshop",
        "Adobe Illustrator",
        "Wondershare Filmora",
        "Blender",
      ],
      softwareDevelopment: [
        "Node.js",
        "PHP",
        "Laravel",
        "Java",
        "Kotlin",
        "JavaFX",
        "C#",
        "Python",
        "Android application development",
        "Desktop application development",
        "Web development",
      ],
      itSupportAndHardware: [
        "IT infrastructure operation and maintenance",
        "Webcam installation",
        "User Management using IFMIS",
        "Fiber Optic Installation",
      ],
    },
    professionalTitle: "IT Officer",
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D2A]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D4D3C9] flex flex-col my-auto">
        <div className="p-6 bg-[#2D2D2A] text-white flex items-start justify-between border-b border-[#5A5A40] sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <UserCircle2 className="h-4 w-4" />
              <span>Developer Profile</span>
            </div>
            <h2 className="text-xl font-serif text-white">
              {developerProfile.fullName}
            </h2>
            <p className="text-xs text-[#D4D3C9]">
              {developerProfile.professionalTitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#D4D3C9] hover:text-white hover:bg-[#5A5A40] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-[#2D2D2A] leading-relaxed">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img
              src={developerProfile.photoUrl}
              alt={developerProfile.fullName}
              className="h-24 w-24 rounded-2xl object-cover border border-[#D4D3C9] shadow-sm"
            />
            <div className="space-y-3 flex-1">
              <p className="text-sm text-[#2D2D2A]/80">
                {developerProfile.summary}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-[#5A5A40]">
                  <Mail className="h-4 w-4" />
                  <span>{developerProfile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#5A5A40]">
                  <Phone className="h-4 w-4" />
                  <span>{developerProfile.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[#5A5A40]">
                  <MapPin className="h-4 w-4" />
                  <span>{developerProfile.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[#5A5A40]">
                  <Github className="h-4 w-4" />
                  <span>{developerProfile.github || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-[#5A5A40] sm:col-span-2">
                  <Linkedin className="h-4 w-4" />
                  <span>{developerProfile.linkedIn || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#F8F7F4] rounded-2xl p-4 border border-[#D4D3C9] space-y-3">
              <h3 className="font-serif font-bold text-sm flex items-center gap-2 text-[#2D2D2A]">
                <Briefcase className="h-4 w-4 text-[#5A5A40]" />
                <span>Work Experience</span>
              </h3>
              {developerProfile.workExperience.map((job, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-3 border border-[#D4D3C9] space-y-1"
                >
                  <p className="font-bold text-[#2D2D2A]">{job.jobTitle}</p>
                  <p className="text-[#5A5A40]">
                    {job.company} • {job.location}
                  </p>
                  <p className="text-[#5A5A40]">
                    {job.startDate} - {job.endDate}
                  </p>
                  <ul className="list-disc list-inside text-[#2D2D2A]/80 space-y-1 mt-2">
                    {job.responsibilities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-[#F8F7F4] rounded-2xl p-4 border border-[#D4D3C9] space-y-3">
              <h3 className="font-serif font-bold text-sm flex items-center gap-2 text-[#2D2D2A]">
                <GraduationCap className="h-4 w-4 text-[#5A5A40]" />
                <span>Education</span>
              </h3>
              {developerProfile.education.map((edu, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-3 border border-[#D4D3C9]"
                >
                  <p className="font-bold text-[#2D2D2A]">{edu.degree}</p>
                  <p className="text-[#5A5A40]">{edu.institution}</p>
                  <p className="text-[#5A5A40]">
                    {edu.fieldOfStudy} • {edu.graduationYear}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#F8F7F4] rounded-2xl p-4 border border-[#D4D3C9] space-y-3">
              <h3 className="font-serif font-bold text-sm flex items-center gap-2 text-[#2D2D2A]">
                <Trophy className="h-4 w-4 text-[#5A5A40]" />
                <span>Achievements</span>
              </h3>
              <ul className="list-disc list-inside text-[#2D2D2A]/80 space-y-1">
                {developerProfile.achievements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#F8F7F4] rounded-2xl p-4 border border-[#D4D3C9] space-y-3">
              <h3 className="font-serif font-bold text-sm flex items-center gap-2 text-[#2D2D2A]">
                <Star className="h-4 w-4 text-[#5A5A40]" />
                <span>Technical Skills</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.values(developerProfile.technicalSkills)
                  .flat()
                  .map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-full bg-white border border-[#D4D3C9] text-[#2D2D2A] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="bg-[#F8F7F4] rounded-2xl p-4 border border-[#D4D3C9] space-y-3">
            <h3 className="font-serif font-bold text-sm flex items-center gap-2 text-[#2D2D2A]">
              <FileText className="h-4 w-4 text-[#5A5A40]" />
              <span>Featured Project</span>
            </h3>
            {developerProfile.projects.map((project, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-3 border border-[#D4D3C9] space-y-2"
              >
                <p className="font-bold text-[#2D2D2A]">{project.title}</p>
                <p className="text-[#2D2D2A]/80">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologiesUsed.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-md bg-[#E5E5DF] text-[#5A5A40] text-[11px] font-bold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#F8F7F4] rounded-2xl p-4 border border-[#D4D3C9] space-y-3">
            <h3 className="font-serif font-bold text-sm flex items-center gap-2 text-[#2D2D2A]">
              <UserCircle2 className="h-4 w-4 text-[#5A5A40]" />
              <span>References</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {developerProfile.references.map((ref, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-3 border border-[#D4D3C9] space-y-1"
                >
                  <p className="font-bold text-[#2D2D2A]">{ref.name}</p>
                  <p className="text-[#5A5A40]">{ref.position}</p>
                  <p className="text-[#5A5A40]">{ref.organization}</p>
                  <p className="text-[#5A5A40]">{ref.email}</p>
                  <p className="text-[#5A5A40]">{ref.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#F8F7F4] border-t border-[#D4D3C9] flex justify-end sticky bottom-0 z-10 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#2D2D2A] hover:bg-[#1D1D1A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
