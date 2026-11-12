// ============================================
// ANAPA RIMA - JavaScript Interactions
// ============================================

// === LANGUAGE TOGGLE ===
const langToggle = document.getElementById('langToggle');
if (langToggle) {
    langToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const currentLang = html.getAttribute('lang');
        const newLang = currentLang === 'fr' ? 'en' : 'fr';
        html.setAttribute('lang', newLang);
        langToggle.textContent = newLang === 'fr' ? 'EN' : 'FR';

        // Traduire les selects du formulaire
        document.querySelectorAll('select[data-options-fr]').forEach(select => {
            const options = JSON.parse(select.getAttribute('data-options-' + newLang));
            const optionEls = select.querySelectorAll('option');
            optionEls.forEach((opt, i) => {
                if (options[i] !== undefined) opt.textContent = options[i];
            });
        });

        // Traduire les placeholders des textareas
        document.querySelectorAll('textarea[data-placeholder-fr]').forEach(textarea => {
            textarea.placeholder = textarea.getAttribute('data-placeholder-' + newLang) || textarea.placeholder;
        });
    });
}

// === NAVIGATION STICKY ===
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// === MENU MOBILE ===
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const isActive = menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Fermer le menu mobile avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
}

// Fermer le menu mobile au clic sur un lien
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

// === SMOOTH SCROLL ===
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');

        // Ne bloquer que les liens ancre (#), laisser les liens vers d'autres pages
        if (!targetId || !targetId.startsWith('#')) return;

        e.preventDefault();
        if (targetId.startsWith('#')) {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Offset pour la navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// === ACTIVE NAV LINK ON SCROLL ===
const sections = document.querySelectorAll('section[id]');

const updateActiveLink = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
};

window.addEventListener('scroll', updateActiveLink);

// === EMAILJS INITIALISATION ===
// Initialisation différée : le SDK est chargé avec defer, il peut ne pas être prêt ici.
// On initialise dès que possible, et on ré-essaie avant l'envoi si nécessaire.
let emailjsReady = false;

function initEmailJS() {
    if (emailjsReady) return true;
    if (typeof emailjs !== 'undefined') {
        emailjs.init('wMBs2gMN4TZDvobpx');
        emailjsReady = true;
        return true;
    }
    return false;
}

// Tenter l'init immédiatement
initEmailJS();
// Retenter après le chargement complet de la page
window.addEventListener('load', initEmailJS);

// === FORMULAIRE DE CONTACT ===
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');
const newRequestBtn = document.getElementById('newRequestBtn');

// Bouton "Nouvelle demande" pour réafficher le formulaire
newRequestBtn.addEventListener('click', () => {
    formSuccess.style.display = 'none';
    contactForm.style.display = 'block';
    contactForm.reset();
    if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
});

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Validation : Nom obligatoire
    if (!data.name || data.name.trim() === '') {
        const lang = document.documentElement.getAttribute('lang');
        showFormError(lang === 'en' ? 'Please enter your full name.' : 'Veuillez entrer votre nom et prénom.');
        return;
    }

    // Validation : au moins téléphone ou email
    if ((!data.phone || data.phone.trim() === '') && (!data.email || data.email.trim() === '')) {
        const lang = document.documentElement.getAttribute('lang');
        showFormError(lang === 'en' ? 'Please provide at least a phone number or email address.' : 'Veuillez renseigner au moins un téléphone ou un email.');
        return;
    }

    // Validation reCAPTCHA
    if (typeof grecaptcha !== 'undefined') {
        const captchaResponse = grecaptcha.getResponse();
        if (!captchaResponse) {
            const lang = document.documentElement.getAttribute('lang');
            showFormError(lang === 'en' ? 'Please complete the CAPTCHA verification.' : 'Veuillez compléter la vérification CAPTCHA.');
            return;
        }
    }

    // Afficher le loading
    submitBtn.disabled = true;
    submitBtn.querySelectorAll('.btn-text').forEach(el => el.style.display = 'none');
    submitBtn.querySelector('.btn-loading').style.display = 'inline-flex';

    // Générer date et heure (heure de Tahiti, UTC-10)
    const now = new Date();
    const tahitiOffset = -10 * 60;
    const tahitiTime = new Date(now.getTime() + (tahitiOffset - now.getTimezoneOffset()) * 60000);
    const dateStr = tahitiTime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = tahitiTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Récupérer le texte visible du select service
    const serviceSelect = document.getElementById('service');
    const serviceText = serviceSelect.options[serviceSelect.selectedIndex]?.text || data.service;

    // Préparer les paramètres pour EmailJS
    const templateParams = {
        from_name: data.name.trim(),
        phone: data.phone ? data.phone.trim() : 'Non renseigné',
        email: data.email ? data.email.trim() : 'Non renseigné',
        service: serviceText,
        message: data.message || 'Aucun message',
        date: dateStr,
        time: timeStr + ' (heure de Tahiti)'
    };

    try {
        // S'assurer qu'EmailJS est initialisé avant l'envoi
        if (!initEmailJS()) {
            throw new Error('EmailJS non chargé');
        }
        await emailjs.send('service_cl58eoh', 'template_yjtvc9i', templateParams);

        // Succès : masquer le formulaire et afficher la confirmation
        contactForm.style.display = 'none';
        formSuccess.style.display = 'flex';
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        console.error('Erreur EmailJS:', error);
        const lang = document.documentElement.getAttribute('lang');
        showFormError(lang === 'en'
            ? 'An error occurred while sending. Please try again or contact via WhatsApp.'
            : 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer ou contacter via WhatsApp.');
    } finally {
        // Restaurer le bouton
        submitBtn.disabled = false;
        submitBtn.querySelectorAll('.btn-text').forEach(el => el.style.display = '');
        submitBtn.querySelector('.btn-loading').style.display = 'none';
    }
});

// Fonction pour afficher une erreur dans le formulaire
function showFormError(message) {
    // Supprimer l'erreur précédente s'il y en a une
    const existingError = contactForm.querySelector('.form-error');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;

    // Insérer avant le bouton submit
    submitBtn.parentNode.insertBefore(errorDiv, submitBtn);

    // Supprimer après 5 secondes
    setTimeout(() => {
        errorDiv.classList.add('fade-out');
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// === GALLERY HOVER EFFECT ===
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.zIndex = '10';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.zIndex = '1';
    });
});

// === ACCESSIBILITY IMPROVEMENTS ===
// Ajouter le focus visible pour la navigation au clavier
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// Style pour le focus clavier
const accessibilityStyle = document.createElement('style');
accessibilityStyle.textContent = `
    body.keyboard-nav *:focus {
        outline: 2px solid #5f7a69 !important;
        outline-offset: 2px;
    }
`;
document.head.appendChild(accessibilityStyle);

// === AGENDA GOOGLE CALENDAR API ===
(() => {
    const GCAL_API_KEY = 'AIzaSyBXebmEFqubgjilMcmG86LHKbzWgeZugZU';
    const GCAL_CALENDAR_ID = 'anaparima.massages@gmail.com';
    const HOUR_START = 7;
    const HOUR_END = 19;

    const agendaWeekEl = document.getElementById('agendaWeek');
    const agendaListEl = document.getElementById('agendaList');
    const agendaLoading = document.getElementById('agendaLoading');
    const agendaError = document.getElementById('agendaError');
    const agendaWeekLabel = document.getElementById('agendaWeekLabel');
    const agendaPrev = document.getElementById('agendaPrev');
    const agendaNext = document.getElementById('agendaNext');

    if (!agendaWeekEl) return;

    const lang = () => document.documentElement.getAttribute('lang') || 'fr';

    const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const DAYS_SHORT_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const DAYS_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Tahiti est à UTC-10 toute l'année (pas d'heure d'été). Tous les calculs se font
    // à l'heure de Tahiti, quel que soit le fuseau de l'ordinateur du visiteur.
    const TAHITI_OFFSET_MS = -10 * 3600000;
    const DAY_MS = 86400000;
    const MARGIN_MIN = 15;       // marge avant et après chaque rendez-vous
    const MIN_FREE_MIN = 60;     // un trou plus court qu'un massage d'1h est affiché occupé

    // Date « vue de Tahiti » : lire avec getUTC*()
    function tahiti(instant) {
        return new Date(instant.getTime() + TAHITI_OFFSET_MS);
    }

    // Minuit à Tahiti pour une date du calendrier
    function tahitiMidnight(year, month, day) {
        return new Date(Date.UTC(year, month, day) - TAHITI_OFFSET_MS);
    }

    function tahitiDayStart(instant) {
        const t = tahiti(instant);
        return tahitiMidnight(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
    }

    function addDays(dayStart, n) {
        return new Date(dayStart.getTime() + n * DAY_MS);
    }

    let currentWeekStart = getMonday(new Date());

    function getMonday(d) {
        const dayStart = tahitiDayStart(d);
        const weekday = tahiti(dayStart).getUTCDay();
        return addDays(dayStart, weekday === 0 ? -6 : 1 - weekday);
    }

    function formatWeekLabel(monday) {
        const mon = tahiti(monday);
        const sun = tahiti(addDays(monday, 6));
        const l = lang();
        const months = l === 'fr' ? MONTHS_FR : MONTHS_EN;
        const dStart = mon.getUTCDate();
        const mStart = months[mon.getUTCMonth()];
        const dEnd = sun.getUTCDate();
        const mEnd = months[sun.getUTCMonth()];
        const year = sun.getUTCFullYear();
        if (mon.getUTCMonth() === sun.getUTCMonth()) {
            return `${dStart}-${dEnd} ${mStart} ${year}`;
        }
        return `${dStart} ${mStart} - ${dEnd} ${mEnd} ${year}`;
    }

    // 435 → « 7h15 », 540 → « 9h »
    function formatMinutes(min) {
        const h = Math.floor(min / 60);
        const m = min % 60;
        return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
    }

    function isToday(dayStart) {
        return dayStart.getTime() === tahitiDayStart(new Date()).getTime();
    }

    function isPast(dayStart) {
        return dayStart < tahitiDayStart(new Date());
    }

    async function fetchEvents(weekStart) {
        const timeMin = weekStart;
        const timeMax = addDays(weekStart, 7);

        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GCAL_CALENDAR_ID)}/events?` +
            `key=${GCAL_API_KEY}` +
            `&timeMin=${timeMin.toISOString()}` +
            `&timeMax=${timeMax.toISOString()}` +
            `&singleEvents=true` +
            `&orderBy=startTime` +
            `&timeZone=Pacific/Tahiti`;

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`API error ${resp.status}`);
        const data = await resp.json();
        return (data.items || []).filter(ev => ev.status !== 'cancelled');
    }

    // Début et fin d'un événement. Les événements « toute la journée » ont une date
    // de fin exclusive (2026-11-12 → 2026-11-13) et pas de marge.
    function eventRange(ev) {
        if (ev.start.dateTime) {
            const margin = MARGIN_MIN * 60000;
            return {
                start: new Date(ev.start.dateTime).getTime() - margin,
                end: new Date(ev.end.dateTime).getTime() + margin
            };
        }
        const [ys, ms, ds] = ev.start.date.split('-').map(Number);
        const [ye, me, de] = ev.end.date.split('-').map(Number);
        return {
            start: tahitiMidnight(ys, ms - 1, ds).getTime(),
            end: tahitiMidnight(ye, me - 1, de).getTime()
        };
    }

    // Découpe la journée (7h-19h) en plages libres / occupées, en minutes depuis minuit.
    // Chaque rendez-vous bloque 15 min avant et après, y compris s'il a commencé avant 7h
    // ou la veille ; un trou libre de moins d'1h est compté occupé.
    function buildTimeSlots(events, dayStart) {
        const dayOpen = HOUR_START * 60;
        const dayClose = HOUR_END * 60;
        const toMinutes = ms => (ms - dayStart.getTime()) / 60000;

        const busy = events
            .map(eventRange)
            .map(r => ({
                start: Math.max(dayOpen, Math.floor(toMinutes(r.start))),
                end: Math.min(dayClose, Math.ceil(toMinutes(r.end)))
            }))
            .filter(r => r.start < r.end)
            .sort((a, b) => a.start - b.start);

        const slots = [];
        let cursor = dayOpen;
        const pushSlot = (start, end, isBusy) => {
            const last = slots[slots.length - 1];
            if (last && last.busy === isBusy) {
                last.end = Math.max(last.end, end);
            } else {
                slots.push({ start, end, busy: isBusy });
            }
        };
        const addFree = (start, end) => {
            if (end > start) pushSlot(start, end, end - start < MIN_FREE_MIN);
        };

        busy.forEach(r => {
            addFree(cursor, r.start);
            if (r.end > cursor) {
                pushSlot(Math.max(cursor, r.start), r.end, true);
                cursor = r.end;
            }
        });
        addFree(cursor, dayClose);
        return slots;
    }

    function renderWeekView(events) {
        agendaWeekEl.innerHTML = '';
        const l = lang();
        const dayNames = l === 'fr' ? DAYS_SHORT_FR : DAYS_SHORT_EN;
        const availText = l === 'fr' ? 'Disponible' : 'Available';
        const busyText = l === 'fr' ? 'Occupée' : 'Booked';

        for (let i = 0; i < 7; i++) {
            const dayDate = addDays(currentWeekStart, i);
            const dayLocal = tahiti(dayDate);

            const past = isPast(dayDate);
            const dayEl = document.createElement('div');
            dayEl.className = 'agenda-day' + (isToday(dayDate) ? ' today' : '') + (past ? ' past' : '');

            const slots = buildTimeSlots(events, dayDate);
            const passedText = l === 'fr' ? 'Passé' : 'Past';

            dayEl.innerHTML = `
                <div class="agenda-day-header">
                    <div class="agenda-day-name">${dayNames[dayLocal.getUTCDay()]}</div>
                    <div class="agenda-day-number">${dayLocal.getUTCDate()}</div>
                </div>
                <div class="agenda-day-events">
                    ${past
                        ? `<div class="agenda-day-passed">${passedText}</div>`
                        : slots.map(slot => `
                            <div class="agenda-slot ${slot.busy ? 'slot-busy' : 'slot-free'}">
                                <span class="agenda-slot-time">${formatMinutes(slot.start)}-${formatMinutes(slot.end)}</span>
                                <span class="agenda-slot-status">${slot.busy ? busyText : availText}</span>
                            </div>
                        `).join('')
                    }
                </div>
            `;

            agendaWeekEl.appendChild(dayEl);
        }
    }

    function renderListView(events) {
        agendaListEl.innerHTML = '';
        const l = lang();
        const dayNames = l === 'fr' ? DAYS_FR : DAYS_EN;
        const months = l === 'fr' ? MONTHS_FR : MONTHS_EN;
        const todayText = l === 'fr' ? "Aujourd'hui" : 'Today';
        const availText = l === 'fr' ? 'Disponible' : 'Available';
        const busyText = l === 'fr' ? 'Occupée' : 'Booked';

        for (let i = 0; i < 7; i++) {
            const dayDate = addDays(currentWeekStart, i);
            const dayLocal = tahiti(dayDate);

            const slots = buildTimeSlots(events, dayDate);
            const today = isToday(dayDate);
            const past = isPast(dayDate);

            // Ne pas afficher les jours passés en vue liste
            if (past) continue;

            const dayEl = document.createElement('div');
            dayEl.className = 'agenda-list-day' + (today ? ' today' : '');

            dayEl.innerHTML = `
                <div class="agenda-list-header">
                    ${dayNames[dayLocal.getUTCDay()]} ${dayLocal.getUTCDate()} ${months[dayLocal.getUTCMonth()]}
                    ${today ? `<span class="today-badge">${todayText}</span>` : ''}
                </div>
                ${slots.map(slot => `
                    <div class="agenda-list-event ${slot.busy ? 'slot-busy' : 'slot-free'}">
                        <span class="agenda-list-time">${formatMinutes(slot.start)}-${formatMinutes(slot.end)}</span>
                        <span class="agenda-list-status">${slot.busy ? busyText : availText}</span>
                    </div>
                `).join('')}
            `;

            agendaListEl.appendChild(dayEl);
        }
    }

    async function loadWeek() {
        agendaLoading.style.display = 'flex';
        agendaError.style.display = 'none';
        agendaWeekEl.innerHTML = '';
        agendaListEl.innerHTML = '';
        agendaWeekLabel.textContent = formatWeekLabel(currentWeekStart);

        try {
            const events = await fetchEvents(currentWeekStart);
            agendaLoading.style.display = 'none';
            renderWeekView(events);
            renderListView(events);
        } catch (err) {
            console.error('Erreur agenda:', err);
            agendaLoading.style.display = 'none';
            agendaError.style.display = 'block';
        }
    }

    const thisWeekMonday = getMonday(new Date());

    function updatePrevButton() {
        const isPastOrCurrent = currentWeekStart <= thisWeekMonday;
        agendaPrev.disabled = isPastOrCurrent;
        agendaPrev.style.opacity = isPastOrCurrent ? '0.3' : '1';
        agendaPrev.style.cursor = isPastOrCurrent ? 'default' : 'pointer';
    }

    agendaPrev.addEventListener('click', () => {
        const prevWeek = addDays(currentWeekStart, -7);
        if (prevWeek < thisWeekMonday) return;
        currentWeekStart = prevWeek;
        updatePrevButton();
        loadWeek();
    });

    agendaNext.addEventListener('click', () => {
        currentWeekStart = addDays(currentWeekStart, 7);
        updatePrevButton();
        loadWeek();
    });

    // Recharger quand on change de langue
    const langToggleBtn = document.getElementById('langToggle');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            setTimeout(loadWeek, 50);
        });
    }

    // Charger la semaine courante
    updatePrevButton();
    loadWeek();
})();

// === PRÉCHARGEMENT DES SECTIONS AU HOVER ===
navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        const targetId = link.getAttribute('href');
        if (targetId.startsWith('#')) {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                // Précharger le contenu de la section
                targetSection.style.willChange = 'transform';
                setTimeout(() => {
                    targetSection.style.willChange = 'auto';
                }, 1000);
            }
        }
    });
});
