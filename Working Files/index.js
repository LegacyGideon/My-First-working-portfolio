const currentYear = document.querySelector("#current-year");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

const progressBar = document.querySelector("#scroll-progress-bar");
let progressFrameRequested = false;

const updateScrollProgress = () => {
    if (!progressBar) {
        return;
    }

    const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress =
        scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

    progressBar.style.transform = `scaleX(${scrollProgress})`;
    progressFrameRequested = false;
};

const requestScrollProgressUpdate = () => {
    if (!progressFrameRequested) {
        progressFrameRequested = true;
        window.requestAnimationFrame(updateScrollProgress);
    }
};

if (progressBar) {
    window.addEventListener("scroll", requestScrollProgressUpdate, {
        passive: true
    });
    window.addEventListener("resize", requestScrollProgressUpdate);
    updateScrollProgress();
}

const themeToggle = document.querySelector("#theme-toggle");
let savedTheme = null;

try {
    savedTheme = localStorage.getItem("portfolio-theme");
} catch (error) {
    console.warn("The saved color theme could not be loaded.", error);
}

const initialTheme = savedTheme === "light" ? "light" : "dark";

document.body.dataset.theme = initialTheme;
document.body.dataset.bsTheme = initialTheme;

if (themeToggle) {
    const updateThemeToggle = (theme) => {
        const isLight = theme === "light";

        themeToggle.setAttribute("aria-pressed", String(isLight));
        themeToggle.setAttribute(
            "aria-label",
            `Switch to ${isLight ? "dark" : "light"} mode`
        );
        themeToggle.querySelector(".theme-toggle-icon").textContent =
            isLight ? "☾" : "☀";
        themeToggle.querySelector(".theme-toggle-text").textContent =
            isLight ? "Dark mode" : "Light mode";
    };

    updateThemeToggle(initialTheme);

    themeToggle.addEventListener("click", () => {
        const nextTheme =
            document.body.dataset.theme === "light" ? "dark" : "light";

        document.body.dataset.theme = nextTheme;
        document.body.dataset.bsTheme = nextTheme;

        try {
            localStorage.setItem("portfolio-theme", nextTheme);
        } catch (error) {
            console.warn("The color theme preference could not be saved.", error);
        }

        updateThemeToggle(nextTheme);
    });
}

$(".navbar-collapse .nav-link[href^='#']").on("click", function () {
    const navbarMenu = document.querySelector("#mainNavbar");
    const isMobileMenu = window.matchMedia("(max-width: 991.98px)").matches;

    if (navbarMenu && isMobileMenu && navbarMenu.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(navbarMenu).hide();
    }
});

const navigationLinks = Array.from(
    document.querySelectorAll(".navbar .nav-link[href^='#']")
);
const observedSections = navigationLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter((section) => section !== null);

if (navigationLinks.length > 0 && "IntersectionObserver" in window) {
    const visibleSections = new Map();

    const navigationObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visibleSections.set(entry.target, entry);
                } else {
                    visibleSections.delete(entry.target);
                }
            });

            const viewportCenter = window.innerHeight / 2;
            const activeEntry = Array.from(visibleSections.values()).sort(
                (first, second) => {
                    const firstDistance = Math.abs(
                        first.boundingClientRect.top +
                        first.boundingClientRect.height / 2 -
                        viewportCenter
                    );
                    const secondDistance = Math.abs(
                        second.boundingClientRect.top +
                        second.boundingClientRect.height / 2 -
                        viewportCenter
                    );

                    return firstDistance - secondDistance;
                }
            )[0];

            if (!activeEntry) {
                return;
            }

            const activeSectionId = activeEntry.target.id;

            navigationLinks.forEach((link) => {
                const isActive =
                    link.getAttribute("href") === `#${activeSectionId}`;

                link.classList.toggle("active", isActive);

                if (isActive) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        },
        { rootMargin: "-45% 0px -45% 0px" }
    );

    observedSections.forEach((section) => {
        navigationObserver.observe(section);
    });
}

const aboutSection = document.querySelector("#about");
const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

if (
    aboutSection &&
    "IntersectionObserver" in window &&
    !prefersReducedMotion.matches
) {
    const photosContainer = aboutSection.querySelector(".about-photos");
    const photos = Array.from(
        aboutSection.querySelectorAll(".about-photo")
    );

    if (photosContainer && photos.length > 1) {
        const photoDisplayDuration = 2000;
        const flipDuration = 700;

        const showNextPhoto = (currentIndex) => {
            window.setTimeout(() => {
                const currentPhoto = photos[currentIndex];
                const nextIndex = currentIndex + 1;

                currentPhoto.classList.remove("is-active");
                currentPhoto.classList.add("is-leaving");

                if (nextIndex < photos.length) {
                    photos[nextIndex].classList.add("is-active");

                    window.setTimeout(() => {
                        currentPhoto.classList.remove("is-leaving");
                    }, flipDuration);

                    showNextPhoto(nextIndex);
                    return;
                }

                window.setTimeout(() => {
                    photosContainer.classList.remove("is-playing");
                    photos.forEach((photo) => {
                        photo.classList.remove("is-active", "is-leaving");
                    });
                }, flipDuration);
            }, photoDisplayDuration);
        };

        const aboutObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    observer.unobserve(entry.target);
                    photosContainer.classList.add("is-playing");

                    window.requestAnimationFrame(() => {
                        photos[0].classList.add("is-active");
                        showNextPhoto(0);
                    });
                });
            },
            { threshold: 0.25 }
        );

        aboutObserver.observe(aboutSection);
    }
}

const revealSelectors = [
    ".hero-content",
    ".hero-quick-links",
    ".about-copy",
    ".skills-copy",
    ".skills-wrapper",
    ".projects-heading",
    ".project-card",
    ".contact-copy",
    ".contact-artwork",
    ".contact-social-panel"
];
const revealElements = Array.from(
    document.querySelectorAll(revealSelectors.join(", "))
);

if (
    revealElements.length > 0 &&
    "IntersectionObserver" in window &&
    !prefersReducedMotion.matches
) {
    const projectCards = document.querySelectorAll(".project-card");

    projectCards.forEach((card, index) => {
        card.style.setProperty("--reveal-delay", `${index * 120}ms`);
    });

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("scroll-reveal", "is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -5% 0px"
        }
    );

    revealElements.forEach((element) => {
        element.classList.add("scroll-reveal");
        revealObserver.observe(element);
    });
}

const $projectFilters = $(".project-filter");
const $projectItems = $(".project-item");
const $projectFilterStatus = $("#project-filter-status");

if ($projectFilters.length && $projectItems.length) {
    $projectFilters.on("click", function () {
        const selectedFilter = $(this).data("filter");
        let visibleProjects = 0;

        $projectItems.removeClass("is-filter-entering");

        $projectFilters
            .removeClass("is-active")
            .attr("aria-pressed", "false");

        $(this)
            .addClass("is-active")
            .attr("aria-pressed", "true");

        $projectItems.each(function () {
            const matchesFilter =
                selectedFilter === "all" ||
                $(this).data("category") === selectedFilter;

            $(this).toggleClass("d-none", !matchesFilter);

            if (matchesFilter) {
                visibleProjects += 1;
                void this.offsetWidth;
                $(this).addClass("is-filter-entering");
            }
        });

        let statusMessage;

        if (selectedFilter === "all") {
            statusMessage = `Showing all ${visibleProjects} projects.`;
        } else if (selectedFilter === "javascript") {
            const projectWord = visibleProjects === 1 ? "project" : "projects";
            statusMessage = `Showing ${visibleProjects} JavaScript ${projectWord}.`;
        } else {
            const categoryLabel = visibleProjects === 1 ? "website" : "websites";
            const projectWord = visibleProjects === 1 ? "project" : "projects";
            statusMessage = `Showing ${visibleProjects} ${categoryLabel} ${projectWord}.`;
        }

        $projectFilterStatus.text(statusMessage);
    });
}

const $contactForm = $("#contact-form");

if ($contactForm.length) {
    const $contactStatus = $("#contact-form-status");
    const formEndpoint = $contactForm.attr("action");
    const endpointIsConfigured =
        formEndpoint &&
        /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(formEndpoint);

    if (endpointIsConfigured) {
        $contactStatus.text("Your message will be sent directly from this page.");
    }

    $contactForm.on("submit", function (event) {
        event.preventDefault();

        const form = this;
        const $form = $(form);
        const $button = $form.find(".contact-submit");
        const $buttonText = $form.find(".contact-submit-text");

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!endpointIsConfigured) {
            $contactStatus
                .removeClass("is-success")
                .addClass("is-error")
                .text("Sorry, the form isn't available right now. Please email me directly instead.");
            return;
        }

        $button.prop("disabled", true);
        $buttonText.text("Sending...");
        $form.attr("aria-busy", "true");
        $contactStatus
            .removeClass("is-success is-error")
            .text("Sending your message...");

        $.ajax({
            url: formEndpoint,
            method: "POST",
            data: $form.serialize(),
            dataType: "json",
            headers: {
                Accept: "application/json"
            }
        })
            .done(function () {
                $contactStatus
                    .removeClass("is-error")
                    .addClass("is-success")
                    .text("Thanks! Your message has been sent.");

                form.reset();
            })
            .fail(function (error) {
                console.error("Contact form submission failed.", error);

                $contactStatus
                    .removeClass("is-success")
                    .addClass("is-error")
                    .text("Your message could not be sent. Please try again or email me directly.");
            })
            .always(function () {
                $button.prop("disabled", false);
                $buttonText.text("Send message");
                $form.removeAttr("aria-busy");
            });
    });
}
