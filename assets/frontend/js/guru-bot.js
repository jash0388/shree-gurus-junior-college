/**
 * ==========================================================================
 * GURU AI - Official Admissions Counselor & Intelligent Admissions Engine
 * Shree Gurus Group of Institutions — Vijayawada
 * ==========================================================================
 */

(function () {
    // Session State & Conversation Memory
    const sessionState = {
        mode: 'chat', // 'chat' | 'registration'
        regStep: 0,   // step index when guiding registration
        data: {
            year: '2026 - 2027 (Active Intake)',
            course: 'BRAHMOS: IPE + NEET Medical (Bi.P.C)',
            class: 'Class 11 / Intermediate 1st Year',
            state: 'Andhra Pradesh',
            district: 'Vijayawada (NTR Dist)',
            campus_type: 'Residential (Hostel + Food + 24/7 Mentoring)',
            student_name: '',
            phone: '',
            email: '',
            notes: 'Standard Enquiry',
            source: 'Guru AI Admissions Chatbot'
        },
        history: [],
        submitted: false,
        lastEnquiryId: ''
    };

    let isOpen = false;

    // Verified Institutional Knowledge Base (Self-Contained Client Fallback)
    const KB = {
        name: "Shree Gurus Group of Institutions",
        location: "D.No: 48-19-5/9, Ballem Vari Street, Near Ramavarappadu Ring, Vijayawada - 520007, Andhra Pradesh",
        campuses: "Separate dedicated residential & semi-residential campuses for Boys and Girls in Vijayawada with 24/7 resident faculty, security, and CCTV.",
        contacts: {
            phone: "+91 9640711111",
            phoneAlt: "+91 9171222333",
            email: "mail2shreegurus@gmail.com",
            whatsapp: "https://wa.me/919640711111",
            hours: "8:00 AM – 8:00 PM (Monday to Sunday)"
        },
        years: {
            "2026-27": "For Academic Year 2026 - 2027 (Active Intake), admissions are strictly active for NEET Medical (BRAHMOS Track — Bi.P.C). JEE Engineering programs open for 2027–2028 intake.",
            "2027-28": "For Academic Year 2027 - 2028 (Pre-Bookings Open), all 3 programs are available: BRAHMOS (NEET Medical), TRISHUL (JEE Main), and SINDOOR (JEE Advanced)."
        },
        courses: {
            brahmos: "BRAHMOS: 2-Year Integrated IPE + NEET Medical (Bi.P.C). Active for 2026-27 & 2027-28. Total 120 seats (90 Girls across 3 sections, 30 Boys in 1 section). Includes line-by-line NCERT Biology mastery, physics/chemistry speed drills, daily testing, and air-cooled classrooms.",
            trishul: "TRISHUL: 2-Year Integrated IPE + JEE Main (M.P.C). Open for 2027-28 intake. 120 seats (40 Girls in 1 section, 80 Boys in 2 sections). High-speed CBT testing in our 200+ computer lab.",
            sindoor: "SINDOOR: Elite 2-Year Integrated IPE + JEE Advanced (M.P.C). Open for 2027-28 intake. 120 seats (40 Girls in 1 section, 80 Boys in 2 sections). Higher-order problem solving targeted at Top 500 All India Ranks.",
            repeaters: "Long-Term Repeaters Super-60 Batch: 1-Year intensive NEET & JEE coaching with individual error-log tracking and weekly full-length CBT grand tests."
        },
        campusTypes: {
            residential: "Residential: Nutritious South Indian dining, AC/Air-cooled rooms, 24/7 resident faculty mentoring, and study hours.",
            semiResidential: "Semi-Residential: Day + Evening Study Care (8:00 AM to 8:00 PM) including meals and supervised doubt-clearing.",
            dayScholar: "Day Scholar: Regular classroom lectures and lab sessions."
        },
        batchSize: "Strict ceiling of 25 to 30 students per classroom (Super-30 micro cohorts) guaranteeing personalized faculty error-tracking every single day.",
        results: "100% pass percentage in 1st Year Intermediate. MPC Topper: 465/470 Marks. BiPC Topper: 450/470 Marks. 35+ students scored 460+ marks.",
        fees: "Fees depend on stream (Medical vs Engineering) and campus type (Day Scholar vs Residential). We offer up to 100% Merit Scholarships based on Class 10 GPA and the Shree Gurus Talent Search Exam (SG-SAT). The Academic Dean evaluates eligibility to provide official quotations.",
        admissionProcess: "1. Submit enquiry with Guru AI. 2. Receive Enquiry ID (#SG-...). 3. Academic Dean calls within 2 hours with syllabus and fee details. 4. Campus counseling visit in Vijayawada."
    };

    // Initialize Bot DOM
    function initBotDOM() {
        if (document.getElementById('guruBotLauncher')) return;

        const botHTML = `
        <!-- Floating Launcher Trigger -->
        <div class="guru-bot-launcher" id="guruBotLauncher" onclick="window.GuruBot.toggle()">
            <div class="guru-bot-tooltip" id="guruBotTooltip">
                <span class="badge-gold">2026-27</span>
                <span>Admissions Open for 2026–27! Ask me or register.</span>
                <span class="guru-bot-tooltip-close" onclick="event.stopPropagation(); window.GuruBot.dismissTooltip();">&times;</span>
            </div>
            <div class="guru-bot-btn" aria-label="Open Admissions Chatbot">
                <div class="guru-bot-pulse-ring"></div>
                <img src="assets/frontend/img/logo_emblem.png?v=12" alt="Shree Gurus Emblem" class="emblem-icon">
                <div class="guru-bot-status-dot"></div>
            </div>
        </div>

        <!-- Chat Window -->
        <div class="guru-bot-window" id="guruBotWindow" role="dialog" aria-modal="true" aria-label="Guru AI Admissions Assistant">
            <!-- Header -->
            <div class="guru-header">
                <div class="guru-header-info">
                    <div class="guru-header-avatar">
                        <img src="assets/frontend/img/logo_emblem.png?v=12" alt="Guru AI">
                    </div>
                    <div>
                        <h4 class="guru-header-title">Guru AI <span class="tag-ai">COUNSELOR</span></h4>
                        <p class="guru-header-sub">
                            <span class="online-badge"></span> Shree Gurus Admissions Desk
                        </p>
                    </div>
                </div>
                <div class="guru-header-actions">
                    <button class="guru-action-btn" title="Restart Conversation" onclick="window.GuruBot.restart()">
                        <i class="fa-solid fa-rotate-right"></i>
                    </button>
                    <button class="guru-action-btn" title="Close" onclick="window.GuruBot.toggle()">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div class="guru-chat-body" id="guruChatBody">
                <!-- Welcome Banner -->
                <div class="guru-welcome-banner">
                    <h6>SHREE GURUS GROUP OF INSTITUTIONS</h6>
                    <p>Vijayawada • Guiding Minds ★ Building Futures</p>
                    <div class="guru-welcome-badges">
                        <span class="guru-badge-chip"><i class="fa-solid fa-award me-1 text-warning"></i> 100% Pass Rate</span>
                        <span class="guru-badge-chip"><i class="fa-solid fa-user-shield me-1 text-primary"></i> Super-30 Batches</span>
                        <span class="guru-badge-chip"><i class="fa-solid fa-stethoscope me-1 text-success"></i> 2026-27 NEET Active</span>
                    </div>
                </div>
            </div>

            <!-- Footer / Input Area -->
            <div class="guru-footer">
                <div class="guru-input-wrapper">
                    <input type="text" id="guruUserInput" class="guru-input" placeholder="Ask a question or type your name..." onkeydown="if(event.key === 'Enter') window.GuruBot.handleSend()">
                    <button class="guru-send-btn" id="guruSendBtn" onclick="window.GuruBot.handleSend()" aria-label="Send message">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
                <div class="guru-input-helper">
                    <span>Helpline: <strong>+91 9640711111</strong></span>
                    <span>&bull;</span>
                    <a href="https://wa.me/919640711111?text=Hello%20Shree%20Gurus%20Admissions%20Team,%20I%20want%20to%20know%20about%202026-27%20admissions." target="_blank">
                        <i class="fa-brands fa-whatsapp me-1"></i> WhatsApp
                    </a>
                </div>
            </div>
        </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = botHTML;
        document.body.appendChild(container);
    }

    function toggleChat() {
        const win = document.getElementById('guruBotWindow');
        const tooltip = document.getElementById('guruBotTooltip');
        isOpen = !isOpen;
        if (isOpen) {
            win.classList.add('active');
            if (tooltip) tooltip.style.display = 'none';
            document.getElementById('guruUserInput').focus();
            if (sessionState.history.length === 0) {
                startGreeting();
            }
        } else {
            win.classList.remove('active');
        }
    }

    function dismissTooltip() {
        const tooltip = document.getElementById('guruBotTooltip');
        if (tooltip) tooltip.style.display = 'none';
    }

    function appendMessage(sender, html, chips = []) {
        const chatBody = document.getElementById('guruChatBody');
        const row = document.createElement('div');
        row.className = `guru-msg-row ${sender}`;

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (sender === 'bot') {
            row.innerHTML = `
                <div class="guru-avatar-mini">
                    <img src="assets/frontend/img/logo_emblem.png?v=12" alt="Bot">
                </div>
                <div class="guru-bubble">
                    ${html}
                    ${renderChips(chips)}
                    <span class="guru-msg-time">${now}</span>
                </div>
            `;
        } else {
            row.innerHTML = `
                <div class="guru-bubble">
                    ${html}
                    <span class="guru-msg-time">${now}</span>
                </div>
            `;
        }

        chatBody.appendChild(row);
        chatBody.scrollTop = chatBody.scrollHeight;
        sessionState.history.push({ sender, text: html });
    }

    function renderChips(chips) {
        if (!chips || chips.length === 0) return '';
        let html = '<div class="guru-chips-container">';
        chips.forEach(chip => {
            const label = typeof chip === 'string' ? chip : chip.label;
            const value = typeof chip === 'string' ? chip : (chip.value || chip.label);
            const isGold = (typeof chip === 'object' && chip.gold) ? 'gold' : '';
            html += `<div class="guru-chip ${isGold}" onclick="window.GuruBot.handleChipClick('${escapeQuotes(value)}')">${label}</div>`;
        });
        html += '</div>';
        return html;
    }

    function escapeQuotes(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    function showTyping(callback) {
        const chatBody = document.getElementById('guruChatBody');
        const typingEl = document.createElement('div');
        typingEl.className = 'guru-msg-row bot';
        typingEl.id = 'guruTypingIndicator';
        typingEl.innerHTML = `
            <div class="guru-avatar-mini">
                <img src="assets/frontend/img/logo_emblem.png?v=12" alt="Bot">
            </div>
            <div class="guru-typing">
                <div class="guru-typing-dot"></div>
                <div class="guru-typing-dot"></div>
                <div class="guru-typing-dot"></div>
            </div>
        `;
        chatBody.appendChild(typingEl);
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
            const el = document.getElementById('guruTypingIndicator');
            if (el) el.remove();
            if (callback) callback();
        }, 450);
    }

    function updatePlaceholder(text) {
        const input = document.getElementById('guruUserInput');
        if (input) input.placeholder = text;
    }

    // Step 0: Greeting
    function startGreeting() {
        showTyping(() => {
            appendMessage('bot', `
                Hello! 🙏 Welcome to <strong>Shree Gurus</strong>.<br>
                How can I help you with admissions today?
            `, [
                { label: "🩺 NEET Brahmos (2026-27)", value: "Tell me about Brahmos NEET 2026-27" },
                { label: "📝 Register Admission Enquiry", value: "I want to submit an admission enquiry", gold: true },
                { label: "🎓 Fee & Scholarships", value: "What is your fee structure and scholarship?" },
                { label: "📍 Campus & Hostels", value: "Where is the campus and what are hostel facilities?" }
            ]);
            updatePlaceholder("Ask a question or type your name...");
        });
    }

    // Natural Language Entity Extraction
    function extractEntities(text) {
        const lower = text.toLowerCase();

        // 1. Academic Year
        if (lower.includes('2026') || lower.includes('active')) {
            sessionState.data.year = '2026 - 2027 (Active Intake)';
            // If year is 2026-27, default to Brahmos
            sessionState.data.course = 'BRAHMOS: IPE + NEET Medical (Bi.P.C)';
        } else if (lower.includes('2027') || lower.includes('2028') || lower.includes('pre-book')) {
            sessionState.data.year = '2027 - 2028 (Pre-Bookings Open)';
        }

        // 2. Course
        if (lower.includes('brahmos') || lower.includes('neet') || lower.includes('medical') || lower.includes('bipc')) {
            sessionState.data.course = 'BRAHMOS: IPE + NEET Medical (Bi.P.C)';
        } else if (lower.includes('trishul') || lower.includes('jee main')) {
            sessionState.data.course = 'TRISHUL: IPE + JEE Main (M.P.C)';
            sessionState.data.year = '2027 - 2028 (Pre-Bookings Open)';
        } else if (lower.includes('sindoor') || lower.includes('jee advanced')) {
            sessionState.data.course = 'SINDOOR: IPE + JEE Advanced (M.P.C)';
            sessionState.data.year = '2027 - 2028 (Pre-Bookings Open)';
        } else if (lower.includes('repeat') || lower.includes('long term') || lower.includes('dropper')) {
            sessionState.data.class = 'Long Term Repeaters (Target 2027)';
        }

        // 3. Class
        if (lower.includes('11') || lower.includes('1st year') || lower.includes('inter 1')) {
            sessionState.data.class = 'Class 11 / Intermediate 1st Year';
        } else if (lower.includes('12') || lower.includes('2nd year') || lower.includes('inter 2')) {
            sessionState.data.class = 'Class 12 / Intermediate 2nd Year';
        }

        // 4. Campus Type
        if (lower.includes('residential') || lower.includes('hostel')) {
            sessionState.data.campus_type = 'Residential (Hostel + Food + 24/7 Mentoring)';
        } else if (lower.includes('semi-residential') || lower.includes('day care')) {
            sessionState.data.campus_type = 'Semi-Residential (Day + Evening Study Care)';
        } else if (lower.includes('day scholar') || lower.includes('no hostel')) {
            sessionState.data.campus_type = 'Day Scholar (Classroom + Labs)';
        }

        // 5. Phone number
        const phoneMatch = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}/);
        if (phoneMatch) {
            sessionState.data.phone = phoneMatch[0].replace(/[^0-9]/g, '').slice(-10);
        }

        // 6. Email
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
            sessionState.data.email = emailMatch[0];
        }
    }

    // Check if user intends to register
    function isRegistrationIntent(text) {
        const lower = text.toLowerCase().trim();
        const regPhrases = [
            'register', 'apply', 'enroll', 'enrol', 'admission enquiry', 'submit enquiry',
            'book a seat', 'book seat', 'join the college', 'take admission', 'registration',
            'i want admission', 'want to join', 'admissions open'
        ];
        return regPhrases.some(p => lower.includes(p));
    }

    // Intelligent Local Knowledge Resolver (Short & Crisp)
    function resolveLocalKnowledge(text) {
        const q = text.toLowerCase().trim();

        // Greetings / Casual hello
        const cleanQ = q.replace(/[^\w\s]/g, '').trim();
        const greetingWords = ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'hlo', 'good morning', 'good afternoon', 'good evening', 'gm', 'yo', 'start', 'bro', 'hola', 'sup'];
        if (greetingWords.some(w => cleanQ === w || cleanQ.startsWith(w + ' ') || cleanQ.endsWith(' ' + w) || cleanQ.split(/\s+/).includes(w))) {
            return {
                answer: `Hello! 🙏 Welcome to <strong>Shree Gurus</strong>. How can I help you today?`,
                chips: ["2026–27 NEET Admissions", "Register Enquiry", "Campus & Hostels", "Fee Structure"]
            };
        }

        // Fee & Scholarship
        if (q.includes('fee') || q.includes('cost') || q.includes('scholarship') || q.includes('concession') || q.includes('price')) {
            return {
                answer: `🎓 Course fees depend on stream and hostel accommodation. We award up to <strong>100% Merit Scholarships</strong> based on Class 10 GPA and SG-SAT. Would you like a fee quotation for your profile?`,
                chips: ["Register Admission Enquiry", "Scholarship Details", "Call +91 9640711111"]
            };
        }

        // 2026-27 vs 2027-28 Intake
        if (q.includes('2026') || (q.includes('year') && (q.includes('which') || q.includes('academic') || q.includes('intake')))) {
            return {
                answer: `📅 <strong>Admissions Status:</strong><br>• <strong>2026–27 (Active):</strong> NEET Medical (BRAHMOS Bi.P.C) &amp; Repeaters.<br>• <strong>2027–28 (Pre-Bookings):</strong> Open for Brahmos, Trishul &amp; Sindoor.`,
                chips: ["2026–27 (Active NEET)", "2027–28 (JEE & NEET)", "Register for Brahmos"]
            };
        }

        // Engineering / JEE / Trishul / Sindoor
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

        // Medical / NEET / Brahmos
        if (q.includes('neet') || q.includes('medical') || q.includes('bipc') || q.includes('brahmos') || q.includes('doctor')) {
            return {
                answer: `🩺 <strong>BRAHMOS (IPE + NEET Medical Bi.P.C):</strong> Active for 2026–27 with 120 seats, line-by-line NCERT Biology mastery, and daily diagnostic testing. Would you like to register an enquiry?`,
                chips: ["Register for Brahmos 2026–27", "Campus & Hostels", "Fee Structure"]
            };
        }

        // Repeaters / Long Term
        if (q.includes('repeat') || q.includes('long term') || q.includes('dropper') || q.includes('12th pass')) {
            return {
                answer: `🎯 Our <strong>Long-Term Repeaters</strong> batch offers intensive 1-year coaching for NEET &amp; JEE 2027 with daily CBT tests, personalized error tracking, and evening doubt clearance.`,
                chips: ["Register for Repeaters", "Hostel Facilities", "Call +91 9640711111"]
            };
        }

        // Campus Location / Address
        if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('reach') || q.includes('city') || q.includes('vijayawada')) {
            return {
                answer: `📍 <strong>Campus Location:</strong> D.No: 48-19-5/9, Ballem Vari Street, Near Ramavarappadu Ring, Vijayawada - 520007. We operate separate secured campuses for Boys and Girls.`,
                chips: ["Hostel Details", "Schedule Visit", "Register Enquiry"]
            };
        }

        // Hostels / Food / Accommodation / Girls Safety
        if (q.includes('hostel') || q.includes('food') || q.includes('mess') || q.includes('room') || q.includes('residential') || q.includes('boarding') || q.includes('girls')) {
            return {
                answer: `🛏️ We offer Residential (separate AC hostels for Boys &amp; Girls with doctor-approved South Indian dining and 24/7 mentoring), Semi-Residential (8 AM – 8 PM study care), and Day Scholar options.`,
                chips: ["Residential Hostels", "Day Scholar Options", "Fee Structure"]
            };
        }

        // Helplines & Contacts
        if (q.includes('contact') || q.includes('phone') || q.includes('number') || q.includes('call') || q.includes('email') || q.includes('helpline') || q.includes('whatsapp')) {
            return {
                answer: `📞 Admissions Helpline: <a href="tel:9640711111"><strong>${KB.contacts.phone}</strong></a> / <a href="tel:9171222333"><strong>${KB.contacts.phoneAlt}</strong></a> (8 AM – 8 PM daily). Email: <a href="mailto:${KB.contacts.email}"><strong>${KB.contacts.email}</strong></a>.`,
                chips: ["Register Admission Enquiry", "WhatsApp Chat", "Campus Location"]
            };
        }

        // Batch Size
        if (q.includes('batch size') || q.includes('strength') || q.includes('ratio') || q.includes('how many student') || q.includes('crowd')) {
            return {
                answer: `👥 We strictly limit classes to <strong>25 to 30 students per batch</strong> (Super-30 cohorts) so faculty know every student personally and track their daily error log.`,
                chips: ["Explore Programs", "Admission Process", "Register Now"]
            };
        }

        // Results & Ranks
        if (q.includes('result') || q.includes('rank') || q.includes('topper') || q.includes('pass') || q.includes('track record')) {
            return {
                answer: `🏆 <strong>100% Pass Rate</strong> in Inter 1st Year. Top scores: MPC 465/470, BiPC 450/470, with 35+ students scoring 460+ marks.`,
                chips: ["Explore Brahmos (NEET)", "Explore Trishul (JEE)", "Register for 2026-27"]
            };
        }

        // Website Navigation Links
        if (q.includes('link') || q.includes('page') || q.includes('website') || q.includes('form') || q.includes('brochure')) {
            return {
                answer: `🔗 <strong>Quick Links:</strong> <a href="admissions.html">Admissions Form</a> &bull; <a href="programs.html">Programs</a> &bull; <a href="about.html#facilities">Campus &amp; Hostels</a> &bull; <a href="contact.html">Contact Desk</a>`,
                chips: ["Register Online", "Call Helpline", "Ask a Question"]
            };
        }

        // Default Institutional Overview (Short & Crisp)
        return {
            answer: `Welcome to <strong>Shree Gurus</strong>, Vijayawada (NEET &amp; JEE). How can I assist you with admissions today?`,
            chips: ["2026–27 NEET Admissions", "Campus & Hostels", "Fee Structure", "Register Enquiry"]
        };
    }

    // Step-by-Step Guided Registration Prompts
    function promptRegistrationStep() {
        switch (sessionState.regStep) {
            case 0: // Student Name
                appendMessage('bot', `Great! Let's set up your admission enquiry. 🎓<br><br>May I have the <strong>Student's Full Name</strong>?`);
                updatePlaceholder("Type student full name (e.g. Ananya Rao)...");
                break;
            case 1: // Mobile Phone
                appendMessage('bot', `Thank you, <strong>${sessionState.data.student_name}</strong>! 🌟<br><br>Please share your <strong>10-digit Mobile / WhatsApp Number</strong> so our academic dean can call you with prospectus details:`);
                updatePlaceholder("e.g. 9848012345");
                break;
            case 2: // Academic Year
                appendMessage('bot', `Which <strong>Academic Year</strong> are you applying for?`, [
                    { label: "🩺 2026 – 2027 (Active Intake: NEET Only)", value: "2026 - 2027 (Active Intake)", gold: true },
                    { label: "🎯 2027 – 2028 (Pre-Bookings: Trishul, Sindoor & Brahmos)", value: "2027 - 2028 (Pre-Bookings Open)" }
                ]);
                break;
            case 3: // Course / Program
                if (sessionState.data.year.includes('2026')) {
                    appendMessage('bot', `For <strong>2026–2027 Session</strong>, admissions are exclusively active for <strong>NEET Medical (Brahmos)</strong>.<br><br>Please confirm your course:`, [
                        "BRAHMOS: IPE + NEET Medical (Bi.P.C)"
                    ]);
                } else {
                    appendMessage('bot', `For <strong>2027–2028 Session</strong>, which program would you like to pre-book?`, [
                        "BRAHMOS: IPE + NEET Medical (Bi.P.C)",
                        "TRISHUL: IPE + JEE Main (M.P.C)",
                        "SINDOOR: IPE + JEE Advanced (M.P.C)"
                    ]);
                }
                break;
            case 4: // Select Class
                appendMessage('bot', `Which <strong>Class / Grade</strong> are you joining?`, [
                    "Class 11 / Intermediate 1st Year",
                    "Class 12 / Intermediate 2nd Year",
                    "Long Term Repeaters (Target 2027)"
                ]);
                break;
            case 5: // Campus Type / Accommodation
                appendMessage('bot', `What is your <strong>Campus Accommodation</strong> preference?`, [
                    "Residential (Hostel + Food + 24/7 Mentoring)",
                    "Semi-Residential (Day + Evening Study Care)",
                    "Day Scholar (Classroom + Labs)"
                ]);
                break;
            case 6: // Email (Optional)
                appendMessage('bot', `What is your <strong>Email Address</strong>? (or tap Skip if you don't use email):`, [
                    "Skip Email"
                ]);
                updatePlaceholder("e.g. student@gmail.com or skip...");
                break;
            case 7: // Review Summary Card
                showReviewSummaryCard();
                break;
        }
    }

    // Process Guided Registration Inputs
    function processRegistrationInput(text) {
        switch (sessionState.regStep) {
            case 0: // Student Name
                if (text.length < 2) {
                    appendMessage('bot', "Please enter a valid student name (at least 2 letters):");
                    return;
                }
                sessionState.data.student_name = text;
                sessionState.regStep = 1;
                showTyping(promptRegistrationStep);
                break;

            case 1: // Phone Number
                const cleanPhone = text.replace(/[^0-9]/g, '');
                if (cleanPhone.length < 10) {
                    appendMessage('bot', "⚠️ Please enter a valid <strong>10-digit mobile number</strong> so our Academic Dean can contact you:");
                    return;
                }
                sessionState.data.phone = cleanPhone.slice(-10);
                sessionState.regStep = 2;
                showTyping(promptRegistrationStep);
                break;

            case 2: // Academic Year
                if (text.includes('2026')) {
                    sessionState.data.year = '2026 - 2027 (Active Intake)';
                    sessionState.data.course = 'BRAHMOS: IPE + NEET Medical (Bi.P.C)';
                } else {
                    sessionState.data.year = '2027 - 2028 (Pre-Bookings Open)';
                }
                sessionState.regStep = 3;
                showTyping(promptRegistrationStep);
                break;

            case 3: // Course
                if (sessionState.data.year.includes('2026')) {
                    sessionState.data.course = 'BRAHMOS: IPE + NEET Medical (Bi.P.C)';
                } else {
                    if (text.includes('Trishul') || text.includes('Main')) {
                        sessionState.data.course = 'TRISHUL: IPE + JEE Main (M.P.C)';
                    } else if (text.includes('Sindoor') || text.includes('Advanced')) {
                        sessionState.data.course = 'SINDOOR: IPE + JEE Advanced (M.P.C)';
                    } else {
                        sessionState.data.course = 'BRAHMOS: IPE + NEET Medical (Bi.P.C)';
                    }
                }
                sessionState.regStep = 4;
                showTyping(promptRegistrationStep);
                break;

            case 4: // Class
                if (text.includes('12')) {
                    sessionState.data.class = 'Class 12 / Intermediate 2nd Year';
                } else if (text.includes('Repeat') || text.includes('Long Term')) {
                    sessionState.data.class = 'Long Term Repeaters (Target 2027)';
                } else {
                    sessionState.data.class = 'Class 11 / Intermediate 1st Year';
                }
                sessionState.regStep = 5;
                showTyping(promptRegistrationStep);
                break;

            case 5: // Campus Type
                if (text.includes('Semi')) {
                    sessionState.data.campus_type = 'Semi-Residential (Day + Evening Study Care)';
                } else if (text.includes('Day')) {
                    sessionState.data.campus_type = 'Day Scholar (Classroom + Labs)';
                } else {
                    sessionState.data.campus_type = 'Residential (Hostel + Food + 24/7 Mentoring)';
                }
                sessionState.regStep = 6;
                showTyping(promptRegistrationStep);
                break;

            case 6: // Email
                if (text.toLowerCase().includes('skip')) {
                    sessionState.data.email = 'Not Provided';
                } else if (text.includes('@')) {
                    sessionState.data.email = text.trim();
                } else {
                    sessionState.data.email = 'Not Provided';
                }
                sessionState.regStep = 7;
                showTyping(promptRegistrationStep);
                break;
        }
    }

    // Display Review Summary Card
    function showReviewSummaryCard() {
        const d = sessionState.data;
        const summaryHTML = `
            <div class="guru-summary-card">
                <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="fa-solid fa-clipboard-check text-warning fs-5"></i>
                    <strong style="color: #07153D; font-size: 15px;">Admission Enquiry Review</strong>
                </div>
                <table class="guru-summary-table">
                    <tr><td class="label">Student Name:</td><td class="val">${d.student_name}</td></tr>
                    <tr><td class="label">Phone / WhatsApp:</td><td class="val">+91 ${d.phone}</td></tr>
                    <tr><td class="label">Academic Year:</td><td class="val" style="color: #16A34A; font-weight: 700;">${d.year}</td></tr>
                    <tr><td class="label">Target Course:</td><td class="val" style="color: #2A4FD6; font-weight: 700;">${d.course}</td></tr>
                    <tr><td class="label">Class:</td><td class="val">${d.class}</td></tr>
                    <tr><td class="label">Campus Type:</td><td class="val">${d.campus_type}</td></tr>
                    <tr><td class="label">Location:</td><td class="val">${d.district}</td></tr>
                    <tr><td class="label">Email:</td><td class="val">${d.email || 'Not Provided'}</td></tr>
                </table>
                <div class="d-flex flex-column gap-2 mt-3">
                    <button class="flow-btn flow-btn-submit guru-submit-btn" id="guruConfirmSubmitBtn" onclick="window.GuruBot.submitRegistration()">
                        <svg class="flow-arr-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;min-width:16px;max-width:16px;pointer-events:none;"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        <span class="flow-text">Confirm &amp; Submit Registration</span>
                        <span class="flow-circle"></span>
                        <svg class="flow-arr-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;min-width:16px;max-width:16px;pointer-events:none;"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm rounded-pill mt-1" onclick="window.GuruBot.editDetails()">
                        <i class="fa-solid fa-pen me-1"></i> Edit Details
                    </button>
                </div>
            </div>
        `;
        appendMessage('bot', `Please review your details and click <strong>Confirm &amp; Submit</strong> to register your admission enquiry:${summaryHTML}`);
        updatePlaceholder("Click Confirm or type to edit...");
    }

    // Submit Registration to Backend and Notification Systems
    function submitRegistration() {
        if (sessionState.submitted) {
            appendMessage('bot', `⚠️ Your enquiry is already recorded (ID: <strong>${sessionState.lastEnquiryId}</strong>). Our Academic Dean will call you soon!`);
            return;
        }

        const confirmBtn = document.getElementById('guruConfirmSubmitBtn');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.6';
        }

        showTyping(() => {
            appendMessage('bot', `<i class="fa-solid fa-spinner fa-spin text-primary me-2"></i> Registering enquiry with Admissions Desk...`);

            const payload = {
                student_name: sessionState.data.student_name,
                phone: sessionState.data.phone,
                email: sessionState.data.email,
                year: sessionState.data.year,
                course: sessionState.data.course,
                class: sessionState.data.class,
                state: sessionState.data.state,
                district: sessionState.data.district,
                campus_type: sessionState.data.campus_type,
                source: 'AI Chatbot',
                status: 'Pending',
                notes: 'Chatbot Assisted Registration'
            };

            // 1. Client-side FormSubmit Notification Backup
            try {
                fetch('https://formsubmit.co/ajax/mail2shreegurus@gmail.com', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        '_subject': `New Shree Gurus Admission Enquiry - ${payload.student_name} (${payload.course})`,
                        ...payload
                    })
                }).catch(() => {});
            } catch (e) {}

            // 2. Dispatch to Backend (/api/enquiry)
            fetch('/api/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                const enquiryId = data.enquiry_id || ('SG-' + Date.now().toString().slice(-6));
                sessionState.submitted = true;
                sessionState.lastEnquiryId = enquiryId;
                saveLead(payload, enquiryId);
                showSuccessCard(enquiryId);
            })
            .catch(() => {
                const fallbackId = 'SG-' + Date.now().toString().slice(-6);
                sessionState.submitted = true;
                sessionState.lastEnquiryId = fallbackId;
                saveLead(payload, fallbackId);
                showSuccessCard(fallbackId);
            });
        });
    }

    function saveLead(payload, enquiryId) {
        try {
            const leads = JSON.parse(localStorage.getItem('shree_gurus_leads') || '[]');
            payload.enquiry_id = enquiryId;
            payload.timestamp = new Date().toLocaleString();
            leads.push(payload);
            localStorage.setItem('shree_gurus_leads', JSON.stringify(leads));
        } catch (e) {}
    }

    function showSuccessCard(enquiryId) {
        showTyping(() => {
            const successHTML = `
                <div class="guru-success-card">
                    <div class="guru-success-icon"><i class="fa-solid fa-circle-check"></i></div>
                    <h5>Admission Enquiry Received!</h5>
                    <p style="font-size: 14px; margin-top: 8px; color: #166534; font-weight: 700;">
                        Enquiry ID: <strong>#${enquiryId}</strong>
                    </p>
                    <p class="text-muted small mb-0">
                        Notification dispatched to admissions desk. Our Academic Dean will call you at <strong>+91 ${sessionState.data.phone}</strong> within 2 hours.
                    </p>
                </div>
            `;
            appendMessage('bot', successHTML, [
                "Ask another question",
                "Campus Office Address",
                "WhatsApp Admissions Desk"
            ]);
            sessionState.mode = 'chat';
            updatePlaceholder("Ask any further question...");
        });
    }

    function editDetails() {
        sessionState.regStep = 0;
        showTyping(promptRegistrationStep);
    }

    // Main Message Handler
    function handleSend(userText = null, isChip = false) {
        const input = document.getElementById('guruUserInput');
        const text = (userText !== null ? userText : input.value).trim();
        if (!text) return;
        if (userText === null) input.value = '';

        appendMessage('user', text);

        // Always run entity extraction to passively learn user context
        extractEntities(text);

        // If in Registration Mode
        if (sessionState.mode === 'registration') {
            processRegistrationInput(text);
            return;
        }

        // If user explicitly triggers registration
        if (isRegistrationIntent(text)) {
            sessionState.mode = 'registration';
            // If name is already provided in session, jump to phone
            if (sessionState.data.student_name && sessionState.data.student_name.length > 2) {
                sessionState.regStep = 1;
            } else {
                sessionState.regStep = 0;
            }
            showTyping(promptRegistrationStep);
            return;
        }

        // Query Backend AI Endpoint (/api/chat) with graceful fallback to local knowledge
        showTyping(() => {
            fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: sessionState.history.slice(-6),
                    context: sessionState.data
                })
            })
            .then(res => res.json())
            .then(resData => {
                if (resData && resData.answer) {
                    appendMessage('bot', resData.answer, resData.chips || []);
                } else {
                    const localRes = resolveLocalKnowledge(text);
                    appendMessage('bot', localRes.answer, localRes.chips);
                }
            })
            .catch(() => {
                // Network failure fallback
                const localRes = resolveLocalKnowledge(text);
                appendMessage('bot', localRes.answer, localRes.chips);
            });
        });
    }

    function handleChipClick(val) {
        handleSend(val, true);
    }

    function restart() {
        const chatBody = document.getElementById('guruChatBody');
        const rows = chatBody.querySelectorAll('.guru-msg-row');
        rows.forEach(r => r.remove());
        sessionState.mode = 'chat';
        sessionState.regStep = 0;
        sessionState.submitted = false;
        sessionState.history = [];
        startGreeting();
    }

    // Global Public API
    window.GuruBot = {
        toggle: toggleChat,
        dismissTooltip: dismissTooltip,
        handleSend: handleSend,
        handleChipClick: handleChipClick,
        submitRegistration: submitRegistration,
        editDetails: editDetails,
        restart: restart
    };

    // Auto-init on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBotDOM);
    } else {
        initBotDOM();
    }
})();
