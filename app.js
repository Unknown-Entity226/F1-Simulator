document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const f1Loader = document.getElementById('f1-loader'); // Reference the loader

    const homeHTML = contentArea.innerHTML;

    async function loadPage(page) {
        // 1. Start the Race (Show Loader)
        f1Loader.classList.remove('loader-hidden');

        if (page === 'home' || page === 'index') {
            // Small timeout so the car actually has time to drive across 
            // even if the "load" is instant
            setTimeout(() => {
                contentArea.innerHTML = homeHTML;
                updateActiveLink('home');
                f1Loader.classList.add('loader-hidden');
            }, 800); 
            return;
        }

        try {
            const response = await fetch(`${page}.html`);
            if (!response.ok) throw new Error('Page not found');
            const html = await response.text();

            // 2. Inject content
            contentArea.innerHTML = html;
            updateActiveLink(page);

            if (page === 'simulator' && typeof initSimulator === 'function') {
                initSimulator();
            }
        } catch (err) {
            contentArea.innerHTML = `<div class="error">Failed to load ${page}. Error: ${err.message}</div>`;
        } finally {
            // 3. Finish the Race (Hide Loader)
            // Added a slight delay so the transition feels smoother
            setTimeout(() => {
                f1Loader.classList.add('loader-hidden');
            }, 600);
        }
    }

    function updateActiveLink(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });
    }

    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('[data-page]');
        if (target) {
            e.preventDefault(); 
            const page = target.getAttribute('data-page');
            loadPage(page);
            window.history.pushState({page}, '', page === 'home' ? 'index.html' : `${page}.html`);
        }
    });

    window.onpopstate = (e) => {
        if (e.state && e.state.page) {
            loadPage(e.state.page);
        }
    };
});