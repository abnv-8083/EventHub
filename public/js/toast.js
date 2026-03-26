// Function to show a toast message
function showToast(message, type = 'success') {
    // 1. Check if the container exists, if not, create it
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Add an icon based on the type (using FontAwesome since you linked it in your HTML)
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';

    // Add a close button
    const closeBtn = document.createElement('i');
    closeBtn.className = 'fa-solid fa-xmark toast-close';
    closeBtn.onclick = () => removeToast(toast);

    toast.innerHTML = `${icon} <span style="flex: 1;">${message}</span>`;
    toast.appendChild(closeBtn);

    // 3. Add to container
    container.appendChild(toast);

    // 4. Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10); // Tiny delay to allow CSS transition to work

    // 5. Auto-remove after 4 seconds (increased slightly to give more time if needed)
    const autoRemoveTimeout = setTimeout(() => {
        removeToast(toast);
    }, 4000);

    // Store the timeout ID on the element in case we want to cancel it (not strictly needed here but good practice)
    toast.dataset.timeoutId = autoRemoveTimeout;
}

/**
 * Helper function to remove a toast with animation
 */
function removeToast(toast) {
    if (toast.dataset.timeoutId) {
        clearTimeout(parseInt(toast.dataset.timeoutId));
    }
    toast.classList.remove('show');
    // Wait for slide-out animation to finish before removing from DOM
    setTimeout(() => {
        toast.remove();
    }, 400);
}

// NEW: Check for pending toasts when any page loads
document.addEventListener('DOMContentLoaded', () => {
    const pendingToast = sessionStorage.getItem('pendingToast');
    
    if (pendingToast && typeof showToast === 'function') {
        // Parse the stored string back into an object
        const toastData = JSON.parse(pendingToast);
        
        // Show the toast on the new page
        showToast(toastData.message, toastData.type);
        
        // Delete it so it doesn't show again on page refresh
        sessionStorage.removeItem('pendingToast');
    }
});