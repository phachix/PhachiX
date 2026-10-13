/* =========================================
   PHACHIX — MAIN JAVASCRIPT
========================================= */

"use strict";


/* =========================================
   GLOBAL DATA
========================================= */

let allScripts = [];
let currentCategory = "all";


/* =========================================
   DOM
========================================= */

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const scriptGrid =
    document.getElementById("scriptGrid");

const categoriesBox =
    document.getElementById("categoriesBox");

const count =
    document.getElementById("count");

const totalScripts =
    document.getElementById("totalScripts");

const totalGames =
    document.getElementById("totalGames");

const emptyState =
    document.getElementById("emptyState");

const clearSearch =
    document.getElementById("clearSearch");


/* =========================================
   LOAD JSON
========================================= */

async function loadScripts(){

    try{

        const response =
            await fetch("data/scripts.json", {
                cache: "no-store"
            });

        if(!response.ok){
            throw new Error(
                "Could not load scripts.json"
            );
        }

        const data =
            await response.json();

        if(
            !data ||
            !Array.isArray(data.scripts)
        ){
            throw new Error(
                "Invalid scripts.json format"
            );
        }

        allScripts = data.scripts;

        updateStats();

        createCategories();

        displayScripts(allScripts);

    }catch(error){

        console.error(
            "PhachiX:",
            error
        );

        showLoadError();

    }

}


/* =========================================
   UPDATE STATS
========================================= */

function updateStats(){

    if(totalScripts){

        totalScripts.textContent =
            formatNumber(
                allScripts.length
            );

    }


    if(totalGames){

        const games =
            new Set(
                allScripts
                    .map(script =>
                        script.game
                    )
                    .filter(Boolean)
            );

        totalGames.textContent =
            formatNumber(
                games.size
            );

    }

}


/* =========================================
   CREATE GAME CATEGORIES
========================================= */

function createCategories(){

    if(!categoriesBox){
        return;
    }


    const games =
        [
            "all",
            ...new Set(
                allScripts
                    .map(script =>
                        script.game
                    )
                    .filter(Boolean)
            )
        ];


    categoriesBox.innerHTML = "";


    games.forEach(
        (game, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "category";

            button.dataset.category =
                game;

            button.textContent =
                game === "all"
                    ? "All Games"
                    : game;


            if(index === 0){

                button.classList.add(
                    "active"
                );

            }


            button.addEventListener(
                "click",
                () => {

                    selectCategory(
                        game,
                        button
                    );

                }
            );


            categoriesBox.appendChild(
                button
            );

        }
    );

}


/* =========================================
   SELECT CATEGORY
========================================= */

function selectCategory(
    category,
    selectedButton
){

    currentCategory =
        category;


    document
        .querySelectorAll(
            ".category"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    selectedButton.classList.add(
        "active"
    );


    filterScripts();


    if(
        window.innerWidth < 650
    ){

        document
            .getElementById("scripts")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }

}


/* =========================================
   FILTER / SEARCH
========================================= */

function filterScripts(){

    const query =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        allScripts.filter(
            script => {

                const name =
                    String(
                        script.name || ""
                    ).toLowerCase();

                const game =
                    String(
                        script.game || ""
                    ).toLowerCase();

                const description =
                    String(
                        script.description || ""
                    ).toLowerCase();

                const tags =
                    Array.isArray(
                        script.tags
                    )
                        ? script.tags
                            .join(" ")
                            .toLowerCase()
                        : "";


                const matchesSearch =
                    !query ||
                    name.includes(query) ||
                    game.includes(query) ||
                    description.includes(query) ||
                    tags.includes(query);


                const matchesCategory =
                    currentCategory === "all" ||
                    script.game ===
                        currentCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    displayScripts(filtered);

}


/* =========================================
   DISPLAY SCRIPTS
========================================= */

function displayScripts(
    scripts
){

    if(!scriptGrid){
        return;
    }


    scriptGrid.innerHTML = "";


    if(count){

        count.textContent =
            scripts.length +
            (
                scripts.length === 1
                    ? " Script"
                    : " Scripts"
            );

    }


    if(
        emptyState
    ){

        emptyState.style.display =
            scripts.length === 0
                ? "block"
                : "none";

    }


    if(
        scripts.length === 0
    ){

        return;

    }


    scripts.forEach(
        script => {

            const card =
                createScriptCard(
                    script
                );

            scriptGrid.appendChild(
                card
            );

        }
    );

}


/* =========================================
   CREATE SCRIPT CARD
========================================= */

function createScriptCard(
    script
){

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "card";


    const icon =
        safeText(
            script.icon || "⚡"
        );


    const status =
        safeText(
            script.status || "UNKNOWN"
        );


    const name =
        safeText(
            script.name ||
            "Unnamed Script"
        );


    const description =
        safeText(
            script.description ||
            "No description available."
        );


    const id =
        safeText(
            script.id || ""
        );


    const tags =
        Array.isArray(
            script.tags
        )
            ? script.tags
            : [];


    card.innerHTML = `

        <div class="card-top">

            <div class="icon">
                ${icon}
            </div>

            <div class="status">
                ● ${status}
            </div>

        </div>


        <h3>
            ${name}
        </h3>


        <p>
            ${description}
        </p>


        <div class="tags">

            ${
                tags
                    .slice(0, 5)
                    .map(
                        tag => `
                            <span class="tag">
                                ${safeText(tag)}
                            </span>
                        `
                    )
                    .join("")
            }

        </div>


        <div class="actions">

            <a
                class="script-link"
                href="script.html?id=${encodeURIComponent(id)}"
            >
                View Script
            </a>

            <button
                class="copy"
                type="button"
            >
                Copy Script
            </button>

        </div>

    `;


    const copyButton =
        card.querySelector(
            ".copy"
        );


    copyButton.addEventListener(
        "click",
        () => {

            copyScript(
                script.code || "",
                copyButton
            );

        }
    );


    return card;

}


/* =========================================
   COPY SCRIPT
========================================= */

async function copyScript(
    code,
    button
){

    if(!code){

        showTemporaryMessage(
            button,
            "No Code"
        );

        return;

    }


    try{

        await navigator.clipboard
            .writeText(code);


        const oldText =
            button.textContent;


        button.textContent =
            "Copied ✓";


        button.style.background =
            "#168a4b";


        setTimeout(
            () => {

                button.textContent =
                    oldText;

                button.style.background =
                    "";

            },
            1600
        );


    }catch(error){

        console.error(
            error
        );


        showTemporaryMessage(
            button,
            "Copy Failed"
        );

    }

}


/* =========================================
   TEMPORARY BUTTON MESSAGE
========================================= */

function showTemporaryMessage(
    button,
    message
){

    const oldText =
        button.textContent;


    button.textContent =
        message;


    setTimeout(
        () => {

            button.textContent =
                oldText;

        },
        1600
    );

}


/* =========================================
   SEARCH EVENTS
========================================= */

if(searchInput){

    searchInput.addEventListener(
        "input",
        () => {

            filterScripts();

        }
    );

}


if(searchButton){

    searchButton.addEventListener(
        "click",
        () => {

            filterScripts();

            document
                .getElementById(
                    "scripts"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }
    );

}


if(searchInput){

    searchInput.addEventListener(
        "keydown",
        event => {

            if(
                event.key === "Enter"
            ){

                filterScripts();

                document
                    .getElementById(
                        "scripts"
                    )
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

            }

        }
    );

}


/* =========================================
   CLEAR SEARCH
========================================= */

if(clearSearch){

    clearSearch.addEventListener(
        "click",
        () => {

            if(searchInput){
                searchInput.value = "";
            }


            currentCategory =
                "all";


            document
                .querySelectorAll(
                    ".category"
                )
                .forEach(
                    (button, index) => {

                        button.classList
                            .toggle(
                                "active",
                                index === 0
                            );

                    }
                );


            displayScripts(
                allScripts
            );


            document
                .getElementById(
                    "scripts"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }
    );

}


/* =========================================
   SAFE HTML TEXT
========================================= */

function safeText(
    value
){

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================
   NUMBER FORMAT
========================================= */

function formatNumber(
    number
){

    const value =
        Number(number) || 0;


    if(
        value >= 1000000
    ){

        return (
            value / 1000000
        )
            .toFixed(1)
            .replace(
                ".0",
                ""
            ) + "M";

    }


    if(
        value >= 1000
    ){

        return (
            value / 1000
        )
            .toFixed(1)
            .replace(
                ".0",
                ""
            ) + "K";

    }


    return String(
        value
    );

}


/* =========================================
   LOAD ERROR
========================================= */

function showLoadError(){

    if(!scriptGrid){
        return;
    }


    scriptGrid.innerHTML = `

        <div class="loading-card">

            <div
                style="
                    font-size:32px;
                    margin-bottom:5px;
                "
            >
                ⚠️
            </div>

            <p>
                Failed to load scripts.
            </p>

            <small
                style="
                    color:#444;
                    margin-top:5px;
                "
            >
                Check data/scripts.json
            </small>

        </div>

    `;


    if(count){

        count.textContent =
            "Error";

    }

}


/* =========================================
   START
========================================= */

loadScripts();