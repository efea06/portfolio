/*
 * Chatbot knowledge base. Edit this file to change what the chatbot says.
 *
 * Each intent has:
 *   id        unique name, used by "next" and "starters"
 *   q         the question shown on the suggestion button (optional)
 *   keywords  words and phrases that trigger this intent
 *               "word"      matches that word (plurals are handled)
 *               "commun*"   matches any word that starts with "commun"
 *               "two words" matches that exact phrase
 *               "word^4"    sets the weight (default 2 for words, 4 for phrases; a match needs 2+ to win)
 *   generic   true for broad topics. A specific intent always wins over a generic one.
 *   answer    the reply, as HTML
 *   next      up to 3 intent ids to offer as follow-up questions
 *
 * When two intents tie, the one listed first wins.
 */
(function () {
  var C = window.SITE_CONFIG;
  var RESUME = "assets/Efe_Ahworegba_Resume.pdf";
  var LINKEDIN = "https://www.linkedin.com/in/efe-a-b9727723b";

  window.PORTFOLIO_KB = {
    intro: "Hi! This is an automated chat that answers questions about my background, using what's on my resume. Pick a question below or type your own.",

    starters: ["communication", "security", "molson", "projects_overview", "education", "contact"],

    fallback: {
      answer: "<p>I don't have an answer for that one. I can talk about my experience, skills, projects, education, and how to reach me. For anything else, <a href=\"#contact\">send me a message</a> and I'll reply by email.</p>",
      next: ["experience_overview", "skills_overview", "contact"]
    },

    intents: [
      /* ---------- Conversation basics ---------- */
      {
        id: "greeting", generic: true, maxTokens: 5,
        keywords: ["hi", "hello", "hey", "howdy", "good morning", "good afternoon", "good evening", "whats up", "yo"],
        answer: "<p>Hi! What would you like to know about my background?</p>",
        next: ["about", "experience_overview", "projects_overview"]
      },
      {
        id: "thanks", generic: true, maxTokens: 5,
        keywords: ["thanks", "thank*", "appreciate"],
        answer: "<p>You're welcome! Anything else you'd like to know?</p>",
        next: ["contact", "resume"]
      },
      {
        id: "bye", generic: true, maxTokens: 5,
        keywords: ["bye", "goodbye", "see you", "talk later", "gotta go"],
        answer: "<p>Thanks for stopping by. If you'd like to follow up, my <a href=\"#contact\">contact details</a> are here.</p>",
        next: ["resume"]
      },
      {
        id: "help", generic: true,
        keywords: ["help", "what can you do", "what can i ask", "what should i ask", "topics", "options", "menu"],
        answer: "<p>You can ask me about:</p><ul><li>Communication, leadership, teamwork, and problem-solving</li><li>My jobs and internships</li><li>Cybersecurity skills and tools</li><li>Projects and competitions</li><li>Education and honors</li><li>My resume and how to contact me</li></ul>",
        next: ["communication", "experience_overview", "projects_overview"]
      },

      /* ---------- Soft skills ---------- */
      {
        id: "communication", q: "What experience do you have with communication?",
        keywords: ["communicat*", "public speaking", "speak*", "soft skill", "interpersonal", "articulat*", "writing skill", "presenting", "present to"],
        answer: "<p>Communication is a big part of what I do. As a Supplemental Instructor at Bowie State, I give 20 hours of weekly instruction and lab support in cybersecurity, walking students through tools like Wireshark and topics like Active Directory security. That work has contributed to a 14% increase in average test scores.</p><p>I've also presented Bowie State research and Interledger initiatives to global technology leaders in Mexico City, taught financial literacy at HBCUs, and pitched PadiSave in the Bulldog Pitch Competition. In IT roles I've written remote-service scenario guides and manuals that lay out troubleshooting and escalation steps.</p>",
        next: ["supplemental", "conferences", "leadership"]
      },
      {
        id: "leadership", q: "What leadership experience do you have?",
        keywords: ["leader*", "lead", "led", "mentor*", "organiz*", "organis*", "initiative*", "volunteer*", "community service^4", "mlt^4", "management leadership^4", "fellow*", "take charge"],
        answer: "<p>I'm the Student Lead of the Interledger Impact Team, where we travel to HBCUs to teach financial literacy and open payments. I'm also a Career Prep Fellow in Management Leadership for Tomorrow (MLT), an Executive Leadership Council Scholar, and a Breakthrough Tech AI Fellow.</p><p>Through the Bowie State Honors Program I organized a campus-wide toiletries drive supporting women's shelters in the DMV area, and I founded PadiSave.</p>",
        next: ["interledger", "padisave", "honors"]
      },
      {
        id: "teamwork", q: "How do you work with a team?",
        keywords: ["team*", "collaborat*", "cooperat*", "work together", "work with others", "group", "colleague*", "coworker*"],
        answer: "<p>At Molson Coors I collaborated with the IT Security team on enterprise identity and access management work. At Del Cor Technologies I shadow IT engineers on on-site and remote service operations, and I've done AI/ML research in the Women in Computer Science research cluster under faculty and senior student mentorship.</p><p>As a Supplemental Instructor I also work with students directly in lab sessions.</p>",
        next: ["molson", "delcor", "supplemental"]
      },
      {
        id: "problem_solving", q: "How do you approach problem-solving?",
        keywords: ["problem*", "troubleshoot*", "solv*", "critical thinking", "analytic*", "incident*", "triage", "debug*", "challenge*"],
        answer: "<p>I like to diagnose an issue, fix it, and then document it so it's repeatable. At Molson Coors I reviewed and remediated 16,000+ Active Directory service accounts and supported SAP account debugging. At Del Cor Technologies and My Prestige Healthcare I built response scenarios for common malfunctions and wrote triage guides, and I reviewed findings from internal audits.</p><p>My Molson Coors &times; TMCF case competition solution placed 2nd, with recognition for innovation and problem-solving.</p>",
        next: ["molson", "competitions", "delcor"]
      },

      /* ---------- Jobs ---------- */
      {
        id: "supplemental", q: "What do you do as a Supplemental Instructor?",
        keywords: ["supplemental^4", "instruct*", "tutor*", "teach*", "lab support", "test score*", "si leader", "professor", "class", "classes"],
        answer: "<p>Since December 2025 I've been a Supplemental Instructor for Cybersecurity at Bowie State University. I provide 20 hours of weekly instruction and lab support in intrusion prevention, threat detection, and network security, using Linux, Windows Server, and network-monitoring tools.</p><p>I guide students through Wireshark analysis, vulnerability identification, Active Directory security, system hardening, and network forensics, contributing to a 14% increase in average test scores.</p>",
        next: ["communication", "security", "education"]
      },
      {
        id: "molson", q: "What did you do at Molson Coors?",
        keywords: ["molson^4", "coors^4", "password*", "blacklist", "sap", "it security intern^4", "intern*", "summer"],
        answer: "<p>In summer 2026 (May to August) I was an IT Security Intern at Molson Coors in Milwaukee. I:</p><ul><li>Developed a password blacklist with 900+ terms to strengthen enterprise password security</li><li>Reviewed and remediated 16,000+ Active Directory service accounts, improving identity management and reducing licensing costs</li><li>Supported SAP account debugging to improve secure user access</li><li>Collaborated with IT Security teams on identity and access management initiatives</li></ul>",
        next: ["iam", "delcor", "competitions"]
      },
      {
        id: "delcor", q: "What are you doing at Del Cor Technologies?",
        keywords: ["del cor^4", "delcor^4", "shadow*", "consulting", "it solutions", "silver spring", "dispatch*"],
        answer: "<p>Since August 2026 I've been an IT Solutions Consulting Shadow at Del Cor Technologies in Silver Spring, MD. I shadow IT engineers on on-site and remote service operations, help develop standardized dispatch plans and response scenarios, review internal audit findings, and write remote-service scenario guides covering troubleshooting, escalation, and resolution.</p>",
        next: ["prestige", "problem_solving", "molson"]
      },
      {
        id: "prestige", q: "What was your role at My Prestige Healthcare?",
        keywords: ["my prestige^4", "prestige^4", "healthcare", "health care", "apprentice*", "it administrator", "administrator", "laurel"],
        answer: "<p>From September 2024 to February 2025 I was an Apprentice IT Administrator at My Prestige Healthcare in Laurel, MD. I oversaw on-site IT engineer dispatch plans with pre-defined response scenarios for common malfunctions, reviewed deficiencies found in internal audits and suggested remedies, and created remote-service manuals that define appropriate triage.</p>",
        next: ["delcor", "problem_solving", "experience_overview"]
      },

      /* ---------- Education and honors ---------- */
      {
        id: "education", q: "Where did you study?",
        keywords: ["education", "degree", "school", "universit*", "college", "gpa", "grade*", "bowie", "major", "computer technology", "coursework", "course*", "graduat*", "bachelor*", "study*", "student", "academic*", "learn*"],
        answer: "<p>I'm pursuing a B.S. in Computer Technology (Cybersecurity Track) at Bowie State University, with a 4.00 GPA and an expected graduation in December 2027.</p><p>Relevant coursework includes Database Management &amp; Development, Linux OS, Client OS, Network Security, and Methods of Intrusion Prevention and Detection.</p>",
        next: ["honors", "supplemental", "security"]
      },
      {
        id: "honors", q: "What honors and scholarships have you received?",
        keywords: ["honor*", "award*", "scholar*", "dean*", "achievement*", "recogni*", "distinction*", "tmcf", "delegate", "elc^4", "executive leadership council^4", "procter", "proctor"],
        answer: "<p>I'm a Bowie State Honors Scholar and on the Dean's List. I've been named a TMCF Scholar, Maryland Delegate Scholar, Procter &amp; Gamble Scholar, and Executive Leadership Council (ELC) Scholar. My Molson Coors &times; TMCF case competition solution earned 2nd place.</p>",
        next: ["education", "competitions", "leadership"]
      },

      /* ---------- Technical topics ---------- */
      {
        id: "iam", q: "What is your identity and access management experience?",
        keywords: ["active directory^4", "identity^4", "iam^4", "access management^4", "service account^4", "user access", "ad ds", "permission*", "account*"],
        answer: "<p>Identity and access management is a focus of my work. At Molson Coors I reviewed and remediated 16,000+ Active Directory service accounts, built a 900+ term password blacklist, and supported SAP account debugging.</p><p>I also built an AD DS environment with DNS/DHCP in my enterprise multi-VM lab, and I teach Active Directory security as a Supplemental Instructor.</p>",
        next: ["molson", "multivm", "security"]
      },
      {
        id: "security", q: "Tell me about your cybersecurity experience.",
        keywords: ["security", "cyber*", "wireshark", "nessus", "nmap", "intrusion", "forensic*", "threat*", "vulnerab*", "harden*", "network security", "defen*", "hack*", "pentest*", "penetration", "tools"],
        answer: "<p>My focus is defense and detection. I've worked with Wireshark, Nessus, and Nmap, and my skills include intrusion detection, network forensics, Active Directory security, and system hardening.</p><p>I teach these topics as a Supplemental Instructor, applied identity security at Molson Coors, and built a 6-machine enterprise network simulation with segmentation and hardening.</p>",
        next: ["supplemental", "iam", "multivm"]
      },
      {
        id: "cloud", q: "Do you have cloud experience?",
        keywords: ["azure", "aws", "cloud", "amazon web services", "microsoft azure"],
        answer: "<p>Azure and AWS are both on my skills list, alongside Windows Server and Linux. My resume highlights hands-on work in identity and network security more than cloud projects, so if cloud is a priority for your role, <a href=\"#contact\">send me a message</a> and I'll share more.</p>",
        next: ["skills_overview", "iam", "contact"]
      },
      {
        id: "programming", q: "What programming languages do you know?",
        keywords: ["python", "java", "sql", "cod*", "program*", "software", "develop*", "database*", "programming language^4", "script*"],
        answer: "<p>I work in Python, Java, and SQL. My coursework includes Database Management &amp; Development. For technical projects, see my <a href=\"" + C.githubUrl + "\" target=\"_blank\" rel=\"noopener\">GitHub</a>.</p>",
        next: ["projects_overview", "skills_overview", "research"]
      },
      {
        id: "research", q: "Have you done any AI or ML research?",
        keywords: ["ai", "ml", "machine learning", "artificial intelligence", "research*", "women in computer science", "wics", "breakthrough^4", "data science"],
        answer: "<p>Yes. I conducted AI/ML research in the Women in Computer Science AI/ML Research Cluster, under faculty and senior student mentorship, and I'm a Breakthrough Tech AI Fellow.</p>",
        next: ["leadership", "programming", "education"]
      },

      /* ---------- Projects ---------- */
      {
        id: "padisave", q: "What is PadiSave?",
        keywords: ["padisave^4", "padi save^4", "fintech", "financial*", "credit", "trust score*", "savings", "founder", "startup", "entrepreneur*", "open payments^4"],
        answer: "<p>PadiSave is a financial inclusion and credit platform that I founded. It's an open payments fintech solution designed to build savings history, trust scores, and access for underserved communities.</p><p>I presented it as a finalist in Bowie State's Bulldog Pitch Competition, up against graduate student teams.</p>",
        next: ["competitions", "interledger", "projects_overview"]
      },
      {
        id: "multivm", q: "Tell me about your enterprise network project.",
        keywords: ["multi vm^4", "multivm^4", "vm*", "virtual machine*", "vha", "eas", "home lab", "network simulation", "dns", "dhcp", "segmentation", "enterprise network*", "virtual*"],
        answer: "<p>The Enterprise Multi-VM Network is a 6-machine Windows and Ubuntu environment that simulates a VHA EAS setup. It includes AD DS, DNS/DHCP, network segmentation, and system hardening.</p><p>You can find it on my <a href=\"" + C.githubUrl + "\" target=\"_blank\" rel=\"noopener\">GitHub</a> or in the <a href=\"#projects\">Projects</a> section.</p>",
        next: ["iam", "security", "projects_overview"]
      },
      {
        id: "competitions", q: "What competitions have you been in?",
        keywords: ["competition*", "case competition^4", "innovation case^4", "second place", "2nd place", "pitch*", "bulldog", "finalist*", "won", "win", "placed", "contest*", "hackathon*"],
        answer: "<p>I placed 2nd in the Molson Coors &times; TMCF Innovation Case Competition, a national challenge where I presented a tech solution and was recognized for innovation and problem-solving.</p><p>I was also a finalist in Bowie State's Bulldog Pitch Competition, where I presented PadiSave against graduate student teams.</p>",
        next: ["padisave", "communication", "honors"]
      },
      {
        id: "interledger", q: "What is the Interledger work you do?",
        keywords: ["interledger^4", "financial literacy^4", "hbcu*", "mexico*", "impact team", "ethical payments", "payments"],
        answer: "<p>I'm the Student Lead on the Interledger Impact Team. We partner with the Interledger Foundation and travel to HBCUs to teach financial literacy and open payments.</p><p>I was also invited to Mexico City to present Bowie State research and Interledger initiatives to global technology leadership, and I engaged with the CTO on ethical payments innovation.</p>",
        next: ["conferences", "padisave", "leadership"]
      },
      {
        id: "conferences", q: "What conferences have you attended?",
        keywords: ["conference*", "presentations", "mexico city^4", "tech trek^4", "leadership institute^4", "thurgood^4", "california", "travel*", "invited", "convening"],
        answer: "<p>I've been invited to three events:</p><ul><li>The Interledger Foundation in Mexico City, where I presented Bowie State research and Interledger initiatives</li><li>The Thurgood Marshall College Fund Leadership Institute, as an invited scholar representing Bowie State University</li><li>The Management Leadership for Tomorrow Tech Trek in California, a technology immersion experience with industry leaders</li></ul>",
        next: ["interledger", "communication", "leadership"]
      },

      /* ---------- Practical ---------- */
      {
        id: "resume", q: "Can I see your resume?",
        keywords: ["resume", "cv", "download", "curriculum vitae", "pdf"],
        answer: "<p>You can view or download my resume in the <a href=\"#resume\">Resume</a> section, or <a href=\"" + RESUME + "\" download>download the PDF directly</a>.</p>",
        next: ["contact", "experience_overview"]
      },
      {
        id: "contact", q: "How can I contact you?",
        keywords: ["contact*", "email", "e mail", "reach*", "get in touch", "linkedin", "phone", "message", "talk to you", "connect", "interview*", "schedul*", "meeting", "call"],
        answer: "<p>Email is quickest: <a href=\"mailto:" + C.email + "\">" + C.email + "</a>. You can also find me on <a href=\"" + LINKEDIN + "\" target=\"_blank\" rel=\"noopener\">LinkedIn</a> or use the <a href=\"#contact\">contact form</a>.</p>",
        next: ["resume", "availability"]
      },
      {
        id: "availability", q: "Are you available for work or an internship?",
        keywords: ["availab*^3", "start date", "open to", "looking for", "seeking", "full time", "part time", "relocat*", "remote", "authorization", "authorized", "visa", "sponsor*", "citizen*", "hiring", "opportunit*"],
        answer: "<p>I'm graduating in December 2027, and I'm currently working as a Supplemental Instructor and an IT consulting shadow. For availability, start dates, or work authorization, please <a href=\"#contact\">contact me directly</a> so I can give you an accurate answer.</p>",
        next: ["contact", "resume", "why_hire"]
      },
      {
        id: "location", q: "Where are you located?",
        keywords: ["where are you", "located", "location", "based", "where do you live", "live"],
        answer: "<p>I study in Bowie, Maryland, and my current role at Del Cor Technologies is in Silver Spring, Maryland.</p>",
        next: ["availability", "contact"]
      },
      {
        id: "certifications", q: "Do you have any certifications?",
        keywords: ["certif*", "comptia", "security+", "cissp", "ccna", "license*", "credential*"],
        answer: "<p>Certifications aren't listed on my resume right now. My credentials are my Cybersecurity track degree, a 4.00 GPA, and hands-on work in instruction, identity security, and IT operations. If a certification matters for your role, <a href=\"#contact\">message me</a> and I'll tell you where I stand.</p>",
        next: ["education", "experience_overview", "contact"]
      },
      {
        id: "github", q: "Where can I see your code?",
        keywords: ["github^3", "repo*", "repositor*", "source code", "code sample*", "git"],
        answer: "<p>My repositories are on <a href=\"" + C.githubUrl + "\" target=\"_blank\" rel=\"noopener\">GitHub</a>, and the <a href=\"#projects\">Projects</a> section links to each project.</p>",
        next: ["projects_overview", "multivm"]
      },
      {
        id: "why_hire", q: "Why should I hire you?",
        keywords: ["why hire^4", "why should^4", "hire", "strength*", "stand out", "best fit", "unique", "good fit"],
        answer: "<p>Here's what my record shows: a 4.00 GPA in a cybersecurity program, a 14% increase in average test scores as an instructor, 16,000+ Active Directory accounts remediated at Molson Coors, and a 2nd place finish in a national case competition.</p><p>I'm also comfortable in front of an audience, from leading lab sessions to presenting in Mexico City. Take a look at my <a href=\"#resume\">resume</a>, or <a href=\"#contact\">message me</a> to talk it through.</p>",
        next: ["experience_overview", "communication", "contact"]
      },
      {
        id: "site_meta", q: "How was this site and chatbot built?",
        keywords: ["this site", "this website", "built this", "how was this", "chatbot", "chat bot", "bot", "qr", "qr code", "how do you work", "framework*"],
        answer: "<p>This site is built with plain HTML, CSS, and JavaScript, with no frameworks. The chatbot is rule-based: it matches your question against a knowledge base written from my resume, and everything runs in your browser. The QR code links to this site and is also printed on my resume. The <a href=\"" + C.sourceUrl + "\" target=\"_blank\" rel=\"noopener\">source code</a> is on GitHub.</p>",
        next: ["github", "resume"]
      },

      /* ---------- Broad topics (generic): only used when nothing more specific matches ---------- */
      {
        id: "about", generic: true, q: "Tell me about yourself.",
        keywords: ["about you", "about yourself", "yourself", "who are you", "who is efe", "efe^1", "introduce*", "summary", "background", "bio", "overview", "intro"],
        answer: "<p>I'm a Computer Technology student on the Cybersecurity track at Bowie State University, with a 4.00 GPA, graduating in December 2027. I teach network security as a Supplemental Instructor, I've worked in IT security at Molson Coors, and I'm now shadowing IT consulting at Del Cor Technologies. I also founded PadiSave, a fintech idea for underserved communities.</p><p>The <a href=\"#about\">About</a> section has the full picture.</p>",
        next: ["experience_overview", "projects_overview", "skills_overview"]
      },
      {
        id: "skills_overview", generic: true, q: "What are your technical skills?",
        keywords: ["skill*", "tech*", "technolog*", "tech stack", "proficien*", "good at", "expertise"],
        answer: "<p>My technical skills include Azure, AWS, Python, Java, SQL, Active Directory, Windows Server, and Linux and Windows. On the security side I use Wireshark, Nessus, and Nmap, and I work in intrusion detection and network forensics. I also focus on ethical and financial technology applications.</p>",
        next: ["security", "programming", "cloud"]
      },
      {
        id: "projects_overview", generic: true, q: "What projects have you built?",
        keywords: ["project*", "portfolio", "built"],
        answer: "<p>My main projects are:</p><ul><li><strong>PadiSave</strong>, a financial inclusion and credit platform I founded</li><li><strong>Enterprise Multi-VM Network</strong>, a 6-machine Windows and Ubuntu enterprise simulation</li><li><strong>Molson Coors &times; TMCF Innovation Case Competition</strong>, where I placed 2nd</li><li><strong>Bulldog Pitch Competition</strong>, where I was a finalist</li></ul><p>See the <a href=\"#projects\">Projects</a> section for details and links.</p>",
        next: ["padisave", "multivm", "competitions"]
      },
      {
        id: "experience_overview", generic: true, q: "What is your work experience?",
        keywords: ["work experience^4", "experience^2", "work*", "job*", "employ*", "career", "professional", "worked", "history", "roles", "role"],
        answer: "<p>I've held four roles:</p><ul><li><strong>Supplemental Instructor, Cybersecurity</strong> at Bowie State University (Dec 2025 to present)</li><li><strong>IT Solutions Consulting Shadow</strong> at Del Cor Technologies (Aug 2026 to present)</li><li><strong>IT Security Intern</strong> at Molson Coors (May to Aug 2026)</li><li><strong>Apprentice IT Administrator</strong> at My Prestige Healthcare (Sep 2024 to Feb 2025)</li></ul><p>Ask about any of them for details.</p>",
        next: ["supplemental", "molson", "delcor"]
      }
    ]
  };
})();
