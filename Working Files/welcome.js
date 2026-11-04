const welcomeStage = document.querySelector(".welcome-stage");
const enterPortfolio = document.querySelector("#enter-portfolio");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const themeToggle = document.querySelector("#welcome-theme-toggle");
let savedTheme = null;

try {
    savedTheme = localStorage.getItem("portfolio-theme");
} catch (error) {
    console.warn("The saved color theme could not be loaded.", error);
}

const initialTheme = savedTheme === "light" ? "light" : "dark";
document.body.dataset.theme = initialTheme;

if (themeToggle) {
    const updateThemeToggle = (theme) => {
        const isLight = theme === "light";

        themeToggle.setAttribute("aria-pressed", String(isLight));
        themeToggle.setAttribute(
            "aria-label",
            `Switch to ${isLight ? "dark" : "light"} mode`
        );
        themeToggle.querySelector(".welcome-theme-icon").textContent =
            isLight ? "☾" : "☀";
    };

    updateThemeToggle(initialTheme);

    themeToggle.addEventListener("click", () => {
        const nextTheme =
            document.body.dataset.theme === "light" ? "dark" : "light";

        document.body.dataset.theme = nextTheme;

        try {
            localStorage.setItem("portfolio-theme", nextTheme);
        } catch (error) {
            console.warn("The color theme preference could not be saved.", error);
        }

        updateThemeToggle(nextTheme);
    });
}

if (welcomeStage && enterPortfolio) {
    enterPortfolio.addEventListener("click", (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        event.preventDefault();
        welcomeStage.classList.add("is-entering");

        window.setTimeout(() => {
            window.location.href = enterPortfolio.href;
        }, prefersReducedMotion.matches ? 50 : 850);
    });
}
