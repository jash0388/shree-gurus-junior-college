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

    // 0. Greetings / Casual hello
    const cleanQ = q.replace(/[^\w\s]/g, '').trim();
    const greetingWords = ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'hlo', 'good morning', 'good afternoon', 'good evening', 'gm', 'yo', 'start', 'bro', 'hola', 'sup'];
    if (greetingWords.some(w => cleanQ === w || cleanQ.startsWith(w + ' ') || cleanQ.endsWith(' ' + w) || cleanQ.split(/\s+/).includes(w))) {
        return {
            answer: `Hello! 🙏 Welcome to <strong>Shree Gurus</strong>. How can I help you today?`,
            chips: ["2026–27 NEET Admissions", "Register Enquiry", "Campus & Hostels", "Fee Structure"]
        };
    }

    // 1. Fee structure / cost / scholarship
    if (q.includes('fee') || q.includes('cost') || q.includes('scholarship') || q.includes('concession') || q.includes('price')) {
        return {
            answer: `🎓 Course fees depend on stream and hostel accommodation. We award up to <strong>100% Merit Scholarships</strong> based on Class 10 GPA and SG-SAT. Would you like a fee quotation for your profile?`,
            chips: ["Register for 2026–27", "Scholarship Details", "Call +91 9640711111"]
        };
    }

    // 2. JEE Courses (Trishul / Sindoor)
    if (q.includes('jee') || q.includes('engineering') || q.includes('mpc') || q.includes('iit') || q.includes('trishul') || q.includes('sindoor')) {
        if (q.includes('2026')) {
            return {
                answer: `⚠️ For 2026–27, admissions are active only for <strong>NEET Medical (Brahmos)</strong>. Our Engineering tracks (Trishul &amp; Sindoor) open for <strong>2027–28 Intake</strong>. Would you like to pre-book?`,
                chips: ["Pre-Book 2027–28 JEE", "Explore Brahmos NEET 2026", "Helpline +91 9640711111"]
            };
        }
        return {
            answer: `⚙️ We offer <strong>TRISHUL</strong> (JEE Main) and <strong>SINDOOR</strong> (JEE Advanced) for 2027–28 with 25–30 student cohorts, CBT computer labs, and senior IITian mentorship.`,
            chips: ["Pre-Book Trishul 2027–28", "Pre-Book Sindoor 2027–28", "Ask about Hostels"]
        };
    }

    // 3. Academic year status
    if (q.includes('2026') || (q.includes('year') && q.includes('next')) || q.includes('intake') || q.includes('when')) {
        return {
            answer: `📅 <strong>Admissions Status:</strong><br>• <strong>2026–27 (Active):</strong> NEET Medical (BRAHMOS Bi.P.C) &amp; Repeaters.<br>• <strong>2027–28 (Pre-Bookings):</strong> Open for Brahmos, Trishul &amp; Sindoor.`,
            chips: ["2026–27 NEET Admissions", "2027–28 JEE & NEET", "Register Enquiry"]
        };
    }

    // 4. Medical / NEET / Brahmos
    if (q.includes('neet') || q.includes('medical') || q.includes('bipc') || q.includes('brahmos') || q.includes('doctor')) {
        return {
            answer: `🩺 <strong>BRAHMOS (IPE + NEET Medical Bi.P.C):</strong> Active for 2026–27 with 120 seats, line-by-line NCERT Biology mastery, and daily diagnostic testing. Would you like to register an enquiry?`,
            chips: ["Register for Brahmos", "Campus & Hostels", "Fee Structure"]
        };
    }

    // 5. Repeaters / Long Term
    if (q.includes('repeat') || q.includes('long term') || q.includes('dropper') || q.includes('12th pass')) {
        return {
            answer: `🎯 Our <strong>Long-Term Repeaters</strong> batch offers intensive 1-year coaching for NEET &amp; JEE 2027 with daily CBT tests, personalized error tracking, and evening doubt clearance.`,
            chips: ["Register for Repeaters", "Hostel Facilities", "Call +91 9640711111"]
        };
    }

    // 6. Campus locations / address
    if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('reach') || q.includes('city') || q.includes('vijayawada')) {
        return {
            answer: `📍 <strong>Campus Location:</strong> D.No: 48-19-5/9, Ballem Vari Street, Near Ramavarappadu Ring, Vijayawada - 520007. We operate separate secured campuses for Boys and Girls.`,
            chips: ["Hostel Details", "Schedule Visit", "Register Enquiry"]
        };
    }

    // 7. Hostel / food / accommodation
    if (q.includes('hostel') || q.includes('food') || q.includes('mess') || q.includes('room') || q.includes('residential') || q.includes('boarding') || q.includes('girls') || q.includes('accommodation') || q.includes('campus type')) {
        return {
            answer: `🛏️ We offer Residential (separate AC hostels for Boys &amp; Girls with doctor-approved South Indian dining and 24/7 mentoring), Semi-Residential (8 AM – 8 PM study care), and Day Scholar options.`,
            chips: ["Residential Hostels", "Day Scholar Options", "Fee Details"]
        };
    }

    // 8. Contact / phone / email
    if (q.includes('contact') || q.includes('phone') || q.includes('number') || q.includes('call') || q.includes('email') || q.includes('helpline') || q.includes('whatsapp')) {
        return {
            answer: `📞 Admissions Helpline: <a href="tel:9640711111"><strong>+91 96407 11111</strong></a> / <a href="tel:9171222333"><strong>+91 91712 22333</strong></a> (8 AM – 8 PM daily). Email: <a href="mailto:mail2shreegurus@gmail.com"><strong>mail2shreegurus@gmail.com</strong></a>.`,
            chips: ["Register Enquiry", "WhatsApp Chat", "Campus Location"]
        };
    }

    // 9. Batch size
    if (q.includes('batch size') || q.includes('strength') || q.includes('ratio') || q.includes('how many student') || q.includes('crowd')) {
        return {
            answer: `👥 We strictly limit classes to <strong>25 to 30 students per batch</strong> (Super-30 cohorts) so faculty know every student personally and track their daily error log.`,
            chips: ["Explore Programs", "Admission Process", "Register Now"]
        };
    }

    // 10. Results / ranks
    if (q.includes('result') || q.includes('rank') || q.includes('topper') || q.includes('pass') || q.includes('track record')) {
        return {
            answer: `🏆 <strong>100% Pass Rate</strong> in Inter 1st Year. Top scores: MPC 465/470, BiPC 450/470, with 35+ students scoring 460+ marks.`,
            chips: ["Brahmos (NEET)", "Trishul (JEE)", "Register for 2026-27"]
        };
    }

    // 11. How to apply
    if (q.includes('apply') || q.includes('register') || q.includes('admission process') || q.includes('procedure') || q.includes('how to join') || q.includes('enroll')) {
        return {
            answer: `📝 Submit your details right here with Guru AI or call <a href="tel:9640711111"><strong>+91 96407 11111</strong></a>. Our Academic Dean will connect with you within 2 hours!`,
            chips: ["Register Now with Guru AI", "Call +91 9640711111", "View Programs"]
        };
    }

    // 12. Default institutional overview (Short & Crisp)
    return {
        answer: `Welcome to <strong>Shree Gurus</strong>, Vijayawada (NEET &amp; JEE). How can I assist you with admissions today?`,
        chips: ["2026–27 NEET Admissions", "Campus & Hostels", "Fee Structure", "Register Enquiry"]
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
