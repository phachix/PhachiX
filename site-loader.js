document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // PHACHIX JSON API
    // ==========================================

    const API_URL = "https://phachix.free.je/site-api.php";

    let siteData = null;
    let allScripts = [];
    let currentGame = "all";
    let currentSearch = "";

    // ==========================================
    // HELPERS
    // ==========================================

    function escapeHTML(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function $(id) {
        return document.getElementById(id);
    }

    // ==========================================
    // LOAD JSON
    // ==========================================

    async function loadSiteData() {

        try {

            console.log("PhachiX: Loading JSON...");

            const response = await fetch(
                API_URL + "?v=" + Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "API HTTP Error: " + response.status
                );
            }

            const result = await response.json();

            console.log("PhachiX API:", result);

            if (!result.success) {
                throw new Error(
                    result.error || "API returned an error"
                );
            }

            siteData = result.data;

            if (!siteData) {
                throw new Error("No site data received");
            }

            allScripts = Array.isArray(siteData.scripts)
                ? siteData.scripts
                : [];

            updateSite();
            renderGames();
            renderScripts();

            console.log("PhachiX: JSON loaded successfully.");

        } catch (error) {

            console.error(
                "PhachiX JSON Error:",
                error
            );

            showLoadError(
                "Unable to load PhachiX data. Please try again."
            );
        }
    }

    // ==========================================
    // UPDATE SITE
    // ==========================================

    function updateSite() {

        // TITLE
        if (siteData.siteName) {

            document.title =
                siteData.siteName +
                " | Roblox Scripts";
        }

        // LOGO
        document.querySelectorAll(".logo").forEach(logo => {

            logo.innerHTML =
                escapeHTML(siteData.siteName || "Phachi") +
                "<span>X</span>";
        });

        // HERO DESCRIPTION
        const heroParagraph =
            document.querySelector(".hero-content > p");

        if (heroParagraph && siteData.description) {

            heroParagraph.textContent =
                siteData.description;
        }

        // STATS
        if ($("totalScripts")) {

            $("totalScripts").textContent =
                siteData.stats?.scripts ?? allScripts.length;
        }

        if ($("totalGames")) {

            $("totalGames").textContent =
                siteData.stats?.games ??
                (siteData.games?.length || 0);
        }

        // ACCESS
        const accessStat =
            document.querySelector(
                ".hero-stats .stat:nth-of-type(3) strong"
            );

        if (accessStat) {

            accessStat.textContent =
                siteData.stats?.access || "24/7";
        }

        // FEATURES
        renderFeatures();
    }

    // ==========================================
    // FEATURES
    // ==========================================

    function renderFeatures() {

        if (!Array.isArray(siteData.features)) {
            return;
        }

        const featureGrid =
            document.querySelector(".feature-grid");

        if (!featureGrid) {
            return;
        }

        featureGrid.innerHTML =
            siteData.features.map(feature => `

                <article class="feature-card">

                    <div class="feature-icon">
                        ${escapeHTML(feature.icon || "⚡")}
                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(feature.title)}
                        </h3>

                        <p>
                            ${escapeHTML(feature.description)}
                        </p>

                    </div>

                </article>

            `).join("");
    }

    // ==========================================
    // GAMES
    // ==========================================

    function renderGames() {

        const categoriesBox =
            $("categoriesBox");

        if (!categoriesBox) {
            return;
        }

        const games =
            Array.isArray(siteData.games)
                ? siteData.games
                : [];

        categoriesBox.innerHTML = `

            <button
                class="category active"
                data-category="all"
            >
                All Games
            </button>

            ${games.map(game => `

                <button
                    class="category"
                    data-category="${escapeHTML(game.name)}"
                >
                    ${escapeHTML(game.name)}
                </button>

            `).join("")}

        `;

        // EVENTS
        categoriesBox
            .querySelectorAll(".category")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        categoriesBox
                            .querySelectorAll(".category")
                            .forEach(btn =>
                                btn.classList.remove("active")
                            );

                        button.classList.add("active");

                        currentGame =
                            button.dataset.category || "all";

                        renderScripts();
                    }
                );
            });
    }

    // ==========================================
    // SCRIPTS
    // ==========================================

    function renderScripts() {

        const grid =
            $("scriptGrid");

        const empty =
            $("emptyState");

        const count =
            $("count");

        if (!grid) {
            return;
        }

        let scripts = [...allScripts];

        // GAME FILTER
        if (currentGame !== "all") {

            scripts = scripts.filter(script =>
                String(script.game || "").toLowerCase() ===
                String(currentGame).toLowerCase()
            );
        }

        // SEARCH
        if (currentSearch.trim() !== "") {

            const search =
                currentSearch.toLowerCase();

            scripts = scripts.filter(script => {

                const text = [

                    script.name,
                    script.game,
                    script.description,
                    script.executor,
                    ...(Array.isArray(script.tags)
                        ? script.tags
                        : [])

                ]
                .join(" ")
                .toLowerCase();

                return text.includes(search);
            });
        }

        // COUNT
        if (count) {

            count.textContent =
                scripts.length +
                (scripts.length === 1
                    ? " Script"
                    : " Scripts");
        }

        // EMPTY
        if (scripts.length === 0) {

            grid.innerHTML = "";

            if (empty) {
                empty.style.display = "block";
            }

            return;
        }

        if (empty) {
            empty.style.display = "none";
        }

        // CARDS
        grid.innerHTML =
            scripts.map(script => {

                const tags =
                    Array.isArray(script.tags)
                        ? script.tags
                        : [];

                return `

                    <article class="script-card">

                        <div class="script-card-top">

                            <span class="script-game">
                                ${escapeHTML(
                                    script.game || "Roblox"
                                )}
                            </span>

                            <span class="script-executor">
                                ${escapeHTML(
                                    script.executor || "Mobile"
                                )}
                            </span>

                        </div>

                        <h3>
                            ${escapeHTML(
                                script.name || "Unnamed Script"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                script.description || ""
                            )}
                        </p>

                        <div class="script-tags">

                            ${tags.map(tag => `

                                <span>
                                    ${escapeHTML(tag)}
                                </span>

                            `).join("")}

                        </div>

                        <div class="script-card-bottom">

                            <small>
                                Updated:
                                ${escapeHTML(
                                    script.updated || "Recently"
                                )}
                            </small>

                            <a
                                href="${escapeHTML(
                                    script.link || "#"
                                )}"
                                class="script-button"
                            >
                                Open Script
                            </a>

                        </div>

                    </article>

                `;

            }).join("");
    }

    // ==========================================
    // SEARCH
    // ==========================================

    function setupSearch() {

        const input =
            $("searchInput");

        const button =
            $("searchButton");

        if (!input) {
            return;
        }

        function doSearch() {

            currentSearch =
                input.value.trim();

            currentGame = "all";

            document
                .querySelectorAll(".category")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            const allButton =
                document.querySelector(
                    '.category[data-category="all"]'
                );

            if (allButton) {
                allButton.classList.add("active");
            }

            renderScripts();

            const scriptsSection =
                $("scripts");

            if (scriptsSection) {

                scriptsSection.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }

        if (button) {
            button.addEventListener(
                "click",
                doSearch
            );
        }

        input.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {
                    doSearch();
                }
            }
        );

        input.addEventListener(
            "input",
            () => {

                if (input.value.trim() === "") {

                    currentSearch = "";

                    renderScripts();
                }
            }
        );
    }

    // ==========================================
    // CLEAR SEARCH
    // ==========================================

    function setupClearSearch() {

        const clear =
            $("clearSearch");

        if (!clear) {
            return;
        }

        clear.addEventListener(
            "click",
            () => {

                const input =
                    $("searchInput");

                if (input) {
                    input.value = "";
                }

                currentSearch = "";
                currentGame = "all";

                document
                    .querySelectorAll(".category")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                const allButton =
                    document.querySelector(
                        '.category[data-category="all"]'
                    );

                if (allButton) {
                    allButton.classList.add("active");
                }

                renderScripts();
            }
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    function showLoadError(message) {

        const grid =
            $("scriptGrid");

        if (!grid) {
            return;
        }

        grid.innerHTML = `

            <div class="loading-card">

                <p>
                    ${escapeHTML(message)}
                </p>

                <button
                    onclick="location.reload()"
                    class="clear-button"
                >
                    Retry
                </button>

            </div>

        `;
    }

    // ==========================================
    // START
    // ==========================================

    setupSearch();
    setupClearSearch();
    loadSiteData();

});