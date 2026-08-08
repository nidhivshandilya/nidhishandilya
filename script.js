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

// Dot grid background
(function () {
    const canvas = document.getElementById('dot-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const spacing = 26;
    const maxAlpha = 0.16;
    let dots = [];

    function buildDots() {
        dots = [];
        const cols = Math.ceil(canvas.width / spacing) + 1;
        const rows = Math.ceil(canvas.height / spacing) + 1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                dots.push({
                    x: c * spacing + spacing / 2,
                    y: r * spacing + spacing / 2,
                    delay: Math.random() * 2600
                });
            }
        }
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        buildDots();
    }
    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    const fadeDuration = 900;

    function draw(now) {
        ctx.fillStyle = '#131312';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (const d of dots) {
            const elapsed = now - start - d.delay;
            if (elapsed < 0) continue;
            const alpha = Math.min(1, elapsed / fadeDuration) * maxAlpha;
            ctx.beginPath();
            ctx.arc(d.x, d.y, 1.1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
})();

// Firefly cursor glow (unchanged from the current site — redesign pending)
(function () {
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const glows = [];

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.style.mixBlendMode = 'screen';
    document.body.appendChild(canvas);

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', function (e) {
        glows.push({
            x: e.clientX, y: e.clientY,
            life: 1.0,
            size: 60 + Math.random() * 30,
            fadeSpeed: 0.008 + Math.random() * 0.004,
            pulseOffset: Math.random() * Math.PI * 2,
            pulseSpeed: 0.03 + Math.random() * 0.02
        });
        if (glows.length > 150) glows.shift();
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const time = Date.now() * 0.001;
        for (let i = glows.length - 1; i >= 0; i--) {
            const glow = glows[i];
            glow.life -= glow.fadeSpeed;
            if (glow.life <= 0) { glows.splice(i, 1); continue; }
            const pulse = Math.sin(time * glow.pulseSpeed + glow.pulseOffset) * 0.3 + 0.7;
            const opacity = 0.12 * glow.life * pulse;
            const gradient = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.size);
            gradient.addColorStop(0, 'rgba(255, 250, 200, ' + (opacity * 1.2) + ')');
            gradient.addColorStop(0.2, 'rgba(255, 248, 180, ' + (opacity * 0.8) + ')');
            gradient.addColorStop(0.5, 'rgba(240, 255, 160, ' + (opacity * 0.4) + ')');
            gradient.addColorStop(0.8, 'rgba(200, 255, 140, ' + (opacity * 0.15) + ')');
            gradient.addColorStop(1, 'rgba(180, 255, 120, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(glow.x, glow.y, glow.size, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})();
