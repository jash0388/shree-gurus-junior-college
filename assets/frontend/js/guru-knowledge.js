/**
 * ==========================================================================
 * Shree Gurus Group of Institutions — Verified Institutional Knowledge Base
 * Source of Truth: Official Website & Admissions Desk
 * ==========================================================================
 */

const SHREE_GURUS_KNOWLEDGE = {
    institution: {
        name: "Shree Gurus Group of Institutions",
        aliases: ["Shree Gurus", "Shree Gurus NEET & JEE Academy", "Shree Gurus Junior College"],
        tagline: "Guiding Minds ★ Building Futures",
        description: "Premier competitive coaching and intermediate educational institution in Vijayawada, Andhra Pradesh. Renowned for elite NEET Medical and IIT-JEE preparation with strict batch ceilings of 25–30 students per cohort, 3-tier competitive coaching, and proven top state & national ranks.",
        headquarters: {
            address: "D.No: 48-19-5/9, Ballem Vari Street, Near Ramavarappadu Ring, Vijayawada - 520007, Andhra Pradesh",
            city: "Vijayawada",
            district: "NTR District",
            state: "Andhra Pradesh"
        },
        campuses: {
            boys: "Vijayawada Boys Campus — Separate secured residential & semi-residential campus with resident faculty.",
            girls: "Vijayawada Girls Campus — Dedicated high-security residential & semi-residential campus with female wardens & resident faculty."
        },
        contact: {
            phonePrimary: "+91 9640711111",
            phoneSecondary: "+91 9171222333",
            whatsapp: "https://wa.me/919640711111",
            email: "mail2shreegurus@gmail.com",
            website: "https://www.shreegurus.com",
            counselingHours: "8:00 AM – 8:00 PM (Monday to Sunday)"
        }
    },

    academicYears: {
        "2026-2027": {
            label: "2026 - 2027 (Active Intake)",
            status: "Active Admissions Intake",
            rule: "For the 2026–2027 academic session, admissions are EXCLUSIVELY active for NEET Medical (BRAHMOS Track). JEE Main (Trishul) and JEE Advanced (Sindoor) are not open for 2026–27.",
            availablePrograms: ["BRAHMOS: IPE + NEET Medical (Bi.P.C)", "NEET Medical Repeaters Super-60"]
        },
        "2027-2028": {
            label: "2027 - 2028 (Pre-Bookings Open)",
            status: "Pre-Bookings & Advance Registrations Open",
            rule: "For the 2027–2028 academic session, all three flagship programs are open: BRAHMOS (NEET), TRISHUL (JEE Main), and SINDOOR (JEE Advanced).",
            availablePrograms: [
                "BRAHMOS: IPE + NEET Medical (Bi.P.C)",
                "TRISHUL: IPE + JEE Main (M.P.C)",
                "SINDOOR: IPE + JEE Advanced (M.P.C)",
                "NEET Repeaters Long Term",
                "JEE Main & Advanced Repeaters"
            ]
        }
    },

    classes: [
        {
            name: "Class 11 / Intermediate 1st Year",
            description: "2-Year integrated curriculum combining Board/IPE syllabus with high-intensity entrance preparation."
        },
        {
            name: "Class 12 / Intermediate 2nd Year",
            description: "Advanced syllabus completion, high-frequency CBT mock exams, and national test series."
        },
        {
            name: "Long Term Repeaters (Target 2027)",
            description: "Dedicated 1-year intensive rank-booster program for 12th pass students targeting top medical/engineering colleges."
        }
    ],

    programs: {
        brahmos: {
            code: "BRAHMOS",
            fullName: "BRAHMOS: IPE + NEET Medical (Bi.P.C)",
            stream: "Medical (Bi.P.C)",
            targetExam: "NEET-UG & State Board / IPE",
            availability: "Active Intake for 2026–2027 & 2027–2028",
            intake: "120 Seats Total (90 Girls in 3 Sections • 30 Boys in 1 Section)",
            highlights: [
                "NCERT Line-by-Line microscopic mastery in Biology",
                "Specialized numerical shortcuts for Physics & Physical Chemistry",
                "Daily diagnostic tests with individual error log tracking",
                "Super-30 micro batches for personalized mentor attention",
                "Air-cooled/AC smart classrooms and separate Boys & Girls hostels"
            ]
        },
        trishul: {
            code: "TRISHUL",
            fullName: "TRISHUL: IPE + JEE Main (M.P.C)",
            stream: "Engineering (M.P.C)",
            targetExam: "JEE Main & State Board / IPE",
            availability: "Intake Opens for 2027–2028",
            intake: "120 Seats Total (40 Girls in 1 Section • 80 Boys in 2 Sections)",
            highlights: [
                "Concept building for high percentile in JEE Main Physics, Chemistry & Maths",
                "Speed & accuracy drills with 200+ terminal Computer-Based Test (CBT) lab",
                "Daily evening study care with resident faculty doubt clearance",
                "Rigorous IPE board marks guarantee integrated into schedule"
            ]
        },
        sindoor: {
            code: "SINDOOR",
            fullName: "SINDOOR: IPE + JEE Advanced (M.P.C)",
            stream: "Elite Engineering (M.P.C)",
            targetExam: "JEE Advanced (IITs), JEE Main & IPE",
            availability: "Intake Opens for 2027–2028",
            intake: "120 Seats Total (40 Girls in 1 Section • 80 Boys in 2 Sections)",
            highlights: [
                "Elite problem-solving cohort targeting All India Top 500 Ranks",
                "Advanced multi-concept physics & higher-order mathematics rigor",
                "Mentored by senior IITian & national Olympiad faculty",
                "Comprehensive mock tests mapped to IIT-JEE Advanced pattern"
            ]
        },
        repeaters: {
            code: "REPEATERS",
            fullName: "Long-Term Repeaters Batch (NEET & JEE)",
            stream: "Medical & Engineering Repeaters",
            targetExam: "NEET & JEE 2027",
            availability: "Active Admissions Open",
            highlights: [
                "1-year dedicated syllabus re-engineering and concept overhaul",
                "Analysis of previous exam mistakes through Personalized Error Logs",
                "Weekly full-syllabus CBT grand tests and national benchmarking"
            ]
        }
    },

    campusTypes: {
        residential: {
            name: "Residential (Hostel + Food + 24/7 Mentoring)",
            details: "Safe, secure boarding with nutritious South Indian dining, AC/Air-cooled rooms, study hours supervised by resident faculty, and zero distraction environment."
        },
        semiResidential: {
            name: "Semi-Residential (Day + Evening Study Care)",
            details: "Full day schedule from 8:00 AM to 8:00 PM including morning lectures, lunch, evening supervised study hours, and doubt clearing."
        },
        dayScholar: {
            name: "Day Scholar (Classroom + Labs)",
            details: "Standard day coaching including regular classroom sessions, practical labs, and daily tests."
        }
    },

    pedagogy: [
        "Small Batch Ceiling: Strict maximum of 25–30 students per cohort (unlike crowded institutes with 120+ students).",
        "3-Tier Preparation Model: Comprehensive Board (IPE) foundation + Foundation Competitive + Advanced Rank Booster.",
        "Microscopic Error Analysis: Every student maintains an individualized Error Log Book reviewed daily by faculty mentors.",
        "Daily Diagnostic Testing: Morning learning is tested every evening to confirm conceptual clarity before moving ahead.",
        "Dedicated Resident Mentors: Experienced faculty stay on campus for evening doubt resolution."
    ],

    results: {
        passRate: "100% Pass Percentage in Intermediate 1st Year",
        mpcTopper: "465 / 470 Marks (AIR benchmark)",
        bipcTopper: "450 / 470 Marks",
        highScorers: "35+ students scored 460+ marks in Mathematics & Natural Sciences"
    },

    feesAndScholarships: {
        policy: "Exact fee schedules depend on the chosen stream (Medical vs Engineering) and campus accommodation (Residential vs Day Scholar).",
        scholarshipInfo: "Merit scholarships up to 100% are awarded based on Class 10 GPA and performance in the Shree Gurus Talent Search Exam (SG-SAT).",
        disclaimer: "Fee concessions and exact fee amounts are finalized by the Academic Dean during personal admissions counseling. To receive a detailed fee breakdown, submit an enquiry or call +91 9640711111."
    },

    admissionProcedure: {
        steps: [
            "1. Fill out the Admission Enquiry form or register with Guru AI.",
            "2. Receive an official Enquiry ID (#SG-...).",
            "3. Senior Academic Dean calls within 2 hours to discuss course eligibility and fee structure.",
            "4. Campus visit & diagnostic counseling session in Vijayawada.",
            "5. Seat confirmation and enrollment."
        ],
        callbackTime: "Within 2 hours during counseling hours (8:00 AM – 8:00 PM)"
    },

    officialLinks: {
        home: "index.html",
        admissions: "admissions.html",
        programs: "programs.html",
        about: "about.html",
        facilities: "about.html#facilities",
        pedagogy: "pedagogy.html",
        videos: "videos.html",
        contact: "contact.html"
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SHREE_GURUS_KNOWLEDGE;
}
