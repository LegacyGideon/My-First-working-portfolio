const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

const setTheme = (theme) => {
    body.dataset.theme = theme;

    if (!themeToggle) {
        return;
    }

    const icon = themeToggle.querySelector("i");

    if (icon) {
        icon.className =
            theme === "light" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    }

    themeToggle.setAttribute(
        "aria-label",
        `Switch to ${theme === "light" ? "dark" : "light"} mode`
    );
    themeToggle.setAttribute("aria-pressed", String(theme === "light"));

    try {
        localStorage.setItem("optionfm-theme", theme);
    } catch (error) {
        console.warn("The Option FM theme preference could not be saved.", error);
    }
};

let savedTheme = "dark";

try {
    savedTheme = localStorage.getItem("optionfm-theme") || "dark";
} catch (error) {
    console.warn("The saved Option FM theme could not be loaded.", error);
}

setTheme(savedTheme === "light" ? "light" : "dark");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const nextTheme = body.dataset.theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
    });
}

const programSearch = document.getElementById("program-search");
const programFilters = Array.from(
    document.querySelectorAll(".program-filter")
);
const programCards = Array.from(
    document.querySelectorAll(".programming-card")
);
const programResults = document.getElementById("program-results");
let activeProgramFilter = "all";

const filterPrograms = () => {
    if (!programSearch || !programResults || programCards.length === 0) {
        return;
    }

    const searchTerm = programSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    programCards.forEach((card) => {
        const categoryMatches =
            activeProgramFilter === "all" ||
            card.dataset.category === activeProgramFilter;
        const textMatches = card.textContent.toLowerCase().includes(searchTerm);
        const isVisible = categoryMatches && textMatches;

        card.hidden = !isVisible;

        if (isVisible) {
            visibleCount += 1;
        }
    });

    programResults.textContent =
        visibleCount === 0
            ? "No topics match your search. Try another word or filter."
            : `Showing ${visibleCount} ${visibleCount === 1 ? "topic" : "topics"}.`;
};

if (programSearch && programFilters.length && programCards.length) {
    programSearch.addEventListener("input", filterPrograms);

    programFilters.forEach((filterButton) => {
        filterButton.addEventListener("click", () => {
            activeProgramFilter = filterButton.dataset.filter || "all";

            programFilters.forEach((button) => {
                const isActive = button === filterButton;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-pressed", String(isActive));
            });

            filterPrograms();
        });
    });
}
