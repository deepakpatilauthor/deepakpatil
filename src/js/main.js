// Main JavaScript functionality for the portfolio website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initScrollEffects();
    initAnimations();
});

// Navigation functionality
function initNavigation() {
    const navbar = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');
    
    // Handle scroll effect on navbar
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Handle active navigation links - this is now handled by navbar.js
    // Keeping this for backward compatibility but navbar.js handles it better
}

// Mobile menu functionality is now handled by navbar.js

// Scroll effects
function initScrollEffects() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animation functionality
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.animate-fade-in, .animate-fade-in-delay, .animate-fade-in-delay-2').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        observer.observe(el);
    });
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Form handling (for contact page). No third-party service: on submit, the
// browser opens the visitor's email client with a pre-filled message addressed
// to hi@deepakpatil.com (no mail server, no backend required).
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            // Basic validation
            if (!data.name || !data.email || !data.message) {
                alert('Please fill in all required fields.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Build a pre-filled draft: recipient, subject, and body from the form
            const subject = 'Project Inquiry from ' + data.name + ' — ' + (data.projectType || 'General Inquiry');
            const body = [
                'Name: ' + data.name,
                'Email: ' + data.email,
                'Project Type: ' + (data.projectType || '—'),
                'Budget Range: ' + (data.budget || '—'),
                'Timeline: ' + (data.timeline || '—'),
                '',
                'Project Details:',
                data.message
            ].join('\n');

            const mailto = 'mailto:hi@deepakpatil.com'
                + '?subject=' + encodeURIComponent(subject)
                + '&body=' + encodeURIComponent(body);

            showFormStatus(contactForm, 'Opening your email app — press send to deliver your message.');

            // Trigger the mail client via a temporary anchor (works even where
            // assigning window.location.href to a mailto is blocked)
            const link = document.createElement('a');
            link.href = mailto;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            link.remove();
        });
    }
}

function showFormStatus(form, message) {
    let status = form.querySelector('.form-status');
    if (!status) {
        status = document.createElement('p');
        status.className = 'form-status mt-4 text-sm text-green-600 flex items-center justify-center gap-1.5';
        status.setAttribute('role', 'status');
        form.appendChild(status);
    }
    status.textContent = message;
    window.clearTimeout(status._timer);
    status._timer = window.setTimeout(function() {
        status.textContent = '';
    }, 6000);
}

// Blog functionality
function initBlog() {
    // Category filtering. Re-queries posts on every click so it also covers
    // the posts appended later by the "Load More" button.
    const categoryButtons = document.querySelectorAll('.category-btn');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.textContent.trim();

            // Update active button
            categoryButtons.forEach(btn => {
                btn.classList.remove('bg-black', 'text-white');
                btn.classList.add('bg-gray-100', 'text-gray-700');
            });
            this.classList.remove('bg-gray-100', 'text-gray-700');
            this.classList.add('bg-black', 'text-white');

            applyBlogFilter(category);
        });
    });
}

// Applies the category filter + search query to every rendered post (static + dynamically appended)
let blogSearchQuery = '';

function applyBlogFilter(category) {
    document.querySelectorAll('.blog-post').forEach(post => {
        const matchesCategory = (category === 'All' || post.dataset.category === category);
        const matchesQuery = !blogSearchQuery || (post.textContent || '').toLowerCase().includes(blogSearchQuery);
        post.style.display = (matchesCategory && matchesQuery) ? 'block' : 'none';
    });
}

function getActiveCategory() {
    const active = document.querySelector('.category-btn.bg-black');
    return active ? active.dataset.category : 'All';
}

// Blog search: filters the grid as you type and supports /blog/?q=… URLs
// (used by the site's WebSite SearchAction structured data)
function initBlogSearch() {
    const input = document.getElementById('blog-search');
    if (!input) return;
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) input.value = q;
    input.addEventListener('input', function() {
        blogSearchQuery = this.value.trim().toLowerCase();
        applyBlogFilter(getActiveCategory());
    });
    if (q) {
        blogSearchQuery = q.trim().toLowerCase();
        applyBlogFilter(getActiveCategory());
    }
}

// Blog: "Load More" incremental rendering from the build-time JSON feed.
// The first 6 posts are rendered in the static HTML for SEO/first paint; this
// fetches the rest once, then appends batches of 6 on demand.
function initLoadMore() {
    const grid = document.getElementById('blog-grid');
    const btn = document.getElementById('load-more-btn');
    if (!grid || !btn) return;

    let posts = null;
    const batchSize = 6;
    let index = grid.querySelectorAll('.blog-post').length;

    fetch('/api/posts.json')
        .then(function(response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(function(data) {
            posts = data;
            if (index >= posts.length) {
                btn.classList.add('hidden');
            }
        })
        .catch(function() {
            btn.classList.add('hidden');
        });

    btn.addEventListener('click', function() {
        if (!posts) return;
        const batch = posts.slice(index, index + batchSize);
        index += batch.length;
        batch.forEach(function(post) {
            grid.insertAdjacentHTML('beforeend', blogCardHTML(post));
        });
        applyBlogFilter(getActiveCategory());
        if (index >= posts.length) {
            btn.classList.add('hidden');
        }
    });
}

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Builds the exact same card markup the static Eleventy loop renders, so the
// dynamically appended posts are visually identical to the first six.
function blogCardHTML(post) {
    const media = post.image
        ? '<div class="aspect-square overflow-hidden">' +
            '<img src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.title) + '" ' +
            'class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" ' +
            'loading="lazy" width="400" height="400">' +
          '</div>'
        : '<div class="w-full h-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">' +
            '<div class="text-center p-8">' +
              '<div class="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">' +
                '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m-4 4l4 4-4 4m6-4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v-2h2v-6h-2v-2z"></path>' +
                '</svg>' +
              '</div>' +
              '<h4 class="text-lg font-bold text-gray-800 mb-2">Linux Commands</h4>' +
              '<p class="text-gray-600 text-sm">Complete Reference Guide</p>' +
            '</div>' +
          '</div>';

    return '<article class="blog-post group cursor-pointer" data-category="' + escapeHtml(post.category) + '" onclick="window.location.href=\'' + escapeHtml(post.url) + '\'">' +
        '<div class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">' +
            media +
            '<div class="p-6">' +
                '<div class="flex items-center gap-3 mb-4">' +
                    '<span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">' + escapeHtml(post.category) + '</span>' +
                '</div>' +
                '<h3 class="text-xl font-bold mb-4 group-hover:text-blue-600 transition-colors leading-tight text-gray-900">' + escapeHtml(post.title) + '</h3>' +
                '<p class="text-gray-600 leading-relaxed mb-6">' + escapeHtml(post.excerpt) + '</p>' +
                '<div class="flex items-center gap-4 text-sm text-gray-500">' +
                    '<div class="flex items-center gap-1">' +
                        '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>' +
                        '<span>' + escapeHtml(post.date) + '</span>' +
                    '</div>' +
                    '<div class="flex items-center gap-1">' +
                        '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' +
                        '<span>' + escapeHtml(post.readTime) + ' min read</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</article>';
}

// Newsletter subscription
function initNewsletter() {
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            if (!email) {
                alert('Please enter your email address.');
                return;
            }
            
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;
            
            // Simulate subscription
            setTimeout(() => {
                alert('Thank you for subscribing! You\'ll receive updates about new articles.');
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    });
}

// Work page functionality
function initWorkPage() {
    // Project hover effects
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization
const debouncedScrollHandler = debounce(function() {
    // Handle scroll events here if needed
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Initialize page-specific functionality based on the elements on the page.
// Feature-detection (not filename matching) so it also works with the site's
// clean URLs, e.g. /blog/ instead of blog.html.
if (document.getElementById('contact-form')) initContactForm();
if (document.getElementById('blog-grid')) { initBlog(); initBlogSearch(); initLoadMore(); }
if (document.querySelector('.project-card')) initWorkPage();
initNewsletter();

// Mobile-specific optimizations
function initMobileOptimizations() {
    // Improve touch interactions
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    // Handle viewport height issues on mobile
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    
    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Initialize mobile optimizations
initMobileOptimizations();

// Handle page visibility changes (back button, tab switching)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible - any cleanup can be done here
    }
});

// Handle page transitions (if using SPA-like navigation)
function navigateToPage(url) {
    // Navigate after a brief delay for smooth transition
    setTimeout(() => {
        window.location.href = url;
    }, 150);
}

// Reset inline body styles when restored from bfcache (back/forward), otherwise
// a leftover loading-state style would persist and dim the page like an overlay
window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
        document.body.style.opacity = '';
        document.body.style.pointerEvents = '';
    }
});

// Handle external links
document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.hostname !== window.location.hostname) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});
