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
        e.preventDefault();
        const targetId = link.getAttribute('href');
        
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

// === SCROLL ANIMATIONS ===
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Éléments à animer
const animatedElements = document.querySelectorAll(`
    .service-card,
    .pricing-card,
    .gallery-item,
    .about-content,
    .contact-method
`);

animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    animateOnScroll.observe(el);
});

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

// === HERO (parallax désactivé pour ne pas recouvrir l'intro) ===
const hero = document.querySelector('.hero');

// === SMOOTH REVEAL ON PAGE LOAD ===
document.body.classList.add('js-loading');
window.addEventListener('load', () => {
    document.body.classList.remove('js-loading');
    document.body.classList.add('js-loaded');
});

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

// === SERVICE CARDS STAGGER ANIMATION ===
const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
});

// === CONSOLE LOG PERSONNALISÉ ===
console.log('%c🌺 ANAPĀ RIMA - Massages Bien-Être', 'font-size: 20px; font-weight: bold; color: #2d4a3e;');
console.log('%cSite créé avec 💚 pour Victoria Paret', 'font-size: 14px; color: #4a6b5a;');
console.log('%cRéservations: (+689) 89 51 53 62', 'font-size: 12px; color: #d4a373;');

// === PERFORMANCE OPTIMIZATION ===
// Lazy loading natif supporté par tous les navigateurs modernes
// Les images utilisent directement l'attribut loading="lazy" dans le HTML

// === EASTER EGG - KONAMI CODE ===
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join('') === konamiPattern.join('')) {
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
            alert('🌺 Mauruuru ! Vous avez trouvé le code secret d\'ANAPA RIMA ! 🌺');
        }, 2000);
    }
});

// Animation rainbow pour l'easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

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
        outline: 2px solid #d4a373 !important;
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

    let currentWeekStart = getMonday(new Date());

    function getMonday(d) {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        date.setDate(diff);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    function formatWeekLabel(monday) {
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        const l = lang();
        const months = l === 'fr' ? MONTHS_FR : MONTHS_EN;
        const dStart = monday.getDate();
        const mStart = months[monday.getMonth()];
        const dEnd = sunday.getDate();
        const mEnd = months[sunday.getMonth()];
        const year = sunday.getFullYear();
        if (monday.getMonth() === sunday.getMonth()) {
            return `${dStart} – ${dEnd} ${mStart} ${year}`;
        }
        return `${dStart} ${mStart} – ${dEnd} ${mEnd} ${year}`;
    }

    function formatTime(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Pacific/Tahiti' });
    }

    function isSameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    }

    function isToday(d) {
        return isSameDay(d, new Date());
    }

    async function fetchEvents(weekStart) {
        const timeMin = new Date(weekStart);
        const timeMax = new Date(weekStart);
        timeMax.setDate(timeMax.getDate() + 7);

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
        return data.items || [];
    }

    function getEventsForDay(events, dayDate) {
        return events.filter(ev => {
            const start = new Date(ev.start.dateTime || ev.start.date);
            return isSameDay(start, dayDate);
        }).filter(ev => {
            // Filtrer les événements hors plage horaire
            if (ev.start.dateTime) {
                const h = new Date(ev.start.dateTime).getHours();
                return h >= HOUR_START && h < HOUR_END;
            }
            return true; // Événements "toute la journée"
        });
    }

    function renderWeekView(events) {
        agendaWeekEl.innerHTML = '';
        const l = lang();
        const dayNames = l === 'fr' ? DAYS_SHORT_FR : DAYS_SHORT_EN;
        const freeText = l === 'fr' ? 'Libre' : 'Free';

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(dayDate.getDate() + i);

            const dayEl = document.createElement('div');
            dayEl.className = 'agenda-day' + (isToday(dayDate) ? ' today' : '');

            const dayEvents = getEventsForDay(events, dayDate);

            dayEl.innerHTML = `
                <div class="agenda-day-header">
                    <div class="agenda-day-name">${dayNames[dayDate.getDay()]}</div>
                    <div class="agenda-day-number">${dayDate.getDate()}</div>
                </div>
                <div class="agenda-day-events">
                    ${dayEvents.length > 0
                        ? dayEvents.map(ev => `
                            <div class="agenda-event">
                                <span class="agenda-event-time">${ev.start.dateTime ? formatTime(ev.start.dateTime) + ' – ' + formatTime(ev.end.dateTime) : (l === 'fr' ? 'Journée' : 'All day')}</span>
                                ${ev.summary ? `<span class="agenda-event-title">${ev.summary}</span>` : ''}
                            </div>
                        `).join('')
                        : `<div class="agenda-day-free">${freeText}</div>`
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
        const freeText = l === 'fr' ? 'Aucun rendez-vous' : 'No appointments';
        const todayText = l === 'fr' ? "Aujourd'hui" : 'Today';

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(dayDate.getDate() + i);

            const dayEvents = getEventsForDay(events, dayDate);
            const today = isToday(dayDate);

            const dayEl = document.createElement('div');
            dayEl.className = 'agenda-list-day' + (today ? ' today' : '');

            dayEl.innerHTML = `
                <div class="agenda-list-header">
                    ${dayNames[dayDate.getDay()]} ${dayDate.getDate()} ${months[dayDate.getMonth()]}
                    ${today ? `<span class="today-badge">${todayText}</span>` : ''}
                </div>
                ${dayEvents.length > 0
                    ? dayEvents.map(ev => `
                        <div class="agenda-list-event">
                            <span class="agenda-list-time">${ev.start.dateTime ? formatTime(ev.start.dateTime) + ' – ' + formatTime(ev.end.dateTime) : (l === 'fr' ? 'Journée' : 'All day')}</span>
                            ${ev.summary ? `<span class="agenda-list-title">${ev.summary}</span>` : ''}
                        </div>
                    `).join('')
                    : `<div class="agenda-list-free">${freeText}</div>`
                }
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
        const prevWeek = new Date(currentWeekStart);
        prevWeek.setDate(prevWeek.getDate() - 7);
        if (prevWeek < thisWeekMonday) return;
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        updatePrevButton();
        loadWeek();
    });

    agendaNext.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
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

// === DÉTECTION DU VIEWPORT POUR OPTIMISATIONS ===
const isMobile = window.innerWidth <= 768;
const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

if (isMobile) {
    console.log('📱 Mode mobile détecté');
    // Désactiver certaines animations sur mobile pour les performances
    document.querySelectorAll('.floating-element').forEach(el => {
        el.style.display = 'none';
    });
}

// === SCROLL TO TOP BUTTON (optionnel) ===
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '↑';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.setAttribute('aria-label', 'Retour en haut');
document.body.appendChild(scrollToTopBtn);

const scrollToTopStyle = document.createElement('style');
scrollToTopStyle.textContent = `
    .scroll-to-top {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        background: var(--color-secondary);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .scroll-to-top.visible {
        opacity: 1;
        visibility: visible;
    }
    
    .scroll-to-top:hover {
        background: var(--color-primary);
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
    
    @media (max-width: 768px) {
        .scroll-to-top {
            bottom: 1.5rem;
            right: 1.5rem;
            width: 45px;
            height: 45px;
        }
    }
`;
document.head.appendChild(scrollToTopStyle);

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

console.log('✅ JavaScript ANAPA RIMA chargé avec succès');
