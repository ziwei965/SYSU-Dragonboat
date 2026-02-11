document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const langToggle = document.getElementById('langToggle');
    const hero = document.getElementById('hero');

    // --- Navbar scroll effect ---
    const navObserver = new IntersectionObserver(
        ([entry]) => {
            navbar.classList.toggle('scrolled', !entry.isIntersecting);
        },
        { threshold: 0.1 }
    );
    navObserver.observe(hero);

    // --- Hamburger menu ---
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // --- Language toggle ---
    langToggle.addEventListener('click', () => {
        const newLang = currentLang === 'zh' ? 'en' : 'zh';
        setLanguage(newLang);
    });

    // --- Scroll animations ---
    const animObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    animObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        animObserver.observe(el);
    });

    // --- Smooth scroll for hero CTA ---
    document.querySelector('.hero-cta')?.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(e.currentTarget.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
