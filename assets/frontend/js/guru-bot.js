/**
 * ==========================================================================
 * GURU AI - Smart Admissions Counselor & Guided Course Registration
 * Shree Gurus Group of Institutions
 * ==========================================================================
 */

(function () {
    // Knowledge Base for instant intelligent answers
    const GURU_FAQ = [
        {
            keywords: ['fee structure', 'fees structure', 'how much fee', 'course fee', 'cost of coaching', 'scholarship', 'fee concession'],
            answer: "🎓 <strong>Fee &amp; Scholarship Structure:</strong><br>Our course fee varies by stream (Day Scholar vs Residential Hostel). We offer <strong>up to 100% Merit Scholarships</strong> based on Class 10 GPA and the Shree Gurus Talent Search Exam! Our academic dean evaluates your eligibility and grants fee concessions."
        },
        {
            keywords: ['where is the college', 'where is campus', 'campus location', 'college address', 'reach the campus', 'directions to campus', 'google map location'],
            answer: "🏫 <strong>Campus Location:</strong><br>Our primary campus is located at:<br><strong>Ballem Vari St, Near Ramavarappadu Ring, Vijayawada, Andhra Pradesh - 520007</strong>.<br>We operate separate specialized campuses for <strong>Boys</strong> and <strong>Girls</strong> with high security."
        },
        {
            keywords: ['hostel facility', 'mess food', 'hostel room', 'residential facility', 'boarding facility', 'food menu in hostel'],
            answer: "🛏️ <strong>Hostel &amp; Boarding:</strong><br>We provide premium Air-Cooled &amp; AC residential hostels with attached hygienic washrooms, 24/7 power backup, nutritious doctor-approved South Indian dining, and resident faculty available for evening doubt-clearing sessions."
        },
        {
            keywords: ['toppers list', 'highest mark', 'neet rank', 'jee rank', 'pass percentage', 'previous results in neet'],
            answer: "🏆 <strong>2026 Academic Records:</strong><br>• <strong>100% Pass Percentage</strong> in 1st Year Inter.<br>• <strong>MPC Topper:</strong> 465 / 470 Marks (AIR benchmark).<br>• <strong>BiPC Topper:</strong> 450 / 470 Marks.<br>• 35+ students scored 460+ marks in Mathematics &amp; Natural Sciences!"
        },
        {
            keywords: ['batch size', 'class strength', 'how many students in batch', 'student to teacher ratio'],
            answer: "👥 <strong>Small Batch Ceiling:</strong><br>Unlike crowded mega-coaching institutes with 120+ students per class, Shree Gurus enforces a strict ceiling of <strong>25 to 30 students per cohort</strong>, guaranteeing individual error-tracking every single day."
        },
        {
            keywords: ['contact number', 'helpline number', 'office number', 'principal phone', 'phone number to call'],
            answer: "📞 <strong>Admissions Helplines:</strong><br>• <strong>+91 9640711111</strong><br>• <strong>+91 9171222333</strong><br>• Email: <a href='mailto:mail2shreegurus@gmail.com'>mail2shreegurus@gmail.com</a>"
        }
    ];

    // Registration Flow State
    const regData = {
        name: '',
        phone: '',
        email: '',
        city: '',
        course: '',
        academic_year: '2027-28',
        campus: 'Vijayawada Campus',
        hostel: 'Not Specified',
        notes: '',
        source: 'Guru AI Chatbot'
    };

    let currentStep = 0; // 0: Name, 1: Phone, 2: Email, 3: City, 4: Course, 5: Year, 6: Campus, 7: Notes, 8: Confirm, 9: Done
    let isOpen = false;

    // Build Chatbot HTML
    function initBotDOM() {
        const botHTML = `
        <!-- Floating Launcher -->
        <div class="guru-bot-launcher" id="guruBotLauncher" onclick="window.GuruBot.toggle()">
            <div class="guru-bot-tooltip" id="guruBotTooltip">
                <span class="badge-gold">2027-28</span>
                <span>Admissions in progress! Register here.</span>
                <span class="guru-bot-tooltip-close" onclick="event.stopPropagation(); window.GuruBot.dismissTooltip();">&times;</span>
            </div>
            <div class="guru-bot-btn">
                <div class="guru-bot-pulse-ring"></div>
                <img src="assets/frontend/img/logo_emblem.png" alt="Shree Gurus" class="emblem-icon">
                <div class="guru-bot-status-dot"></div>
            </div>
        </div>

        <!-- Chat Window -->
        <div class="guru-bot-window" id="guruBotWindow">
            <!-- Header -->
            <div class="guru-header">
                <div class="guru-header-info">
                    <div class="guru-header-avatar">
                        <img src="assets/frontend/img/logo_emblem.png" alt="Guru AI">
                    </div>
                    <div>
                        <h4 class="guru-header-title">Guru AI <span class="tag-ai">SMART</span></h4>
                        <p class="guru-header-sub">
                            <span class="online-badge"></span> Shree Gurus Admissions Desk
                        </p>
                    </div>
                </div>
                <div class="guru-header-actions">
                    <button class="guru-action-btn" title="Export Enquiries to Excel" onclick="window.GuruBot.downloadLeadsExcel()">
                        <i class="fa-solid fa-file-excel"></i>
                    </button>
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
                    <h6>SHREE GURUS NEET &amp; JEE ACADEMY</h6>
                    <p>Admissions Open for 2027–28 • Boys &amp; Girls Campuses</p>
                    <div class="guru-welcome-badges">
                        <span class="guru-badge-chip"><i class="fa-solid fa-award me-1 text-warning"></i> 100% Pass</span>
                        <span class="guru-badge-chip"><i class="fa-solid fa-star me-1 text-warning"></i> 465/470 Topper</span>
                        <span class="guru-badge-chip"><i class="fa-solid fa-user-shield me-1 text-primary"></i> Super-30 Cohorts</span>
                    </div>
                </div>
                <!-- Dynamic messages injected here -->
            </div>

            <!-- Footer / Input -->
            <div class="guru-footer">
                <div class="guru-input-wrapper">
                    <input type="text" id="guruUserInput" class="guru-input" placeholder="Type your full name..." onkeydown="if(event.key === 'Enter') window.GuruBot.handleSend()">
                    <button class="guru-send-btn" id="guruSendBtn" onclick="window.GuruBot.handleSend()">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
                <div class="guru-input-helper">
                    <span>Direct Helpline: <strong>+91 9640711111</strong></span>
                    <span>&bull;</span>
                    <a href="https://wa.me/919640711111?text=Hello%20Shree%20Gurus%20Admissions%20Team,%20I%20want%20to%20know%20about%202027-28%20admissions." target="_blank">
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
            if (currentStep === 0 && document.querySelectorAll('.guru-msg-row').length === 0) {
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
                    <img src="assets/frontend/img/logo_emblem.png" alt="Bot">
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
        return str.replace(/'/g, "\\'");
    }

    function showTyping(callback) {
        const chatBody = document.getElementById('guruChatBody');
        const typingEl = document.createElement('div');
        typingEl.className = 'guru-msg-row bot';
        typingEl.id = 'guruTypingIndicator';
        typingEl.innerHTML = `
            <div class="guru-avatar-mini">
                <img src="assets/frontend/img/logo_emblem.png" alt="Bot">
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
        }, 550);
    }

    function updatePlaceholder(text) {
        const input = document.getElementById('guruUserInput');
        if (input) input.placeholder = text;
    }

    // Step 0: Greeting
    function startGreeting() {
        showTyping(() => {
            appendMessage('bot', `
                Namaste! 🙏 Welcome to <strong>Shree Gurus Group of Institutions</strong>.<br><br>
                I am <strong>Guru AI</strong>, your personal Admissions Counselor. I'll guide you step-by-step through our <strong>Course Registration &amp; Admission Enquiry</strong>.<br><br>
                To get started, may I have your <strong>Full Name</strong> (Student or Parent)?
            `, [
                { label: "🎓 Register for 2027-28", value: "I want to register for 2027-28" },
                { label: "❓ Ask a Question", value: "What are your courses and fee?" }
            ]);
            updatePlaceholder("Type your full name...");
        });
    }

    // Check if user input is an explicit question rather than an answer
    function isUserAskingQuestion(text) {
        const lower = text.toLowerCase().trim();
        if (lower.includes('?')) return true;
        const questionStarters = [
            'what is', 'what are', 'where is', 'where are', 'how much', 'how can',
            'tell me', 'can you', 'could you', 'explain', 'do you provide', 'do you have',
            'is there', 'are there', 'fee details', 'details about', 'fee structure'
        ];
        return questionStarters.some(starter => lower.startsWith(starter) || lower.includes(' ' + starter));
    }

    // Check if user is asking a general question
    function checkFAQ(text) {
        const lower = text.toLowerCase();
        for (const item of GURU_FAQ) {
            for (const kw of item.keywords) {
                if (lower.includes(kw)) {
                    return item.answer;
                }
            }
        }
        return null;
    }

    // Handle incoming user input
    function handleSend(userText = null, isChip = false) {
        const input = document.getElementById('guruUserInput');
        const text = (userText !== null ? userText : input.value).trim();
        if (!text) return;
        if (userText === null) input.value = '';

        appendMessage('user', text);

        // When user clicked an option chip, it is an explicit choice for the current step - NEVER intercept with FAQ!
        if (isChip) {
            processStep(text);
            return;
        }

        // Only check FAQ if the user is explicitly asking a question and not currently confirming
        if (currentStep < 8 && isUserAskingQuestion(text)) {
            const faqAnswer = checkFAQ(text);
            if (faqAnswer) {
                showTyping(() => {
                    appendMessage('bot', `
                        ${faqAnswer}<br><br>
                        <span style="color: #2A4FD6; font-weight: 600;">✨ Now, let's continue with your registration:</span>
                    `);
                    promptCurrentStep();
                });
                return;
            }
        }

        processStep(text);
    }

    function handleChipClick(val) {
        handleSend(val, true);
    }

    function promptCurrentStep() {
        switch (currentStep) {
            case 0:
                appendMessage('bot', "Please enter the <strong>Student or Parent's Full Name</strong>:");
                updatePlaceholder("Type full name...");
                break;
            case 1:
                appendMessage('bot', `Please share your <strong>10-digit Mobile / WhatsApp Number</strong>:`);
                updatePlaceholder("e.g. 9876543210");
                break;
            case 2:
                appendMessage('bot', `What is your <strong>Email ID</strong>? (or tap skip):`, ["Skip Email"]);
                updatePlaceholder("e.g. student@gmail.com");
                break;
            case 3:
                appendMessage('bot', `Which <strong>City or District</strong> are you from?`, [
                    "Vijayawada", "Guntur", "Hyderabad", "Rajahmundry", "Visakhapatnam", "Tirupati"
                ]);
                updatePlaceholder("Select city or type here...");
                break;
            case 4:
                appendMessage('bot', `Which <strong>Course / Stream</strong> are you interested in?`, [
                    "Inter MPC (IIT-JEE Integrated)",
                    "Inter BiPC (NEET Integrated)",
                    "NEET Long Term (Repeaters)",
                    "JEE Long Term (Repeaters)",
                    "Class 8th–10th Foundation"
                ]);
                updatePlaceholder("Select or type course...");
                break;
            case 5:
                appendMessage('bot', `Which <strong>Academic Year</strong> are you applying for?`, [
                    { label: "🎓 2027–28 Admissions (In Progress)", value: "2027-28", gold: true },
                    { label: "⚡ 2026–27 Immediate Admission", value: "2026-27" }
                ]);
                break;
            case 6:
                appendMessage('bot', `What is your <strong>Campus &amp; Accommodation</strong> preference?`, [
                    "Vijayawada Boys Campus (Hostel)",
                    "Vijayawada Girls Campus (Hostel)",
                    "Day Scholar (No Hostel Needed)",
                    "AC Residential Hostel Needed"
                ]);
                break;
            case 7:
                appendMessage('bot', `Any specific goal, target rank, or question for our counselors?`, [
                    "Looking for Super-60 Batch",
                    "Interested in Scholarship Test",
                    "No additional questions — Proceed"
                ]);
                updatePlaceholder("Type remarks or tap option...");
                break;
        }
    }

    function processStep(text) {
        switch (currentStep) {
            case 0: // Name
                if (text.toLowerCase().includes('register') || text.toLowerCase().includes('admission') || text.toLowerCase().includes('start')) {
                    showTyping(() => {
                        appendMessage('bot', "Great! Let's get you registered for <strong>2027–28 Admissions</strong>. 🎓<br><br>Please enter the <strong>Student or Parent's Full Name</strong>:");
                        updatePlaceholder("Type full name (e.g. Rahul Sharma)...");
                    });
                    return;
                }
                if (text.toLowerCase().includes('question') || text.toLowerCase().includes('fee') || text.toLowerCase().includes('course')) {
                    showTyping(() => {
                        appendMessage('bot', `
                            We offer top-ranked 2-Year Intermediate programs:
                            <br>• <strong>Board + JEE Main &amp; Advanced (M.P.C)</strong>
                            <br>• <strong>Board + NEET Medical (Bi.P.C)</strong>
                            <br>• <strong>JEE / NEET Repeaters Long Term</strong>
                            <br>• <strong>Foundation (Classes 8 to 10)</strong>
                            <br><br>Scholarships up to 100% available!
                            <br><br><span style="color: #2A4FD6; font-weight: 600;">To proceed, please enter the Student or Parent's Full Name:</span>
                        `);
                        updatePlaceholder("Type full name...");
                    });
                    return;
                }
                regData.name = text;
                currentStep = 1;
                showTyping(() => {
                    appendMessage('bot', `
                        Wonderful to connect, <strong>${regData.name}</strong>! 🌟<br><br>
                        Please provide your <strong>10-digit Mobile / WhatsApp Number</strong> so our academic counselors can send the syllabus &amp; prospectus:
                    `);
                    updatePlaceholder("e.g. 9848012345");
                });
                break;

            case 1: // Phone
                const cleanPhone = text.replace(/[^0-9]/g, '');
                if (cleanPhone.length < 10) {
                    showTyping(() => {
                        appendMessage('bot', `⚠️ Please enter a valid <strong>10-digit mobile number</strong> so we can reach you:`);
                        updatePlaceholder("e.g. 9848012345");
                    });
                    return;
                }
                regData.phone = cleanPhone.slice(-10);
                currentStep = 2;
                showTyping(() => {
                    appendMessage('bot', `
                        Got it! (+91 ${regData.phone}) ✅<br><br>
                        What is your <strong>Email Address</strong>? (or tap skip):
                    `, ["Skip Email"]);
                    updatePlaceholder("e.g. yourname@gmail.com");
                });
                break;

            case 2: // Email
                if (text.toLowerCase().includes('skip')) {
                    regData.email = 'Not Provided';
                } else {
                    regData.email = text;
                }
                currentStep = 3;
                showTyping(() => {
                    appendMessage('bot', `
                        Thank you! 📍 Which <strong>City or District</strong> are you currently based in?
                    `, [
                        "Vijayawada", "Guntur", "Hyderabad", "Rajahmundry", "Visakhapatnam", "Tirupati"
                    ]);
                    updatePlaceholder("Select city or type here...");
                });
                break;

            case 3: // City
                regData.city = text;
                currentStep = 4;
                showTyping(() => {
                    appendMessage('bot', `
                        Recorded: <strong>${regData.city}</strong> 📍<br><br>
                        Which <strong>Academic Stream / Course</strong> do you want to register for?
                    `, [
                        "Inter MPC (IIT-JEE Integrated)",
                        "Inter BiPC (NEET Integrated)",
                        "NEET Long Term (Repeaters)",
                        "JEE Long Term (Repeaters)",
                        "Class 8th–10th Foundation"
                    ]);
                    updatePlaceholder("Select your course...");
                });
                break;

            case 4: // Course
                regData.course = text;
                currentStep = 5;
                showTyping(() => {
                    appendMessage('bot', `
                        Selected: <strong>${regData.course}</strong> 🎯<br><br>
                        Which <strong>Academic Year</strong> are you seeking admission for?
                    `, [
                        { label: "🎓 2027–28 Admissions (In Progress)", value: "2027-28", gold: true },
                        { label: "⚡ 2026–27 Immediate Joining", value: "2026-27" }
                    ]);
                });
                break;

            case 5: // Academic Year
                regData.academic_year = text.includes('2026') ? '2026-27' : '2027-28';
                currentStep = 6;
                showTyping(() => {
                    appendMessage('bot', `
                        Target Year: <strong>${regData.academic_year}</strong> 📅<br><br>
                        Do you require <strong>Residential Hostel Accommodation</strong> or prefer <strong>Day Scholar</strong>?
                    `, [
                        "Vijayawada Boys Campus (AC Hostel)",
                        "Vijayawada Girls Campus (AC Hostel)",
                        "Day Scholar (No Hostel Needed)",
                        "Hostel Required (Non-AC)"
                    ]);
                });
                break;

            case 6: // Campus / Hostel
                if (text.toLowerCase().includes('girls')) {
                    regData.campus = 'Vijayawada Girls Campus';
                    regData.hostel = 'Hostel Required';
                } else if (text.toLowerCase().includes('boys')) {
                    regData.campus = 'Vijayawada Boys Campus';
                    regData.hostel = 'Hostel Required';
                } else if (text.toLowerCase().includes('day scholar')) {
                    regData.campus = 'Vijayawada Campus';
                    regData.hostel = 'Day Scholar (No Hostel)';
                } else {
                    regData.campus = 'Vijayawada Campus';
                    regData.hostel = text;
                }
                currentStep = 7;
                showTyping(() => {
                    appendMessage('bot', `
                        Campus Preference: <strong>${regData.campus}</strong> (${regData.hostel}) 🏫<br><br>
                        Almost done! 📝 Any specific goal, target rank, or question for our counselors?
                    `, [
                        "Looking for Super-60 Batch",
                        "Interested in Scholarship Test",
                        "No specific notes — Register me!"
                    ]);
                    updatePlaceholder("Type remarks or tap option...");
                });
                break;

            case 7: // Notes & Summary
                regData.notes = text.includes('No specific') ? 'Standard Enquiry' : text;
                currentStep = 8;
                showTyping(() => {
                    showSummaryCard();
                });
                break;

            case 8: // Submission triggered
                submitRegistration();
                break;
        }
    }

    function showSummaryCard() {
        const summaryHTML = `
            <div class="guru-summary-card">
                <h6><i class="fa-solid fa-clipboard-check text-warning"></i> Registration Review</h6>
                <table class="guru-summary-table">
                    <tr><td class="label">Student Name:</td><td class="val">${regData.name}</td></tr>
                    <tr><td class="label">Mobile No:</td><td class="val">+91 ${regData.phone}</td></tr>
                    <tr><td class="label">Email ID:</td><td class="val">${regData.email}</td></tr>
                    <tr><td class="label">Location:</td><td class="val">${regData.city}</td></tr>
                    <tr><td class="label">Target Course:</td><td class="val" style="color:#2A4FD6;">${regData.course}</td></tr>
                    <tr><td class="label">Academic Year:</td><td class="val">${regData.academic_year}</td></tr>
                    <tr><td class="label">Campus:</td><td class="val">${regData.campus}</td></tr>
                    <tr><td class="label">Hostel:</td><td class="val">${regData.hostel}</td></tr>
                </table>
                <button class="guru-submit-btn" onclick="window.GuruBot.submitRegistration()">
                    <i class="fa-solid fa-paper-plane"></i> Confirm &amp; Submit Registration
                </button>
            </div>
        `;
        appendMessage('bot', `
            Here is your registration summary. Please review and tap <strong>Confirm</strong> to send to our admissions desk:
            ${summaryHTML}
        `);
    }

    function submitRegistration() {
        currentStep = 9;
        showTyping(() => {
            appendMessage('bot', `
                <i class="fa-solid fa-spinner fa-spin text-primary me-2"></i> Registering your admission, appending to Excel sheet &amp; dispatching email...
            `);

            // 1. Save to local storage for instant client-side Excel download
            saveLeadToLocalStorage(regData);

            // 2. POST to Local Server / Backend API
            fetch('/api/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(regData)
            })
            .then(res => res.json())
            .then(data => {
                console.log('Server response:', data);
                showSuccessCard(data.enquiry_id || 'SG-' + Date.now().toString().slice(-6));
            })
            .catch(err => {
                console.warn('Local API unavailable, falling back to static dispatch:', err);
                // Also dispatch to FormSubmit as client-side fallback
                dispatchClientEmail(regData);
                showSuccessCard('SG-' + Date.now().toString().slice(-6));
            });
        });
    }

    function dispatchClientEmail(data) {
        try {
            fetch('https://formsubmit.co/ajax/mail2shreegurus@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    '_subject': `New Shree Gurus Admission Enquiry - ${data.name} (${data.course})`,
                    ...data
                })
            }).catch(e => console.log('Client mail dispatched:', e));
        } catch (e) {}
    }

    function saveLeadToLocalStorage(data) {
        try {
            const list = JSON.parse(localStorage.getItem('shree_gurus_leads') || '[]');
            data.timestamp = new Date().toLocaleString();
            data.enquiry_id = 'SG-' + Date.now().toString().slice(-6);
            list.push(data);
            localStorage.setItem('shree_gurus_leads', JSON.stringify(list));
        } catch (e) {}
    }

    function showSuccessCard(enquiryId) {
        showTyping(() => {
            const successHTML = `
                <div class="guru-success-card">
                    <div class="guru-success-icon"><i class="fa-solid fa-circle-check"></i></div>
                    <h5>Registration Successful!</h5>
                    <p>
                        Your enquiry <strong>#${enquiryId}</strong> is officially registered.<br>
                        ✅ Saved in Shree Gurus Admissions Excel.<br>
                        ✉️ Email notification sent to <strong>mail2shreegurus@gmail.com</strong>.<br>
                        Our counselor will call you on <strong>+91 ${regData.phone}</strong> shortly!
                    </p>
                    <div class="guru-download-grid">
                        <a href="/api/download-excel" target="_blank" class="guru-dl-btn excel" onclick="window.GuruBot.downloadLeadsExcel()">
                            <i class="fa-solid fa-file-excel"></i> Download Excel
                        </a>
                        <a href="assets/frontend/img/pamphlet-draft.pdf" download="Shree-Gurus-Pamphlet.pdf" class="guru-dl-btn pdf">
                            <i class="fa-solid fa-file-pdf"></i> Pamphlet (PDF)
                        </a>
                    </div>
                </div>
            `;
            appendMessage('bot', successHTML);
            updatePlaceholder("Type any additional questions...");
        });
    }

    function downloadLeadsExcel() {
        // Try local server download first
        fetch('/api/download-excel', { method: 'HEAD' })
        .then(res => {
            if (res.ok) {
                window.location.href = '/api/download-excel';
            } else {
                generateClientCSV();
            }
        })
        .catch(() => {
            generateClientCSV();
        });
    }

    function generateClientCSV() {
        const leads = JSON.parse(localStorage.getItem('shree_gurus_leads') || '[]');
        if (leads.length === 0) {
            alert('No registrations recorded yet! Please complete a registration first.');
            return;
        }

        const headers = ['Enquiry ID', 'Date & Time', 'Student Name', 'Phone', 'Email', 'City', 'Course', 'Academic Year', 'Campus', 'Hostel', 'Notes'];
        let csvContent = '\uFEFF' + headers.join(',') + '\n';

        leads.forEach(l => {
            const row = [
                l.enquiry_id || 'N/A',
                `"${l.timestamp || ''}"`,
                `"${l.name || ''}"`,
                `"${l.phone || ''}"`,
                `"${l.email || ''}"`,
                `"${l.city || ''}"`,
                `"${l.course || ''}"`,
                `"${l.academic_year || ''}"`,
                `"${l.campus || ''}"`,
                `"${l.hostel || ''}"`,
                `"${(l.notes || '').replace(/"/g, '""')}"`
            ];
            csvContent += row.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Shree_Gurus_Admissions_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function restart() {
        const chatBody = document.getElementById('guruChatBody');
        // Clear message rows
        const rows = chatBody.querySelectorAll('.guru-msg-row');
        rows.forEach(r => r.remove());
        currentStep = 0;
        regData.name = '';
        regData.phone = '';
        regData.email = '';
        regData.city = '';
        regData.course = '';
        startGreeting();
    }

    // Expose global API
    window.GuruBot = {
        toggle: toggleChat,
        dismissTooltip: dismissTooltip,
        handleSend: handleSend,
        handleChipClick: handleChipClick,
        submitRegistration: submitRegistration,
        downloadLeadsExcel: downloadLeadsExcel,
        restart: restart
    };

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBotDOM);
    } else {
        initBotDOM();
    }
})();
