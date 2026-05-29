/* ==========================================================================
   Sterling Chronicle - Application Logic
   ========================================================================== */

// Active Sibling Data State (fetched from backend server)
let siblings = [];

async function loadSiblings() {
    try {
        const response = await fetch('/api/siblings');
        if (response.ok) {
            siblings = await response.json();
        } else {
            console.error('Failed to load siblings data from API');
        }
    } catch (err) {
        console.error('Error loading siblings data:', err);
    }
}


// --- Sibling Relationship Circles Data ---
const relationshipCircles = [
    {
        id: "twins",
        name: "Twin Bond",
        color: "hsl(262, 80%, 65%)",
        colorGlow: "rgba(138, 75, 241, 0.25)",
        icon: "fa-solid fa-people-arrows",
        count: "2 Members",
        members: ["Kai Sterling", "Luna Sterling"],
        desc: "Kai (Twin A) and Luna (Twin B) share a tight connection. Born just minutes apart, they collaborate on digital projects: Kai codes game levels while Luna animates the characters and assets.",
        quote: "We don't need words to communicate. Half a glance is enough to know what move we are making next.",
        quoteAuthor: "Luna & Kai"
    },
    {
        id: "builders",
        name: "Eco-Tech Alliance",
        color: "hsl(36, 100%, 55%)",
        colorGlow: "rgba(245, 158, 11, 0.25)",
        icon: "fa-solid fa-cubes",
        count: "3 Members",
        members: ["Alexander Sterling", "Ethan Sterling", "Kai Sterling"],
        desc: "The builders of the family. From structural architecture (Alex) to software and robotics (Ethan) and digital systems mapping (Kai), these three are constantly brainstorming tools, smart housing concepts, and system architectures.",
        quote: "We spent our childhood stacking blocks. Now we build systems, buildings, and robots. The scale changed, the passion didn't.",
        quoteAuthor: "Alexander"
    },
    {
        id: "creative-guild",
        name: "Artistic Collective",
        color: "hsl(339, 85%, 60%)",
        colorGlow: "rgba(244, 63, 94, 0.25)",
        icon: "fa-solid fa-palette",
        count: "4 Members",
        members: ["Charles Sterling", "Gabriel Sterling", "Julia Sterling", "Luna Sterling"],
        desc: "The artistic spirits. Charles composes orchestration, Gabriel bakes fine pastries, Julia creates structural couture fashion, and Luna animates worlds. They cross-pollinate projects, like baking concept shows or custom soundtracks for animations.",
        quote: "Art takes different forms, whether it is heard, worn, eaten, or animated. We find harmony in our creative chaos.",
        quoteAuthor: "Charles"
    },
    {
        id: "nature-scholars",
        name: "Science & Nature Club",
        color: "hsl(142, 70%, 45%)",
        colorGlow: "rgba(34, 197, 94, 0.25)",
        icon: "fa-solid fa-dna",
        count: "3 Members",
        members: ["Beatrice Sterling", "Fiona Sterling", "Ian Sterling"],
        desc: "The intellectual researchers. Beatrice studies the cosmic universe, Fiona researches soil microbiomes, and Ian archives human history and literary frameworks. Together they form a research circle, challenging each other on science and philosophy.",
        quote: "Whether looking through a telescope or a microscope, we are looking for the structural logic of the universe.",
        quoteAuthor: "Beatrice"
    },
    {
        id: "outdoor-adventurers",
        name: "Adrenaline Crew",
        color: "hsl(200, 95%, 55%)",
        colorGlow: "rgba(14, 165, 233, 0.25)",
        icon: "fa-solid fa-person-hiking",
        count: "3 Members",
        members: ["Diana Sterling", "Helena Sterling", "Alexander Sterling"],
        desc: "The outdoor thrill-seekers. Diana tracks wilderness trails for wildlife photography, Helena trains in open waters, and Alexander is a mountaineer. They often plan wilderness climbing trips and kayaking expeditions.",
        quote: "Our best conversations happen when we're lost on a mountain trail or waiting for the sunrise by the lake.",
        quoteAuthor: "Diana"
    }
];

// --- App State ---
let activeFilters = {
    searchQuery: "",
    category: "all",
    sortBy: "birth-order-asc"
};
let currentSiblingIndex = 0; // For modal navigation

// --- DOM Elements ---
const themeToggleBtn = document.getElementById("theme-toggle");
const siblingsGrid = document.getElementById("siblings-grid");
const siblingSearch = document.getElementById("sibling-search");
const clearSearchBtn = document.getElementById("clear-search");
const categoryFilters = document.getElementById("category-filters");
const siblingSort = document.getElementById("sibling-sort");
const noResultsPanel = document.getElementById("no-results");
const resetFiltersBtn = document.getElementById("reset-filters");
const timelineItems = document.getElementById("timeline-items");
const connectionsCircles = document.getElementById("connections-circles");
const connectionDetailsPanel = document.getElementById("connection-details-panel");

// Modal Elements
const modalOverlay = document.getElementById("sibling-modal");
const modalCloseBtn = document.getElementById("modal-close");
const modalPrevBtn = document.getElementById("modal-prev");
const modalNextBtn = document.getElementById("modal-next");
const modalDynamicContent = document.getElementById("modal-dynamic-content");

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggleBtn.querySelector("i");
    if (theme === "dark") {
        icon.className = "fa-solid fa-sun";
    } else {
        icon.className = "fa-solid fa-moon";
    }
}

// --- Cards Rendering ---
function renderSiblingCards(filteredData) {
    siblingsGrid.innerHTML = "";
    
    if (filteredData.length === 0) {
        noResultsPanel.style.display = "block";
        siblingsGrid.style.display = "none";
        return;
    }
    
    noResultsPanel.style.display = "none";
    siblingsGrid.style.display = "grid";
    
    filteredData.forEach(sib => {
        const initials = sib.name.split(" ").map(n => n[0]).join("");
        const card = document.createElement("div");
        card.className = "sibling-card";
        card.style.setProperty("--card-accent", sib.accentColor);
        card.style.setProperty("--card-accent-alt", sib.accentColorAlt);
        card.style.setProperty("--card-accent-glow", sib.accentColorGlow);
        
        card.innerHTML = `
            <div class="card-header">
                <span class="birth-badge">${sib.birthOrder}</span>
                <span class="zodiac-icon" title="${sib.zodiac}"><i class="${sib.zodiacIcon}"></i></span>
            </div>
            <div class="card-avatar-wrapper">
                ${sib.photo ? `<img src="${sib.photo}" alt="${sib.name}" class="avatar-image">` : initials}
            </div>
            <h3 class="sibling-name">${sib.name}</h3>
            <div class="sibling-age-role">Age ${sib.age} &bull; ${sib.role}</div>
            <p class="sibling-quote">"${sib.quote}"</p>
            <div class="sibling-tags">
                ${sib.traits.map(t => `<span class="sibling-tag-chip">${t}</span>`).join("")}
            </div>
            <button class="view-profile-btn" data-id="${sib.id}">
                View Profile <i class="fa-solid fa-arrow-right"></i>
            </button>
        `;
        siblingsGrid.appendChild(card);
    });
    
    // Attach event listeners to card buttons
    document.querySelectorAll(".view-profile-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.getAttribute("data-id"));
            openSiblingModal(id);
        });
    });
}

// --- Filtering & Sorting Logic ---
function filterAndSortSiblings() {
    let result = [...siblings];
    
    // 1. Search Query Filter
    if (activeFilters.searchQuery.trim() !== "") {
        const query = activeFilters.searchQuery.toLowerCase();
        result = result.filter(sib => 
            sib.name.toLowerCase().includes(query) ||
            sib.role.toLowerCase().includes(query) ||
            sib.bio.toLowerCase().includes(query) ||
            sib.traits.some(t => t.toLowerCase().includes(query)) ||
            sib.hobbies.some(h => h.name.toLowerCase().includes(query))
        );
    }
    
    // 2. Category Filter
    if (activeFilters.category !== "all") {
        result = result.filter(sib => sib.category === activeFilters.category);
    }
    
    // 3. Sorting
    if (activeFilters.sortBy === "birth-order-asc") {
        result.sort((a, b) => a.id - b.id);
    } else if (activeFilters.sortBy === "birth-order-desc") {
        result.sort((a, b) => b.id - a.id);
    } else if (activeFilters.sortBy === "name-asc") {
        result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (activeFilters.sortBy === "name-desc") {
        result.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    renderSiblingCards(result);
}

// --- Timeline Rendering ---
function renderTimeline() {
    timelineItems.innerHTML = "";
    
    // Sort oldest first for chronological timeline
    const chronological = [...siblings].sort((a, b) => a.birthYear - b.birthYear);
    
    chronological.forEach((sib, index) => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        item.style.setProperty("--timeline-accent", sib.accentColor);
        item.style.setProperty("--timeline-accent-glow", sib.accentColorGlow);
        
        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-card">
                <div class="timeline-year">
                    <i class="fa-regular fa-calendar"></i> ${sib.birthYear}
                </div>
                <h3 class="timeline-name">${sib.name} (${sib.nickname})</h3>
                <p class="timeline-desc">${sib.role}. Key childhood interest included ${sib.hobbies[0].name.toLowerCase()} and tinkering with creative designs.</p>
            </div>
        `;
        timelineItems.appendChild(item);
    });
}

// --- Connection Circles Rendering ---
function renderConnections() {
    connectionsCircles.innerHTML = "";
    
    relationshipCircles.forEach((circle, index) => {
        const card = document.createElement("div");
        card.className = "connection-cluster";
        card.style.setProperty("--cluster-color", circle.color);
        card.style.setProperty("--cluster-color-glow", circle.colorGlow);
        card.setAttribute("data-cluster-id", circle.id);
        
        card.innerHTML = `
            <div class="cluster-info">
                <div class="cluster-icon"><i class="${circle.icon}"></i></div>
                <div>
                    <h3 class="cluster-name">${circle.name}</h3>
                    <span class="cluster-members-count">${circle.count} &bull; ${circle.members.join(", ")}</span>
                </div>
            </div>
            <i class="fa-solid fa-chevron-right cluster-arrow"></i>
        `;
        
        card.addEventListener("click", () => {
            document.querySelectorAll(".connection-cluster").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            showConnectionDetails(circle);
        });
        
        connectionsCircles.appendChild(card);
    });
}

function showConnectionDetails(cluster) {
    const placeholder = connectionDetailsPanel.querySelector(".panel-placeholder");
    const content = connectionDetailsPanel.querySelector(".panel-content");
    
    placeholder.style.display = "none";
    content.style.display = "block";
    content.style.setProperty("--cluster-color", cluster.color);
    
    // Look up sibling colors for avatar chips
    const memberChipsHTML = cluster.members.map(memberName => {
        const sib = siblings.find(s => s.name === memberName);
        const color = sib ? sib.accentColor : "var(--accent-purple)";
        return `
            <div class="member-avatar-chip" style="--member-color: ${color}" data-sib-id="${sib ? sib.id : ''}">
                <div class="member-dot"></div>
                ${sib ? sib.nickname : memberName}
            </div>
        `;
    }).join("");

    content.innerHTML = `
        <h3 class="panel-cluster-title">
            <span class="cluster-icon" style="display: inline-flex; width: 36px; height: 36px; font-size: 1rem; border-radius: var(--radius-full); background: var(--bg-tertiary); align-items: center; justify-content: center; border: 2px solid ${cluster.color}; color: ${cluster.color}"><i class="${cluster.icon}"></i></span>
            ${cluster.name}
        </h3>
        <p class="panel-cluster-desc">${cluster.desc}</p>
        
        <div class="panel-members-list">
            <h4 class="panel-members-title">Circle Members</h4>
            <div class="members-avatars">
                ${memberChipsHTML}
            </div>
        </div>
        
        <div class="dynamic-quote-box" style="border-left-color: ${cluster.color}">
            <div class="quote-label">Family Dynamics</div>
            <p class="quote-text">"${cluster.quote}"</p>
            <div style="text-align: right; font-size: 0.8rem; color: var(--text-muted); margin-top: 6px; font-weight: 600;">&mdash; ${cluster.quoteAuthor}</div>
        </div>
    `;

    // Attach click events to the member chips to open their profile modal
    content.querySelectorAll(".member-avatar-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const id = parseInt(chip.getAttribute("data-sib-id"));
            if (id) openSiblingModal(id);
        });
    });
}

// --- Modal Logic ---
function openSiblingModal(siblingId) {
    const sibling = siblings.find(s => s.id === siblingId);
    if (!sibling) return;
    
    currentSiblingIndex = siblings.findIndex(s => s.id === siblingId);
    
    // Inject dynamic template
    const initials = sibling.name.split(" ").map(n => n[0]).join("");
    const avatarContent = sibling.photo 
        ? `<img src="${sibling.photo}" alt="${sibling.name}" class="avatar-image">` 
        : initials;
    modalDynamicContent.innerHTML = `
        <div class="modal-profile-grid" style="--sib-color: ${sibling.accentColor}; --sib-color-alt: ${sibling.accentColorAlt}; --sib-color-glow: ${sibling.accentColorGlow}">
            <!-- Left Side: Basic Info & Avatar -->
            <div class="modal-left-panel">
                <div class="modal-avatar-wrapper">${avatarContent}</div>
                <h2 class="modal-name">${sibling.name}</h2>
                <div class="modal-role">${sibling.role}</div>
                <div class="birth-badge" style="margin-bottom: 24px;">${sibling.birthOrder}</div>
                
                <div class="modal-meta-grid">
                    <div class="meta-item">
                        <div class="meta-val">${sibling.age}</div>
                        <div class="meta-lbl">Age</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-val">${sibling.birthYear}</div>
                        <div class="meta-lbl">Birth Year</div>
                    </div>
                    <div class="meta-item" style="grid-column: span 2">
                        <div class="meta-val" style="font-size: 1rem;"><i class="${sibling.zodiacIcon}" style="margin-right: 6px; color: ${sibling.accentColor}"></i>${sibling.zodiac}</div>
                        <div class="meta-lbl">Zodiac Sign</div>
                    </div>
                </div>
                
            </div>
            
            <!-- Right Side: Details, Traits & Hobbies -->
            <div class="modal-right-panel">
                <h3 class="modal-section-title">Biography</h3>
                <p class="modal-bio">${sibling.bio}</p>
                
                <h3 class="modal-section-title">Key Aptitudes</h3>
                <div class="modal-stats">
                    ${Object.entries(sibling.skills).map(([skill, val]) => `
                        <div class="stat-row">
                            <div class="stat-label-row">
                                <span>${skill}</span>
                                <span>${val}%</span>
                            </div>
                            <div class="stat-track">
                                <div class="stat-fill" data-width="${val}%"></div>
                            </div>
                        </div>
                    `).join("")}
                </div>
                
                <h3 class="modal-section-title" style="margin-bottom: 16px;">Hobbies & Interests</h3>
                <div class="modal-hobbies">
                    ${sibling.hobbies.map(h => `
                        <span class="hobby-chip">
                            <i class="${h.icon}"></i>
                            ${h.name}
                        </span>
                    `).join("")}
                </div>
            </div>
        </div>
    `;
    
    // Open modal container
    modalOverlay.classList.add("open");
    modalOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Disable background scrolling
    
    // Trigger progress bar animations (slight delay to let DOM render)
    setTimeout(() => {
        modalDynamicContent.querySelectorAll(".stat-fill").forEach(fill => {
            fill.style.width = fill.getAttribute("data-width");
        });
    }, 100);
}

function closeSiblingModal() {
    modalOverlay.classList.remove("open");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Enable back ground scrolling
}

function navigateModal(direction) {
    let nextIndex = currentSiblingIndex + direction;
    if (nextIndex < 0) {
        nextIndex = siblings.length - 1; // loop back to end
    } else if (nextIndex >= siblings.length) {
        nextIndex = 0; // loop back to start
    }
    openSiblingModal(siblings[nextIndex].id);
}

// --- Event Listeners ---
function setupEventListeners() {
    // Theme toggle
    themeToggleBtn.addEventListener("click", toggleTheme);
    
    // Search input
    siblingSearch.addEventListener("input", (e) => {
        activeFilters.searchQuery = e.target.value;
        if (activeFilters.searchQuery.trim() !== "") {
            clearSearchBtn.style.display = "block";
        } else {
            clearSearchBtn.style.display = "none";
        }
        filterAndSortSiblings();
    });
    
    // Clear Search
    clearSearchBtn.addEventListener("click", () => {
        siblingSearch.value = "";
        activeFilters.searchQuery = "";
        clearSearchBtn.style.display = "none";
        filterAndSortSiblings();
    });
    
    // Category chips
    categoryFilters.querySelectorAll(".filter-tag").forEach(tag => {
        tag.addEventListener("click", () => {
            categoryFilters.querySelectorAll(".filter-tag").forEach(t => t.classList.remove("active"));
            tag.classList.add("active");
            activeFilters.category = tag.getAttribute("data-category");
            filterAndSortSiblings();
        });
    });
    
    // Sort dropdown
    siblingSort.addEventListener("change", (e) => {
        activeFilters.sortBy = e.target.value;
        filterAndSortSiblings();
    });
    
    // Reset Filters button
    resetFiltersBtn.addEventListener("click", () => {
        siblingSearch.value = "";
        activeFilters.searchQuery = "";
        clearSearchBtn.style.display = "none";
        
        categoryFilters.querySelectorAll(".filter-tag").forEach(t => t.classList.remove("active"));
        categoryFilters.querySelector('[data-category="all"]').classList.add("active");
        activeFilters.category = "all";
        
        siblingSort.value = "birth-order-asc";
        activeFilters.sortBy = "birth-order-asc";
        
        filterAndSortSiblings();
    });
    
    // Modal controls
    modalCloseBtn.addEventListener("click", closeSiblingModal);
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) closeSiblingModal();
    });
    
    modalPrevBtn.addEventListener("click", () => navigateModal(-1));
    modalNextBtn.addEventListener("click", () => navigateModal(1));
    
    // Key presses
    document.addEventListener("keydown", (e) => {
        if (!modalOverlay.classList.contains("open")) return;
        
        if (e.key === "Escape") {
            closeSiblingModal();
        } else if (e.key === "ArrowLeft") {
            navigateModal(-1);
        } else if (e.key === "ArrowRight") {
            navigateModal(1);
        }
    });

    // Active link highlighting on scroll
    window.addEventListener("scroll", () => {
        let current = "";
        const sections = document.querySelectorAll("header, section");
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollPosition >= sectionTop) {
                current = section.getAttribute("id");
            }
        });
        
        document.querySelectorAll(".nav-links a").forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });
}

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    await loadSiblings();
    filterAndSortSiblings();
    renderTimeline();
    renderConnections();
    setupEventListeners();
});
