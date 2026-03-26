/**
 * Password Visibility Toggle Handler
 * Dynamically attaches collectors to all .password-toggle buttons
 */
document.addEventListener('DOMContentLoaded', () => {
    // We use event delegation or direct selection depending on the complexity
    // Here direct selection is fine since it's a global script loaded on every page
    const setupToggles = () => {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            // Remove existing listener to avoid duplication if scripts run twice
            button.removeEventListener('click', handleToggle);
            button.addEventListener('click', handleToggle);
        });
    };

    function handleToggle(e) {
        e.preventDefault();
        const button = e.currentTarget;
        const group = button.closest('.password-group');
        const input = group.querySelector('input');
        const icon = button.querySelector('svg');
        
        // Define SVG paths for Eye and Eye-Off
        const eyePath = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
        const eyeOffPath = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

        if (input.type === 'password') {
            input.type = 'text';
            icon.innerHTML = eyeOffPath;
            button.setAttribute('aria-label', 'Hide Password');
        } else {
            input.type = 'password';
            icon.innerHTML = eyePath;
            button.setAttribute('aria-label', 'Show Password');
        }
    }

    // Run on initial load
    setupToggles();

    // Re-run for AJAX-loaded contents or potential dynamic forms
    const observer = new MutationObserver(() => {
        setupToggles();
    });

    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
});
