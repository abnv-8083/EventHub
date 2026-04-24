/**
 * Handles form submission via AJAX (Fetch API)
 * Supports both HTMLFormElement and programmatic configuration objects.
 * @param {HTMLFormElement|Object} target - The form to submit or a config object {action, method, data}
 */
async function submitFormAjax(target) {
    let action, method, body, isMultipart = false;
    let headers = {};
    let submitBtn, originalBtnText;

    if (target instanceof HTMLFormElement) {
        action = target.action;
        method = target.method || 'POST';
        isMultipart = target.enctype === 'multipart/form-data';
        const formData = new FormData(target);
        
        if (isMultipart) {
            body = formData;
        } else {
            const data = Object.fromEntries(formData.entries());
            body = JSON.stringify(data);
            headers['Content-Type'] = 'application/json';
        }

        submitBtn = target.querySelector('[type="submit"]');
        originalBtnText = submitBtn ? submitBtn.innerText : 'Submit';
    } else {
        action = target.action;
        method = target.method || 'POST';
        body = target.data ? JSON.stringify(target.data) : null;
        if (body) headers['Content-Type'] = 'application/json';
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Processing...';
    }

    try {
        const response = await fetch(action, {
            method: method,
            headers: headers,
            body: body
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

                const retryBody = (target instanceof HTMLFormElement && !isMultipart) 
                    ? JSON.stringify({ ...Object.fromEntries(new FormData(target)), confirmed: true })
                    : JSON.stringify({ ...(target.data || {}), confirmed: true });

                const retryResponse = await fetch(action, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: retryBody
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
            if (target instanceof HTMLFormElement) {
                target.dispatchEvent(new CustomEvent('ajax:success', { detail: result }));
            }

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
            if (result.redirect) {
                // If a redirect is provided even on failure, honor it (e.g., being blocked)
                sessionStorage.setItem('pendingToast', JSON.stringify({
                    message: result.message, 
                    type: 'error'
                }));
                window.location.href = result.redirect;
            } else {
                if (typeof showToast === 'function') {
                    showToast(result.message, 'error');
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
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
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check for custom confirmation message
            const confirmMsg = form.dataset.confirm;
            if (confirmMsg) {
                const confirmed = await Confirmation.show({
                    title: form.dataset.confirmTitle || 'Confirm Action',
                    message: confirmMsg,
                    type: form.dataset.confirmType || 'confirm'
                });
                if (!confirmed) return;
            }

            if (typeof window.submitFormAjax === 'function') {
                window.submitFormAjax(form);
            }
        });
    });
});
