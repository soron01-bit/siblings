/* ==========================================================================
   Sterling Chronicle - Admin Management Logic
   ========================================================================== */

// State
let token = localStorage.getItem('sterling_admin_token');
let siblings = [];
let activeEditFile = null;

// Preset Color Maps
const colorPresets = {
    amber: {
        accentColor: "hsl(36, 100%, 55%)",
        accentColorAlt: "hsl(48, 100%, 50%)",
        accentColorGlow: "rgba(245, 158, 11, 0.25)"
    },
    blue: {
        accentColor: "hsl(200, 95%, 55%)",
        accentColorAlt: "hsl(215, 90%, 50%)",
        accentColorGlow: "rgba(14, 165, 233, 0.25)"
    },
    rose: {
        accentColor: "hsl(339, 85%, 60%)",
        accentColorAlt: "hsl(320, 80%, 55%)",
        accentColorGlow: "rgba(244, 63, 94, 0.25)"
    },
    emerald: {
        accentColor: "hsl(142, 70%, 45%)",
        accentColorAlt: "hsl(160, 60%, 40%)",
        accentColorGlow: "rgba(34, 197, 94, 0.25)"
    },
    purple: {
        accentColor: "hsl(262, 80%, 65%)",
        accentColorAlt: "hsl(290, 75%, 60%)",
        accentColorGlow: "rgba(138, 75, 241, 0.3)"
    }
};

// Preset Zodiac Icon Maps
const zodiacIcons = {
    Aries: "fa-solid fa-cloud-bolt",
    Taurus: "fa-solid fa-moon",
    Gemini: "fa-solid fa-masks-theater",
    Cancer: "fa-solid fa-water",
    Leo: "fa-solid fa-fire",
    Virgo: "fa-solid fa-seedling",
    Libra: "fa-solid fa-scale-balanced",
    Scorpio: "fa-solid fa-spider",
    Sagittarius: "fa-solid fa-arrow-trend-up",
    Capricorn: "fa-solid fa-mountain",
    Aquarius: "fa-solid fa-wind",
    Pisces: "fa-solid fa-fish"
};

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const adminWelcomeText = document.getElementById('admin-welcome-text');
const btnLogout = document.getElementById('btn-logout');
const btnAddSibling = document.getElementById('btn-add-sibling');
const btnResetDb = document.getElementById('btn-reset-db');
const siblingTableBody = document.getElementById('sibling-table-body');

// Form Modal Elements
const adminFormModal = document.getElementById('admin-form-modal');
const modalClose = document.getElementById('modal-close');
const adminFormCancel = document.getElementById('admin-form-cancel');
const adminSiblingForm = document.getElementById('admin-sibling-form');
const formActionText = document.getElementById('form-action-text');

// Form Fields
const siblingIdInput = document.getElementById('sibling-id');
const sibNameInput = document.getElementById('sib-name');
const sibNicknameInput = document.getElementById('sib-nickname');
const sibRoleInput = document.getElementById('sib-role');
const sibAgeInput = document.getElementById('sib-age');
const sibCategorySelect = document.getElementById('sib-category');
const sibColorSelect = document.getElementById('sib-color-preset');
const sibZodiacSelect = document.getElementById('sib-zodiac');
const sibBirthOrderInput = document.getElementById('sib-birth-order');
const sibQuoteInput = document.getElementById('sib-quote');
const sibBioInput = document.getElementById('sib-bio');
const photoInput = document.getElementById('admin-photo-input');
const photoPreviewBox = document.getElementById('admin-photo-preview');

// Auth Form Elements
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginError = document.getElementById('login-error');
const loginSuccess = document.getElementById('login-success');
const signupError = document.getElementById('signup-error');
const signupSuccess = document.getElementById('signup-success');

// Theme Elements
const themeToggleBtn = document.getElementById("theme-toggle");

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem("sterling_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("sterling_theme", newTheme);
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

// --- Check Authorization ---
async function checkAuth() {
    if (!token) {
        showAuthView();
        return;
    }

    try {
        const response = await fetch('/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            showDashboardView(data.username);
        } else {
            // Invalid token
            logout();
        }
    } catch (e) {
        console.error(e);
        showAuthView();
    }
}

function showAuthView() {
    authView.style.display = 'block';
    dashboardView.style.display = 'none';
}

function showDashboardView(username) {
    authView.style.display = 'none';
    dashboardView.style.display = 'block';
    adminWelcomeText.textContent = `Welcome back, ${username || 'Administrator'}`;
    loadSiblingsList();
}

function logout() {
    localStorage.removeItem('sterling_admin_token');
    localStorage.removeItem('sterling_admin_username');
    token = null;
    showAuthView();
}

// --- Load Siblings List ---
async function loadSiblingsList() {
    try {
        const response = await fetch('/api/siblings');
        if (response.ok) {
            siblings = await response.json();
            renderSiblingsTable();
        } else {
            console.error("Failed to load siblings database list");
        }
    } catch (e) {
        console.error(e);
    }
}

function renderSiblingsTable() {
    siblingTableBody.innerHTML = '';
    
    if (siblings.length === 0) {
        siblingTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No sibling profiles found in the database. Click "Add Sibling" to create one.</td></tr>`;
        return;
    }

    siblings.forEach(sib => {
        const row = document.createElement('tr');
        
        // Initials or Photo thumbnail
        const initials = sib.name.split(" ").map(n => n[0]).join("");
        const avatarHTML = sib.photo 
            ? `<img src="${sib.photo}" alt="${sib.name}">` 
            : initials;

        row.innerHTML = `
            <td><strong style="color: var(--text-primary); font-family: var(--font-heading);">${sib.birthOrder}</strong></td>
            <td>
                <div class="admin-avatar-col">
                    <div class="admin-avatar-circle" style="background: linear-gradient(135deg, ${sib.accentColor}, ${sib.accentColorAlt}); box-shadow: 0 2px 8px ${sib.accentColorGlow}">
                        ${avatarHTML}
                    </div>
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary);">${sib.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">"${sib.nickname}"</div>
                    </div>
                </div>
            </td>
            <td>${sib.role}</td>
            <td>${sib.age} yrs</td>
            <td><span class="category-tag ${sib.category}" style="display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: var(--radius-full); text-transform: uppercase;">${sib.category}</span></td>
            <td style="text-align: right;">
                <div class="admin-actions-cell" style="justify-content: flex-end;">
                    <button class="btn-icon edit-btn" title="Edit Sibling Profile" data-id="${sib.id}"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn-icon delete-btn" title="Delete Profile" data-id="${sib.id}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </td>
        `;
        
        // Wire up row buttons
        row.querySelector('.edit-btn').addEventListener('click', () => openFormModal(sib.id));
        row.querySelector('.delete-btn').addEventListener('click', () => deleteSiblingProfile(sib.id));

        siblingTableBody.appendChild(row);
    });
}

// --- Delete Sibling Profile ---
async function deleteSiblingProfile(id) {
    const sib = siblings.find(s => s.id === id);
    if (!sib) return;

    if (confirm(`Are you absolutely sure you want to delete ${sib.name}'s profile from the database? This action cannot be undone.`)) {
        try {
            const response = await fetch(`/api/siblings/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                await loadSiblingsList();
            } else {
                alert("Failed to delete: " + (data.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Network error occurred during profile deletion.");
        }
    }
}

// --- Open Form Modal ---
function openFormModal(id = null) {
    activeEditFile = null;
    photoInput.value = '';
    
    // Clear alerts or visual states
    adminSiblingForm.reset();

    if (id) {
        // Edit Profile Mode
        const sib = siblings.find(s => s.id === id);
        if (!sib) return;

        formActionText.textContent = "Edit Sibling Profile";
        siblingIdInput.value = sib.id;
        sibNameInput.value = sib.name;
        sibNicknameInput.value = sib.nickname;
        sibRoleInput.value = sib.role;
        sibAgeInput.value = sib.age;
        sibCategorySelect.value = sib.category;
        sibZodiacSelect.value = sib.zodiac;
        sibBirthOrderInput.value = sib.birthOrder;
        sibQuoteInput.value = sib.quote;
        sibBioInput.value = sib.bio;

        // Deduced Color Preset
        let matchedPreset = 'amber';
        for (const [key, val] of Object.entries(colorPresets)) {
            if (val.accentColor === sib.accentColor) {
                matchedPreset = key;
                break;
            }
        }
        sibColorSelect.value = matchedPreset;

        // Photo Preview Setup
        const initials = sib.name.split(" ").map(n => n[0]).join("");
        if (sib.photo) {
            photoPreviewBox.innerHTML = `<img src="${sib.photo}" alt="${sib.name}" class="avatar-image">`;
        } else {
            photoPreviewBox.innerHTML = initials;
            photoPreviewBox.style.background = `linear-gradient(135deg, ${sib.accentColor}, ${sib.accentColorAlt})`;
        }

        // Skills Prepopulation
        const skillsArray = Object.entries(sib.skills);
        for (let i = 0; i < 3; i++) {
            const skillNameInput = document.getElementById(`skill-name-${i}`);
            const skillValInput = document.getElementById(`skill-val-${i}`);
            const skillValPreview = document.getElementById(`val-preview-${i}`);
            if (skillsArray[i]) {
                skillNameInput.value = skillsArray[i][0];
                skillValInput.value = skillsArray[i][1];
                skillValPreview.textContent = `${skillsArray[i][1]}%`;
            } else {
                skillNameInput.value = '';
                skillValInput.value = 50;
                skillValPreview.textContent = '50%';
            }
        }

        // Hobbies Prepopulation
        for (let i = 0; i < 3; i++) {
            const hobbyInput = document.getElementById(`hobby-${i}`);
            if (sib.hobbies[i]) {
                hobbyInput.value = sib.hobbies[i].name;
            } else {
                hobbyInput.value = '';
            }
        }
    } else {
        // Add Profile Mode
        formActionText.textContent = "Add New Sibling";
        siblingIdInput.value = '';
        photoPreviewBox.innerHTML = '?';
        photoPreviewBox.style.background = 'var(--bg-tertiary)';
        
        // Defaults
        sibCategorySelect.value = 'creatives';
        sibColorSelect.value = 'amber';
        sibZodiacSelect.value = 'Aries';
        
        // Skills Defaults
        for (let i = 0; i < 3; i++) {
            document.getElementById(`skill-name-${i}`).value = '';
            document.getElementById(`skill-val-${i}`).value = 80;
            document.getElementById(`val-preview-${i}`).textContent = '80%';
        }
        
        // Hobbies Defaults
        for (let i = 0; i < 3; i++) {
            document.getElementById(`hobby-${i}`).value = '';
        }
    }

    adminFormModal.classList.add('open');
    adminFormModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeFormModal() {
    adminFormModal.classList.remove('open');
    adminFormModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// --- Form Modal Submissions ---
async function saveSiblingProfile(e) {
    e.preventDefault();

    const id = siblingIdInput.value;
    const isEdit = id !== '';

    // Color preset values mapping
    const presetName = sibColorSelect.value;
    const colors = colorPresets[presetName] || colorPresets.amber;

    // Zodiac icon mapping
    const zodiacName = sibZodiacSelect.value;
    const zodiacIcon = zodiacIcons[zodiacName] || "fa-solid fa-star";

    // Deduce birth year
    const age = parseInt(sibAgeInput.value);
    const birthYear = 2026 - age;

    // Build skills object
    const skills = {};
    for (let i = 0; i < 3; i++) {
        const name = document.getElementById(`skill-name-${i}`).value.trim();
        const val = parseInt(document.getElementById(`skill-val-${i}`).value);
        if (name) {
            skills[name] = val;
        } else {
            skills[`Skill ${i+1}`] = val;
        }
    }

    // Build hobbies list (mapping simple text inputs to standard icons)
    const hobbyIcons = ["fa-solid fa-star", "fa-solid fa-heart", "fa-solid fa-sparkles"];
    const hobbies = [];
    for (let i = 0; i < 3; i++) {
        const name = document.getElementById(`hobby-${i}`).value.trim();
        if (name) {
            hobbies.push({
                icon: hobbyIcons[i] || "fa-solid fa-circle",
                name: name
            });
        }
    }
    // If no hobbies added, provide placeholder
    if (hobbies.length === 0) {
        hobbies.push({ icon: "fa-solid fa-gamepad", name: "Tinkering" });
    }

    // Simple traits mapping derived from aesthetics or defaults
    let traits = ["Creative", "Enthusiastic", "Kind"];
    if (sibCategorySelect.value === 'scholars') traits = ["Analytical", "Observant", "Quiet"];
    if (sibCategorySelect.value === 'builders') traits = ["Logical", "Innovative", "Detail-oriented"];
    if (sibCategorySelect.value === 'adventurers') traits = ["Fearless", "Spontaneous", "Energetic"];

    // Build FormData payload
    const formData = new FormData();
    formData.append('name', sibNameInput.value.trim());
    formData.append('nickname', sibNicknameInput.value.trim());
    formData.append('birthYear', birthYear);
    formData.append('birthOrder', sibBirthOrderInput.value.trim());
    formData.append('age', age);
    formData.append('zodiac', zodiacName);
    formData.append('zodiacIcon', zodiacIcon);
    formData.append('role', sibRoleInput.value.trim());
    formData.append('category', sibCategorySelect.value);
    formData.append('quote', sibQuoteInput.value.trim());
    formData.append('bio', sibBioInput.value.trim());
    formData.append('accentColor', colors.accentColor);
    formData.append('accentColorAlt', colors.accentColorAlt);
    formData.append('accentColorGlow', colors.accentColorGlow);
    formData.append('skills', JSON.stringify(skills));
    formData.append('hobbies', JSON.stringify(hobbies));
    formData.append('traits', JSON.stringify(traits));

    // Append File if uploaded
    if (photoInput.files[0]) {
        formData.append('photo', photoInput.files[0]);
    }

    try {
        const url = isEdit ? `/api/siblings/${id}` : '/api/siblings';
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            closeFormModal();
            await loadSiblingsList();
        } else {
            alert("Error saving profile: " + (data.error || "Server error occurred."));
        }
    } catch (err) {
        console.error(err);
        alert("Network error occurred during form submission.");
    }
}

// --- Live Photo Upload Preview ---
photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            photoPreviewBox.innerHTML = `<img src="${event.target.result}" alt="Preview" class="avatar-image">`;
        };
        reader.readAsDataURL(file);
    }
});

// Live range updates inside form sliders
document.querySelectorAll('.admin-skill-slider').forEach((slider, index) => {
    slider.addEventListener('input', (e) => {
        document.getElementById(`val-preview-${index}`).textContent = `${e.target.value}%`;
    });
});

// --- Reset Database (Admin only) ---
async function resetDatabase() {
    if (confirm("Are you sure you want to reset all sibling profiles and photos to defaults? This will erase all your custom modifications.")) {
        try {
            const response = await fetch('/api/siblings/reset', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message || "Reset successful!");
                await loadSiblingsList();
            } else {
                alert("Failed to reset: " + (data.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Error sending reset request.");
        }
    }
}

// --- Auth Operations ---

// Tab switching
tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
    loginError.style.display = 'none';
    signupError.style.display = 'none';
});

tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    signupForm.style.display = 'flex';
    loginForm.style.display = 'none';
    loginError.style.display = 'none';
    signupError.style.display = 'none';
});

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    loginSuccess.style.display = 'none';

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            localStorage.setItem('sterling_admin_token', token);
            localStorage.setItem('sterling_admin_username', data.username);
            loginSuccess.textContent = "Authorized. Access granted.";
            loginSuccess.style.display = 'flex';
            
            setTimeout(() => {
                showDashboardView(data.username);
                loginForm.reset();
            }, 1000);
        } else {
            loginError.textContent = data.error || "Access denied.";
            loginError.style.display = 'flex';
        }
    } catch (err) {
        console.error(err);
        loginError.textContent = "Server communication failure.";
        loginError.style.display = 'flex';
    }
});

// Signup Form Submit
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signupError.style.display = 'none';
    signupSuccess.style.display = 'none';

    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            signupSuccess.textContent = "Registration successful! You can now log in.";
            signupSuccess.style.display = 'flex';
            signupForm.reset();
            
            setTimeout(() => {
                tabLogin.click();
            }, 2000);
        } else {
            signupError.textContent = data.error || "Registration failed.";
            signupError.style.display = 'flex';
        }
    } catch (err) {
        console.error(err);
        signupError.textContent = "Server communication failure.";
        signupError.style.display = 'flex';
    }
});

// --- Wire Up Global Event Listeners ---
themeToggleBtn.addEventListener('click', toggleTheme);
btnLogout.addEventListener('click', logout);
btnAddSibling.addEventListener('click', () => openFormModal(null));
btnResetDb.addEventListener('click', resetDatabase);
modalClose.addEventListener('click', closeFormModal);
adminFormCancel.addEventListener('click', closeFormModal);
adminSiblingForm.addEventListener('submit', saveSiblingProfile);

adminFormModal.addEventListener('click', (e) => {
    if (e.target === adminFormModal) closeFormModal();
});

// Keypress close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminFormModal.classList.contains('open')) {
        closeFormModal();
    }
});

// Initialize on DOM Load
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    checkAuth();
});
