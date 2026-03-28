document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const f1Loader = document.getElementById('f1-loader');

    // Store initial dashboard HTML
    const homeHTML = contentArea.innerHTML;

    // Helper to toggle loader visibility
    const setLoader = (active) => {
        if (active) f1Loader.classList.remove('loader-hidden');
        else f1Loader.classList.add('loader-hidden');
    };

    async function loadPage(page) {
        setLoader(true);

        // Handle Home/Dashboard
        if (page === 'home') {
            setTimeout(() => {
                contentArea.innerHTML = homeHTML;
                updateActiveLink('home');
                setLoader(false);
            }, 600); // Allow car animation to play
            return;
        }

        try {
            // Request the ROUTE from Flask, not the file path
            const response = await fetch(`/${page}`);
            if (!response.ok) throw new Error('Telemetry lost (Page not found)');
            
            const html = await response.text();

            // Inject content
            contentArea.innerHTML = html;
            updateActiveLink(page);

            // Re-init simulator if needed
            if (page === 'simulator' && typeof initSimulator === 'function') {
                initSimulator();
            }
        } catch (err) {
            contentArea.innerHTML = `<div class="error">PIT STOP ERROR: ${err.message}</div>`;
        } finally {
            // Delay hiding the loader to ensure smooth transition
            setTimeout(() => setLoader(false), 800);
        }
    }

    function updateActiveLink(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-page') === page);
        });
    }

    // Click Delegation
    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('[data-page]');
        if (target) {
            e.preventDefault();
            const page = target.getAttribute('data-page');
            
            // Clean URL management for Flask
            const url = page === 'home' ? '/' : `/${page}`;
            window.history.pushState({ page }, '', url);
            
            loadPage(page);
        }
    });

    window.onpopstate = (e) => {
        const page = (e.state && e.state.page) ? e.state.page : 'home';
        loadPage(page);
    };

    // Initial check: Hide loader once everything is ready
    setTimeout(() => setLoader(false), 1000);
});