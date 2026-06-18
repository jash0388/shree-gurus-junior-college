/* ==========================================================================
   SHREE GURUS JUNIOR COLLEGE - Premium Interaction Logic
   Inspired by Proxy Papers Vercel App
   Author: Antigravity Code Assistant
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Loader Stage Timeout
  const stage = document.querySelector('.ob-stage');
  if (stage) {
    // Wait 2.2 seconds (matching the load animation bar transition)
    setTimeout(() => {
      stage.classList.add('loaded');
      document.documentElement.classList.add('pp-ready');
    }, 2200);
  }

  // 2. Navigation Menu Toggle
  const menuBtn = document.querySelector('.Navbar-module__HP0XWa__menuBtn');
  const menuNav = document.querySelector('.Navbar-module__HP0XWa__nav');
  const menuOverlay = document.querySelector('.Menu-module__YsnlLq__menu');
  const scrimClose = document.querySelector('.Menu-module__YsnlLq__scrim');

  if (menuBtn && menuOverlay) {
    const toggleMenu = () => {
      const isOpen = menuOverlay.classList.contains('open');
      if (isOpen) {
        menuOverlay.classList.remove('open');
        menuNav.classList.remove('Navbar-module__HP0XWa__navMenuOpen');
        menuBtn.setAttribute('aria-expanded', 'false');
      } else {
        menuOverlay.classList.add('open');
        menuNav.classList.add('Navbar-module__HP0XWa__navMenuOpen');
        menuBtn.setAttribute('aria-expanded', 'true');
      }
    };

    menuBtn.addEventListener('click', toggleMenu);
    
    if (scrimClose) {
      scrimClose.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking sub-links
    const menuLinks = document.querySelectorAll('.Menu-module__YsnlLq__link');
    menuLinks.forEach(link => {
      link.addEventListener('click', toggleMenu);
    });
  }

  // 3. Document/Subject Conveyor Autoplay
  const trackLeft = document.getElementById('trackLeft');
  const trackRight = document.getElementById('trackRight');

  if (trackLeft && trackRight) {
    let xLeft = 0;
    let xRight = -1500; // start halfway offset

    const speed = 0.6; // pixels per frame

    // Clone rows inside tracks to facilitate infinite marquee loops
    const cloneNodes = (trackElement) => {
      const items = Array.from(trackElement.children);
      items.forEach(item => {
        const clone = item.cloneNode(true);
        trackElement.appendChild(clone);
      });
    };

    cloneNodes(trackLeft);
    cloneNodes(trackRight);

    const animateConveyors = () => {
      // Move left conveyor to the left
      xLeft -= speed;
      // If shifted more than half of scroll width, reset
      const halfWidthLeft = trackLeft.scrollWidth / 2;
      if (Math.abs(xLeft) >= halfWidthLeft) {
        xLeft = 0;
      }
      trackLeft.style.transform = `translateX(${xLeft}px)`;

      // Move right conveyor to the right
      xRight += speed;
      const halfWidthRight = trackRight.scrollWidth / 2;
      if (xRight >= 0) {
        xRight = -halfWidthRight;
      }
      trackRight.style.transform = `translateX(${xRight}px)`;

      requestAnimationFrame(animateConveyors);
    };

    // Delay start until loader clears
    setTimeout(animateConveyors, 2300);
  }

  // 4. Profiles Flip Mechanic
  const flipCards = document.querySelectorAll('.Profiles-module__CPaMNa__card');
  flipCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Prevent flipping if click target is a direct external CTA hyperlink inside
      if (e.target.tagName === 'A') return;
      
      card.classList.toggle('flipped');
    });
  });

  // 5. Scroll effect on floating header
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.Navbar-module__HP0XWa__nav');
    if (header) {
      if (window.scrollY > 100 && window.scrollY > lastScrollY) {
        // Scrolling down - hide nav
        header.style.top = '-80px';
      } else {
        // Scrolling up - show nav
        header.style.top = `${24 * (window.innerWidth < 1024 ? 1 : (window.innerWidth / 1512))}px`;
      }
      lastScrollY = window.scrollY;
    }
  });

  // 6. Filterable Gallery (Gallery Page)
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

  // 7. Lightbox Modal (Gallery Page)
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

  // 8. Interactive Form Validation (Admissions & Contact Page)
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
          input.style.borderColor = '#f7f4f02d';
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
        element.style.borderColor = '#f7f4f02d';
      });
    });
  }
});
