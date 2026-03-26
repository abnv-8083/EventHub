/**
 * Reusable Confirmation Modal Component
 * Enhanced with premium glassmorphism and animations
 */
const Confirmation = {
    /**
     * Shows a confirmation modal
     * @param {Object} options - Configuration for the modal
     * @returns {Promise<boolean>}
     */
    show: function(options) {
        const {
            title = 'Confirm Action',
            message = 'Are you sure you want to proceed?',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            type = 'confirm'
        } = options;

        return new Promise((resolve) => {
            let overlay = document.getElementById('confirmation-modal-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'confirmation-modal-overlay';
                overlay.className = 'modal-overlay';
                document.body.appendChild(overlay);
            }

            const iconClass = type === 'delete' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-question';
            const modalVariantClass = type === 'delete' ? 'modal-delete' : 'modal-confirm';
            const accentColor = type === 'delete' ? 'var(--primary)' : '#2ECC71';
            const glowClass = type === 'delete' ? 'glow-primary' : '';

            overlay.innerHTML = `
                <div class="modal-container glass-dark ${modalVariantClass}" style="max-width: 450px; border: 1px solid rgba(255,255,255,0.1);">
                    <div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding: 1.2rem 2rem;">
                        <h3 style="font-size: 1.25rem; font-weight: 700; color: white;">${title}</h3>
                        <div class="modal-close" style="font-size: 1.1rem; opacity: 0.6;"><i class="fa-solid fa-xmark"></i></div>
                    </div>
                    <div class="modal-body text-center" style="padding: 2.5rem 2rem;">
                        <div class="confirmation-icon-wrapper" style="margin-bottom: 1.5rem;">
                            <i class="${iconClass}" style="font-size: 3.5rem; color: ${accentColor}; filter: drop-shadow(0 0 15px ${accentColor}44);"></i>
                        </div>
                        <p style="font-size: 1.05rem; color: var(--text-main); line-height: 1.6; font-weight: 500;">${message}</p>
                    </div>
                    <div class="modal-footer" style="background: rgba(255,255,255,0.03); border-top: 1px solid rgba(255,255,255,0.05); padding: 1.2rem 2rem; gap: 1rem;">
                        <button class="btn btn-outline modal-cancel-btn" style="flex: 1; padding: 0.8rem; border-radius: 10px; font-size: 0.95rem;">${cancelText}</button>
                        <button class="btn btn-primary modal-confirm-btn ${glowClass}" style="flex: 1; padding: 0.8rem; border-radius: 10px; font-size: 0.95rem; background-color: ${accentColor}; border: none;">${confirmText}</button>
                    </div>
                </div>
            `;

            // Add inner styles for unique animations if not already present
            if (!document.getElementById('confirmation-modal-styles')) {
                const style = document.createElement('style');
                style.id = 'confirmation-modal-styles';
                style.innerHTML = `
                    @keyframes confirmationPulse {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.05); opacity: 0.8; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .confirmation-icon-wrapper i {
                        animation: confirmationPulse 2s infinite ease-in-out;
                    }
                    .modal-overlay {
                        backdrop-filter: blur(10px);
                        transition: all 0.3s ease;
                    }
                `;
                document.head.appendChild(style);
            }

            const closeBtn = overlay.querySelector('.modal-close');
            const cancelBtn = overlay.querySelector('.modal-cancel-btn');
            const confirmBtn = overlay.querySelector('.modal-confirm-btn');

            const closeModal = (result) => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.innerHTML = '';
                    resolve(result);
                }, 300);
            };

            closeBtn.onclick = () => closeModal(false);
            cancelBtn.onclick = () => closeModal(false);
            confirmBtn.onclick = () => closeModal(true);

            overlay.onclick = (e) => {
                if (e.target === overlay) closeModal(false);
            };

            // Trigger show animation
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
        });
    }
};

window.Confirmation = Confirmation;
