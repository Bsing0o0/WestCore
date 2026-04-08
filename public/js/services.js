/**
 * Service Modal Handler
 * Handles opening and closing service detail modals
 */

document.addEventListener('DOMContentLoaded', function() {
    const serviceBlocks = document.querySelectorAll('.service-block');
    
    serviceBlocks.forEach(block => {
        block.addEventListener('click', function() {
            openServiceModal(this);
        });
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('service-modal')) {
            closeAllModals();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
});

function openServiceModal(serviceBlock) {
    // Get service details
    const title = serviceBlock.querySelector('h2').innerHTML;
    const image = serviceBlock.querySelector('.service-image img').src;
    const content = serviceBlock.querySelector('.service-content').innerHTML;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'service-modal';
    modal.innerHTML = `
        <div class="service-modal-content">
            <div class="service-modal-header">
                <img src="${image}" alt="${title.replace(/<[^>]*>/g, '')}">
                <h2 class="service-modal-title">${title}</h2>
                <button class="service-modal-close">×</button>
            </div>
            <div class="service-modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add close button handler
    const closeBtn = modal.querySelector('.service-modal-close');
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeAllModals();
    });
    
    // Prevent modal content clicks from closing modal
    const modalContent = modal.querySelector('.service-modal-content');
    modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Trigger animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    const modals = document.querySelectorAll('.service-modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // Re-enable body scroll
    document.body.style.overflow = '';
}
