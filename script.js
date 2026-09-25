// ===========================================
// NOVAFLOW AI AGENCY — INTERACTIVITY
// ===========================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav a');

    if (mobileBtn && mobileNav) {
        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.toggle('active');
            mobileNav.classList.toggle('open');
            document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : 'auto';
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileBtn.classList.remove('active');
                mobileNav.classList.remove('open');
                document.body.style.overflow = 'auto';
            });
        });
    }

    // 2. Sticky Navbar Background
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                e.preventDefault();
                return;
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answerDiv = item.querySelector('.faq-answer');

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            faqItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-answer').style.maxHeight = null;
            });

            // Open if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                answerDiv.style.maxHeight = answerDiv.scrollHeight + "px";
            }
        });
    });

    // 5. Contact Form Submission via Web3Forms
    const form = document.getElementById('inquiryForm');
    const formMessage = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;

            const formData = new FormData(form);

            // Simple client-side validation
            if (!formData.get('name') || !formData.get('email') || !formData.get('needs')) {
                showMessage('Please fill out all required fields.', 'error');
                return;
            }

            // Check if Access Key is still placeholder
            if (formData.get('access_key') === 'YOUR_ACCESS_KEY_HERE') {
                showMessage('Form is missing the Access Key. Please complete the manual setup.', 'error');
                return;
            }

            btn.innerText = 'Sending Request...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                // --- ADDED: Sync to Google Sheets CRM ---
                const googleSheetURL = 'https://script.google.com/macros/s/AKfycbwkGX5abaTOm3-urX13b7xAYWsyoVjuWgMD0MK_e7YvlsfcfYvchaoMHr-hLt8yvgrCLg/exec';
                try {
                    const crmData = new URLSearchParams();
                    for (const pair of formData.entries()) {
                        crmData.append(pair[0], pair[1]);
                    }
                    fetch(googleSheetURL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: crmData.toString()
                    }).catch(e => console.log('CRM Sync error', e));
                } catch (err) {
                    console.error('CRM Sync failed', err);
                }
                // ----------------------------------------


                if (data.success) {
                    btn.innerText = 'Request Sent!';
                    btn.style.background = 'var(--color-cta)';
                    btn.style.color = '#000';
                    btn.style.opacity = '1';

                    form.reset();
                    showMessage('Your audit request has been received. We will be in touch shortly!', 'success');

                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.style.background = '';
                        btn.style.color = '';
                        btn.disabled = false;
                        formMessage.style.display = 'none';
                    }, 5000);
                } else {
                    showMessage(data.message || 'Something went wrong. Please try again.', 'error');
                    btn.innerText = originalText;
                    btn.style.opacity = '1';
                    btn.disabled = false;
                }
            } catch (error) {
                showMessage('Network error. Please check your connection and try again.', 'error');
                btn.innerText = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
            }
        });
    }

    function showMessage(msg, type) {
        formMessage.style.display = 'block';
        formMessage.innerText = msg;
        if (type === 'error') {
            formMessage.style.background = 'rgba(255, 59, 48, 0.1)';
            formMessage.style.color = '#ff3b30';
            formMessage.style.border = '1px solid rgba(255, 59, 48, 0.3)';
        } else {
            formMessage.style.background = 'rgba(0, 230, 118, 0.1)';
            formMessage.style.color = '#00e676';
            formMessage.style.border = '1px solid rgba(0, 230, 118, 0.3)';
        }
    }
});
