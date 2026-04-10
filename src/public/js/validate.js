document.addEventListener('DOMContentLoaded', () => {
    // 1. Find ALL forms on the page that have the 'needs-validation' class
    const forms = document.querySelectorAll('form.needs-validation');

    forms.forEach(form => {
        // Disable the ugly default browser popups so we can use our custom styling
        form.setAttribute('novalidate', true);

        const inputs = form.querySelectorAll('input, textarea');

        // Store original placeholders and set up "clear error on typing"
        inputs.forEach(input => {
            if (input.type !== 'checkbox' && input.type !== 'radio' && input.type !== 'submit') {
                input.dataset.originalPlaceholder = input.placeholder || '';
                input.addEventListener('input', () => clearError(input));
            }
        });

        form.addEventListener('submit', (e) => {
            let isValid = true;

            inputs.forEach(input => {
                if (input.type === 'submit' || input.type === 'button') return;

                // Special check for Confirm Password fields using a custom data attribute
                const matchName = input.dataset.match;
                if (matchName) {
                    const matchTarget = form.querySelector(`[name="${matchName}"]`);
                    if (matchTarget && input.value !== matchTarget.value) {
                        showError(input, input.dataset.errorMsg || 'Does not match');
                        isValid = false;
                        return; // Skip the rest of the checks for this field
                    }
                }

                // Skip OTP digit boxes - those are handled by custom OTP logic in their own scripts.
                if (input.classList.contains('otp-box')) return;

                // Check standard HTML5 validity (required, minlength, email, etc.)
                if (!input.checkValidity()) {
                    // Use custom error message if provided, otherwise generate one
                    const errorMessage = input.dataset.errorMsg || getErrorMessage(input);
                    showError(input, errorMessage);
                    isValid = false;
                }
            });

            if (!isValid) {
                e.preventDefault();
                return;
            }

            // --- Hand over to AJAX Handler ---
            e.preventDefault();
            if (typeof window.submitFormAjax === 'function') {
                window.submitFormAjax(form);
            } else {
                console.error('AJAX Handler (ajax-handler.js) not loaded!');
                form.submit(); // Fallback to normal submission
            }
        });
    });

    // Helper: Generate clean error messages based on the specific error
    function getErrorMessage(input) {
        if (input.validity.valueMissing) return 'This field is required';
        if (input.validity.typeMismatch) {
            if (input.type === 'email') return 'Valid email required';
            if (input.type === 'url') return 'Valid URL required';
        }
        if (input.validity.tooShort) return `Min ${input.minLength} characters`;
        if (input.validity.patternMismatch) return 'Invalid format';
        return 'Invalid input'; // Fallback
    }

    // Helper: Show Error (same as before)
    function showError(input, message) {
        if (input.type === 'checkbox') return; // Handle checkboxes differently if needed
        input.value = '';
        input.classList.add('input-error');
        input.placeholder = message;
    }

    // Helper: Clear Error (same as before)
    function clearError(input) {
        if (input.classList.contains('input-error')) {
            input.classList.remove('input-error');
            input.placeholder = input.dataset.originalPlaceholder;
        }
    }
});
