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

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

const aboutImageSection = document.querySelector(".about");
const aboutImagePhotos = Array.from(
    aboutImageSection?.querySelectorAll(".about-photo") ?? []
);
const aboutImageSequenceMedia = window.matchMedia(
    "(min-height: 600px) and (prefers-reduced-motion: no-preference)"
);
let aboutImageSequenceFrameRequested = false;

const updateAboutImageSequence = () => {
    aboutImageSequenceFrameRequested = false;

    if (!aboutImageSection || aboutImagePhotos.length === 0) {
        return;
    }

    if (!aboutImageSequenceMedia.matches) {
        aboutImageSection.classList.remove("has-image-sequence");
        aboutImagePhotos.forEach((photo) => {
            photo.classList.remove("is-sequence-visible");
        });
        return;
    }

    aboutImageSection.classList.add("has-image-sequence");

    const sectionTop =
        aboutImageSection.getBoundingClientRect().top + window.scrollY;
    const scrollDistance =
        aboutImageSection.offsetHeight - window.innerHeight;
    const revealStart = sectionTop - window.innerHeight * 0.25;
    const revealDistance =
        scrollDistance + window.innerHeight * 0.25;
    const progress =
        revealDistance > 0
            ? Math.min(
                1,
                Math.max(0, (window.scrollY - revealStart) / revealDistance)
            )
            : 0;
    const visiblePhotoCount =
        progress >= 0.56 ? 3 : progress >= 0.28 ? 2 : progress > 0 ? 1 : 0;

    aboutImagePhotos.forEach((photo, index) => {
        photo.classList.toggle("is-sequence-visible", index < visiblePhotoCount);
    });
};

const requestAboutImageSequenceUpdate = () => {
    if (!aboutImageSequenceFrameRequested) {
        aboutImageSequenceFrameRequested = true;
        window.requestAnimationFrame(updateAboutImageSequence);
    }
};

if (aboutImageSection && aboutImagePhotos.length > 0) {
    window.addEventListener("scroll", requestAboutImageSequenceUpdate, {
        passive: true
    });
    window.addEventListener("resize", requestAboutImageSequenceUpdate);
    aboutImageSequenceMedia.addEventListener(
        "change",
        requestAboutImageSequenceUpdate
    );
    updateAboutImageSequence();
}

const skillsSection = document.querySelector(".skills");
const skillsLayout = skillsSection?.querySelector(".skills-layout");
const skillsSwapMedia = window.matchMedia(
    "(min-width: 992px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)"
);
let skillsSwapFrameRequested = false;
let skillsIsSwapped = false;

const updateSkillsSwap = () => {
    skillsSwapFrameRequested = false;

    if (!skillsSection || !skillsLayout) {
        return;
    }

    if (!skillsSwapMedia.matches) {
        skillsIsSwapped = false;
        skillsSection.classList.remove("is-swapped");
        skillsSection.style.removeProperty("--skills-swap-forward");
        skillsSection.style.removeProperty("--skills-swap-backward");
        return;
    }

    const columnGap =
        Number.parseFloat(window.getComputedStyle(skillsLayout).columnGap) || 0;
    const swapDistance = (skillsLayout.clientWidth - columnGap) / 2 + columnGap;
    const sectionStart =
        skillsSection.getBoundingClientRect().top + window.scrollY;
    const scrollDistance = skillsSection.offsetHeight - skillsLayout.offsetHeight;
    const scrollProgress =
        scrollDistance > 0
            ? (window.scrollY - sectionStart) / scrollDistance
            : 0;
    if (!skillsIsSwapped && scrollProgress >= 0.56) {
        skillsIsSwapped = true;
    } else if (skillsIsSwapped && scrollProgress <= 0.44) {
        skillsIsSwapped = false;
    }

    skillsSection.style.setProperty(
        "--skills-swap-forward",
        `${swapDistance}px`
    );
    skillsSection.style.setProperty(
        "--skills-swap-backward",
        `${-swapDistance}px`
    );
    skillsSection.classList.toggle("is-swapped", skillsIsSwapped);
};

const requestSkillsSwapUpdate = () => {
    if (!skillsSwapFrameRequested) {
        skillsSwapFrameRequested = true;
        window.requestAnimationFrame(updateSkillsSwap);
    }
};

if (skillsSection && skillsLayout) {
    window.addEventListener("scroll", requestSkillsSwapUpdate, {
        passive: true
    });
    window.addEventListener("resize", requestSkillsSwapUpdate);
    skillsSwapMedia.addEventListener("change", requestSkillsSwapUpdate);
    updateSkillsSwap();
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
