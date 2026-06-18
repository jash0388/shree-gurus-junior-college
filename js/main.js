/* ==========================================================================
   SHREE GURUS JUNIOR COLLEGE - Core Logic
   Author: Antigravity Code Assistant
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  // 2. Sticky Header Class on Scroll
  const mainHeader = document.querySelector('.main-header');
  if (mainHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        mainHeader.classList.add('scrolled');
      } else {
        mainHeader.classList.remove('scrolled');
      }
    });
  }

  // 3. Hero Slideshow Autoplay (Home Page)
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dot');
  
  if (slides.length > 0) {
    let currentSlide = 0;
    let slideInterval;

    const showSlide = (index) => {
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      slides[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
      currentSlide = index;
    };

    const nextSlide = () => {
      let nextIndex = (currentSlide + 1) % slides.length;
      showSlide(nextIndex);
    };

    // Auto-advance every 5 seconds
    const startSlideShow = () => {
      slideInterval = setInterval(nextSlide, 5000);
    };

    const stopSlideShow = () => {
      clearInterval(slideInterval);
    };

    startSlideShow();

    // Click dots to change slide
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        stopSlideShow();
        showSlide(index);
        startSlideShow();
      });
    });
  }

  // 4. Filterable Gallery (Gallery Page)
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (filterBtns.length > 0 && galleryItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Active button styling
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        galleryItems.forEach(item => {
          if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 50);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  // 5. Lightbox Modal (Gallery Page)
  const galleryModal = document.getElementById('galleryModal');
  const modalImg = document.getElementById('modalImg');
  const modalClose = document.querySelector('.modal-close');
  
  if (galleryItems.length > 0 && galleryModal && modalImg) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const imgSrc = item.querySelector('img').getAttribute('src');
        modalImg.setAttribute('src', imgSrc);
        galleryModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Lock background scroll
      });
    });

    const closeModal = () => {
      galleryModal.style.display = 'none';
      document.body.style.overflow = 'auto'; // Unlock background scroll
    };

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    galleryModal.addEventListener('click', (e) => {
      if (e.target === galleryModal) {
        closeModal();
      }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  // 6. Interactive Form Validation (Admissions & Contact Page)
  const collegeForm = document.querySelector('.college-form');
  const successAlert = document.getElementById('successAlert');
  const errorAlert = document.getElementById('errorAlert');

  if (collegeForm) {
    collegeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Reset alerts
      if (successAlert) successAlert.style.display = 'none';
      if (errorAlert) errorAlert.style.display = 'none';

      let isValid = true;
      const requiredInputs = collegeForm.querySelectorAll('[required]');

      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = 'var(--danger-color)';
        } else {
          input.style.borderColor = 'rgba(15, 23, 42, 0.1)';
        }

        // Email regex validation
        if (input.type === 'email' && input.value.trim()) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(input.value.trim())) {
            isValid = false;
            input.style.borderColor = 'var(--danger-color)';
          }
        }

        // Phone pattern validation
        if (input.type === 'tel' && input.value.trim()) {
          const phonePattern = /^[0-9]{10}$/; // Simple 10 digit check for India
          if (!phonePattern.test(input.value.trim().replace(/\s/g, ''))) {
            isValid = false;
            input.style.borderColor = 'var(--danger-color)';
          }
        }
      });

      if (isValid) {
        if (successAlert) {
          successAlert.textContent = collegeForm.hasAttribute('data-success-msg') 
            ? collegeForm.getAttribute('data-success-msg') 
            : 'Form submitted successfully! We will get in touch soon.';
          successAlert.style.display = 'block';
          collegeForm.reset();
          
          // Scroll to top of the form or alert
          successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        if (errorAlert) {
          errorAlert.textContent = 'Please fill out all required fields correctly.';
          errorAlert.style.display = 'block';
          
          errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
    
    // Clear error border on input
    collegeForm.querySelectorAll('input, select, textarea').forEach(element => {
      element.addEventListener('input', () => {
        element.style.borderColor = 'rgba(15, 23, 42, 0.1)';
      });
    });
  }
});
