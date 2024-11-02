document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const productId = this.dataset.productId;
            window.location.href = `/product/${productId}`;
        });
    });
});
