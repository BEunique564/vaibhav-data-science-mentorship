// ============================================
// VAIBHAV GUPTA — Coaching Website JS
// ============================================

// Mobile Menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

function closeMobile() {
  mobileMenu.classList.remove('open');
}

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
    mobileMenu.classList.remove('open');
  }
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset;
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${section.id}`) {
          link.classList.add('active');
        }
      });
    }
  });
});

// Form Submit
function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  // Simulate submission (replace with real API call)
  setTimeout(() => {
    form.style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
  }, 1500);
}

// Newsletter Subscribe
function subscribeNewsletter() {
  const input = document.querySelector('.email-input');
  if (!input.value || !input.value.includes('@')) {
    input.style.borderColor = 'red';
    setTimeout(() => input.style.borderColor = '', 2000);
    return;
  }
  const btn = input.nextElementSibling;
  btn.textContent = '✅ Subscribed!';
  btn.disabled = true;
  input.value = '';
  setTimeout(() => {
    btn.textContent = 'Subscribe →';
    btn.disabled = false;
  }, 3000);
}

// Scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe cards
document.querySelectorAll('.program-card, .testimonial-card, .blog-card, .result-num-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// Nav scroll effect
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(10,10,15,0.98)';
  } else {
    nav.style.background = 'rgba(10,10,15,0.85)';
  }
});

// Counter animation for stats
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const increment = target / 60;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current) + suffix;
    }
  }, 16);
}

// Trigger counters when visible
const statNums = document.querySelectorAll('.stat-num, .rn-number');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      const text = entry.target.textContent;
      const num = parseInt(text.replace(/[^0-9]/g, ''));
      if (!isNaN(num) && num > 0) {
        const suffix = text.replace(/[0-9]/g, '');
        animateCounter(entry.target, num, suffix);
      }
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => counterObserver.observe(el));

console.log('🚀 VG Mentorship Website loaded!');
