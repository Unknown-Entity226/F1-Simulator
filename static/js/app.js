document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const f1Loader = document.getElementById('f1-loader');
    const homeHTML = contentArea.innerHTML;

    const setLoader = (active) => {
        if (active) f1Loader.classList.remove('loader-hidden');
        else f1Loader.classList.add('loader-hidden');
    };

    async function loadPage(page, updateURL = true) {
        setLoader(true);

        if (page === 'home' || page === '' || page === '/') {
            contentArea.innerHTML = homeHTML;
            updateActiveLink('home');
            setTimeout(() => setLoader(false), 600);
            return;
        }

        try {
            // We fetch from the special 'get-content' route to avoid infinite loops
            const response = await fetch(`/get-content/${page}`);
            if (!response.ok) throw new Error('Telemetry lost');
            
            const html = await response.text();
            contentArea.innerHTML = html;
            updateActiveLink(page);

            if (updateURL) {
                window.history.pushState({ page }, '', `/${page}`);
            }

            if (page === 'simulator' && typeof initSimulator === 'function') {
                initSimulator();
            }
        } catch (err) {
            contentArea.innerHTML = `<div class="error">PIT STOP ERROR: ${err.message}</div>`;
        } finally {
            setTimeout(() => setLoader(false), 800);
        }
    }

    // --- CRITICAL: Handle Reload Event ---
    const initialPath = window.location.pathname.split('/').pop();
    if (initialPath && initialPath !== 'index.html') {
        loadPage(initialPath, false); // false so we don't push the same URL again
    } else {
        setLoader(false); // Hide loader if we are just on Home
    }

    function updateActiveLink(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-page') === page);
        });
    }

    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('[data-page]');
        if (target) {
            e.preventDefault();
            loadPage(target.getAttribute('data-page'));
        }
    });

    window.onpopstate = (e) => {
        const page = (e.state && e.state.page) ? e.state.page : 'home';
        loadPage(page, false);
    };
});