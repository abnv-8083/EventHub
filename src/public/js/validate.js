document.addEventListener('DOMContentLoaded', () => {
    // 1. Find ALL forms on the page that have the 'needs-validation' class
    const forms = document.querySelectorAll('form.needs-validation');

    forms.forEach(form => {
        // Disable the ugly default browser popups so we can use our custom styling
        form.setAttribute('novalidate', true);

        const inputs = form.querySelectorAll('input, textarea');

        // Store original placeholders and set up inline events
        inputs.forEach(input => {
            if (input.type !== 'checkbox' && input.type !== 'radio' && input.type !== 'submit' && input.type !== 'button') {
                input.dataset.originalPlaceholder = input.placeholder || '';
                
                // Clear error immediately when they start typing
                input.addEventListener('input', () => clearError(input));

                // NEW: Inline Validation - Only if form has been marked as 'was-validated'
                input.addEventListener('blur', () => {
                    if (form.classList.contains('was-validated')) {
                        if (input.hasAttribute('required') || input.value.trim() !== '') {
                            validateSingleInput(input, form);
                        }
                    }
                });
            }
        });

        form.addEventListener('submit', (e) => {
            const submitter = e.submitter || window.event?.submitter;
            const skipValidation = submitter && submitter.hasAttribute('formnovalidate');

            if (!skipValidation) {
                let isValid = true;
                inputs.forEach(input => {
                    if (input.type === 'submit' || input.type === 'button') return;
                    const isInputValid = validateSingleInput(input, form);
                    if (!isInputValid) isValid = false;
                });

                if (!isValid) {
                    e.preventDefault();
                    form.classList.add('was-validated');
                    return;
                }
            }

            // Hand over to AJAX Handler for BOTH draft and final submissions
            e.preventDefault();
            if (typeof window.submitFormAjax === 'function') {
                window.submitFormAjax(form);
            } else {
                form.submit();
            }
        });
    });

    // NEW: Extracted validation logic for a single input
    function validateSingleInput(input, form) {
        // Clear any existing errors first so we have a clean slate
        clearError(input);

        // Skip OTP digit boxes
        if (input.classList.contains('otp-box')) return true;

        // Special check for Confirm Password fields using a custom data attribute
        const matchName = input.dataset.match;
        if (matchName) {
            const matchTarget = form.querySelector(`[name="${matchName}"]`);
            if (matchTarget && input.value !== matchTarget.value && input.value !== '') {
                showError(input, input.dataset.errorMsg || 'Does not match');
                return false;
            }
        }

        // Check standard HTML5 validity (required, minlength, email, pattern, etc.)
        if (!input.checkValidity()) {
            const errorMessage = input.dataset.errorMsg || getErrorMessage(input);
            showError(input, errorMessage);
            return false;
        }

        return true;
    }

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

    // Helper: Show Error (NON-DESTRUCTIVE - No more clearing input.value!)
    function showError(input, message) {
        if (input.type === 'checkbox') return;
        input.classList.add('input-error');
        
        // We only change placeholder if the input is actually empty
        if (input.value === '') {
            input.placeholder = message;
        }
    }

    // Helper: Clear Error
    function clearError(input) {
        if (input.classList.contains('input-error')) {
            input.classList.remove('input-error');
            if (input.dataset.originalPlaceholder !== undefined) {
                input.placeholder = input.dataset.originalPlaceholder;
            }
        }
    }
});