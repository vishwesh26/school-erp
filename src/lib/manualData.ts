export interface ManualStep {
    title: string;
    description: string;
    steps: string[];
    keywords: string[];
}

export interface ManualCategory {
    category: string;
    icon: string;
    topics: ManualStep[];
}

export const manualData: ManualCategory[] = [
    {
        category: "Dashboards & Security",
        icon: "home",
        topics: [
            {
                title: "New Sign-In Experience",
                description: "Accessing the portal with the modern login interface.",
                steps: [
                    "Visit the school URL to see the high-performance, professional sign-in page.",
                    "Enter your Username (e.g., 10A-001) or Email Address.",
                    "The system now features 'Glassmorphism' visual effects and instant validation.",
                    "Login sessions are secured and persist until you manually log out."
                ],
                keywords: ["login", "sign in", "security", "glassmorphism", "portal access"]
            },
            {
                title: "Understanding Your Dashboard",
                description: "Overview of stats and charts on the home screen.",
                steps: [
                    "Admins: View global student/teacher counts and gender distribution charts.",
                    "Teachers: View your schedule and class attendance trends (Finance/Admin stats are hidden for privacy).",
                    "Parents/Students: View personal calendar and upcoming lesson schedule.",
                    "Check the 'Announcements' and 'Events' sidebar for the latest school updates."
                ],
                keywords: ["dashboard", "home", "charts", "stats", "navigation"]
            }
        ]
    },
    {
        category: "Registration & User Management",
        icon: "profile",
        topics: [
            {
                title: "Protected Registration Flow",
                description: "Security update regarding user creation.",
                steps: [
                    "Registration is no longer available to the public or students.",
                    "Admin and Teachers: Navigate to 'Register' in your sidebar menu.",
                    "Select the Role (Student, Teacher, etc.) at the top of the form.",
                    "Filling the form now includes advanced fields like Aadhar No, SARAL ID, and APAAR ID.",
                    "Submit to immediately create the user and send welcome credentials via email."
                ],
                keywords: ["registration", "secure signup", "add user", "onboard", "profile"]
            },
            {
                title: "How to Add a New Staff Member",
                description: "Onboarding teachers, librarians, and accountants.",
                steps: [
                    "Use the new protected 'Register' page in the sidebar.",
                    "Choose the relevant staff role (Teacher, Librarian, etc.).",
                    "Fill in the credentials and profile info.",
                    "The staff member will receive their auto-generated password via email."
                ],
                keywords: ["add teacher", "new librarian", "staff onboarding", "teacher subjects"]
            }
        ]
    },
    {
        category: "Document Generation Hub",
        icon: "view",
        topics: [
            {
                title: "Generating School Certificates",
                description: "Professional, print-ready documents in seconds.",
                steps: [
                    "Go to 'Documents' (Admin) or use the Certificates link.",
                    "Select the Document Type: Leaving Certificate or Bonafide Certificate.",
                    "Drill-down: Select the Class and then the specific Student from the dropdowns.",
                    "The system automatically fetches all current records (Joining date, attendance, etc.) to pre-fill the form.",
                    "Click 'Download PDF' to generate a pixel-perfect A4 document."
                ],
                keywords: ["leaving certificate", "bonafide", "documents", "pdf generator", "drilldown"]
            },
            {
                title: "The Admission Form System",
                description: "Handling both existing and prospective students.",
                steps: [
                    "Existing Students: Selecting a student pre-fills their Aadhar, DOB, and parent details.",
                    "Prospective Students: Select 'Admission Form' WITHOUT selecting a student from the drill-down.",
                    "The system enters 'Prospective Mode', providing a clean, empty form for new applicants.",
                    "The Admission Form replicates the official paper format with 8-box DOB grids and sibling tables.",
                    "Download and print blank forms for on-site registrations."
                ],
                keywords: ["admission form", "prospective student", "blank form", "print admission"]
            }
        ]
    },
    {
        category: "Academic Operations",
        icon: "class",
        topics: [
            {
                title: "Flexible Exam & Lesson Creation",
                description: "Setting up the curriculum with optional fields.",
                steps: [
                    "Go to 'Exams' or 'Lessons'.",
                    "Click '+' and fill in the required fields (Name, Class, Teacher).",
                    "Note: The system now allows you to skip optional fields during planning—the form will still submit successfully.",
                    "Update full details (Date, Time, Location) once they are finalized."
                ],
                keywords: ["add exam", "new lesson", "optional fields", "flexible planning"]
            },
            {
                title: "Creating the Time-Table",
                description: "Scheduling weekly classes.",
                steps: [
                    "Go to 'Lessons'.",
                    "Link a Subject, Teacher, and Class together.",
                    "Set the recurring Day and Time slot.",
                    "Submit. Students and Teachers will see this in their personal calendars."
                ],
                keywords: ["timetable", "schedule", "lesson", "class time"]
            }
        ]
    },
    {
        category: "Evaluations & Attendance",
        icon: "attendance",
        topics: [
            {
                title: "Recording Attendance",
                description: "Managing daily student presence.",
                steps: [
                    "Teachers: Go to 'Attendance'.",
                    "Select your Class and Date.",
                    "Toggle students as Present or Absent.",
                    "Submit to sync with the parent portal."
                ],
                keywords: ["mark attendance", "roll call", "absent student"]
            },
            {
                title: "Posting Assignments",
                description: "Managing student tasks.",
                steps: [
                    "Go to 'Assignments'.",
                    "Click '+' to add a new task.",
                    "Provide a Title, Description, and Due Date.",
                    "Students will be notified by email automatically."
                ],
                keywords: ["add assignment", "homework", "task"]
            }
        ]
    },
    {
        category: "Library & Communications",
        icon: "subject",
        topics: [
            {
                title: "How to Issue a Library Book",
                description: "Lending books to students.",
                steps: [
                    "Go to the Library module.",
                    "Select 'Issue Book'.",
                    "Enter Student ID and Book Accession No.",
                    "Set a Due Date and click Issue."
                ],
                keywords: ["issue book", "library", "lend", "borrow"]
            },
            {
                title: "Posting Announcements & Events",
                description: "Broadcasting news to the school.",
                steps: [
                    "Go to 'Announcements' or 'Events'.",
                    "Write your message and select the target audience.",
                    "Submit. Emails are sent out automatically and items appear on calendars."
                ],
                keywords: ["notice", "announcement", "post news", "event", "meeting"]
            }
        ]
    },
    {
        category: "Common Tools",
        icon: "filter",
        topics: [
            {
                title: "Searching, Filtering & Sorting",
                description: "Managing large lists efficiently.",
                steps: [
                    "Search: Use the top search bar to find people by name or ID.",
                    "Filter: Click the Funnel icon to select specific Grades or Statuses.",
                    "Sort: Click the Arrow icon to arrange by date or name.",
                    "Pagination: Use the page numbers at the bottom to browse through items."
                ],
                keywords: ["search", "filter", "sort", "pagination", "find"]
            }
        ]
    }
];
