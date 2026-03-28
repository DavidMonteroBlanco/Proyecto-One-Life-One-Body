<footer class="footer">
    <div class="container text-center">

        <div class="social-icons mb-3">
            <a href="https://www.instagram.com/one.life.one.body.benidorm"
               target="_blank"
               class="social instagram">
                <i class="bi bi-instagram"></i>
            </a>

            <a href="https://www.facebook.com/one.life.one.body.benidorm"
               target="_blank"
               class="social facebook">
                <i class="bi bi-facebook"></i>
            </a>
        </div>

        © 2026 ONE LIFE ONE BODY · Todos los derechos reservados
    </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

<script>
(function () {
    const bg = document.querySelector(".page-bg");
    if (!bg) return;

    let ticking = false;

    function onScroll() {
        if (ticking) return;
        ticking = true;

        window.requestAnimationFrame(() => {
            const y = window.scrollY || 0;
            bg.style.backgroundPosition = `center ${-(y / 6)}px`;
            ticking = false;
        });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
})();
</script>

</body>
</html>
