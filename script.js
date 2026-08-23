/* =====================================================
   Spendlens - MAIN JAVASCRIPT & SHARED CORE ENGINE
===================================================== */

/* =====================================================
   LOCAL STORAGE KEYS
===================================================== */
const STORAGE = {
  users: "Spendlens_users",
  currentUser: "Spendlens_current_user",
  subscriptions: "Spendlens_subscriptions",
  theme: "Spendlens_theme",
  budget: "Spendlens_budget",
  snapshots: "Spendlens_snapshots",
  profileImage: "Spendlens_profile_image",
  recommendedPortfolio: "Spendlens_recommended_portfolio",
};
if (typeof window !== "undefined") {
  window.STORAGE = STORAGE;
}
if (typeof global !== "undefined") {
  global.STORAGE = STORAGE;
}

/* =====================================================
   BASIC HELPERS & UTILITIES
===================================================== */
function getData(key, defaultValue) {
  const data = localStorage.getItem(key);
  if (data === null || data === undefined) {
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    const parts = String(dateString).split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/* =====================================================
   CURRENT USER & AUTHENTICATION
===================================================== */
function getCurrentUser() {
  return getData(STORAGE.currentUser, null);
}

function getUsers() {
  return getData(STORAGE.users, []);
}

function setCurrentUser(user) {
  saveData(STORAGE.currentUser, user);
}

function saveUsers(users) {
  saveData(STORAGE.users, users);
}

function requireLogin() {
  let user = getCurrentUser();
  if (!user) {
    const users = getUsers();
    if (users && users.length > 0) {
      // User exists in system, set current or redirect
      window.location.href = "login.html";
      return false;
    } else {
      // First time visitor / seed default demo account
      const defaultUser = {
        id: "user_demo_1",
        name: "Riya Sharma",
        email: "riya@Spendlens.app",
        password: "password123",
        createdAt: new Date().toISOString(),
      };
      saveUsers([defaultUser]);
      setCurrentUser(defaultUser);
      user = defaultUser;
    }
  }
  return true;
}

function logout() {
  localStorage.removeItem(STORAGE.currentUser);

  localStorage.removeItem(STORAGE.theme);
  document.documentElement.setAttribute("data-theme", "light");

  showToast("Logged out successfully");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

/* =====================================================
   SUBSCRIPTION DATA RETRIEVAL & STORAGE
===================================================== */
function getAllSubscriptions() {
  return getData(STORAGE.subscriptions, []);
}

function getUserSubscriptions() {
  const user = getCurrentUser();
  if (!user) {
    return [];
  }
  const all = getAllSubscriptions();
  return all.filter((subscription) => subscription.userId === user.id);
}

function saveUserSubscriptions(userSubscriptions) {
  const user = getCurrentUser();
  if (!user) return;

  const all = getAllSubscriptions();
  const otherUsers = all.filter(
    (subscription) => subscription.userId !== user.id,
  );

  // Normalize monthly costs before saving
  const normalized = userSubscriptions.map((sub) => {
    const cost =
      Number(sub.cost !== undefined ? sub.cost : sub.monthlyCost) || 0;
    const monthlyCost =
      Number(sub.monthlyCost) || calculateMonthlyCost(cost, sub.billingCycle);
    return {
      ...sub,
      userId: user.id,
      cost,
      monthlyCost: Math.round(monthlyCost * 100) / 100,
    };
  });

  saveData(STORAGE.subscriptions, [...otherUsers, ...normalized]);
}

/* =====================================================
   COST CALCULATIONS
===================================================== */
function calculateMonthlyCost(cost, billingCycle) {
  cost = Number(cost) || 0;
  const cycle = String(billingCycle || "Monthly").toLowerCase();

  switch (cycle) {
    case "weekly":
      return (cost * 52) / 12;
    case "monthly":
      return cost;
    case "quarterly":
      return cost / 3;
    case "yearly":
    case "annual":
      return cost / 12;
    default:
      return cost;
  }
}

function calculateYearlyCost(cost, billingCycle) {
  return calculateMonthlyCost(cost, billingCycle) * 12;
}

function getActiveSubscriptions() {
  return getUserSubscriptions().filter(
    (subscription) =>
      String(subscription.status || "Active").toLowerCase() === "active",
  );
}

function getMonthlyTotal() {
  return getActiveSubscriptions().reduce((total, subscription) => {
    const cost =
      Number(subscription.monthlyCost) ||
      calculateMonthlyCost(subscription.cost, subscription.billingCycle);
    return total + cost;
  }, 0);
}

function getYearlyTotal() {
  return getMonthlyTotal() * 12;
}

/* =====================================================
   CATEGORY GROUPING & OVERLAP DETECTION
===================================================== */
function groupByCategory() {
  const grouped = {};
  getActiveSubscriptions().forEach((subscription) => {
    const category = subscription.category || "Other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(subscription);
  });
  return grouped;
}

function detectOverlaps() {
  const categories = groupByCategory();
  const overlaps = [];

  Object.keys(categories).forEach((category) => {
    const subscriptions = categories[category];
    if (subscriptions.length > 1) {
      const costs = subscriptions.map(
        (s) =>
          Number(s.monthlyCost) || calculateMonthlyCost(s.cost, s.billingCycle),
      );
      const totalMonthly = costs.reduce((sum, c) => sum + c, 0);

      // Potential savings: if user keeps only the primary (most expensive or essential) service, they save the rest
      // Conservatively, potential savings = total - max cost in the category
      const maxCost = Math.max(...costs);
      const minCost = Math.min(...costs);
      const secondarySavingsMonthly = totalMonthly - maxCost;

      overlaps.push({
        category,
        subscriptions,
        count: subscriptions.length,
        monthlyCost: totalMonthly,
        potentialMonthlySavings:
          secondarySavingsMonthly > 0 ? secondarySavingsMonthly : minCost,
        potentialYearlySavings:
          (secondarySavingsMonthly > 0 ? secondarySavingsMonthly : minCost) *
          12,
      });
    }
  });

  return overlaps;
}

function calculatePotentialSavings() {
  const overlaps = detectOverlaps();
  let savings = 0;
  overlaps.forEach((overlap) => {
    savings += overlap.potentialYearlySavings;
  });
  return savings;
}

/* =====================================================
   COST LEAK DETECTOR DIAGNOSTICS
===================================================== */
function detectCostLeaks() {
  const active = getActiveSubscriptions();
  const overlaps = detectOverlaps();
  const duplicateNames = [];
  const highCostOptional = [];

  // Check duplicate services by normalized name
  const nameMap = {};
  active.forEach((sub) => {
    const norm = (sub.name || "").trim().toLowerCase();
    if (!nameMap[norm]) nameMap[norm] = [];
    nameMap[norm].push(sub);
  });

  Object.keys(nameMap).forEach((name) => {
    if (nameMap[name].length > 1) {
      duplicateNames.push({
        name: nameMap[name][0].name,
        subscriptions: nameMap[name],
      });
    }
  });

  // Check high cost optional or low priority services
  active.forEach((sub) => {
    if (
      (sub.priority === "Optional" || sub.priority === "Low Priority") &&
      Number(sub.monthlyCost) >= 500
    ) {
      highCostOptional.push(sub);
    }
  });

  return {
    overlaps,
    duplicateNames,
    highCostOptional,
    totalActiveCost: getMonthlyTotal(),
    potentialYearlySavings: calculatePotentialSavings(),
  };
}

/* =====================================================
   TOAST NOTIFICATION
===================================================== */
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* =====================================================
   THEME MANAGEMENT
===================================================== */
function initializeTheme() {
  const savedTheme = localStorage.getItem(STORAGE.theme) || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const themeButton = document.getElementById("themeToggle");
  if (themeButton) {
    themeButton.textContent = savedTheme === "dark" ? "☀️" : "🌙";
    // Remove old listeners by replacing with clone or single attachment
    themeButton.onclick = toggleTheme;
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const newTheme = current === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem(STORAGE.theme, newTheme);

  const button = document.getElementById("themeToggle");
  if (button) {
    button.textContent = newTheme === "dark" ? "☀️" : "🌙";
  }
}

/* =====================================================
   SIDEBAR & NAVBAR INITIALIZATION
===================================================== */
function initializeSidebar() {
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("open");
    });

    // Close sidebar on click outside (mobile)
    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 900 &&
        sidebar.classList.contains("open") &&
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
      ) {
        sidebar.classList.remove("open");
      }
    });
  }
}

function initializeNavbar() {
  const menuButton = document.getElementById("menuBtn");
  const nav = document.getElementById("navMenu");

  if (menuButton && nav && !document.getElementById("sidebar")) {
    menuButton.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

  const authButton = document.getElementById("authBtn");
  const user = getCurrentUser();
  if (authButton && user) {
    authButton.textContent = "Dashboard";
    authButton.href = "dashboard.html";
  }
}

/* =====================================================
   HOME PAGE STATISTICS
===================================================== */
function renderHomeStatistics() {
  const subscriptions = getAllSubscriptions();
  const users = getUsers();
  const active = subscriptions.filter(
    (s) => String(s.status || "Active").toLowerCase() === "active",
  );

  const categories = {};
  active.forEach((subscription) => {
    const cat = subscription.category || "Other";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(subscription);
  });

  let potentialSavings = 0;
  Object.values(categories).forEach((list) => {
    if (list.length > 1) {
      const costs = list.map(
        (s) =>
          Number(s.monthlyCost) || calculateMonthlyCost(s.cost, s.billingCycle),
      );
      const maxCost = Math.max(...costs);
      const total = costs.reduce((a, b) => a + b, 0);
      potentialSavings += (total - maxCost) * 12;
    }
  });

  const subscriptionElement = document.getElementById("totalSubscriptionsStat");
  const usersElement = document.getElementById("totalUsersStat");
  const savingsElement = document.getElementById("potentialSavingsStat");

  if (subscriptionElement) {
    subscriptionElement.textContent = subscriptions.length;
  }
  if (usersElement) {
    usersElement.textContent = users.length || 1;
  }
  if (savingsElement) {
    savingsElement.textContent = money(
      potentialSavings > 0 ? potentialSavings : 7188,
    );
  }
}

/* =====================================================
   GLOBAL DOM INITIALIZER
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initializeTheme();
  initializeSidebar();
  initializeNavbar();
  renderHomeStatistics();
});
