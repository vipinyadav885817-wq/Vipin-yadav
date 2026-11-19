const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");
const resetProgressButton = document.getElementById("resetProgress");
const courseList = document.getElementById("dashboardCourses");
const dashboardMessage = document.getElementById("dashboardMessage");

const CURRENT_USER_KEY = "cybershieldCurrentUser";
const courses = [
    { id: "networking", title: "Networking Essentials", category: "FOUNDATION", description: "Understand how devices communicate and build a strong networking foundation.", lessons: [
        { title: "What is a network?", content: "A network is a group of connected devices that exchange information. Your home Wi-Fi is a local network; the internet links many networks together." },
        { title: "Devices and connections", content: "Routers direct traffic between networks, while switches connect devices inside a local network. Wi-Fi and Ethernet are two common ways a device joins one." },
        { title: "IP addresses in everyday terms", content: "An IP address helps identify where network traffic should go. Devices may have a private address inside a home network and use a shared public address to reach the internet." },
        { title: "Ports and protocols", content: "Protocols are agreed rules for communication. A port helps a device direct incoming information to the right service; HTTPS commonly uses port 443." },
        { title: "How the web connects", content: "A browser looks up a site's domain, connects to a server, and requests a page using HTTP or HTTPS. HTTPS encrypts the connection between the browser and the site." },
        { title: "Networking recap", content: "Think about a message moving from your laptop, through a router, and to a website. Which devices and addressing concepts help it reach the right destination?" }
    ] },
    { id: "linux", title: "Linux Fundamentals", category: "FOUNDATION", description: "Get comfortable with the terminal, files, permissions, and Linux concepts.", lessons: [
        { title: "Meet the command line", content: "A terminal lets you interact with a computer by entering text commands. Start by observing where you are with `pwd`, then list nearby files with `ls`." },
        { title: "Navigate files and folders", content: "Folders organize files into a tree. Use `cd` to move between folders and `mkdir` to create a practice folder in a location you own." },
        { title: "Read and organize files", content: "Use `cat` to display a small text file and `cp` to make a copy. Check a command's manual with `man` before using unfamiliar options." },
        { title: "Users and permissions", content: "Linux permissions define who can read, change, or run a file. Inspect permissions with `ls -l`; change only files you own or are authorized to manage." },
        { title: "Linux recap", content: "Practice in a temporary folder: create a text file, list it, read it, and remove only that file when you are done. Build confidence before changing system files." }
    ] },
    { id: "security", title: "Security Foundations", category: "SECURITY", description: "Learn core security principles, common risks, and safer online decisions.", lessons: [
        { title: "The security mindset", content: "Security is about reducing risk, not promising that risk is zero. Notice what you want to protect, what could go wrong, and which practical safeguard would help." },
        { title: "Confidentiality, integrity, availability", content: "Confidentiality limits information to the right people; integrity helps keep it accurate; availability means it can be used when needed. Together these goals guide many security decisions." },
        { title: "Identity and access basics", content: "Use unique passwords, a password manager, and multi-factor authentication where available. Give each person or service only the access it needs." },
        { title: "Updates and backups", content: "Updates fix defects and security issues, while backups help recover from mistakes or device loss. Keep important backups separate from the device they protect and test that they can be restored." },
        { title: "Everyday risk awareness", content: "Pause before sharing personal information or approving unexpected sign-in requests. Verify unusual requests through a trusted channel you find independently." },
        { title: "Security recap", content: "Choose one account you use and identify one small improvement: a unique password, multi-factor authentication, or an up-to-date recovery method." }
    ] },
    { id: "web-safety", title: "Web Safety Basics", category: "SECURITY", description: "Explore how websites work and how to protect accounts and data responsibly.", lessons: [
        { title: "How a browser reaches a site", content: "A browser uses a domain name to find a server, then requests the page and its resources. The address bar helps you confirm which site you are visiting." },
        { title: "HTTPS and secure connections", content: "HTTPS encrypts information in transit and helps verify the site endpoint. It does not prove that a website is honest, so check the domain and context too." },
        { title: "Safer account habits", content: "Use unique passwords and a trusted password manager. Enable multi-factor authentication and keep account recovery details current." },
        { title: "Safer browsing", content: "Avoid installing unexpected downloads or browser extensions. Review permissions and use official sources when you need an app or update." },
        { title: "Web safety recap", content: "Before entering sensitive information, check the domain, connection, and reason for the request. If anything seems unusual, stop and verify independently." }
    ] },
    { id: "threat-awareness", title: "Threat Awareness", category: "PRACTICE", description: "Recognize suspicious messages and practice safer habits in daily life.", lessons: [
        { title: "Spotting suspicious messages", content: "Unexpected urgency, unfamiliar senders, odd requests, or mismatched links can be warning signs. One sign alone may not prove a message is malicious, so verify before acting." },
        { title: "Links and attachments", content: "Do not open an unexpected attachment just to see what it is. Check the full destination carefully and visit important services using a saved bookmark or known address." },
        { title: "Social engineering signals", content: "A message may pressure you to reveal information, send money, or bypass a normal process. Contact the person or organization through a trusted channel to confirm." },
        { title: "What to do when something feels wrong", content: "Stop interacting, report the message using your organization's process, and change affected credentials from the official site if needed. Ask a trusted support contact for help." }
    ] },
    { id: "ethical-practice", title: "Ethical Security Practice", category: "PRACTICE", description: "Understand permission, safe boundaries, and responsible security learning.", lessons: [
        { title: "Permission and scope", content: "Only assess systems you own or have explicit written permission to test. Permission should define the systems, allowed activities, timing, and a contact for concerns." },
        { title: "Safe practice environments", content: "Use purpose-built training exercises, local virtual machines, or platforms that explicitly authorize practice. Keep experiments isolated from real accounts, networks, and data." },
        { title: "Responsible reporting", content: "If you discover a concern, avoid accessing or changing data. Record only the minimum details needed and follow the owner's published reporting process." },
        { title: "Keep learning ethically", content: "Technical curiosity works best with clear boundaries. Before any exercise, ask: do I own this system, or do I have explicit permission for this exact activity?" },
        { title: "Ethics recap", content: "Write down the scope of a practice lab and one action that would be outside it. Respecting that boundary is part of the skill, not an optional extra." }
    ] }
];

function readStorage(storage, key) {
    try {
        return storage.getItem(key);
    } catch (error) {
        console.error("Could not read browser storage.", error);
        throw new Error("Browser storage is unavailable. Enable site storage to use your dashboard.");
    }
}

function getUser() {
    const saved = readStorage(localStorage, CURRENT_USER_KEY) || readStorage(sessionStorage, CURRENT_USER_KEY);
    if (!saved) return null;
    try {
        const user = JSON.parse(saved);
        return user && typeof user.email === "string" ? user : null;
    } catch (error) {
        console.error("Could not parse saved account.", error);
        return null;
    }
}

let currentUser;
let progressKey;
let completedLessons = {};

try {
    currentUser = getUser();
} catch (error) {
    dashboardMessage.textContent = error.message;
    dashboardMessage.classList.add("error");
}

if (!currentUser) {
    window.location.replace("auth.html");
} else {
    progressKey = `cybershieldProgress_${encodeURIComponent(currentUser.email.toLowerCase())}`;
    welcomeText.textContent = `Welcome, ${currentUser.name || "Learner"}.`;
    renderDashboard();
}

function loadProgress() {
    const savedProgress = readStorage(localStorage, progressKey);
    if (!savedProgress) return {};
    try {
        const parsedProgress = JSON.parse(savedProgress);
        return parsedProgress && typeof parsedProgress === "object" && !Array.isArray(parsedProgress)
            ? parsedProgress
            : {};
    } catch (error) {
        console.error("Could not parse saved learning progress.", error);
        dashboardMessage.textContent = "Saved progress could not be read. You can reset it and start tracking again.";
        dashboardMessage.classList.add("error");
        return {};
    }
}

function renderDashboard() {
    completedLessons = loadProgress();
    courseList.replaceChildren();

    courses.forEach(function(course) {
        const card = document.createElement("article");
        card.className = "dashboard-course";

        const header = document.createElement("div");
        header.className = "dashboard-course-head";
        const headingGroup = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = course.title;
        const description = document.createElement("p");
        description.textContent = course.description;
        headingGroup.append(title, description);
        const category = document.createElement("span");
        category.className = "course-count";
        category.textContent = course.category;
        header.append(headingGroup, category);

        const doneCount = course.lessons.filter(function(lesson, index) {
            return Boolean(completedLessons[`${course.id}-${index}`]);
        }).length;
        const progressBar = document.createElement("div");
        progressBar.className = "dashboard-progress";
        progressBar.setAttribute("role", "progressbar");
        progressBar.setAttribute("aria-label", `${course.title} progress`);
        progressBar.setAttribute("aria-valuemin", "0");
        progressBar.setAttribute("aria-valuemax", String(course.lessons.length));
        progressBar.setAttribute("aria-valuenow", String(doneCount));
        const progressFill = document.createElement("span");
        progressFill.style.width = `${Math.round(doneCount / course.lessons.length * 100)}%`;
        progressBar.append(progressFill);

        const countLabel = document.createElement("span");
        countLabel.className = "course-count";
        countLabel.textContent = `${doneCount} of ${course.lessons.length} lessons complete`;

        const lessonList = document.createElement("ul");
        lessonList.className = "lesson-list";
        course.lessons.forEach(function(lesson, index) {
            const lessonId = `${course.id}-${index}`;
            const item = document.createElement("li");
            item.className = "lesson-item";
            const lessonHeader = document.createElement("div");
            lessonHeader.className = "lesson-header";
            const expandButton = document.createElement("button");
            expandButton.className = "lesson-expand";
            expandButton.type = "button";
            expandButton.textContent = lesson.title;
            expandButton.setAttribute("aria-expanded", "false");
            const lessonContent = document.createElement("p");
            lessonContent.className = "lesson-content";
            lessonContent.textContent = lesson.content;
            lessonContent.hidden = true;
            expandButton.addEventListener("click", function() {
                lessonContent.hidden = !lessonContent.hidden;
                expandButton.setAttribute("aria-expanded", String(!lessonContent.hidden));
            });
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `lesson-${lessonId}`;
            checkbox.checked = Boolean(completedLessons[lessonId]);
            checkbox.dataset.lessonId = lessonId;
            checkbox.dataset.courseId = course.id;
            const label = document.createElement("label");
            label.htmlFor = checkbox.id;
            label.textContent = "Done";
            lessonHeader.append(expandButton, checkbox, label);
            item.append(lessonHeader, lessonContent);
            lessonList.append(item);
        });

        card.append(header, progressBar, countLabel, lessonList);
        courseList.append(card);
    });

    courseList.querySelectorAll("input[type=checkbox]").forEach(function(checkbox) {
        checkbox.addEventListener("change", function() {
            completedLessons[checkbox.dataset.lessonId] = checkbox.checked;
            saveProgress();
            renderDashboard();
        });
    });

    updateStats();
}

function saveProgress() {
    try {
        localStorage.setItem(progressKey, JSON.stringify(completedLessons));
        dashboardMessage.textContent = "";
        dashboardMessage.classList.remove("error");
    } catch (error) {
        console.error("Could not save learning progress.", error);
        dashboardMessage.textContent = "Progress could not be saved in this browser. Check storage availability.";
        dashboardMessage.classList.add("error");
    }
}

function updateStats() {
    const completedCount = Object.values(completedLessons).filter(Boolean).length;
    const totalLessons = courses.reduce(function(total, course) {
        return total + course.lessons.length;
    }, 0);
    const startedCount = courses.filter(function(course) {
        return course.lessons.some(function(lesson, index) {
            return Boolean(completedLessons[`${course.id}-${index}`]);
        });
    }).length;

    document.getElementById("pathsStarted").textContent = String(startedCount);
    document.getElementById("lessonsCompleted").textContent = String(completedCount);
    document.getElementById("overallProgress").textContent = `${Math.round(completedCount / totalLessons * 100)}%`;
}

resetProgressButton.addEventListener("click", function() {
    if (!window.confirm("Reset all lesson progress for this account on this browser?")) return;
    completedLessons = {};
    saveProgress();
    renderDashboard();
});

logoutBtn.addEventListener("click", function() {
    try {
        localStorage.removeItem(CURRENT_USER_KEY);
        sessionStorage.removeItem(CURRENT_USER_KEY);
        window.location.href = "auth.html";
    } catch (error) {
        console.error("Could not clear the current session.", error);
        dashboardMessage.textContent = "Could not sign out because browser storage is unavailable. Close this tab to end a temporary session.";
        dashboardMessage.classList.add("error");
    }
});
