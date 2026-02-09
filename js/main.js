/**
 * Main application coordinator
 */

import { dataLoader } from './data.js';
import { Renderer } from './renderers.js';

class WebsiteApp {
  constructor() {
    this.data = null;
    this.renderer = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      // Load all data
      this.data = await dataLoader.loadAllData();
      
      // Initialize renderer
      this.renderer = new Renderer(this.data);
      
      // Render content
      this.renderContent();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Update current year
      this.updateCurrentYear();
      
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Failed to initialize website:', error);
      this.showError('Failed to load website content. Please try again later.');
    }
  }

  renderContent() {
    this.renderPublications();
    this.renderEducation();
    this.renderResearchExperience();
    this.renderAcademicServices();
  }

  renderPublications() {
    const container = document.getElementById('publicationsContainer');
    if (!container || !this.renderer) return;
    
    if (this.data.publications && this.data.publications.length > 0) {
      container.innerHTML = this.renderer.renderAllPublications();
    } else {
      container.innerHTML = '<p class="no-data">No publications found.</p>';
    }
  }

  renderAcademicServices() {
    const container = document.getElementById('servicesContainer');
    if (!container || !this.renderer) return;
    
    container.innerHTML = this.renderer.renderAcademicServices();
  }

  renderEducation() {
    const container = document.getElementById('educationContainer');
    if (!container || !this.renderer) return;
    
    container.innerHTML = this.renderer.renderEducation();
  }
  
  renderResearchExperience() {
    const container = document.getElementById('experienceContainer');
    if (!container || !this.renderer) return;
    
    container.innerHTML = this.renderer.renderResearchExperience(this.data.researchExperience);
  }

  setupEventListeners() {
    // Mobile navigation toggle
    const navToggle = document.getElementById('navToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    
    if (navToggle && navbarMenu) {
      navToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', 
          navbarMenu.classList.contains('active')
        );
      });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
      if (navbarMenu && navbarMenu.classList.contains('active') &&
          !navbarMenu.contains(event.target) && 
          !navToggle.contains(event.target)) {
        navbarMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      });
      
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#') return;
        
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // Close mobile menu if open
          if (navbarMenu && navbarMenu.classList.contains('active')) {
            navbarMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
          }
          
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
          
          history.pushState(null, null, targetId);
        }
      });
    });
  }

  updateCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
      </div>
    `;
    
    document.body.prepend(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// Create and initialize the app
const app = new WebsiteApp();

// Export initialization function
export function initWebsite() {
  app.init();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}