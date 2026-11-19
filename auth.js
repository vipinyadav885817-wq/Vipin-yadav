const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");
const passwordInput = document.getElementById("registerPassword");
const strengthMeter = document.getElementById("strengthMeter");
const strengthText = document.getElementById("strengthText");

const USERS_KEY = "cybershieldUsers";
const CURRENT_USER_KEY = "cybershieldCurrentUser";

function showMessage(text, type) {
    message.textContent = text;
    message.classList.toggle("error", type === "error");
}

function getStorageValue(storage, key) {
    try {
        return storage.getItem(key);
    } catch (error) {
        console.error("Could not read browser storage.", error);
        throw new Error("Browser storage is unavailable. Enable site storage and try again.");
    }
}

function setStorageValue(storage, key, value) {
    try {
        storage.setItem(key, value);
    } catch (error) {
        console.error("Could not save browser storage.", error);
        throw new Error("Could not save your account in this browser. Check available storage and try again.");
    }
}

function getUsers() {
    const savedUsers = getStorageValue(localStorage, USERS_KEY);
    if (!savedUsers) return [];

    try {
        const users = JSON.parse(savedUsers);
        if (!Array.isArray(users)) throw new Error("Stored accounts were not a list.");
        return users.filter(function(user) {
            return user && typeof user.email === "string" && typeof user.password === "string";
        });
    } catch (error) {
        console.error("Could not parse saved accounts.", error);
        throw new Error("Saved account data is damaged. Clear this site's browser data and register again.");
    }
}

function saveUsers(users) {
    setStorageValue(localStorage, USERS_KEY, JSON.stringify(users));
}

function getSavedUser() {
    const saved = getStorageValue(localStorage, CURRENT_USER_KEY) || getStorageValue(sessionStorage, CURRENT_USER_KEY);
    if (!saved) return null;
    try {
        const user = JSON.parse(saved);
        return user && typeof user.email === "string" ? user : null;
    } catch (error) {
        console.error("Could not parse saved session.", error);
        return null;
    }
}

function setCurrentUser(user) {
    const remember = document.getElementById("rememberMe").checked;
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;
    setStorageValue(storage, CURRENT_USER_KEY, JSON.stringify(user));
    try {
        otherStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
        console.error("Could not clear previous browser session.", error);
    }
}

function switchForm(showRegister) {
    loginForm.hidden = showRegister;
    registerForm.hidden = !showRegister;
    loginTab.classList.toggle("active", !showRegister);
    registerTab.classList.toggle("active", showRegister);
    loginTab.setAttribute("aria-selected", String(!showRegister));
    registerTab.setAttribute("aria-selected", String(showRegister));
    document.getElementById("authTitle").textContent = showRegister ? "Create your account" : "Welcome back";
    document.querySelector(".auth-subtitle").textContent = showRegister
        ? "Your learning journey starts here."
        : "Pick up your learning journey.";
    showMessage("", "");
}

loginTab.addEventListener("click", function() {
    switchForm(false);
});

registerTab.addEventListener("click", function() {
    switchForm(true);
});

document.querySelectorAll("[data-toggle-password]").forEach(function(button) {
    button.addEventListener("click", function() {
        const input = document.getElementById(button.dataset.togglePassword);
        const showPassword = input.type === "password";
        input.type = showPassword ? "text" : "password";
        button.textContent = showPassword ? "Hide" : "Show";
        button.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
    });
});

document.getElementById("forgotPassword").addEventListener("click", function() {
    showMessage("Password reset needs verified email delivery, which this browser-only demo does not provide. Use a demo account you can access, and never reuse a real password.", "");
});

function updatePasswordStrength() {
    const password = passwordInput.value;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const strength = password.length === 0 ? 0 : Math.min(score, 4);
    const labels = ["Use at least 8 characters. Avoid reusing a real password.", "Weak password", "Fair password", "Good password", "Strong password"];
    const colors = ["transparent", "#ff8787", "#f7bd65", "#b6dc75", "#58e0b7"];
    strengthMeter.style.width = `${strength * 25}%`;
    strengthMeter.style.backgroundColor = colors[strength];
    strengthText.textContent = labels[strength];
}

passwordInput.addEventListener("input", updatePasswordStrength);

registerForm.addEventListener("submit", function(event) {
    event.preventDefault();
    showMessage("", "");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!name || !email || !password) {
        showMessage("Please complete all fields.", "error");
        return;
    }
    if (password.length < 8) {
        showMessage("Choose a password with at least 8 characters.", "error");
        return;
    }

    try {
        const users = getUsers();
        if (users.some(function(user) { return user.email.toLowerCase() === email; })) {
            switchForm(false);
            document.getElementById("loginEmail").value = email;
            showMessage("That email already has a demo account. Sign in instead.", "error");
            return;
        }

        const user = { name, email, password };
        saveUsers(users.concat(user));
        setCurrentUser({ name, email });
        window.location.href = "dashboard.html";
    } catch (error) {
        showMessage(error.message || "Could not create your account. Please try again.", "error");
    }
});

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
    showMessage("", "");

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    try {
        const user = getUsers().find(function(account) {
            return account.email.toLowerCase() === email && account.password === password;
        });

        if (!user) {
            showMessage("Email or password doesn't match a demo account in this browser.", "error");
            return;
        }

        setCurrentUser({ name: user.name || "Learner", email: user.email });
        window.location.href = "dashboard.html";
    } catch (error) {
        showMessage(error.message || "Could not sign in. Please try again.", "error");
    }
});

try {
    if (getSavedUser()) window.location.replace("dashboard.html");
} catch (error) {
    showMessage(error.message, "error");
}
