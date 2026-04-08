/**
 * Theme Toggle Script
 * Handles light/dark mode switching with smooth animations
 */

(function() {
  'use strict';
  
  // Theme constants
  const THEME_KEY = 'westcore-theme';
  const THEME_LIGHT = 'light';
  const THEME_DARK = 'dark';
  
  /**
   * Get current theme from localStorage or system preference
   */
  function getCurrentTheme() {
    // Check for new key first
    let stored = localStorage.getItem(THEME_KEY);
    
    // If not found, check for old key (backward compatibility)
    if (!stored) {
      stored = localStorage.getItem('theme');
      // If old key exists, migrate to new key
      if (stored) {
        localStorage.setItem(THEME_KEY, stored);
        localStorage.removeItem('theme');
      }
    }
    
    if (stored) {
      return stored;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_DARK;
    }
    
    return THEME_LIGHT;
  }
  
  // IMMEDIATELY apply theme before page renders to prevent flash
  (function() {
    const savedTheme = getCurrentTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
  })();
  
  /**
   * Apply theme to document
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    // Update theme toggle button
    updateThemeButton(theme);
  }
  
  /**
   * Update theme toggle button appearance
   */

  function updateThemeButton(theme) {
  const button = document.getElementById('theme-toggle');
  if (!button) return;

  const icon = button.querySelector('.theme-icon');
  if (!icon) return;

  if (theme === THEME_DARK) {
    icon.textContent = '☀️';
    button.setAttribute('aria-label', 'Switch to light mode');
  } else {
    icon.textContent = '🌙';
    button.setAttribute('aria-label', 'Switch to dark mode');
  }
}

  
  /**
   * Toggle between light and dark theme
   */
  function toggleTheme() {
    const current = getCurrentTheme();
    const next = current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
    
    // Add transition class to body for smooth color change
    document.body.style.transition = 'none';
    
    // Apply new theme
    applyTheme(next);
    
    // Trigger animation
    requestAnimationFrame(() => {
      document.body.style.transition = '';
    });
    
    // Optional: Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: next }
    }));
  }
  
  /**
   * Initialize theme on page load
   */
  function initTheme() {
    const theme = getCurrentTheme();
    applyTheme(theme);
    
    // Add event listener to toggle button
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.addEventListener('click', toggleTheme);
    }
    
    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
        }
      });
    }
  }
  
  /**
   * Handle navbar shrink on scroll
   */
  function initNavbarShrink() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollY = window.scrollY;

    function updateNavbar() {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        navbar.classList.add('shrunk');
      } else {
        navbar.classList.remove('shrunk');
      }
      
      lastScrollY = currentScrollY;
    }

    // Throttle scroll events for better performance
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateNavbar();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial check
    updateNavbar();
  }
  
  /**
   * Initialize mobile menu toggle
   */
  function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (!mobileToggle || !navMenu) return;
    
    // Toggle mobile menu
    mobileToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    
    // Handle dropdown clicks on mobile
    const dropdowns = document.querySelectorAll('.nav-dropdown > a');
    dropdowns.forEach(dropdown => {
      dropdown.addEventListener('click', function(e) {
        // Only prevent default on mobile
        if (window.innerWidth <= 768) {
          e.preventDefault();
          const parent = this.parentElement;
          
          // Close other dropdowns
          document.querySelectorAll('.nav-dropdown').forEach(item => {
            if (item !== parent) {
              item.classList.remove('active');
            }
          });
          
          // Toggle current dropdown
          parent.classList.toggle('active');
        }
      });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.navbar') && navMenu.classList.contains('active')) {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
    
    // Close mobile menu on window resize to desktop
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.querySelectorAll('.nav-dropdown').forEach(item => {
          item.classList.remove('active');
        });
      }
    });
  }
  
  // Initialize as soon as DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTheme();
      initNavbarShrink();
      initMobileMenu();
    });
  } else {
    initTheme();
    initNavbarShrink();
    initMobileMenu();
  }
  
  // Expose toggle function globally for potential use in other scripts
  window.WestcoreTheme = {
    toggle: toggleTheme,
    set: applyTheme,
    get: getCurrentTheme
  };
  
  // Smooth scroll for anchor links
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = 100; // Account for fixed navbar
          const targetPosition = target.offsetTop - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  });
  
})();