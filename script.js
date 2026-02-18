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
try {
    if (typeof emailjs !== 'undefined') {
        emailjs.init('wMBs2gMN4TZDvobpx');
    }
} catch (err) {
    console.warn('EmailJS non disponible:', err);
}

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
        // IMPORTANT : Remplacer 'VOTRE_SERVICE_ID' et 'VOTRE_TEMPLATE_ID' par vos identifiants EmailJS
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
