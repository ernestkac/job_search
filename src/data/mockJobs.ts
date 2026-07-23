import { JobListing } from '../types';

export const INITIAL_MOCK_JOBS: JobListing[] = [
  {
    id: 'job-mw-001',
    title: 'Senior ICT Infrastructure & Systems Administrator',
    employer: 'National Bank of Malawi Plc',
    location: 'Blantyre, Malawi',
    closingDate: '2026-08-15',
    applicationMethod: 'vacancies@natbank.mw',
    url: 'https://jobsearchmalawi.com/job/senior-ict-infrastructure-systems-administrator-national-bank',
    rawDescription: `National Bank of Malawi Plc invites applications from suitably qualified and experienced Malawians for the position of Senior ICT Infrastructure & Systems Administrator based at the Head Office in Blantyre.

Key Responsibilities:
- Manage enterprise Windows Server, RedHat Enterprise Linux, and VMware ESXi virtualized environments across primary and disaster recovery data centers.
- Oversee Active Directory, Azure AD/Entra ID, Microsoft Exchange, and Office 365 tenant administration.
- Administer storage area networks (SAN/NAS), data backup routines (Veeam), and system disaster recovery procedures.
- Perform daily system monitoring, verifying the integrity and availability of all hardware, server resources, systems and key processes.
- Implement security patches, OS upgrades, and system performance tuning in compliance with PCI-DSS and RBM cybersecurity regulations.
- Support core banking application servers, database hosting instances, and middleware components.

Qualifications & Experience:
- Bachelor's Degree in Computer Science, Information Technology, Computer Engineering or related field.
- Minimum of 5 years working experience in enterprise systems administration.
- Professional certifications such as MCSA/MCSE, RHCSA, VMware VCP, or CCNA are highly desirable.
- Hands-on experience with SQL Server database administration, powershell scripting, and enterprise backup solutions.`,
    requiredQualifications: [
      "BSc in Computer Science, Information Technology, or Computer Engineering",
      "5+ years enterprise systems administration experience",
      "Certifications: MCSA/MCSE, RHCSA, or VCP preferred"
    ],
    requiredTechnicalSkills: [
      "Windows Server & Active Directory",
      "Linux / RedHat Enterprise Linux",
      "VMware ESXi & vSphere",
      "SAN/NAS Storage & Veeam Backup",
      "SQL Server Administration",
      "PowerShell / Shell Scripting",
      "Enterprise Data Center Security & PCI-DSS"
    ],
    responsibilities: [
      "Manage Windows/Linux servers & virtualized infrastructure",
      "Administer Active Directory, Entra ID, and O365",
      "Maintain SAN storage and Veeam backup/DR routines",
      "Ensure compliance with PCI-DSS & RBM security guidelines"
    ],
    category: 'Systems Administrator',
    postedDate: '2026-07-20',
    workType: 'On-site',
    isExpired: false,
    fingerprint: 'nbm-sr-sysadmin-blantyre-2026-08-15',
    sourceUrl: 'https://jobsearchmalawi.com'
  },
  {
    id: 'job-mw-002',
    title: 'Database Administrator & SQL Analyst',
    employer: 'Airtel Malawi Plc',
    location: 'Lilongwe, Malawi',
    closingDate: '2026-08-10',
    applicationMethod: 'https://airtel.bamboohr.com/careers/malawi',
    url: 'https://jobsearchmalawi.com/job/database-administrator-sql-analyst-airtel-malawi',
    rawDescription: `Airtel Malawi Plc is looking for an energetic Database Administrator & SQL Analyst to join our Information Technology department in Lilongwe.

Job Purpose:
The DBA will maintain high availability, performance, and integrity of critical telecommunications databases (Oracle, PostgreSQL, MySQL, MS SQL Server) supporting billing, subscriber management, and analytics.

Responsibilities:
- Administer, monitor, and optimize Oracle 19c RAC, PostgreSQL, and SQL Server databases.
- Write, optimize, and troubleshoot complex SQL queries, stored procedures, triggers, and ETL jobs.
- Plan and execute database backup, recovery, replication, and high-availability (Data Guard, AlwaysOn) configurations.
- Conduct regular database security audits, user access control, and vulnerability management.
- Collaborate with software development teams to design efficient database schemas and indexing strategies.

Requirements:
- Bachelor's degree in Computer Science, Information Systems, or Software Engineering.
- 3+ years experience as a Database Administrator managing enterprise relational databases.
- Expert proficiency in PL/SQL, T-SQL, database indexing, execution plans, and performance tuning.
- OCA/OCP or PostgreSQL certification is an added advantage.`,
    requiredQualifications: [
      "Bachelor's degree in Computer Science, Information Systems, or Software Engineering",
      "3+ years experience as a DBA managing Oracle/PostgreSQL/SQL Server",
      "Database certification (OCA/OCP/PostgreSQL) preferred"
    ],
    requiredTechnicalSkills: [
      "Oracle 19c / Oracle RAC / Data Guard",
      "PostgreSQL & MySQL",
      "Microsoft SQL Server & T-SQL",
      "PL/SQL Scripting & Stored Procedures",
      "Database Performance Tuning & Indexing",
      "ETL Pipelines & Data Warehouse Concepts"
    ],
    responsibilities: [
      "Maintain high availability of core telecom databases",
      "Develop and optimize complex SQL queries & ETL scripts",
      "Manage database backups, failover, and security patching"
    ],
    category: 'Database Administrator',
    postedDate: '2026-07-18',
    workType: 'Hybrid',
    isExpired: false,
    fingerprint: 'airtel-dba-sql-lilongwe-2026-08-10',
    sourceUrl: 'https://jobsearchmalawi.com'
  },
  {
    id: 'job-mw-003',
    title: 'Full Stack Software Developer (React / Node.js)',
    employer: 'Baobab Health Trust',
    location: 'Lilongwe, Malawi',
    closingDate: '2026-08-20',
    applicationMethod: 'jobs@baobabhealth.org',
    url: 'https://jobsearchmalawi.com/job/full-stack-software-developer-baobab-health-trust',
    rawDescription: `Baobab Health Trust (BHT) is a pioneer in digital health technologies in Malawi. We are seeking a talented Full Stack Software Developer to design and maintain electronic health record (EHR) applications deployed in hospitals across Malawi.

Duties and Responsibilities:
- Develop modern web applications using React, TypeScript, Node.js, Express, and REST/GraphQL APIs.
- Enhance and maintain digital health open-source platforms integrated with CouchDB and MySQL databases.
- Write unit tests, integration tests, and participate in code reviews.
- Work closely with health information officers to gather user requirements and implement user-friendly UI/UX interfaces.
- Deploy applications to Linux servers using Docker containers and automated CI/CD pipelines.

Qualifications:
- Degree in Computer Science, Software Engineering, or Information Technology.
- At least 3 years of software development experience with React, JavaScript/TypeScript, and Node.js.
- Strong knowledge of Git, Linux CLI, Docker, RESTful web services, and SQL/NoSQL databases.
- Experience with health information systems (DHIS2, OpenMRS, EHR) is a plus.`,
    requiredQualifications: [
      "BSc in Computer Science, Software Engineering, or IT",
      "3+ years active software development experience",
      "Demonstrated portfolio of web application projects"
    ],
    requiredTechnicalSkills: [
      "React.js & TypeScript",
      "Node.js & Express.js",
      "RESTful APIs & GraphQL",
      "SQL (MySQL/PostgreSQL) & NoSQL (CouchDB/MongoDB)",
      "Git & GitHub Version Control",
      "Docker & Linux Deployment",
      "UI/UX Design & CSS Tailwind"
    ],
    responsibilities: [
      "Develop responsive health management applications",
      "Build server APIs and integrate local healthcare systems",
      "Deploy solutions using Docker containers on Linux servers"
    ],
    category: 'Software Developer',
    postedDate: '2026-07-21',
    workType: 'Hybrid',
    isExpired: false,
    fingerprint: 'baobab-fullstack-dev-lilongwe-2026-08-20',
    sourceUrl: 'https://jobsearchmalawi.com'
  },
  {
    id: 'job-mw-004',
    title: 'ICT Officer / Systems Support Specialist',
    employer: 'Kamuzu University of Health Sciences (KUHeS)',
    location: 'Blantyre, Malawi',
    closingDate: '2026-08-05',
    applicationMethod: 'hr@kuhes.ac.mw',
    url: 'https://jobsearchmalawi.com/job/ict-officer-systems-support-kuhes',
    rawDescription: `Kamuzu University of Health Sciences (KUHeS) invites applications for the position of ICT Officer (Systems & User Support) tenable at the Blantyre Campus.

Key Duties:
- Provide first-level and second-level technical support for hardware, software, network connectivity, and academic systems (Moodle LMS, Student Information System).
- Manage local area network (LAN) infrastructure, Wi-Fi access points, switches, routers, and firewalls across campus buildings.
- Maintain campus computer labs, printers, projectors, and video conferencing equipment.
- Install, configure, and maintain antivirus software, operating system updates, and endpoint security controls.
- Assist in conducting user training sessions for academic staff and students on IT tools and online portals.

Requirements:
- Bachelor's Degree in Information Technology, Computer Science, or Business Information Systems.
- At least 2 years of relevant experience in IT support, network troubleshooting, and systems administration.
- CompTIA A+, Network+, or Cisco CCNA certifications are advantageous.
- Good customer service skills and ability to diagnose complex hardware/software issues quickly.`,
    requiredQualifications: [
      "Degree in IT, Computer Science, or Business Info Systems",
      "2+ years experience in IT technical support and LAN networking",
      "CompTIA A+/Network+ or CCNA preferred"
    ],
    requiredTechnicalSkills: [
      "Helpdesk & IT Technical Support",
      "LAN Routing & Switching (Cisco/MikroTik)",
      "Hardware Maintenance & Diagnostics",
      "Windows 10/11 & macOS Endpoint Mgmt",
      "Moodle LMS & Academic Systems",
      "Antivirus & Endpoint Security"
    ],
    responsibilities: [
      "Troubleshoot campus network, hardware, and operating system issues",
      "Support academic e-learning platforms and administrative software",
      "Maintain campus computer labs and network infrastructure"
    ],
    category: 'ICT Officer',
    postedDate: '2026-07-15',
    workType: 'On-site',
    isExpired: false,
    fingerprint: 'kuhes-ict-officer-blantyre-2026-08-05',
    sourceUrl: 'https://jobsearchmalawi.com'
  },
  {
    id: 'job-mw-005',
    title: 'Cybersecurity Analyst & Network Engineer',
    employer: 'Telekom Networks Malawi (TNM Plc)',
    location: 'Blantyre, Malawi',
    closingDate: '2026-08-25',
    applicationMethod: 'recruitment@tnm.co.mw',
    url: 'https://jobsearchmalawi.com/job/cybersecurity-analyst-network-engineer-tnm',
    rawDescription: `Telekom Networks Malawi (TNM Plc) is seeking a Cybersecurity Analyst & Network Engineer to safeguard TNM's telecom core network, mobile money platform (Mpamba), and corporate IT infrastructure.

Responsibilities:
- Monitor Security Information and Event Management (SIEM) tools (Splunk / Elastic SIEM) for security threats, alerts, and anomalies.
- Perform network vulnerability assessments, penetration testing, and security logging analysis across firewalls (Palo Alto, Fortinet), routers, and switches.
- Respond to cybersecurity incidents, conduct root-cause investigation, and implement remediation measures.
- Administer network security protocols (IPsec VPN, TLS, RADIUS, 802.1X, BGP security, VLAN isolation).
- Conduct cybersecurity awareness training and enforce ISO 27001 policies.

Qualifications:
- Bachelor's degree in Cybersecurity, Computer Science, Network Engineering, or IT.
- Minimum 3 years experience in network security or SOC analyst role.
- Professional certifications: CEH, CompTIA Security+, CCNA Security, or CISSP.
- Deep understanding of TCP/IP stack, packet inspection (Wireshark), firewall rule configuration, and Linux administration.`,
    requiredQualifications: [
      "BSc in Cybersecurity, Computer Science, or Network Engineering",
      "3+ years experience in network security or SOC environments",
      "Certifications: CompTIA Security+, CEH, CCNA Security, or CISSP"
    ],
    requiredTechnicalSkills: [
      "SIEM Tools (Splunk / Elastic)",
      "Next-Gen Firewalls (Fortinet, Palo Alto)",
      "Network Routing & Switching (BGP, OSPF, VLANs)",
      "Vulnerability Assessment & Wireshark",
      "VPN, IPsec, RADIUS & Access Control",
      "Incident Response & Linux Hardening"
    ],
    responsibilities: [
      "Monitor SIEM alerts and investigate security incidents",
      "Configure firewalls and conduct vulnerability scans",
      "Maintain IPsec VPNs and enforce ISO 27001 policies"
    ],
    category: 'Cybersecurity',
    postedDate: '2026-07-22',
    workType: 'On-site',
    isExpired: false,
    fingerprint: 'tnm-cybersecurity-blantyre-2026-08-25',
    sourceUrl: 'https://jobsearchmalawi.com'
  },
  {
    id: 'job-mw-006',
    title: 'Digital Transformation & Systems Analyst',
    employer: 'Public Procurement and Disposal of Assets Authority (PPDA)',
    location: 'Lilongwe, Malawi',
    closingDate: '2026-08-12',
    applicationMethod: 'dg@ppda.mw',
    url: 'https://jobsearchmalawi.com/job/digital-transformation-systems-analyst-ppda',
    rawDescription: `The Public Procurement and Disposal of Assets Authority (PPDA) invites applications for the position of Systems Analyst to support the enhancement and nationwide rollout of the e-Government Procurement (e-GP) platform.

Duties:
- Analyze organizational processes, formulate functional specifications, and design system workflows for public procurement digitalization.
- Serve as technical bridge between non-technical stakeholders and software development vendors.
- Conduct User Acceptance Testing (UAT), bug tracking, system audit logging, and workflow optimization.
- Query SQL databases to generate compliance reports, procurement analytics, and dashboard visualization.
- Ensure integration compatibility between the e-GP system and Ministry of Finance IFMIS financial systems.

Qualifications:
- Bachelor's degree in Information Systems, Business Information Technology, or Computer Science.
- 3+ years experience in systems analysis, requirements engineering, or IT project management.
- Strong proficiency in SQL database querying, UML diagramming, and workflow modeling (BPMN).
- Experience with government e-services or enterprise ERP systems is desirable.`,
    requiredQualifications: [
      "Degree in Info Systems, Business IT, or Computer Science",
      "3+ years experience in systems analysis and requirements gathering",
      "Knowledge of public sector software or ERP systems"
    ],
    requiredTechnicalSkills: [
      "Systems Analysis & Requirements Engineering",
      "SQL Querying & Reporting",
      "UML & Process Flow Diagramming (BPMN)",
      "User Acceptance Testing (UAT)",
      "System Integration & API Workflows",
      "Data Visualization & Dashboarding"
    ],
    responsibilities: [
      "Gather requirements and design system specifications for e-GP portal",
      "Perform SQL analysis and conduct User Acceptance Testing",
      "Bridge technical vendor team and government stakeholders"
    ],
    category: 'Systems Analyst',
    postedDate: '2026-07-19',
    workType: 'On-site',
    isExpired: false,
    fingerprint: 'ppda-systems-analyst-lilongwe-2026-08-12',
    sourceUrl: 'https://jobsearchmalawi.com'
  },
  {
    id: 'job-mw-007',
    title: 'IT Support Technician & Hardware Assistant',
    employer: 'FDH Bank Plc',
    location: 'Mzuzu, Malawi',
    closingDate: '2026-08-18',
    applicationMethod: 'careers@fdh.co.mw',
    url: 'https://jobsearchmalawi.com/job/it-support-technician-fdh-bank-mzuzu',
    rawDescription: `FDH Bank Plc is seeking a motivated IT Support Technician for our Mzuzu Regional Branch Office to provide hands-on technical assistance for branch staff and ATM terminals.

Key Responsibilities:
- Install, maintain, and troubleshoot desktop computers, printers, card readers, and ATM peripherals across Northern Region branches.
- Diagnose network cabling issues, IP configuration, and local switch setup.
- Perform software installation, active directory domain joins, and email profile configuration.
- Log and resolve helpdesk tickets within agreed SLA response times.

Qualifications:
- Diploma or Degree in Information Technology, Computer Science, or Hardware Engineering.
- 1-2 years hands-on experience in IT support or field service engineering.
- Knowledge of Windows OS, basic networking (TCP/IP), and printer hardware repair.`,
    requiredQualifications: [
      "Diploma or Degree in IT or Computer Science",
      "1-2 years hands-on field IT support experience",
      "Valid driver's license is advantageous"
    ],
    requiredTechnicalSkills: [
      "Hardware Diagnostics & Repair",
      "Windows 11 & Office Application Support",
      "Basic Network Cabling & TCP/IP Troubleshooting",
      "Helpdesk Ticketing Systems",
      "ATM & POS Peripheral Maintenance"
    ],
    responsibilities: [
      "Maintain branch hardware, desktops, and ATM terminals",
      "Resolve network connectivity and software tickets",
      "Provide technical assistance to branch staff"
    ],
    category: 'IT Support',
    postedDate: '2026-07-16',
    workType: 'On-site',
    isExpired: false,
    fingerprint: 'fdh-it-support-mzuzu-2026-08-18',
    sourceUrl: 'https://jobsearchmalawi.com'
  },
  {
    id: 'job-mw-008',
    title: 'IT Project Manager (Digital Services)',
    employer: 'NICO Holdings Plc',
    location: 'Blantyre, Malawi',
    closingDate: '2026-08-22',
    applicationMethod: 'recruitment@nicoholdings.com',
    url: 'https://jobsearchmalawi.com/job/it-project-manager-nico-holdings',
    rawDescription: `NICO Holdings Plc is looking for an experienced IT Project Manager to oversee the implementation of enterprise digital transformations, insurance portals, and mobile app rollouts across NICO subsidiaries.

Responsibilities:
- Plan, execute, and deliver multi-disciplinary IT software and infrastructure projects on time and within budget.
- Manage project scopes, sprint planning, risk registers, and vendor deliverables using Agile/Scrum methodologies.
- Facilitate communication between software vendors, business managers, and internal ICT engineers.
- Monitor project milestones, budget tracking, and post-implementation reviews.

Requirements:
- Bachelor's degree in Computer Science, Information Technology, or Project Management.
- 4+ years of proven experience managing technology projects.
- PMP or PRINCE2 certification, or Certified ScrumMaster (CSM) is highly required.
- Excellent leadership, stakeholder management, and technical communication skills.`,
    requiredQualifications: [
      "Degree in CS, IT, or Business Administration",
      "4+ years managing software/IT infrastructure projects",
      "PMP, PRINCE2, or Agile CSM certification required"
    ],
    requiredTechnicalSkills: [
      "Agile / Scrum & Waterfall Methodologies",
      "Jira, Confluence & MS Project",
      "Risk Management & Budgeting",
      "Software Development Lifecycle (SDLC)",
      "Vendor & Contract Management"
    ],
    responsibilities: [
      "Lead cross-functional IT projects from initiation to deployment",
      "Manage project risks, timelines, and software vendor deliverables",
      "Communicate progress reports to executive management"
    ],
    category: 'Technical Project Management',
    postedDate: '2026-07-22',
    workType: 'Hybrid',
    isExpired: false,
    fingerprint: 'nico-it-pm-blantyre-2026-08-22',
    sourceUrl: 'https://jobsearchmalawi.com'
  }
];

export const INITIAL_CANDIDATE_PROFILE = {
  fullName: "Ernest Agkachingwe",
  professionalTitle: "ICT Specialist & Systems Developer",
  email: "ernestagkachingwe@gmail.com",
  phone: "+265 999 123 456",
  location: "Blantyre, Malawi",
  linkedIn: "linkedin.com/in/ernest-kachingwe",
  github: "github.com/ernest-kachingwe",
  summary: "Results-driven ICT Professional and Computer Scientist with over 4 years of hands-on experience in full-stack web software development, Linux & Windows systems administration, relational database management (SQL/Oracle/PostgreSQL), LAN/WAN network engineering, and enterprise IT user support. Adept at designing scalable web systems, optimizing SQL database performance, and automating administrative workflows.",
  technicalSkills: {
    systemsAndOS: ["Linux (Ubuntu/RHEL)", "Windows Server 2019/2022", "Active Directory / DNS / DHCP", "VMware & VirtualBox"],
    networking: ["Cisco Routing & Switching", "LAN/WAN Configuration", "TCP/IP & Subnetting", "VPN / Firewall Basics"],
    softwareDevelopment: ["JavaScript / TypeScript", "React.js & Tailwind CSS", "Node.js & Express", "Python", "REST APIs & Git"],
    databasesAndSQL: ["MySQL / MariaDB", "PostgreSQL", "Microsoft SQL Server", "T-SQL / PL-SQL Query Optimization"],
    cybersecurity: ["Endpoint Protection & Antivirus", "User Access Management", "Vulnerability Patching", "Data Backup & Recovery"],
    itSupportAndHardware: ["Hardware Diagnostics & Upgrades", "Helpdesk Ticket Resolution", "Printers & Peripherals", "Windows 10/11 Endpoint Mgmt"],
    toolsAndFrameworks: ["Git / GitHub", "Docker Basics", "VS Code", "Veeam Backup", "Jira / Trello"]
  },
  workExperience: [
    {
      id: "exp-1",
      jobTitle: "ICT & Systems Administrator",
      company: "EGI Tech Solutions Malawi",
      location: "Blantyre, Malawi",
      startDate: "2024-01",
      endDate: "Present",
      isCurrent: true,
      responsibilities: [
        "Maintained corporate Windows Server and Linux servers hosting internal management web applications and SQL databases.",
        "Managed LAN network infrastructure across 3 offices, configuring MikroTik routers, VLANs, and VPN connections.",
        "Designed and built custom internal web dashboards using React and Node.js for client ticketing and asset tracking.",
        "Performed daily Veeam backups, SQL database maintenance, and provided Tier-2 technical support to 60+ staff members."
      ]
    },
    {
      id: "exp-2",
      jobTitle: "IT Support Technician & Web Developer",
      company: "Malawi Digital Innovations Hub",
      location: "Lilongwe, Malawi",
      startDate: "2022-06",
      endDate: "2023-12",
      isCurrent: false,
      responsibilities: [
        "Provided hardware diagnostic, operating system installation, and network troubleshooting services for corporate clients.",
        "Developed custom client websites and portal interfaces using JavaScript, PHP, MySQL, and CSS.",
        "Managed user accounts in Active Directory and supported office M365 migration."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "Bachelor of Science in Computer Science & Information Technology",
      institution: "Mzuzu University (MZUNI)",
      fieldOfStudy: "Computer Science and Information Systems",
      graduationYear: "2022"
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Cisco Certified Network Associate (CCNA)",
      issuingOrganization: "Cisco Networking Academy",
      issueYear: "2023"
    },
    {
      id: "cert-2",
      name: "CompTIA Security+",
      issuingOrganization: "CompTIA",
      issueYear: "2024"
    }
  ],
  projects: [
    {
      id: "proj-1",
      title: "Malawi E-Asset & IT Helpdesk Management System",
      description: "Designed a full-stack web application allowing IT staff to track hardware inventory, log helpdesk tickets, and run SQL maintenance reports.",
      technologiesUsed: ["React", "Node.js", "PostgreSQL", "Tailwind CSS"],
      link: "https://github.com/ernest-kachingwe/helpdesk-app"
    }
  ],
  achievements: [
    "Graduated with Distinction in BSc Computer Science at Mzuzu University.",
    "Successfully led the migration of 50+ workstations to centralized Active Directory domain with zero data loss."
  ],
  lastUpdated: new Date().toISOString()
};
