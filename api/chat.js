/**
 * Vercel Serverless Function: /api/chat
 * Official AI Admissions Counselor Backend for Shree Gurus Group of Institutions.
 */

const KNOWLEDGE = {
    institution: "Shree Gurus Group of Institutions (also known as Shree Gurus NEET & JEE Academy) is Vijayawada's premier competitive coaching college, dedicated to medical (NEET) and engineering (JEE) aspirants with disciplined 3-tier preparation, Super-30 small cohorts (25-30 students per class), and personalized error-tracking.",
    address: "D.No: 48-19-5/9, Ballem Vari Street, Near Ramavarappadu Ring, Vijayawada - 520007, Andhra Pradesh.",
    campuses: "We operate separate secured campuses for Boys and Girls in Vijayawada with residential AC/air-cooled hostels, hygienic doctor-approved South Indian dining, and resident faculty mentoring.",
    contacts: "Admissions Helpline: +91 9640711111 / 9171222333 • Email: mail2shreegurus@gmail.com • Counseling Hours: 8:00 AM – 8:00 PM daily • WhatsApp: +91 9640711111.",
    years: {
        "2026-27": "For Academic Year 2026 - 2027 (Active Intake), admissions are strictly active for NEET Medical (BRAHMOS track: IPE + NEET Medical Bi.P.C) and NEET Repeaters. JEE courses are not open for 2026-27.",
        "2027-28": "For Academic Year 2027 - 2028 (Pre-Bookings Open), all 3 flagship programs are available: BRAHMOS (NEET Medical Bi.P.C), TRISHUL (JEE Main M.P.C), and SINDOOR (JEE Advanced M.P.C)."
    },
    programs: {
        brahmos: "BRAHMOS: 2-Year Integrated IPE + NEET Medical (Bi.P.C). Active for 2026-27 & 2027-28. Total 120 seats (90 Girls in 3 sections, 30 Boys in 1 section). Includes line-by-line NCERT Biology mastery, specialized physics numerical drills, daily diagnostic testing, and air-cooled classrooms.",
        trishul: "TRISHUL: 2-Year Integrated IPE + JEE Main (M.P.C). Intake opens for 2027-28. 120 seats (40 Girls in 1 section, 80 Boys in 2 sections). Features speed/accuracy drills in 200+ computer CBT lab and evening study care.",
        sindoor: "SINDOOR: Elite 2-Year Integrated IPE + JEE Advanced (M.P.C). Intake opens for 2027-28. 120 seats (40 Girls in 1 section, 80 Boys in 2 sections). High-rigor problem solving targeted at Top 500 All India Ranks.",
        repeaters: "Long-Term Repeaters Batch: 1-Year intensive repeaters coaching for NEET & JEE 2027 with individualized error-log analysis and weekly full-length CBT mock exams."
    },
    campusTypes: "We offer three campus accommodation types: (1) Residential (Hostel + Food + 24/7 Faculty Mentoring), (2) Semi-Residential (Day + Evening Study Care 8 AM to 8 PM), and (3) Day Scholar (Classroom + Labs).",
    fees: "Fee structures vary depending on the stream (Medical vs Engineering) and campus type (Day Scholar vs Residential). We award Merit Scholarships up to 100% based on Class 10 GPA and the Shree Gurus Talent Search Exam (SG-SAT). Exact fee quotations are determined by the Academic Dean during personal counseling.",
    results: "100% pass percentage in 1st Year Intermediate. MPC Topper: 465/470 marks. BiPC Topper: 450/470 marks. Over 35 students scored 460+ marks.",
    batchSize: "Unlike crowded institutions with 120+ students, Shree Gurus strictly limits cohorts to 25 to 30 students per class."
};

function resolveResponse(query, history = [], context = {}) {
    const q = (query || '').toLowerCase().trim();

    // 1. Fee structure / cost / scholarship
    if (q.includes('fee') || q.includes('cost') || q.includes('scholarship') || q.includes('concession') || q.includes('price')) {
        return {
            answer: `🎓 <strong>Fee &amp; Scholarship Policy:</strong><br><br>Course fees at Shree Gurus depend on whether you choose <strong>Day Scholar</strong>, <strong>Semi-Residential</strong>, or <strong>Residential Hostel</strong> accommodation.<br><br>• <strong>Up to 100% Merit Scholarships</strong> are awarded based on your Class 10 GPA/marks and the <em>Shree Gurus Talent Search Exam (SG-SAT)</em>.<br>• Exact fee schedules are finalized by our Academic Dean to provide the maximum eligible concession.<br><br>Would you like to submit an admission enquiry so our admissions desk can share the official fee breakdown for your profile? Or call our helpline at <strong>+91 9640711111</strong>.`,
            chips: ["Register for 2026–27", "Tell me about Scholarships", "Speak with Admissions Desk"]
        };
    }

    // 2. JEE Courses (Trishul / Sindoor) - evaluated before generic year so "Trishul in 2026" catches incorrect assumption
    if (q.includes('jee') || q.includes('engineering') || q.includes('mpc') || q.includes('iit') || q.includes('trishul') || q.includes('sindoor')) {
        if (q.includes('2026')) {
            return {
                answer: `⚠️ <strong>Note regarding 2026–2027:</strong><br>For the 2026–2027 intake, admissions are exclusively active for <strong>NEET Medical (Brahmos)</strong>.<br><br>Our premier Engineering programs open for <strong>2027 – 2028 (Pre-Bookings Open)</strong>:<br>• <strong>TRISHUL:</strong> 2-Year Integrated IPE + JEE Main (120 seats, CBT lab testing)<br>• <strong>SINDOOR:</strong> Elite 2-Year Integrated IPE + JEE Advanced (Super-30 Top 500 AIR cohort)<br><br>Would you like to pre-book a seat for 2027–28?`,
                chips: ["Pre-Book 2027–28 JEE", "Explore Brahmos (NEET 2026)", "Contact Admissions Desk"]
            };
        }
        return {
            answer: `⚙️ <strong>Engineering Programs (M.P.C):</strong><br><br>We offer two flagship engineering cohorts (open for 2027–2028 Intake):<br><br>1. <strong>TRISHUL (IPE + JEE Main):</strong> Focuses on conceptual clarity, speed & accuracy with our 200+ computer CBT lab. 120 seats (40 Girls, 80 Boys).<br>2. <strong>SINDOOR (IPE + JEE Advanced):</strong> Elite problem-solving cohort mentored by senior IITian faculty targeting All India Top 500 Ranks.<br><br>Both programs feature small 25–30 student batches, evening study care, and Board marks integration.`,
            chips: ["Pre-Book Trishul 2027–28", "Pre-Book Sindoor 2027–28", "Ask about Hostels"]
        };
    }

    // 3. Academic year 2026-27 vs 2027-28 general
    if (q.includes('2026') || (q.includes('year') && q.includes('next')) || q.includes('intake') || q.includes('when')) {
        return {
            answer: `📅 <strong>Academic Year Admissions Status:</strong><br><br>• <strong>2026 – 2027 Session (Active Intake):</strong> Admissions are exclusively open for <strong>NEET Medical (BRAHMOS Track — Bi.P.C)</strong> and Medical Repeaters.<br>• <strong>2027 – 2028 Session (Pre-Bookings Open):</strong> All three programs are open — <strong>BRAHMOS (NEET)</strong>, <strong>TRISHUL (JEE Main)</strong>, and <strong>SINDOOR (JEE Advanced)</strong>.<br><br>Which academic year are you planning for?`,
            chips: ["2026–27 (NEET Only)", "2027–28 (JEE & NEET)", "Tell me about Brahmos"]
        };
    }

    // 4. Medical / NEET / Brahmos
    if (q.includes('neet') || q.includes('medical') || q.includes('bipc') || q.includes('brahmos') || q.includes('doctor')) {
        return {
            answer: `🩺 <strong>BRAHMOS — IPE + NEET Medical (Bi.P.C):</strong><br><br>Our flagship medical program is <strong>Active for 2026–2027 Admissions</strong>!<br><br>• <strong>Cohort Size:</strong> Strictly 120 seats total (90 Girls across 3 sections, 30 Boys in 1 section).<br>• <strong>NCERT Microscopic Mastery:</strong> Line-by-line coverage in Biology with dedicated botany & zoology wet labs.<br>• <strong>Physics & Chemistry Shortcuts:</strong> High-speed numerical drills and formula maps.<br>• <strong>Daily Testing:</strong> Morning concept classes followed by evening diagnostic tests.<br>• <strong>Facilities:</strong> Smart A/C classrooms with separate residential hostels.<br><br>Would you like to register an admission enquiry for Brahmos 2026–27?`,
            chips: ["Register for Brahmos 2026–27", "Campus & Hostel Details", "Fee & Scholarships"]
        };
    }

    // 5. Repeaters / Long Term
    if (q.includes('repeat') || q.includes('long term') || q.includes('dropper') || q.includes('12th pass')) {
        return {
            answer: `🎯 <strong>Long-Term Repeaters Super-60 Batch:</strong><br><br>Designed specifically for 12th pass students targeting NEET & JEE 2027:<br><br>• Intensive 1-year syllabus re-engineering and concept overhaul.<br>• Personalized Error Log Book to diagnose and fix recurring mistakes.<br>• Weekly full-syllabus Computer-Based Tests (CBT) and national benchmarking.<br>• Resident faculty doubt resolution throughout evening study hours.<br><br>Admissions are active now. Would you like to connect with a counsellor?`,
            chips: ["Register for Repeaters", "Hostel Facilities", "Call +91 9640711111"]
        };
    }

    // 6. Campus locations / address / where is it
    if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('reach') || q.includes('city') || q.includes('vijayawada')) {
        return {
            answer: `📍 <strong>Campus Location:</strong><br><br>Our primary campus and head office are located at:<br><strong>SHREE GURUS GROUP OF INSTITUTIONS</strong><br>D.No: 48-19-5/9, Ballem Vari Street, Near Ramavarappadu Ring, Vijayawada - 520007, Andhra Pradesh.<br><br>• We operate separate secured campuses for <strong>Boys</strong> and <strong>Girls</strong> in Vijayawada.<br>• Counseling desk is open <strong>8:00 AM – 8:00 PM</strong> daily.`,
            chips: ["Schedule Campus Visit", "Hostel & Dining Details", "Contact Helplines"]
        };
    }

    // 7. Hostel / food / accommodation / campus types / girls security
    if (q.includes('hostel') || q.includes('food') || q.includes('mess') || q.includes('room') || q.includes('residential') || q.includes('boarding') || q.includes('girls') || q.includes('accommodation') || q.includes('campus type')) {
        return {
            answer: `🛏️ <strong>Campus Types &amp; Accommodation Options:</strong><br><br>We offer three flexible campus options:<br><br>1. <strong>Residential (Hostel + Food + 24/7 Mentoring):</strong> Independent secured campuses for Boys and Girls. Nutritious doctor-approved South Indian dining, AC/Air-cooled rooms with attached washrooms, 24/7 CCTV, and resident faculty study hours.<br>2. <strong>Semi-Residential (Day + Evening Study Care):</strong> 8:00 AM to 8:00 PM program with classes, lunch, dinner/snacks, and evening doubt clearance.<br>3. <strong>Day Scholar (Classroom + Labs):</strong> Standard daytime classroom coaching and laboratory practicals.<br><br>Which option suits you best?`,
            chips: ["Residential Hostels", "Semi-Residential (Study Care)", "Day Scholar (Day Only)"]
        };
    }

    // 8. Contact / phone / email / helpline
    if (q.includes('contact') || q.includes('phone') || q.includes('number') || q.includes('call') || q.includes('email') || q.includes('helpline') || q.includes('whatsapp')) {
        return {
            answer: `📞 <strong>Official Admissions Helplines:</strong><br><br>• <strong>Phone:</strong> <a href="tel:9640711111">+91 9640711111</a> / <a href="tel:9171222333">9171222333</a><br>• <strong>WhatsApp:</strong> <a href="https://wa.me/919640711111" target="_blank">+91 9640711111</a><br>• <strong>Email:</strong> <a href="mailto:mail2shreegurus@gmail.com">mail2shreegurus@gmail.com</a><br>• <strong>Counseling Hours:</strong> 8:00 AM to 8:00 PM (Monday – Sunday)<br><br>Our Academic Dean responds to admission enquiries within 2 hours!`,
            chips: ["Register Admission Enquiry", "WhatsApp Chat", "Campus Location"]
        };
    }

    // 9. Batch size / student teacher ratio / how many students
    if (q.includes('batch size') || q.includes('strength') || q.includes('ratio') || q.includes('how many student') || q.includes('crowd')) {
        return {
            answer: `👥 <strong>Small Batch Ceiling (Super-30 Cohorts):</strong><br><br>Unlike mass coaching institutions that pack 100 to 150 students into a single lecture hall, Shree Gurus enforces a strict ceiling of <strong>25 to 30 students per classroom</strong>.<br><br>This ensures that every teacher knows every student by name, tracks their daily Error Log, and provides 1-on-1 mentorship after class.`,
            chips: ["Explore Programs", "Admission Process", "Register Now"]
        };
    }

    // 10. Results / ranks / pass percentage
    if (q.includes('result') || q.includes('rank') || q.includes('topper') || q.includes('pass') || q.includes('track record')) {
        return {
            answer: `🏆 <strong>Recent Academic Benchmarks:</strong><br><br>• <strong>100% Pass Percentage</strong> in Intermediate 1st Year Board examinations.<br>• <strong>MPC Stream Topper:</strong> 465 / 470 Marks.<br>• <strong>BiPC Stream Topper:</strong> 450 / 470 Marks.<br>• <strong>35+ Students:</strong> Scored 460+ marks in Mathematics and Natural Sciences.<br><br>Our targeted 3-tier pedagogy guarantees both state board perfection and competitive edge.`,
            chips: ["Explore Brahmos (NEET)", "Explore Trishul (JEE)", "Register for 2026-27"]
        };
    }

    // 11. How to apply / admission process
    if (q.includes('apply') || q.includes('register') || q.includes('admission process') || q.includes('procedure') || q.includes('how to join') || q.includes('enroll')) {
        return {
            answer: `📝 <strong>Admission Procedure:</strong><br><br>1. <strong>Enquiry / Registration:</strong> Submit your details here with Guru AI or fill the form on our <a href="admissions.html" style="color:#2A4FD6; font-weight:600;">Admissions Page</a>.<br>2. <strong>Enquiry ID:</strong> You will immediately receive your official Enquiry ID (e.g. <code>#SG-...</code>).<br>3. <strong>Dean Callback:</strong> Our Academic Dean will call you within 2 hours with the syllabus and fee structure.<br>4. <strong>Diagnostic Assessment:</strong> Take the SG-SAT scholarship test or present Class 10 marks.<br>5. <strong>Enrollment:</strong> Secure your cohort seat at our Vijayawada campus.<br><br>Would you like to register right now?`,
            chips: ["Register Now with Guru AI", "Call +91 9640711111", "View Programs"]
        };
    }

    // 12. Default institutional overview with safe context
    return {
        answer: `Namaste! 🙏 I am <strong>Guru AI</strong>, official admissions counsellor for <strong>Shree Gurus Group of Institutions</strong>, Vijayawada.<br><br>I can provide verified information on:<br>• <strong>2026–2027 Admissions:</strong> Active for NEET Medical (BRAHMOS Bi.P.C)<br>• <strong>2027–2028 Admissions:</strong> TRISHUL (JEE Main), SINDOOR (JEE Advanced) &amp; BRAHMOS<br>• <strong>Campus Options:</strong> Residential Boys &amp; Girls Hostels, Semi-Residential, Day Scholar<br>• <strong>Location:</strong> Ballem Vari Street, Near Ramavarappadu Ring, Vijayawada<br>• <strong>Scholarships:</strong> Up to 100% based on Class 10 GPA &amp; SG-SAT<br><br>What would you like to know, or would you like to submit an admission enquiry?`,
        chips: ["Admissions 2026–27", "Campus & Hostels", "Fee & Scholarships", "Register Enquiry"]
    };
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                body = {};
            }
        }

        const message = body.message || '';
        const history = body.history || [];
        const context = body.context || {};

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        const result = resolveResponse(message, history, context);
        return res.status(200).json({
            success: true,
            answer: result.answer,
            chips: result.chips || []
        });
    } catch (err) {
        console.error('Chat API Error:', err);
        return res.status(500).json({
            success: false,
            error: 'Server error processing chat message'
        });
    }
}
