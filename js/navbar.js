// EMERGENCY MOBILE MENU FIX
// This is a bulletproof implementation that WILL work

console.log('🚨 EMERGENCY: Loading navbar.js');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚨 EMERGENCY: DOM loaded, initializing mobile menu');
    initMobileMenu();
});

function initMobileMenu() {
    console.log('🚨 EMERGENCY: Starting mobile menu initialization');
    
    // Get elements
    const menuBtn = document.getElementById('mobile-menu-button');
    const navMenu = document.getElementById('mobile-menu');
    const closeBtn = document.getElementById('mobile-menu-close');
    
    console.log('🚨 EMERGENCY: Elements found:', {
        menuBtn: !!menuBtn,
        navMenu: !!navMenu,
        closeBtn: !!closeBtn
    });
    
    // CRITICAL: If elements don't exist, we can't proceed
    if (!menuBtn || !navMenu) {
        console.error('🚨 EMERGENCY: CRITICAL ERROR - Mobile menu elements not found!');
        console.error('Menu button:', menuBtn);
        console.error('Nav menu:', navMenu);
        return;
    }
    
    console.log('🚨 EMERGENCY: All elements found, setting up event listeners');
    
    // Toggle function
    function toggleMenu() {
        console.log('🚨 EMERGENCY: Toggle menu called');
        const isHidden = navMenu.classList.contains('hidden');
        console.log('🚨 EMERGENCY: Menu is currently hidden:', isHidden);
        
        if (isHidden) {
            // Show menu
            console.log('🚨 EMERGENCY: Showing menu');
            navMenu.classList.remove('hidden');
            menuBtn.setAttribute('aria-expanded', 'true');
            menuBtn.classList.add('active');
            
            // Force visibility with inline styles
            navMenu.style.display = 'block';
            navMenu.style.visibility = 'visible';
            navMenu.style.opacity = '1';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.right = '0';
            navMenu.style.zIndex = '9999';
            
            console.log('🚨 EMERGENCY: Menu should now be visible');
        } else {
            // Hide menu
            console.log('🚨 EMERGENCY: Hiding menu');
            navMenu.classList.add('hidden');
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.classList.remove('active');
            
            // Reset inline styles
            navMenu.style.display = '';
            navMenu.style.visibility = '';
            navMenu.style.opacity = '';
            navMenu.style.position = '';
            navMenu.style.top = '';
            navMenu.style.left = '';
            navMenu.style.right = '';
            navMenu.style.zIndex = '';
            
            console.log('🚨 EMERGENCY: Menu should now be hidden');
        }
    }
    
    // Close function
    function closeMenu() {
        console.log('🚨 EMERGENCY: Close menu called');
        navMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.classList.remove('active');
        
        // Reset inline styles
        navMenu.style.display = '';
        navMenu.style.visibility = '';
        navMenu.style.opacity = '';
        navMenu.style.position = '';
        navMenu.style.top = '';
        navMenu.style.left = '';
        navMenu.style.right = '';
        navMenu.style.zIndex = '';
    }
    
    // Add click event to menu button
    menuBtn.addEventListener('click', function(e) {
        console.log('🚨 EMERGENCY: Menu button clicked!');
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
    
    // Add click event to close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            console.log('🚨 EMERGENCY: Close button clicked!');
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
        });
    }
    
    // Close on mobile link clicks
    const mobileLinks = navMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            console.log('🚨 EMERGENCY: Mobile link clicked, closing menu');
            closeMenu();
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !navMenu.classList.contains('hidden')) {
            console.log('🚨 EMERGENCY: Escape key pressed, closing menu');
            closeMenu();
        }
    });
    
    // Close on outside click
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !menuBtn.contains(e.target) && !navMenu.classList.contains('hidden')) {
            console.log('🚨 EMERGENCY: Outside click detected, closing menu');
            closeMenu();
        }
    });
    
    // Close on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            console.log('🚨 EMERGENCY: Window resized to desktop, closing menu');
            closeMenu();
        }
    });
    
    console.log('🚨 EMERGENCY: Mobile menu setup complete!');
}

// Set active page
function setActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Update desktop links
    const desktopLinks = document.querySelectorAll('#desktop-menu a');
    desktopLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('text-black', 'font-semibold');
            link.classList.remove('text-gray-600');
        } else {
            link.classList.add('text-gray-600');
            link.classList.remove('text-black', 'font-semibold');
        }
    });
    
    // Update mobile links
    const mobileLinks = document.querySelectorAll('#mobile-menu a');
    mobileLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('bg-gray-100', 'text-black', 'font-semibold');
            link.classList.remove('text-gray-600');
        } else {
            link.classList.add('text-gray-600');
            link.classList.remove('bg-gray-100', 'text-black', 'font-semibold');
        }
    });
}