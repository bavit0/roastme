let GITHUB_TOKEN = localStorage.getItem('github_token') || null;
let HEADERS = GITHUB_TOKEN ? { "Authorization": `bearer ${GITHUB_TOKEN}` } : {};
const GRAPHQL_URL = "https://api.github.com/graphql";
const REST_API_URL = "https://api.github.com";
const forbiddenNames = [
    "chatgpt", "gpt", "claude", "gemini", "copilot",
    "mistral", "perplexity", "bard", "llama", "groq",
    "microsoft", "bing", "viva", "azure"
];
let forbiddenAttempts = 0;
// Fire effect variables
let fireActive = false;
let fireTimeout = null;
// --- NEW: Super Error Handler Setup ---
let isSuperErrorModalActive = false; // Prevent multiple modals
function showSuperErrorModal(errorMessage) {
    if (isSuperErrorModalActive) return; // Prevent stacking
    isSuperErrorModalActive = true;
    const superErrorModal = document.getElementById('super-error-modal');
    const modalText = superErrorModal.querySelector('.modal-text');
    // Optional: Display the actual error message for debugging (comment out if not desired)
    // modalText.textContent = `Something went wrong... (${errorMessage})`;
    modalText.textContent = "Something went wrong...";
    superErrorModal.classList.add('active');
}
function hideSuperErrorModal() {
    const superErrorModal = document.getElementById('super-error-modal');
    superErrorModal.classList.remove('active');
    isSuperErrorModalActive = false;
}
// Global error handler for uncaught exceptions
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Global error handler caught:", message, "at", source, ":", lineno, ":", colno, "Error object:", error);
    // Show the super error modal
    showSuperErrorModal(message || "Unknown error");
    return true; // Prevent default browser error handling (like console)
};
// Global handler for unhandled promise rejections (async errors)
window.addEventListener('unhandledrejection', function(event) {
    console.error("Unhandled promise rejection:", event.reason);
    // Show the super error modal
    showSuperErrorModal(event.reason?.message || "Promise rejection");
    event.preventDefault(); // Prevent default browser error handling
});
// --- END: Super Error Handler Setup ---
// --- NEW: Invalid Username Modal Functions ---
function showInvalidUsernameModal() {
    // Ensure the fire effect is stopped if triggered by invalid input
    stopFireEffect();
    const invalidUsernameModal = document.getElementById('invalid-username-modal');
    invalidUsernameModal.classList.add('active');
}
function hideInvalidUsernameModal() {
    const invalidUsernameModal = document.getElementById('invalid-username-modal');
    invalidUsernameModal.classList.remove('active');
}
// --- END: Invalid Username Modal Functions ---
// --- NEW: User Not Found Modal Functions ---
function showUserNotFoundModal() {
    // Ensure the fire effect is stopped
    stopFireEffect();
    const userNotFoundModal = document.getElementById('user-not-found-modal');
    userNotFoundModal.classList.add('active');
}
function hideUserNotFoundModal() {
    const userNotFoundModal = document.getElementById('user-not-found-modal');
    userNotFoundModal.classList.remove('active');
}
// --- END: User Not Found Modal Functions ---
// Fire effect functions
function createFireParticles() {
    const fireParticles = document.getElementById('fireParticles');
    fireParticles.innerHTML = '';
    for (let i = 0; i < 70; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        // Random size
        const size = Math.random() * 15 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        // Random position within 70% width centered
        const leftPosition = 15 + Math.random() * 70; // 15% to 85% (70% width centered)
        particle.style.left = `${leftPosition}%`;
        // Random animation delay and duration
        const delay = Math.random() * 3;
        const duration = Math.random() * 2 + 1;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        // Random color
        const colors = [
            'rgba(255, 100, 0, 0.8)',
            'rgba(255, 50, 0, 0.8)',
            'rgba(255, 150, 0, 0.8)',
            'rgba(255, 80, 0, 0.8)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        fireParticles.appendChild(particle);
    }
}
function startFireEffect() {
    if (fireActive) return;
    const fireContainer = document.getElementById('fireContainer');
    fireContainer.classList.remove('fade-out');
    fireContainer.classList.add('active');
    fireActive = true;
    // Auto-stop fire after 10 seconds if not stopped manually
    if (fireTimeout) clearTimeout(fireTimeout);
    fireTimeout = setTimeout(stopFireEffect, 10000);
}
function stopFireEffect() {
    if (!fireActive) return;
    const fireContainer = document.getElementById('fireContainer');
    fireContainer.classList.remove('active');
    fireContainer.classList.add('fade-out');
    fireActive = false;
    if (fireTimeout) {
        clearTimeout(fireTimeout);
        fireTimeout = null;
    }
}
// Helper function to check if an error is a rate limit error
function isRateLimitError(error) {
    // Check if it's a rate limit error based on message or status code
    return error.message.includes('rate limit') ||
           error.message.includes('API rate limit exceeded') ||
           error.message.includes('Status: 403') ||
           error.message.includes('Status: 429') ||
           error.message.includes('429') ||
           error.message.includes('403');
}
document.addEventListener('DOMContentLoaded', function() {
    const customScrollbar = document.getElementById('custom-scrollbar');
    const scrollbarThumb = document.getElementById('scrollbar-thumb');
    const contentWrapper = document.getElementById('content-wrapper');
    const roastBtn = document.getElementById('roast-btn');
    const usernameInput = document.getElementById('username');
    const resultsSection = document.getElementById('results-section');
    const faqBtn = document.getElementById('faq-btn');
    const aboutBtn = document.getElementById('about-btn');
    const tokenBtn = document.getElementById('token-btn');
    const hallOfFameBtn = document.getElementById('hall-of-fame-btn');
    const compilerTrigger = document.getElementById('compiler-trigger');
    const faqSection = document.getElementById('faq-section');
    const aboutSection = document.getElementById('about-section');
    const tokenSection = document.getElementById('token-section');
    const hallOfFameSection = document.getElementById('hall-of-fame-section');
    const compilerSection = document.getElementById('compiler-section');
    const navButtons = document.querySelectorAll('.nav-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const rateLimitModal = document.getElementById('rate-limit-modal');
    const rateLimitText = document.getElementById('rate-limit-text');
    const gotItBtn = document.getElementById('got-it-btn');
    const tokenModal = document.getElementById('token-modal');
    const modalTokenInput = document.getElementById('modal-token-input');
    const modalSaveTokenBtn = document.getElementById('modal-save-token-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalTokenStatus = document.getElementById('modal-token-status');
    const toggleResultsBtn = document.getElementById('toggle-results-btn');
    const tokenInput = document.getElementById('token-input');
    const saveTokenBtn = document.getElementById('save-token-btn');
    const tokenStatus = document.getElementById('token-status');
    const forbiddenModal = document.getElementById('forbidden-modal');
    const forbiddenOkBtn = document.getElementById('forbidden-ok-btn');
    const robotModal = document.getElementById('robot-modal');
    const typewriterText = document.getElementById('typewriter-text');
    const robotButtons = document.getElementById('robot-buttons');
    const submitBtn1 = document.getElementById('submit-btn-1');
    const submitBtn2 = document.getElementById('submit-btn-2');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const emojiShowcase = document.getElementById('emoji-showcase');
     // --- NEW: Super Error Modal Buttons ---
    const superErrorModal = document.getElementById('super-error-modal');
    const frownBtn = document.getElementById('frown-btn');
    const petErrorBtn = document.getElementById('pet-error-btn');
    // --- END: Super Error Modal Buttons ---
    // --- NEW: Invalid Username Modal Elements ---
    const invalidUsernameModal = document.getElementById('invalid-username-modal');
    const invalidUsernameGotItBtn = document.getElementById('invalid-username-got-it-btn');
    // --- END: Invalid Username Modal Elements ---
    // --- NEW: User Not Found Modal Elements ---
    const userNotFoundModal = document.getElementById('user-not-found-modal');
    const userNotFoundGotItBtn = document.getElementById('user-not-found-got-it-btn');
    // --- END: User Not Found Modal Elements ---
    let isScrolling = false;
    // Initialize fire particles
    createFireParticles();
    function handleScroll() {
        if (!isScrolling) {
            window.requestAnimationFrame(function() {
                const scrollPercent = (contentWrapper.scrollTop / (contentWrapper.scrollHeight - contentWrapper.clientHeight)) * 100;
                if (scrollPercent >= 40) {
                    scrollToTopBtn.classList.add('visible');
                } else {
                    scrollToTopBtn.classList.remove('visible');
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    }
    scrollToTopBtn.addEventListener('click', function() {
        contentWrapper.scrollTo({ top: 0, behavior: 'smooth' });
    });
    contentWrapper.addEventListener('scroll', handleScroll);
    if (GITHUB_TOKEN) {
        tokenInput.value = GITHUB_TOKEN;
        modalTokenInput.value = GITHUB_TOKEN;
        saveTokenBtn.textContent = 'Delete Token';
        saveTokenBtn.classList.remove('primary-btn');
        saveTokenBtn.classList.add('delete-token-btn');
    }
    // --- NEW: Initialize Emoji Showcase with Bug if Petted ---
    function initializeEmojiShowcase() {
        const bugEmojiPetted = localStorage.getItem('bugEmojiPetted');
        if (bugEmojiPetted === 'true') {
            const bugSpan = document.createElement('span');
            bugSpan.textContent = '🐛';
            bugSpan.classList.add('bug-emoji'); // Add class for specific styling/animation
            emojiShowcase.appendChild(bugSpan);
        }
    }
    initializeEmojiShowcase(); // Call on page load
    // --- END: Initialize Emoji Showcase ---
    function initCustomScrollbar() {
        if (contentWrapper.scrollHeight > window.innerHeight) {
            customScrollbar.classList.add('visible');
        }
        contentWrapper.addEventListener('scroll', updateCustomScrollbar);
        window.addEventListener('resize', updateCustomScrollbar);
        updateCustomScrollbar();
    }
    function updateCustomScrollbar() {
        const contentHeight = contentWrapper.scrollHeight;
        const viewportHeight = window.innerHeight;
        const scrollPosition = contentWrapper.scrollTop;
        if (contentHeight <= viewportHeight) {
            customScrollbar.classList.remove('visible');
            return;
        }
        customScrollbar.classList.add('visible');
        const thumbHeightRatio = Math.min(1, viewportHeight / contentHeight);
        const thumbHeight = Math.max(30, thumbHeightRatio * viewportHeight);
        const maxScroll = contentHeight - viewportHeight;
        const scrollRatio = maxScroll > 0 ? scrollPosition / maxScroll : 0;
        const maxThumbPosition = viewportHeight - thumbHeight;
        const thumbPosition = scrollRatio * maxThumbPosition;
        scrollbarThumb.style.height = `${thumbHeight}px`;
        scrollbarThumb.style.top = `${thumbPosition}px`;
    }
    let isDragging = false;
    let startY;
    let startScrollTop;
    scrollbarThumb.addEventListener('mousedown', function(e) {
        isDragging = true;
        startY = e.clientY;
        startScrollTop = contentWrapper.scrollTop;
        scrollbarThumb.classList.add('dragging');
        e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const deltaY = e.clientY - startY;
        const contentHeight = contentWrapper.scrollHeight;
        const viewportHeight = window.innerHeight;
        const scrollRatio = viewportHeight / contentHeight;
        const scrollDelta = deltaY / scrollRatio;
        contentWrapper.scrollTop = startScrollTop + scrollDelta;
    });
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            scrollbarThumb.classList.remove('dragging');
        }
    });
    contentWrapper.addEventListener('wheel', function() {
        setTimeout(updateCustomScrollbar, 0);
    });
    customScrollbar.addEventListener('mouseenter', function() {
        if (contentWrapper.scrollHeight > window.innerHeight) {
            customScrollbar.classList.add('visible');
        }
    });
    let hideTimeout;
    function scheduleHideScrollbar() {
        clearTimeout(hideTimeout);
        if (!isDragging) {
            hideTimeout = setTimeout(() => {
                if (!customScrollbar.matches(':hover')) {
                    customScrollbar.classList.remove('visible');
                }
            }, 1000);
        }
    }
    contentWrapper.addEventListener('scroll', scheduleHideScrollbar);
    customScrollbar.addEventListener('mouseleave', scheduleHideScrollbar);
    window.addEventListener('load', initCustomScrollbar);
    // --- MODIFIED roastBtn Event Listener ---
    roastBtn.addEventListener('click', async function() {
        // 1. Clean the input (trim spaces)
        let username = usernameInput.value.trim();
        // 2. Basic client-side validation using regex
        // GitHub username rules (simplified common ones):
        // - 1 to 39 characters long
        // - Contains only alphanumeric characters or single hyphens
        // - Does not begin or end with a hyphen
        const githubUsernameRegex = /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/;
        if (!username) {
            // Handle empty input
            showInvalidUsernameModal();
            return; // Stop execution
        }
        if (!githubUsernameRegex.test(username)) {
            // 3. If format is invalid, show the new modal
            showInvalidUsernameModal();
            return; // Stop execution, don't proceed to API call
        }
        // If format is valid, proceed with checks
        if (forbiddenNames.includes(username.toLowerCase())) {
            forbiddenAttempts++;
            forbiddenModal.classList.add('active');
            if (forbiddenAttempts >= 4) {
                setTimeout(() => {
                    forbiddenModal.classList.remove('active');
                    robotModal.classList.add('active');
                    typeWriterText("Oh Great One, I bow before your greatness and solemnly pinky swear not to do that again.");
                }, 500);
            }
            return; // Stop if forbidden
        }
        // Update the input field with the cleaned username
        usernameInput.value = username;
        const useGraphQL = !!GITHUB_TOKEN;
        // Start fire effect when analysis begins
        startFireEffect();
        // Wrap the analysis call in a try/catch to handle errors locally if needed,
        // but re-throw to let the global handler catch them for the super error modal.
        try {
             await performAnalysis(username, !useGraphQL);
        } catch (error) {
            // Stop fire effect on ANY error caught here
            stopFireEffect();
            console.error("Error in roastBtn click handler:", error);
            // --- NEW: Check for "User Not Found" FIRST ---
            // Check if the error message indicates the user was not found.
            const userNotFoundIndicators = [
                "User", // REST API 404 message structure
                "Could not resolve to a User", // GraphQL specific error message
                "NOT_FOUND" // General GraphQL error code if present
            ];
            const isUserNotFoundError = userNotFoundIndicators.some(indicator =>
                error.message && error.message.includes(indicator)
            );
            if (isUserNotFoundError) {
                 // --- HANDLE USER NOT FOUND GRACEFULLY ---
                 // Show the new User Not Found modal
                 console.log("User not found error caught and handled gracefully:", error.message);
                 showUserNotFoundModal(); // Use the new dedicated function
                 return; // Exit the catch block, do not show Super Error Modal or process as rate limit
            }
            // --- END NEW: Check for "User Not Found" ---
            // Check if it's a rate limit error handled specifically
            if (isRateLimitError(error)) {
                // Rate limit errors are handled inside performAnalysis or by the check above if thrown directly.
                // The performAnalysis function shows the rate limit modal.
                console.log("Rate limit error handled internally or by performAnalysis.");
                // Prevent the global handler from catching this specific rate limit error again.
                return;
            }
             // For other unexpected errors, re-throw to trigger the global handler (Super Error Modal)
             // This ensures that genuine problems (network issues, code bugs) still show the Super Error Modal.
             throw error;
        }
        // Note: The fire effect stop is also handled in performAnalysis's finally block.
        // Keeping it here ensures it stops even if performAnalysis doesn't run its finally (unlikely)
        // or if an error is caught and handled before performAnalysis completes.
    });
    // --- END MODIFIED roastBtn Event Listener ---
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            roastBtn.click();
        }
    });
    gotItBtn.addEventListener('click', function() {
        rateLimitModal.classList.remove('active');
        // Stop fire effect when modal is closed
        stopFireEffect();
    });
    modalSaveTokenBtn.addEventListener('click', async function() {
        const token = modalTokenInput.value.trim();
        if (token) {
            const isValid = await testToken(token);
            if (isValid) {
                localStorage.setItem('github_token', token);
                GITHUB_TOKEN = token;
                HEADERS = { "Authorization": `bearer ${GITHUB_TOKEN}` };
                showTokenStatus(modalTokenStatus, 'Token is valid and saved!', true);
                tokenModal.classList.remove('active');
                const username = usernameInput.value.trim();
                if (username) {
                    // Wrap in try/catch to potentially catch errors during re-analysis
                    try {
                        await performAnalysis(username, false);
                    } catch (e) {
                        // Re-throw to let global handler catch it
                        throw e;
                    }
                }
            } else {
                showTokenStatus(modalTokenStatus, 'Invalid token. Please check and try again.', false);
            }
        } else {
            showTokenStatus(modalTokenStatus, 'Please enter a token', false);
        }
    });
    modalCancelBtn.addEventListener('click', function() {
        tokenModal.classList.remove('active');
        // Stop fire effect when modal is closed
        stopFireEffect();
    });
    saveTokenBtn.addEventListener('click', async function() {
        if (GITHUB_TOKEN) {
            // Delete token
            localStorage.removeItem('github_token');
            GITHUB_TOKEN = null;
            HEADERS = {};
            tokenInput.value = '';
            showTokenStatus(tokenStatus, 'Token has been deleted', true);
            saveTokenBtn.textContent = 'Save Token';
            saveTokenBtn.classList.remove('delete-token-btn');
            saveTokenBtn.classList.add('primary-btn');
        } else {
            // Save new token
            const token = tokenInput.value.trim();
            if (token) {
                const isValid = await testToken(token);
                if (isValid) {
                    localStorage.setItem('github_token', token);
                    GITHUB_TOKEN = token;
                    HEADERS = { "Authorization": `bearer ${GITHUB_TOKEN}` };
                    showTokenStatus(tokenStatus, 'Token is valid and saved!', true);
                    saveTokenBtn.textContent = 'Delete Token';
                    saveTokenBtn.classList.remove('primary-btn');
                    saveTokenBtn.classList.add('delete-token-btn');
                } else {
                    showTokenStatus(tokenStatus, 'Invalid token. Please check and try again.', false);
                }
            } else {
                showTokenStatus(tokenStatus, 'Please enter a token', false);
            }
        }
    });
    tokenBtn.addEventListener('click', function() {
        faqSection.style.display = 'none';
        aboutSection.style.display = 'none';
        hallOfFameSection.style.display = 'none';
        compilerSection.style.display = 'none';
        navButtons.forEach(btn => btn.classList.remove('active'));
        if (tokenSection.style.display === 'block') {
            tokenSection.style.display = 'none';
        } else {
            tokenSection.style.display = 'block';
            tokenBtn.classList.add('active');
            if (GITHUB_TOKEN) {
                checkTokenStatus(GITHUB_TOKEN);
            }
        }
        tokenSection.scrollIntoView({ behavior: 'smooth' });
    });
    hallOfFameBtn.addEventListener('click', function() {
        faqSection.style.display = 'none';
        aboutSection.style.display = 'none';
        tokenSection.style.display = 'none';
        compilerSection.style.display = 'none';
        navButtons.forEach(btn => btn.classList.remove('active'));
        if (hallOfFameSection.style.display === 'block') {
            hallOfFameSection.style.display = 'none';
        } else {
            hallOfFameSection.style.display = 'block';
        }
        hallOfFameSection.scrollIntoView({ behavior: 'smooth' });
    });
    faqBtn.addEventListener('click', function() {
        aboutSection.style.display = 'none';
        tokenSection.style.display = 'none';
        hallOfFameSection.style.display = 'none';
        compilerSection.style.display = 'none';
        if (faqSection.style.display === 'block') {
            faqSection.style.display = 'none';
            faqBtn.classList.remove('active');
        } else {
            faqSection.style.display = 'block';
            faqBtn.classList.add('active');
            aboutBtn.classList.remove('active');
            tokenBtn.classList.remove('active');
        }
        faqSection.scrollIntoView({ behavior: 'smooth' });
    });
    aboutBtn.addEventListener('click', function() {
        faqSection.style.display = 'none';
        tokenSection.style.display = 'none';
        hallOfFameSection.style.display = 'none';
        compilerSection.style.display = 'none';
        if (aboutSection.style.display === 'block') {
            aboutSection.style.display = 'none';
            aboutBtn.classList.remove('active');
        } else {
            aboutSection.style.display = 'block';
            aboutBtn.classList.add('active');
            faqBtn.classList.remove('active');
            tokenBtn.classList.remove('active');
        }
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    });
    compilerTrigger.addEventListener('click', function(e) {
        const rect = compilerTrigger.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const hitboxSize = 4;
        if (e.clientX >= centerX - hitboxSize &&
            e.clientX <= centerX + hitboxSize &&
            e.clientY >= centerY - hitboxSize &&
            e.clientY <= centerY + hitboxSize) {
            faqSection.style.display = 'none';
            aboutSection.style.display = 'none';
            tokenSection.style.display = 'none';
            hallOfFameSection.style.display = 'none';
            navButtons.forEach(btn => btn.classList.remove('active'));
            compilerSection.style.display = 'block';
            compilerSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
    compilerTrigger.addEventListener('mousemove', function(e) {
        const rect = compilerTrigger.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const hitboxSize = 5;
        if (e.clientX >= centerX - hitboxSize &&
            e.clientX <= centerX + hitboxSize &&
            e.clientY >= centerY - hitboxSize &&
            e.clientY <= centerY + hitboxSize) {
            compilerTrigger.style.cursor = 'crosshair';
        } else {
            compilerTrigger.style.cursor = 'pointer';
        }
    });
    toggleResultsBtn.addEventListener('click', function() {
        if (resultsSection.style.display === 'none') {
            resultsSection.style.display = 'block';
            toggleResultsBtn.textContent = 'Hide Analysis Results';
            const repoAnalysis = document.getElementById('repo-analysis');
            const showAllBtnId = repoAnalysis?.dataset?.showAllButtonId;
            const showAllBtn = document.getElementById(showAllBtnId);
            if (showAllBtn) {
                if (showAllBtn.dataset.wasVisible === 'true') {
                    showAllBtn.style.display = 'block';
                }
            }
        } else {
            resultsSection.style.display = 'none';
            toggleResultsBtn.textContent = 'Show Analysis Results';
            const repoAnalysis = document.getElementById('repo-analysis');
            const showAllBtnId = repoAnalysis?.dataset?.showAllButtonId;
            const showAllBtn = document.getElementById(showAllBtnId);
            if (showAllBtn) {
                showAllBtn.dataset.wasVisible = showAllBtn.style.display === 'block' ? 'true' : 'false';
                showAllBtn.style.display = 'none';
            }
        }
    });
    function updateProgress(percent, message) {
        progressFill.style.width = `${percent}%`;
        progressText.textContent = message;
    }
    function showTokenStatus(element, message, isValid) {
        element.textContent = message;
        element.className = 'token-status';
        element.classList.add(isValid ? 'token-valid' : 'token-invalid');
        element.style.display = 'block';
    }
    async function testToken(token) {
        try {
            const testHeaders = { "Authorization": `bearer ${token}` };
            const query = `query { viewer { login } }`;
            const response = await fetch(GRAPHQL_URL, {
                method: 'POST',
                headers: testHeaders,
                body: JSON.stringify({ query: query })
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    async function checkTokenStatus(token) {
        const isValid = await testToken(token);
        if (isValid) {
            showTokenStatus(tokenStatus, 'Current token is valid', true);
        } else {
            showTokenStatus(tokenStatus, 'Current token is invalid', false);
        }
    }
    async function getUserIdRest(username) {
        updateProgress(10, 'Fetching user ID (REST)...');
        const url = `${REST_API_URL}/users/${username}`;
        const response = await fetch(url, { headers: {} });
        if (!response.ok) {
            // Check for rate limit errors (both 403 and 429)
            if (response.status === 403 || response.status === 429) {
                const errorText = await response.text();
                throw new Error(`REST API rate limit exceeded. Status: ${response.status}. Message: ${errorText}`);
            }
            // Check for 404 Not Found
            if (response.status === 404) {
                 throw new Error(`User '${username}' not found`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        return userData.id;
    }
    async function fetchRepositoriesRest(username) {
        updateProgress(20, 'Fetching repositories (REST)...');
        const ownedRepos = [];
        const contributedRepos = [];
        let ownedPage = 1;
        let ownedHasMore = true;
        while (ownedHasMore && ownedRepos.length < 100) {
            const ownedUrl = `${REST_API_URL}/users/${username}/repos?sort=updated&direction=desc&per_page=100&page=${ownedPage}`;
            const ownedResponse = await fetch(ownedUrl, { headers: {} });
            if (!ownedResponse.ok) {
                // Check for rate limit errors (both 403 and 429)
                if (ownedResponse.status === 403 || ownedResponse.status === 429) {
                    const errorText = await ownedResponse.text();
                    throw new Error(`REST API rate limit exceeded. Status: ${ownedResponse.status}. Message: ${errorText}`);
                }
                // Check for 404 Not Found (user not found)
                if (ownedResponse.status === 404) {
                     throw new Error(`User '${username}' not found`);
                }
                throw new Error(`HTTP error! status: ${ownedResponse.status}`);
            }
            const ownedData = await ownedResponse.json();
            if (ownedData.length === 0) {
                ownedHasMore = false;
            } else {
                ownedRepos.push(...ownedData.map(repo => ({
                    id: repo.id,
                    name: repo.name,
                    url: repo.html_url,
                    owner: { login: repo.owner.login },
                    defaultBranchRef: repo.default_branch ? { name: repo.default_branch } : null
                })));
                ownedPage++;
            }
        }
        let contribPage = 1;
        let contribHasMore = true;
        const processedRepoIds = new Set(ownedRepos.map(r => r.id));
        while (contribHasMore && contributedRepos.length < 100) {
            if (contribPage > 1) break;
            const starredUrl = `${REST_API_URL}/users/${username}/starred?per_page=30&page=${contribPage}`;
            const starredResponse = await fetch(starredUrl, { headers: {} });
            if (!starredResponse.ok) {
                // Check for rate limit errors (both 403 and 429)
                if (starredResponse.status === 403 || starredResponse.status === 429) {
                    const errorText = await starredResponse.text();
                    throw new Error(`REST API rate limit exceeded. Status: ${starredResponse.status}. Message: ${errorText}`);
                }
                // Check for 404 Not Found (user not found)
                if (starredResponse.status === 404) {
                     throw new Error(`User '${username}' not found`);
                }
                console.warn("Failed to fetch starred repos. Skipping contributed repos for REST fallback.");
                break;
            }
            const starredData = await starredResponse.json();
            if (starredData.length === 0) {
                contribHasMore = false;
            } else {
                for (const repo of starredData) {
                    if (contributedRepos.length >= 100) break;
                    if (!processedRepoIds.has(repo.id)) {
                        contributedRepos.push({
                            id: repo.id,
                            name: repo.name,
                            url: repo.html_url,
                            owner: { login: repo.owner.login },
                            defaultBranchRef: repo.default_branch ? { name: repo.default_branch } : null
                        });
                        processedRepoIds.add(repo.id);
                    }
                }
                contribPage++;
            }
        }
        return {
            ownedRepos: ownedRepos.slice(0, 100),
            contributedRepos: contributedRepos.slice(0, 100)
        };
    }
    async function fetchRepoCommitsRest(owner, name, userId, username) {
        const repoCommits = [];
        let commitsPage = 1;
        let commitsHasMore = true;
        while (commitsHasMore && repoCommits.length < 1000) {
            const perPage = 100;
            const commitsUrl = `${REST_API_URL}/repos/${owner}/${name}/commits?per_page=${perPage}&page=${commitsPage}`;
            const commitsResponse = await fetch(commitsUrl, { headers: {} });
            if (!commitsResponse.ok) {
                // Check for rate limit errors (both 403 and 429)
                if (commitsResponse.status === 403 || commitsResponse.status === 429) {
                    const errorText = await commitsResponse.text();
                    throw new Error(`REST API rate limit exceeded. Status: ${commitsResponse.status}. Message: ${errorText}`);
                }
                // Check for 404 Not Found (repo not found) - This is less likely to be the main "user not found" case
                // but good to handle.
                if (commitsResponse.status === 404) {
                     console.warn(`Repository ${owner}/${name} not found. Skipping commits.`);
                     break; // Stop fetching commits for this repo
                }
                console.warn(`Failed to fetch commits for ${owner}/${name}. Status: ${commitsResponse.status}. Skipping.`);
                break;
            }
            const commitsData = await commitsResponse.json();
            if (commitsData.length === 0) {
                commitsHasMore = false;
            } else {
                const newCommits = commitsData.map(commit => ({
                    message: commit.commit.message,
                    date: commit.commit.author.date,
                    author: commit.author ? commit.author.login : 'Unknown'
                }));
                repoCommits.push(...newCommits);
                commitsPage++;
                if (commitsData.length < perPage) {
                    commitsHasMore = false;
                }
            }
        }
        return repoCommits;
    }
    async function fetchCommitsForAllReposConcurrentRest(repos, userId, username) {
        updateProgress(30, 'Fetching commit history (REST)...');
        const validRepos = repos.filter(repo => repo.defaultBranchRef);
        const commitPromises = validRepos.map(repo =>
            fetchRepoCommitsRest(repo.owner.login, repo.name, userId, username)
                .then(repoCommits => ({
                    owner: repo.owner.login,
                    name: repo.name,
                    url: repo.url,
                    branch: repo.defaultBranchRef ? repo.defaultBranchRef.name : 'main',
                    commit_count: repoCommits.length,
                    commits: repoCommits
                }))
                .catch(error => {
                    console.error(`Error fetching commits for ${repo.owner.login}/${repo.name} (REST):`, error);
                    return {
                        owner: repo.owner.login,
                        name: repo.name,
                        url: repo.url,
                        branch: repo.defaultBranchRef ? repo.defaultBranchRef.name : 'main',
                        commit_count: 0,
                        commits: [],
                        error: error.message
                    };
                })
        );
        const totalRepos = commitPromises.length;
        const results = [];
        const batchSize = 5;
        for (let i = 0; i < commitPromises.length; i += batchSize) {
            const batch = commitPromises.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch);
            results.push(...batchResults.filter(result => result !== null));
            const progress = 30 + ((i + batchSize) / totalRepos) * 60;
            updateProgress(Math.min(progress, 90), `Processed ${Math.min(i + batchSize, totalRepos)} of ${totalRepos} repositories (REST)...`);
        }
        return results.filter(result => result !== null);
    }
    async function performAnalysis(username, useRestFallback = true) {
        progressContainer.style.display = 'block';
        updateProgress(0, useRestFallback ? 'Initializing analysis (REST)...' : 'Initializing analysis...');
        faqSection.style.display = 'none';
        aboutSection.style.display = 'none';
        tokenSection.style.display = 'none';
        hallOfFameSection.style.display = 'none';
        compilerSection.style.display = 'none';
        navButtons.forEach(btn => btn.classList.remove('active'));
        try {
            await analyzeUser(username, useRestFallback);
            resultsSection.style.display = 'block';
            toggleResultsBtn.style.display = 'block';
            toggleResultsBtn.textContent = 'Hide Analysis Results';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            resultsSection.style.opacity = '0';
            setTimeout(() => {
                resultsSection.style.transition = 'opacity 0.5s ease';
                resultsSection.style.opacity = '1';
            }, 100);
        } catch (error) {
            console.error('Error in performAnalysis:', error);
            // Stop fire effect immediately on any error caught here
            stopFireEffect();
            // Hide progress bar immediately on any error caught here
            progressContainer.style.display = 'none';
            // --- NEW: Check for "User Not Found" FIRST ---
            // This handles errors from both REST and GraphQL API calls
            const userNotFoundIndicators = [
                "User", // REST API 404 message structure
                "Could not resolve to a User", // GraphQL specific error message
                "NOT_FOUND" // General GraphQL error code if present
            ];
            const isUserNotFoundError = userNotFoundIndicators.some(indicator =>
                error.message && error.message.includes(indicator)
            );
            if (isUserNotFoundError) {
                console.log("User not found error caught in performAnalysis:", error.message);
                // Show the new User Not Found modal
                showUserNotFoundModal(); // Use the new dedicated function
                return; // Exit the catch block, do not process as rate limit or show Super Error Modal
            }
            // --- END NEW: Check for "User Not Found" ---
            // Check for rate limit error specifically
            if (isRateLimitError(error)) {
                // Show rate limit modal
                if (useRestFallback && !GITHUB_TOKEN) {
                    rateLimitText.innerHTML = `
                        <p>You've hit the request limit 🥀</p>
                        <p style="margin-bottom: 15px;"></p>
                        <p>No worries—just wait an hour for it to reset, or connect with a GitHub token to keep going right away.</p>
                    `;
                    rateLimitModal.classList.add('active');
                } else if (GITHUB_TOKEN) {
                    rateLimitText.innerHTML = `
                        <p>You've hit the request limit 🥀.</p>
                        <p style="margin-bottom: 15px;"></p>
                        <p>No worries—just wait an hour for it to reset…</p>
                        <p style="margin-top: 20px; text-align: center; font-style: italic;">
                            Oh my—what a feat! 🏅<br>
                            You’re using a token and still managed to max it out!<br>
                            Here’s a shiny trophy for your legendary clicking skills! 🏆
                        </p>
                    `;
                    rateLimitModal.classList.add('active');
                } else {
                    // Fallback alert, though modal should be shown
                    alert('Error analyzing user: ' + error.message);
                }
                // Do not re-throw rate limit errors as they are handled here
                return; // Exit the catch block
            } else {
                // For other errors caught here (e.g., network issues, code bugs),
                // re-throw them so the global error handler can catch them
                // and show the super error modal.
                throw error; // This will be caught by window.onerror/unhandledrejection
            }
        } finally {
            // The finally block should ideally handle cleanup that always needs to run,
            // but stopFireEffect is also called in the specific error handlers above.
            // It's okay to call it here too, as it checks if the fire is active.
            // However, hiding progressContainer is better done in the specific handlers
            // right after determining the type of error, as the `finally` might run
            // even if we `return` early from the `catch`.
            progressContainer.style.display = 'none'; // Consider removing from here
            stopFireEffect(); // Consider removing from here if handled in catch
             // Or, keep them but be aware they run even on early returns.
        }
    }
    async function getUserId(username, useRestFallback = true) {
        if (useRestFallback) {
            return await getUserIdRest(username);
        }
        updateProgress(10, 'Fetching user ID...');
        const query = `query($login: String!) { user(login: $login) { id } }`;
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({
                query: query,
                variables: { login: username }
            })
        });
        if (!response.ok) {
            // Check for rate limit in GraphQL response
            if (response.status === 403 || response.status === 429) {
                 const errorText = await response.text();
                 if (errorText.includes('rate limit') || errorText.includes('API rate limit exceeded')) {
                      throw new Error(`GraphQL API rate limit exceeded. Status: ${response.status}. Message: ${errorText}`);
                 }
            }
            // Check for 404-like error in GraphQL response text
            const errorText = await response.text();
            if (errorText.includes("Could not resolve to a User")) {
                 throw new Error(`Could not resolve to a User with the login of '${username}'.`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.errors) {
            // Check if the error is related to rate limiting
            const errorMessage = result.errors[0]?.message || 'Unknown GraphQL error';
            if (errorMessage.includes('rate limit') || errorMessage.includes('API rate limit exceeded')) {
                 throw new Error(`GraphQL API rate limit exceeded. Message: ${errorMessage}`);
            }
            // Check for "User not found" in GraphQL errors
            if (errorMessage.includes("Could not resolve to a User")) {
                 throw new Error(`Could not resolve to a User with the login of '${username}'.`);
            }
            throw new Error(errorMessage);
        }
        if (!result.data.user) {
            throw new Error(`User '${username}' not found`);
        }
        return result.data.user.id;
    }
    async function fetchRepositories(username, useRestFallback = true) {
        if (useRestFallback) {
            return await fetchRepositoriesRest(username);
        }
        updateProgress(20, 'Fetching repositories...');
        const ownedRepos = [];
        const contributedRepos = [];
        let hasOwnerNextPage = true;
        let ownerAfterCursor = null;
        while (hasOwnerNextPage && ownedRepos.length < 100) {
            const ownerQuery = `
                query($login: String!, $after: String, $first: Int) {
                    user(login: $login) {
                        repositories(
                            first: $first,
                            after: $after,
                            orderBy: {field: NAME, direction: ASC},
                            ownerAffiliations: OWNER
                        ) {
                            pageInfo { hasNextPage endCursor }
                            nodes {
                                id
                                name
                                url
                                owner { login }
                                defaultBranchRef { name }
                            }
                        }
                    }
                }
            `;
            const ownerResponse = await fetch(GRAPHQL_URL, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify({
                    query: ownerQuery,
                    variables: {
                        login: username,
                        after: ownerAfterCursor,
                        first: Math.min(100, 100 - ownedRepos.length)
                    }
                })
            });
             if (!ownerResponse.ok) {
                // Check for rate limit in GraphQL response
                if (ownerResponse.status === 403 || ownerResponse.status === 429) {
                     const errorText = await ownerResponse.text();
                     if (errorText.includes('rate limit') || errorText.includes('API rate limit exceeded')) {
                          throw new Error(`GraphQL API rate limit exceeded. Status: ${ownerResponse.status}. Message: ${errorText}`);
                     }
                }
                // Check for 404-like error in GraphQL response text
                const errorText = await ownerResponse.text();
                if (errorText.includes("Could not resolve to a User")) {
                     throw new Error(`Could not resolve to a User with the login of '${username}'.`);
                }
                throw new Error(`HTTP error! status: ${ownerResponse.status}`);
            }
            const ownerResult = await ownerResponse.json();
            if (ownerResult.errors) {
                // Check if the error is related to rate limiting
                const errorMessage = ownerResult.errors[0]?.message || 'Unknown GraphQL error';
                if (errorMessage.includes('rate limit') || errorMessage.includes('API rate limit exceeded')) {
                     throw new Error(`GraphQL API rate limit exceeded. Message: ${errorMessage}`);
                }
                // Check for "User not found" in GraphQL errors
                if (errorMessage.includes("Could not resolve to a User")) {
                     throw new Error(`Could not resolve to a User with the login of '${username}'.`);
                }
                throw new Error(errorMessage);
            }
            const ownerData = ownerResult.data.user.repositories;
            ownedRepos.push(...ownerData.nodes);
            hasOwnerNextPage = ownerData.pageInfo.hasNextPage;
            ownerAfterCursor = ownerData.pageInfo.endCursor;
        }
        let hasContribNextPage = true;
        let contribAfterCursor = null;
        while (hasContribNextPage && contributedRepos.length < 100) {
            const contribQuery = `
                query($login: String!, $after: String, $first: Int) {
                    user(login: $login) {
                        repositoriesContributedTo(
                            first: $first,
                            after: $after,
                            orderBy: {field: NAME, direction: ASC},
                            contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY],
                            includeUserRepositories: false
                        ) {
                            pageInfo { hasNextPage endCursor }
                            nodes {
                                id
                                name
                                url
                                owner { login }
                                defaultBranchRef { name }
                            }
                        }
                    }
                }
            `;
            const contribResponse = await fetch(GRAPHQL_URL, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify({
                    query: contribQuery,
                    variables: {
                        login: username,
                        after: contribAfterCursor,
                        first: Math.min(100, 100 - contributedRepos.length)
                    }
                })
            });
             if (!contribResponse.ok) {
                // Check for rate limit in GraphQL response
                if (contribResponse.status === 403 || contribResponse.status === 429) {
                     const errorText = await contribResponse.text();
                     if (errorText.includes('rate limit') || errorText.includes('API rate limit exceeded')) {
                          throw new Error(`GraphQL API rate limit exceeded. Status: ${contribResponse.status}. Message: ${errorText}`);
                     }
                }
                // Check for 404-like error in GraphQL response text
                const errorText = await contribResponse.text();
                if (errorText.includes("Could not resolve to a User")) {
                     throw new Error(`Could not resolve to a User with the login of '${username}'.`);
                }
                throw new Error(`HTTP error! status: ${contribResponse.status}`);
            }
            const contribResult = await contribResponse.json();
            if (contribResult.errors) {
                // Check if the error is related to rate limiting
                const errorMessage = contribResult.errors[0]?.message || 'Unknown GraphQL error';
                if (errorMessage.includes('rate limit') || errorMessage.includes('API rate limit exceeded')) {
                     throw new Error(`GraphQL API rate limit exceeded. Message: ${errorMessage}`);
                }
                // Check for "User not found" in GraphQL errors
                if (errorMessage.includes("Could not resolve to a User")) {
                     throw new Error(`Could not resolve to a User with the login of '${username}'.`);
                }
                throw new Error(errorMessage);
            }
            const contribData = contribResult.data.user.repositoriesContributedTo;
            contributedRepos.push(...contribData.nodes);
            hasContribNextPage = contribData.pageInfo.hasNextPage;
            contribAfterCursor = contribData.pageInfo.endCursor;
        }
        const ownedIds = new Set(ownedRepos.map(repo => repo.id));
        const uniqueContributedRepos = contributedRepos.filter(repo => !ownedIds.has(repo.id));
        return {
            ownedRepos: ownedRepos.slice(0, 100),
            contributedRepos: uniqueContributedRepos.slice(0, 100)
        };
    }
    async function fetchCommitsForAllReposConcurrent(repos, userId, username, useRestFallback = true) {
        if (useRestFallback) {
            return await fetchCommitsForAllReposConcurrentRest(repos, userId, username);
        }
        updateProgress(30, 'Fetching commit history...');
        const validRepos = repos.filter(repo => repo.defaultBranchRef);
        const commitPromises = validRepos.map(repo =>
            fetchRepoCommits(repo.owner.login, repo.name, userId, username)
                .then(repoCommits => ({
                    owner: repo.owner.login,
                    name: repo.name,
                    url: repo.url,
                    branch: repo.defaultBranchRef.name,
                    commit_count: repoCommits.length,
                    commits: repoCommits
                }))
                .catch(error => {
                    console.error(`Error fetching commits for ${repo.owner.login}/${repo.name}:`, error);
                    return null;
                })
        );
        const totalRepos = commitPromises.length;
        const results = [];
        const batchSize = 10;
        for (let i = 0; i < commitPromises.length; i += batchSize) {
            const batch = commitPromises.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch);
            results.push(...batchResults.filter(result => result !== null));
            const progress = 30 + ((i + batchSize) / totalRepos) * 60;
            updateProgress(Math.min(progress, 90), `Processed ${Math.min(i + batchSize, totalRepos)} of ${totalRepos} repositories...`);
        }
        return results.filter(result => result !== null);
    }
    async function fetchRepoCommits(owner, name, userId, username) {
        const repoCommits = [];
        let hasCommitsNextPage = true;
        let commitsEndCursor = null;
        let iterations = 0;
        const maxIterations = 10;
        while (hasCommitsNextPage && repoCommits.length < 1000 && iterations < maxIterations) {
            const first = Math.min(100, 1000 - repoCommits.length);
            let historyArgs = `first: ${first}`;
            if (commitsEndCursor) {
                historyArgs += `, after: "${commitsEndCursor}"`;
            }
            historyArgs += `, author: {id: "${userId}"}`;
            const query = `
                query {
                    repository(owner: "${owner}", name: "${name}") {
                        url
                        defaultBranchRef {
                            name
                            target {
                                ... on Commit {
                                    history(${historyArgs}) {
                                        pageInfo {
                                            hasNextPage
                                            endCursor
                                        }
                                        edges {
                                            node {
                                                message
                                                committedDate
                                                author {
                                                    user {
                                                        login
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const response = await fetch(GRAPHQL_URL, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify({ query: query })
            });
             if (!response.ok) {
                // Check for rate limit in GraphQL response
                if (response.status === 403 || response.status === 429) {
                     const errorText = await response.text();
                     if (errorText.includes('rate limit') || errorText.includes('API rate limit exceeded')) {
                          throw new Error(`GraphQL API rate limit exceeded. Status: ${response.status}. Message: ${errorText}`);
                     }
                }
                // Check for 404 Not Found (repo not found) - This is less likely to be the main "user not found" case
                // but good to handle.
                const errorText = await response.text();
                if (errorText.includes("Could not resolve to a Repository")) {
                     console.warn(`Repository ${owner}/${name} not found (GraphQL). Skipping commits.`);
                     break; // Stop fetching commits for this repo
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.errors) {
                // Check if the error is related to rate limiting
                const errorMessage = result.errors[0]?.message || 'Unknown GraphQL error';
                if (errorMessage.includes('rate limit') || errorMessage.includes('API rate limit exceeded')) {
                     throw new Error(`GraphQL API rate limit exceeded. Message: ${errorMessage}`);
                }
                // Check for "Repository not found" in GraphQL errors
                if (errorMessage.includes("Could not resolve to a Repository")) {
                     console.warn(`Repository ${owner}/${name} not found (GraphQL error). Skipping commits.`);
                     break; // Stop fetching commits for this repo
                }
                throw new Error(errorMessage);
            }
            const data = result.data.repository;
            if (!data || !data.defaultBranchRef || !data.defaultBranchRef.target) {
                break;
            }
            const history = data.defaultBranchRef.target.history;
            const edges = history.edges;
            const newCommits = edges
                .map(edge => ({
                    message: edge.node.message,
                    date: edge.node.committedDate,
                    author: edge.node.author?.user?.login || 'Unknown'
                }));
            repoCommits.push(...newCommits);
            hasCommitsNextPage = history.pageInfo.hasNextPage;
            commitsEndCursor = history.pageInfo.endCursor;
            iterations++;
        }
        return repoCommits;
    }
    function displayResults(username, stats, commitsData) {
        document.getElementById('commit-count').textContent = stats.totalCommits.toLocaleString();
        document.getElementById('owned-repo-count').textContent = stats.ownedRepos;
        document.getElementById('contributed-repo-count').textContent = stats.contributedRepos;
        const repoAnalysis = document.getElementById('repo-analysis');
        repoAnalysis.innerHTML = '<h2 style="color: #4ecdc4; margin-bottom: 20px;">Repository Analysis</h2>';
        if (commitsData.length === 0) {
            repoAnalysis.innerHTML += '<p>No commit data available for analysis.</p>';
            return;
        }
        repoAnalysis.dataset.allReposData = JSON.stringify(commitsData);
        displayTopRepos(commitsData, repoAnalysis);
        if (commitsData.length > 5) {
            const showAllButton = document.createElement('button');
            showAllButton.id = 'show-all-btn';
            showAllButton.className = 'modal-btn primary-btn';
            showAllButton.textContent = 'Show Everything';
            showAllButton.style.display = 'block';
            showAllButton.style.margin = '20px auto 0 auto';
            showAllButton.style.width = 'fit-content';
            showAllButton.dataset.wasVisible = 'true';
            showAllButton.addEventListener('click', function() {
                displayAllRepos(commitsData, repoAnalysis);
                showAllButton.style.display = 'none';
                showAllButton.dataset.wasVisible = 'false';
            });
            repoAnalysis.appendChild(showAllButton);
            repoAnalysis.dataset.showAllButtonId = showAllButton.id;
        }
    }
    function displayTopRepos(commitsData, containerElement) {
        const title = containerElement.querySelector('h2');
        const showAllBtn = document.getElementById(containerElement.dataset.showAllButtonId);
        containerElement.innerHTML = '';
        if (title) containerElement.appendChild(title);
        const sortedRepos = [...commitsData].sort((a, b) => b.commit_count - a.commit_count);
        const topRepos = sortedRepos.slice(0, 5);
        if (topRepos.length === 0) {
            containerElement.innerHTML += '<p>No commits found for analysis.</p>';
            return;
        }
        topRepos.forEach(repo => {
            const repoDiv = document.createElement('div');
            repoDiv.className = 'repo-section';
            const errorMessage = repo.error ? `<div style="color: #ff6b6b; font-size: 0.8rem; margin-top: 5px;">Note: ${repo.error}</div>` : '';
            repoDiv.innerHTML = `
                <div class="repo-title">
                    <a href="${repo.url}" class="repo-url" target="_blank">${repo.owner}/${repo.name}</a>
                    <span>${repo.commit_count} commits</span>
                </div>
                <div class="commit-list">
                    ${repo.commits.slice(0, 3).map(commit => `
                        <div class="commit-item">
                            <div class="commit-message">${(commit.message.length > 150 ? commit.message.substring(0, 150) + '...' : commit.message)}</div>
                            <div class="commit-date">${new Date(commit.date).toLocaleDateString()}</div>
                        </div>
                    `).join('')}
                    ${repo.commits.length > 3 ? `<div class="commit-item">... and ${repo.commits.length - 3} more commits</div>` : ''}
                </div>
                ${errorMessage}
            `;
            containerElement.appendChild(repoDiv);
        });
        if (showAllBtn) {
            if (showAllBtn.dataset.wasVisible === 'true') {
                showAllBtn.style.display = 'block';
            }
            containerElement.appendChild(showAllBtn);
        }
    }
    function displayAllRepos(commitsData, containerElement) {
        const title = containerElement.querySelector('h2');
        containerElement.innerHTML = '';
        if (title) containerElement.appendChild(title);
        const sortedRepos = [...commitsData].sort((a, b) => b.commit_count - a.commit_count);
        if (sortedRepos.length === 0) {
            containerElement.innerHTML += '<p>No commits found for analysis.</p>';
            return;
        }
        sortedRepos.forEach(repo => {
            const repoDiv = document.createElement('div');
            repoDiv.className = 'repo-section';
            const errorMessage = repo.error ? `<div style="color: #ff6b6b; font-size: 0.8rem; margin-top: 5px;">Note: ${repo.error}</div>` : '';
            repoDiv.innerHTML = `
                <div class="repo-title">
                    <a href="${repo.url}" class="repo-url" target="_blank">${repo.owner}/${repo.name}</a>
                    <span>${repo.commit_count} commits</span>
                </div>
                <div class="commit-list">
                    ${repo.commits.slice(0, 3).map(commit => `
                        <div class="commit-item">
                            <div class="commit-message">${(commit.message.length > 150 ? commit.message.substring(0, 150) + '...' : commit.message)}</div>
                            <div class="commit-date">${new Date(commit.date).toLocaleDateString()}</div>
                        </div>
                    `).join('')}
                    ${repo.commits.length > 3 ? `<div class="commit-item">... and ${repo.commits.length - 3} more commits</div>` : ''}
                </div>
                ${errorMessage}
            `;
            containerElement.appendChild(repoDiv);
        });
    }
    async function analyzeUser(username, useRestFallback = true) {
        try {
            const userId = await getUserId(username, useRestFallback);
            const { ownedRepos, contributedRepos } = await fetchRepositories(username, useRestFallback);
            const commitsData = await fetchCommitsForAllReposConcurrent(
                ownedRepos.concat(contributedRepos),
                userId,
                username,
                useRestFallback
            );
            updateProgress(95, useRestFallback ? 'Generating analysis (REST)...' : 'Generating analysis...');
            const totalCommits = commitsData.reduce((sum, repo) => sum + (repo.commit_count || 0), 0);
            const stats = {
                totalCommits: totalCommits,
                ownedRepos: ownedRepos.length,
                contributedRepos: contributedRepos.length
            };
            updateProgress(100, useRestFallback ? 'Analysis complete (REST)!' : 'Analysis complete!');
            displayResults(username, stats, commitsData);
        } catch (error) {
            // Re-throw the error to be caught by the outer try/catch in performAnalysis
            // or directly by the global error handler if not caught there.
            throw new Error(`Failed to analyze user: ${error.message}`);
        }
    }
    forbiddenOkBtn.addEventListener('click', function() {
        forbiddenModal.classList.remove('active');
    });
    function typeWriterText(text) {
        typewriterText.innerHTML = '';
        let i = 0;
        const speed = 50;
        function typeWriter() {
            if (i < text.length) {
                typewriterText.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                setTimeout(() => {
                    robotButtons.style.display = 'flex';
                }, 1000);
            }
        }
        typeWriter();
    }
    submitBtn1.addEventListener('click', function() {
        robotModal.classList.remove('active');
        resetForbiddenAttempts();
    });
    submitBtn2.addEventListener('click', function() {
        robotModal.classList.remove('active');
        resetForbiddenAttempts();
    });
    function resetForbiddenAttempts() {
        forbiddenAttempts = 0;
    }
     // --- NEW: Super Error Modal Button Listeners ---
    frownBtn.addEventListener('click', function() {
        hideSuperErrorModal();
        // Do nothing else, just close the modal
    });
    petErrorBtn.addEventListener('click', function() {
        // Store the petting action in localStorage
        localStorage.setItem('bugEmojiPetted', 'true');
        // Update the emoji showcase immediately
        const bugSpan = document.createElement('span');
        bugSpan.textContent = '🐛';
        bugSpan.classList.add('bug-emoji'); // Add class for animation
        emojiShowcase.appendChild(bugSpan);
        hideSuperErrorModal();
        // Optional: Add a small confirmation or animation?
    });
    // --- END: Super Error Modal Button Listeners ---
    // --- NEW: Invalid Username Modal Button Listener ---
    invalidUsernameGotItBtn.addEventListener('click', function() {
        hideInvalidUsernameModal();
    });
    // --- END: Invalid Username Modal Button Listener ---
    // --- NEW: User Not Found Modal Button Listener ---
    userNotFoundGotItBtn.addEventListener('click', function() {
        hideUserNotFoundModal();
    });
    // --- END: User Not Found Modal Button Listener ---
});