/**
 * Handles form submission via AJAX (Fetch API)
 * Expects a JSON response with { success, message, redirect }
 */
async function submitFormAjax(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // UI Feedback: Disable submit button
    const submitBtn = form.querySelector('[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerText : 'Submit';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Processing...';
    }

    try {
        const response = await fetch(form.action, {
            method: form.method || 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        let result = await response.json();

        // --- CONFIRMATION LOGIC ---
        if (result.confirm) {
            const confirmed = await Confirmation.show({
                title: result.confirm.title || 'Are you sure?',
                message: result.confirm.message || 'Please confirm this action.',
                type: result.confirm.type || 'confirm',
                confirmText: result.confirm.confirmText || 'Confirm',
                cancelText: result.confirm.cancelText || 'Cancel'
            });

            if (confirmed) {
                if (submitBtn) submitBtn.innerText = 'Processing...';

                const retryResponse = await fetch(form.action, {
                    method: form.method || 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, confirmed: true })
                });
                result = await retryResponse.json();
            } else {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
                return;
            }
        }

        // --- ORIGINAL TOAST LOGIC ---
        if (result.success) {
            // Dispatch a custom success event for page-specific logic
            form.dispatchEvent(new CustomEvent('ajax:success', { detail: result }));

            if (result.redirect) {
                sessionStorage.setItem('pendingToast', JSON.stringify({
                    message: result.message, 
                    type: 'success'
                }));
                window.location.href = result.redirect;
            } else {
                if (typeof showToast === 'function') {
                    showToast(result.message, 'success');
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            }
        } else {
            if (typeof showToast === 'function') {
                showToast(result.message, 'error');
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        }
    } catch (error) {
        console.error('AJAX Error:', error);
        if (typeof showToast === 'function') {
            showToast('A network error occurred. Please try again.', 'error');
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    }
}

window.submitFormAjax = submitFormAjax;

// Auto-bind to forms that only need AJAX submission (no validation needed)
document.addEventListener('DOMContentLoaded', () => {
    const ajaxForms = document.querySelectorAll('form.ajax-form');
    ajaxForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof window.submitFormAjax === 'function') {
                window.submitFormAjax(form);
            }
        });
    });
});
