document.addEventListener('DOMContentLoaded', function() {
    const roastBtn = document.getElementById('roast-btn');
    const usernameInput = document.getElementById('username');
    const resultsSection = document.querySelector('.results-section');

    roastBtn.addEventListener('click', function() {
        if (usernameInput.value.trim() !== '') {
            resultsSection.style.display = 'block';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
            // Add animation effect
            resultsSection.style.opacity = '0';
            setTimeout(() => {
                resultsSection.style.transition = 'opacity 0.5s ease';
                resultsSection.style.opacity = '1';
            }, 100);
        }
    });

    // Allow Enter key to trigger roast
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            roastBtn.click();
        }
    });
});