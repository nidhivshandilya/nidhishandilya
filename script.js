// Mobile menu
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menuClose = document.querySelector('.mobile-menu-close');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.add('active');
            body.style.overflow = 'hidden';
        });
    }

    if (menuClose) {
        menuClose.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            body.style.overflow = '';
        });
    }

    document.querySelectorAll('.mobile-nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            body.style.overflow = '';
        });
    });
});

// Theme: dark by default, light remembered per visitor.
(function () {
    const root = document.documentElement;

    function labelFor(theme) { return theme === 'light' ? 'Dark' : 'Light'; }

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
            const next = labelFor(theme);
            const label = btn.querySelector('.theme-toggle-label');
            if (label) label.textContent = next;
            btn.setAttribute('aria-label', 'Switch to ' + next.toLowerCase() + ' theme');
        });
        window.dispatchEvent(new Event('themechange'));
    }

    const stored = (function () { try { return localStorage.getItem('theme'); } catch (e) { return null; } })();
    apply(stored || root.getAttribute('data-theme') || 'dark');

    document.addEventListener('DOMContentLoaded', function () {
        apply(root.getAttribute('data-theme') || 'dark');
        document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                try { localStorage.setItem('theme', next); } catch (e) {}
                apply(next);
            });
        });
    });

    // follow the OS only while the visitor has made no choice of their own
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onSystem = function (e) {
        let chosen = null;
        try { chosen = localStorage.getItem('theme'); } catch (err) {}
        if (!chosen) apply(e.matches ? 'light' : 'dark');
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystem);
    else if (mq.addListener) mq.addListener(onSystem);
})();

// Dot grid + "Well" pointer response.
// One canvas draws the grid and the effect. There is no overlay canvas and no glow:
// dots near the pointer lean toward it and settle back when it leaves.
(function () {
    // Flip to false if the lean feels like noise on phones; grid stays, effect goes.
    const ENABLE_ON_TOUCH = true;

    const canvas = document.getElementById('dot-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const spacing = 26;
    const radius = 1.1;
    const fadeDuration = 900;

    // colours come from the stylesheet, so the grid follows the theme
    let paper = '#131312', dotRgb = '255,255,255', baseAlpha = 0.16;
    function readTheme() {
        const cs = getComputedStyle(document.documentElement);
        paper = (cs.getPropertyValue('--primary-bg') || '#131312').trim();
        dotRgb = (cs.getPropertyValue('--dot-rgb') || '255,255,255').trim();
        baseAlpha = parseFloat(cs.getPropertyValue('--dot-alpha')) || 0.16;
    }
    readTheme();
    window.addEventListener('themechange', readTheme);
    document.addEventListener('DOMContentLoaded', readTheme);

    const touch = window.matchMedia('(hover: none)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const interactive = !reduced && (!touch || ENABLE_ON_TOUCH);
    const R = touch ? 130 : 170;
    const pull = touch ? 8 : 7;

    let dots = [];
    const m = { x: -9999, y: -9999 };
    const p = { x: -9999, y: -9999 };
    let active = false;
    let presence = 0;
    let lastTouchEnd = 0;

    let vw = 0, vh = 0;

    function buildDots() {
        dots = [];
        const cols = Math.ceil(vw / spacing) + 1;
        const rows = Math.ceil(vh / spacing) + 1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                dots.push({
                    x: c * spacing + spacing / 2,
                    y: r * spacing + spacing / 2,
                    ox: 0, oy: 0,
                    delay: Math.random() * 2400
                });
            }
        }
    }

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        vw = window.innerWidth;
        vh = window.innerHeight;
        canvas.width = Math.round(vw * dpr);
        canvas.height = Math.round(vh * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildDots();
    }
    resize();
    // phones fire resize as the URL bar hides; rebuild only on a real size change
    window.addEventListener('resize', function () {
        if (window.innerWidth !== vw || Math.abs(window.innerHeight - vh) > 120) resize();
    });
    window.addEventListener('orientationchange', function () { setTimeout(resize, 250); });

    if (interactive) {
        const onMove = function (e) {
            // Phones synthesize a mousemove right after every tap. Ignore it,
            // or the well stays permanently dented where the finger last was.
            if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
            if (performance.now() - lastTouchEnd < 600) return;
            m.x = e.clientX; m.y = e.clientY;
            if (p.x < -1000) { p.x = e.clientX; p.y = e.clientY; }
            active = true;
        };
        const onLeave = function () { active = false; };
        const onTouch = function (e) {
            const t0 = e.touches && e.touches[0];
            if (!t0) return;
            m.x = t0.clientX; m.y = t0.clientY;
            if (!active) { p.x = t0.clientX; p.y = t0.clientY; }
            active = true;
        };
        const onTouchEnd = function () { active = false; lastTouchEnd = performance.now(); };

        if (!touch) document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseleave', onLeave);
        window.addEventListener('blur', onLeave);
        document.addEventListener('touchstart', onTouch, { passive: true });
        document.addEventListener('touchmove', onTouch, { passive: true });
        document.addEventListener('touchend', onTouchEnd, { passive: true });
        document.addEventListener('touchcancel', onTouchEnd, { passive: true });
    }

    const start = performance.now();

    function draw(now) {
        ctx.fillStyle = paper;
        ctx.fillRect(0, 0, vw, vh);

        // presence eases the whole effect in and out, so the sheet flattens
        // when the pointer leaves, the tab blurs, or a finger lifts
        const want = active ? 1 : 0;
        presence += (want - presence) * (want ? 0.14 : 0.045);
        p.x += (m.x - p.x) * 0.085;
        p.y += (m.y - p.y) * 0.085;

        for (const d of dots) {
            const elapsed = now - start - d.delay;
            if (elapsed < 0) continue;
            const e = Math.min(1, elapsed / fadeDuration);

            let f = 0;
            if (interactive && presence > 0.001) {
                const dx = p.x - d.x, dy = p.y - d.y;
                const dist = Math.hypot(dx, dy);
                if (dist < R && dist > 0.001) f = Math.pow(1 - dist / R, 2.2) * presence;
                const tx = dx / (dist || 1) * pull * f;
                const ty = dy / (dist || 1) * pull * f;
                d.ox += (tx - d.ox) * 0.12;
                d.oy += (ty - d.oy) * 0.12;
            } else if (d.ox || d.oy) {
                d.ox += (0 - d.ox) * 0.12;
                d.oy += (0 - d.oy) * 0.12;
            }

            const alpha = e * (baseAlpha + f * 0.26);
            ctx.beginPath();
            ctx.arc(d.x + d.ox, d.y + d.oy, radius + f * 1.1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + dotRgb + ',' + alpha + ')';
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
})();
