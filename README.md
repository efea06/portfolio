# Efe Ahworegba | Portfolio

Personal portfolio for Efe Ahworegba, a Cybersecurity track student at Bowie State University. Built with plain HTML, CSS, and JavaScript. No frameworks, no build step.

**Live site:** https://efea06.github.io/portfolio/
**Repository:** https://github.com/efea06/portfolio

## Navigating the site

Use the links at the top of the page, or scroll. The header stays in view, and the moon/sun button switches between light and dark mode. On phones, the links collapse into a **Menu** button.

| Section | What's there |
| --- | --- |
| **Home** | Introduction, a button to download the resume, and a QR code that opens the site |
| **About** | Bio, experience, education and honors, skills, leadership and service, presentations and conferences |
| **Projects** | PadiSave, Enterprise Multi-VM Network, and the two competitions, with links to their GitHub repositories |
| **Resume** | Preview of the resume, a download button, and a QR code |
| **Contact** | Message form, plus direct email, LinkedIn, and GitHub links |

The **Ask about me** button (bottom right, on every page) opens the chatbot.

## How the chatbot works

The chatbot is rule-based and runs entirely in the browser. It needs no server, API key, or third-party service, and it only answers from the knowledge base, so it can't make things up.

1. **Knowledge base** (`js/knowledge.js`): a list of *intents*. Each intent has a topic (for example "communication" or "Molson Coors"), the keywords and phrases that trigger it, a written answer, and a few suggested follow-up questions.
2. **Matching** (`js/chatbot.js`): the visitor's question is lowercased, stripped of punctuation, and split into words. Each intent is scored by how many of its keywords appear.
   - A plain word matches that word (plurals are handled).
   - `commun*` matches any word starting with "commun".
   - A multi-word phrase such as `active directory` matches only that phrase and is weighted higher.
   - `word^4` sets a custom weight.
3. **Specific beats generic.** Broad intents (overview, greetings) are used only when no specific intent scores. This is why "What experience do you have with communication?" returns the communication answer (supplemental instruction, presentations) rather than the general list of jobs.
4. **Fallback.** If nothing scores 2 or more, the chatbot says it doesn't know and suggests topics it can answer.
5. **Interface.** Suggested-question buttons let visitors click instead of type. The panel is keyboard accessible (Esc closes it) and respects reduced-motion settings.

### Editing the chatbot

Open `js/knowledge.js` and edit an intent's `answer` or `keywords`. To add a topic, copy an existing intent, give it a unique `id`, and add its `id` to another intent's `next` list so it appears as a suggestion. If two intents tie, the one listed first wins.

## Setup

### 1. Fill in your links: `js/config.js`

```js
githubUsername: "efea06",   // your GitHub username
siteRepo: "portfolio",             // the repository that holds this site
projectRepos: { padisave: "padisave", multivm: "enterprise-multi-vm-network" },  // "" hides a project's GitHub link
formspreeId: "YOUR_FORM_ID",       // see step 3
```

### 2. Regenerate the QR code and resume

The QR code and the stamped resume depend on your live URL. After you know it, run this from the repository root:

```bash
pip install reportlab pypdf pillow pypdfium2
python tools/make_qr.py https://efea06.github.io/portfolio/
```

This rewrites `assets/qr.svg`, `assets/qr.png`, `assets/Efe_Ahworegba_Resume.pdf` (the resume with the QR code in its top-right corner), and `assets/resume-preview.png`. To update your resume later, replace `tools/resume-original.pdf` and run the command again.

### 3. Contact form (optional, free)

A static site can't send email by itself, so the form uses [Formspree](https://formspree.io).

1. Create a free account and a new form that sends to your email.
2. Copy the form ID from its URL (`https://formspree.io/f/XXXXXXXX`).
3. Paste it into `formspreeId` in `js/config.js`.

Until you do this, the form opens the visitor's email app with the message filled in, so it still works.

## Deploying on GitHub Pages

1. Create a new **public** repository named `portfolio` (or your `siteRepo` value).
2. Upload all files in this folder to it, keeping the folder structure.
3. Go to **Settings > Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the `main` branch and the `/ (root)` folder, then save.
4. Wait a minute or two. Your site will be live at `https://efea06.github.io/portfolio/`.

## Testing checklist

- [ ] All five sections load and the nav links jump to them
- [ ] Ask the chatbot: "What experience do you have with communication?"
- [ ] Scan the QR code with a phone and confirm it opens the live site
- [ ] Scan the QR code on the downloaded resume PDF
- [ ] Download the resume from the Home and Resume sections
- [ ] Send a test message through the contact form
- [ ] Check every GitHub link in Projects
- [ ] Try light and dark mode, and a phone-sized window

## Project structure

```
index.html              page markup
css/style.css           styles, light and dark themes, chatbot styles
js/config.js            your GitHub username, repo names, form ID
js/main.js              theme toggle, menu, contact form
js/knowledge.js         chatbot knowledge base (edit answers here)
js/chatbot.js           chatbot matching engine and interface
assets/                 resume PDF, resume preview, QR code, favicon
tools/make_qr.py        regenerates the QR code and stamps it on the resume
tools/resume-original.pdf   your resume without the QR code
```
