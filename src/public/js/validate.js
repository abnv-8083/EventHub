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
            if (input.type === 'email') return 'Please enter a valid email address';
            if (input.type === 'url') return 'Please enter a valid URL';
            if (input.type === 'tel') return 'Please enter a valid phone number';
        }
        if (input.validity.tooShort) return `Minimum ${input.minLength} characters required`;
        if (input.validity.tooLong) return `Maximum ${input.maxLength} characters allowed`;
        if (input.validity.rangeUnderflow) return `Value must be at least ${input.min}`;
        if (input.validity.rangeOverflow) return `Value must be at most ${input.max}`;
        if (input.validity.patternMismatch) return input.title || 'Invalid format';
        
        return 'Invalid input'; // Fallback
    }

    // Helper: Show Error (Injects message below input)
    function showError(input, message) {
        // Add error class to input
        input.classList.add('input-error');
        
        // Find or create error message element
        let errorDisplay = input.parentElement.querySelector('.error-text');
        
        // If input is inside a group (like password-group), look at the parent's sibling
        if (!errorDisplay && (input.parentElement.classList.contains('password-group') || input.parentElement.classList.contains('input-group'))) {
            errorDisplay = input.parentElement.parentElement.querySelector('.error-text');
        }

        if (!errorDisplay) {
            errorDisplay = document.createElement('div');
            errorDisplay.className = 'error-text';
            
            // Insert after the input or its container
            if (input.parentElement.classList.contains('password-group') || input.parentElement.classList.contains('input-group')) {
                input.parentElement.insertAdjacentElement('afterend', errorDisplay);
            } else {
                input.insertAdjacentElement('afterend', errorDisplay);
            }
        }
        
        errorDisplay.innerText = message;
        
        // Optional: Update placeholder if empty
        if (input.value === '') {
            input.placeholder = message;
        }
    }

    // Helper: Clear Error
    function clearError(input) {
        input.classList.remove('input-error');
        
        let errorDisplay = input.parentElement.querySelector('.error-text');
        if (!errorDisplay && (input.parentElement.classList.contains('password-group') || input.parentElement.classList.contains('input-group'))) {
            errorDisplay = input.parentElement.parentElement.querySelector('.error-text');
        }

        if (errorDisplay) {
            errorDisplay.remove();
        }

        if (input.dataset.originalPlaceholder !== undefined) {
            input.placeholder = input.dataset.originalPlaceholder;
        }
    }
});