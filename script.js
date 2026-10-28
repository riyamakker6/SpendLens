/* =====================================================
   Spendlens - MAIN JAVASCRIPT & SHARED CORE ENGINE
===================================================== */

/* =====================================================
   API CONFIGURATION
===================================================== */
// Backend base URL (can be adjusted for staging / production)
const API_BASE_URL = "http://localhost:5000";
if (typeof window !== "undefined") {
  window.API_BASE_URL = API_BASE_URL;
}
if (typeof global !== "undefined") {
  global.API_BASE_URL = API_BASE_URL;
}

/* =====================================================
   LOCAL STORAGE KEYS
===================================================== */
const STORAGE = {
  token: "Spendlens_token",
  users: "Spendlens_users",
  currentUser: "Spendlens_current_user",
  subscriptions: "Spendlens_subscriptions",
  theme: "Spendlens_theme",
  budget: "Spendlens_budget",
  snapshots: "Spendlens_snapshots",
  profileImage: "Spendlens_profile_image",
  recommendedPortfolio: "Spendlens_recommended_portfolio",
  // Demo mode keys
  demoMode: "Spendlens_demo_mode",
  demoOrigin: "Spendlens_demo_origin", // "personal-account" | "login"
  demoBudget: "Spendlens_demo_budget",
  demoBannerDismissed: "Spendlens_demo_banner_dismissed",
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
  if (isDemoMode()) {
    return {
      id: DEMO_USER_ID,
      name: "Demo User",
      email: "demo@spendlens.app",
    };
  }
  return getData(STORAGE.currentUser, null);
}

function getAuthenticatedUser() {
  return getData(STORAGE.currentUser, null);
}

function getAuthToken() {
  return localStorage.getItem(STORAGE.token) || null;
}

function setAuthSession(user, token) {
  if (user) {
    saveData(STORAGE.currentUser, user);
  }
  if (token) {
    localStorage.setItem(STORAGE.token, token);
  }
}

function clearAuthSession() {
  localStorage.removeItem(STORAGE.currentUser);
  localStorage.removeItem(STORAGE.token);
  localStorage.removeItem(STORAGE.demoMode);
  localStorage.removeItem(STORAGE.demoOrigin);
}

function isAuthenticated() {
  if (isDemoMode()) {
    return true;
  }
  const user = getAuthenticatedUser();
  const token = getAuthToken();
  return Boolean(user && token);
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
  // If in Demo Mode, guest/preview access is allowed
  if (isDemoMode()) {
    return true;
  }

  // Client-side authentication check for smooth UI routing.
  // NOTE: This client-side check provides a smooth UI redirect only;
  // real security requires verifying the JWT token on backend APIs.
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function logout() {
  // Clear demo state, current user, auth token, and cached subscriptions
  localStorage.removeItem(STORAGE.demoMode);
  localStorage.removeItem(STORAGE.demoOrigin);
  localStorage.removeItem(STORAGE.currentUser);
  localStorage.removeItem(STORAGE.token);
  sessionStorage.removeItem(STORAGE.demoBannerDismissed);
  currentSubscriptionsCache = null;
  currentBudgetCache = null;

  // Reset theme to default light theme after logout
  localStorage.removeItem(STORAGE.theme);
  document.documentElement.setAttribute("data-theme", "light");

  showToast("Logged out successfully");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 400);
}

/* =====================================================
   DEMO MODE MANAGEMENT
===================================================== */

/** The fixed userId used for storing demo subscriptions */
const DEMO_USER_ID = "DEMO_USER";

/** Returns true when Quick Demo mode is currently active */
function isDemoMode() {
  return localStorage.getItem(STORAGE.demoMode) === "true";
}

/**
 * Seeds the demo subscription dataset (idempotent — only writes if not present).
 * Always uses DEMO_USER_ID so it never touches the real user's data.
 */
function seedDemoSubscriptions() {
  const all = getData(STORAGE.subscriptions, []);
  const withoutDemo = all.filter((s) => s.userId !== DEMO_USER_ID);

  const today = new Date();
  const dPlus = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const demoSubs = [
    { id: "demo_sub_1", userId: DEMO_USER_ID, name: "Netflix", category: "Entertainment", cost: 649, billingCycle: "Monthly", monthlyCost: 649, renewalDate: dPlus(1), status: "Active", paymentMethod: "Credit Card", priority: "High Priority", notes: "Premium 4K plan" },
    { id: "demo_sub_2", userId: DEMO_USER_ID, name: "Disney+ Hotstar", category: "Entertainment", cost: 299, billingCycle: "Monthly", monthlyCost: 299, renewalDate: dPlus(8), status: "Active", paymentMethod: "Credit Card", priority: "Medium Priority", notes: "Streaming overlap" },
    { id: "demo_sub_3", userId: DEMO_USER_ID, name: "Amazon Prime", category: "Entertainment", cost: 1499, billingCycle: "Yearly", monthlyCost: 124.92, renewalDate: dPlus(25), status: "Active", paymentMethod: "UPI", priority: "High Priority", notes: "Prime video & delivery" },
    { id: "demo_sub_4", userId: DEMO_USER_ID, name: "Spotify", category: "Music", cost: 119, billingCycle: "Monthly", monthlyCost: 119, renewalDate: dPlus(4), status: "Active", paymentMethod: "UPI", priority: "High Priority", notes: "Individual plan" },
    { id: "demo_sub_5", userId: DEMO_USER_ID, name: "YouTube Premium", category: "Music", cost: 129, billingCycle: "Monthly", monthlyCost: 129, renewalDate: dPlus(14), status: "Active", paymentMethod: "UPI", priority: "Medium Priority", notes: "Ad-free & Music" },
    { id: "demo_sub_6", userId: DEMO_USER_ID, name: "Canva Pro", category: "Productivity", cost: 500, billingCycle: "Monthly", monthlyCost: 500, renewalDate: dPlus(18), status: "Active", paymentMethod: "Debit Card", priority: "Essential", notes: "Design assets" },
    { id: "demo_sub_7", userId: DEMO_USER_ID, name: "Google One 100GB", category: "Cloud Storage", cost: 130, billingCycle: "Monthly", monthlyCost: 130, renewalDate: dPlus(22), status: "Active", paymentMethod: "Credit Card", priority: "Essential", notes: "Cloud backups" },
  ];

  saveData(STORAGE.subscriptions, [...withoutDemo, ...demoSubs]);
  localStorage.setItem(STORAGE.demoBudget, "2000");
}

/**
 * Activates demo mode.
 * @param {"personal-account" | "login"} [origin] - Where demo mode was launched from.
 *   If not supplied, automatically infers from whether an authenticated user exists.
 */
function enterDemoMode(origin) {
  seedDemoSubscriptions();
  localStorage.setItem(STORAGE.demoMode, "true");
  currentSubscriptionsCache = null;
  currentBudgetCache = null;

  if (!origin) {
    const realUser = getAuthenticatedUser();
    origin = realUser ? "personal-account" : "login";
  }
  localStorage.setItem(STORAGE.demoOrigin, origin);
  sessionStorage.removeItem(STORAGE.demoBannerDismissed);
}

/**
 * Deactivates demo mode.
 * - If launched from an authenticated personal account: restores the personal session without logging out.
 * - If launched from the login page: clears the session and returns to a clean login page.
 * @param {Function | boolean} [onExitOrRedirect=true] - Callback function receiving restoredUser (or null), or boolean to auto-redirect/reload.
 */
function exitDemoMode(onExitOrRedirect = true) {
  const origin = localStorage.getItem(STORAGE.demoOrigin) || "login";
  const realUser = getAuthenticatedUser();

  localStorage.removeItem(STORAGE.demoMode);
  localStorage.removeItem(STORAGE.demoOrigin);
  sessionStorage.removeItem(STORAGE.demoBannerDismissed);
  currentSubscriptionsCache = null;
  currentBudgetCache = null;

  if (origin === "personal-account" && realUser) {
    // CASE 2: User was already logged in to their personal account.
    // Preserve their real authenticated session!
    if (typeof onExitOrRedirect === "function") {
      onExitOrRedirect(realUser);
    } else if (onExitOrRedirect) {
      const currentPage = (window.location.pathname.split("/").pop() || "dashboard.html").toLowerCase();
      if (currentPage === "login.html" || currentPage === "") {
        window.location.href = "dashboard.html";
      } else {
        window.location.reload();
      }
    }
  } else {
    // CASE 1: User entered demo from login page without an authenticated account.
    // Clear any user session and return to a clean login page.
    localStorage.removeItem(STORAGE.currentUser);
    localStorage.removeItem(STORAGE.token);
    if (typeof onExitOrRedirect === "function") {
      onExitOrRedirect(null);
    } else if (onExitOrRedirect) {
      window.location.href = "login.html";
    }
  }
}

/** Returns demo subscriptions (DEMO_USER_ID entries from storage) */
function getDemoSubscriptions() {
  return getData(STORAGE.subscriptions, []).filter(
    (s) => s.userId === DEMO_USER_ID
  );
}

if (typeof window !== "undefined") {
  window.isDemoMode = isDemoMode;
  window.enterDemoMode = enterDemoMode;
  window.exitDemoMode = exitDemoMode;
}
if (typeof global !== "undefined") {
  global.isDemoMode = isDemoMode;
  global.enterDemoMode = enterDemoMode;
  global.exitDemoMode = exitDemoMode;
}

/* =====================================================
   BACKEND SUBSCRIPTION API CLIENT & RETRIEVAL
===================================================== */
// In-memory cache of subscriptions for the current user session
let currentSubscriptionsCache = null;

/**
 * Loads subscriptions from the backend API (or demo storage in demo mode).
 * Caches results in memory so synchronous helper calculations work smoothly.
 */
async function fetchUserSubscriptions(forceRefresh = false) {
  if (isDemoMode()) {
    currentSubscriptionsCache = getDemoSubscriptions().map((s) => ({
      ...s,
      _id: s.id,
    }));
    return currentSubscriptionsCache;
  }

  const token = getAuthToken();
  if (!token) {
    currentSubscriptionsCache = [];
    return [];
  }

  if (currentSubscriptionsCache !== null && !forceRefresh) {
    return currentSubscriptionsCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid
      logout();
      return [];
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to load subscriptions from server");
    }

    const data = await response.json();
    const subsArray = Array.isArray(data) ? data : data.subscriptions || [];

    // Ensure each subscription has both `id` and `_id` mapped identically
    currentSubscriptionsCache = subsArray.map((s) => ({
      ...s,
      id: s._id || s.id,
      monthlyCost: Number(s.monthlyCost !== undefined ? s.monthlyCost : s.cost),
    }));

    return currentSubscriptionsCache;
  } catch (err) {
    console.error("fetchUserSubscriptions error:", err);
    throw err;
  }
}

/**
 * Returns currently loaded subscriptions (synchronous getter).
 * Used by existing helpers like getMonthlyTotal(), detectOverlaps(), etc.
 */
function getUserSubscriptions() {
  if (isDemoMode()) {
    return getDemoSubscriptions().map((s) => ({
      ...s,
      _id: s.id,
    }));
  }
  return currentSubscriptionsCache || [];
}

/**
 * Legacy compatibility stub: no longer authoritative in localStorage.
 * For demo mode, updates localStorage; for real users, logs warning.
 */
function saveUserSubscriptions(userSubscriptions) {
  if (isDemoMode()) {
    const all = getData(STORAGE.subscriptions, []);
    const withoutDemo = all.filter((s) => s.userId !== DEMO_USER_ID);
    saveData(STORAGE.subscriptions, [...withoutDemo, ...userSubscriptions]);
  }
}

/**
 * Creates a new subscription via POST /api/subscriptions
 */
async function createSubscriptionAPI(subData) {
  if (isDemoMode()) {
    throw new Error("Creating subscriptions is disabled in Demo Mode");
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create subscription");
  }

  const newSub = {
    ...data,
    id: data._id || data.id,
    monthlyCost: Number(data.monthlyCost !== undefined ? data.monthlyCost : data.cost),
  };

  if (currentSubscriptionsCache) {
    currentSubscriptionsCache.unshift(newSub);
  }

  return newSub;
}

/**
 * Updates an existing subscription via PUT /api/subscriptions/:id
 */
async function updateSubscriptionAPI(id, subData) {
  if (isDemoMode()) {
    throw new Error("Updating subscriptions is disabled in Demo Mode");
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const response = await fetch(`${API_BASE_URL}/api/subscriptions/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update subscription");
  }

  const updatedSub = {
    ...data,
    id: data._id || data.id,
    monthlyCost: Number(data.monthlyCost !== undefined ? data.monthlyCost : data.cost),
  };

  if (currentSubscriptionsCache) {
    currentSubscriptionsCache = currentSubscriptionsCache.map((s) =>
      (s._id === id || s.id === id ? updatedSub : s)
    );
  }

  return updatedSub;
}

/**
 * Deletes a subscription via DELETE /api/subscriptions/:id
 */
async function deleteSubscriptionAPI(id) {
  if (isDemoMode()) {
    throw new Error("Deleting subscriptions is disabled in Demo Mode");
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const response = await fetch(`${API_BASE_URL}/api/subscriptions/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete subscription");
  }

  if (currentSubscriptionsCache) {
    currentSubscriptionsCache = currentSubscriptionsCache.filter(
      (s) => s._id !== id && s.id !== id
    );
  }

  return data;
}

/**
 * Gets a single subscription by ID via GET /api/subscriptions/:id
 */
async function getSubscriptionByIdAPI(id) {
  if (isDemoMode()) {
    const demo = getDemoSubscriptions().find((s) => s.id === id || s._id === id);
    if (!demo) throw new Error("Subscription not found");
    return { ...demo, _id: demo.id };
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const response = await fetch(`${API_BASE_URL}/api/subscriptions/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch subscription");
  }

  return {
    ...data,
    id: data._id || data.id,
    monthlyCost: Number(data.monthlyCost !== undefined ? data.monthlyCost : data.cost),
  };
}

/* =====================================================
   BACKEND BUDGET API CLIENT & RETRIEVAL (Phase 5D)
===================================================== */
// In-memory cache of the monthly budget for the current session
let currentBudgetCache = null;

/**
 * Loads the user's monthly budget from MongoDB Atlas (or demo storage in demo mode).
 * Returns the numeric budget amount.
 * Does NOT fall back to stale localStorage for authenticated users.
 */
async function fetchUserBudget(forceRefresh = false) {
  if (isDemoMode()) {
    const demoBudget = Number(localStorage.getItem(STORAGE.demoBudget) || 2000);
    currentBudgetCache = demoBudget;
    return currentBudgetCache;
  }

  const token = getAuthToken();
  if (!token) {
    currentBudgetCache = 0;
    return 0;
  }

  if (currentBudgetCache !== null && !forceRefresh) {
    return currentBudgetCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/budget`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      logout();
      return 0;
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to load budget from server");
    }

    const data = await response.json();
    currentBudgetCache = Number(data.amount !== undefined ? data.amount : 0);
    return currentBudgetCache;
  } catch (err) {
    console.error("fetchUserBudget error:", err);
    throw err;
  }
}

/**
 * Returns currently loaded budget (synchronous getter).
 * Returns 0 if not loaded yet or if not set.
 */
function getUserBudget() {
  if (isDemoMode()) {
    return Number(localStorage.getItem(STORAGE.demoBudget) || 2000);
  }
  return currentBudgetCache !== null ? currentBudgetCache : 0;
}

/**
 * Creates or updates the user's monthly budget via PUT /api/budget.
 * In demo mode, updates the demo budget in localStorage without touching Atlas.
 * For real authenticated users, updates Atlas via the backend and updates the cache.
 */
async function updateUserBudgetAPI(newAmount) {
  const numericAmount = Number(newAmount);
  if (isNaN(numericAmount) || !isFinite(numericAmount) || numericAmount < 0) {
    throw new Error("Budget amount must be a finite, non-negative number");
  }

  if (isDemoMode()) {
    localStorage.setItem(STORAGE.demoBudget, String(numericAmount));
    currentBudgetCache = numericAmount;
    return { amount: numericAmount };
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const response = await fetch(`${API_BASE_URL}/api/budget`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount: numericAmount }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update budget on server");
  }

  currentBudgetCache = Number(data.amount !== undefined ? data.amount : numericAmount);
  return data;
}

if (typeof window !== "undefined") {
  window.fetchUserBudget = fetchUserBudget;
  window.getUserBudget = getUserBudget;
  window.updateUserBudgetAPI = updateUserBudgetAPI;
}
if (typeof global !== "undefined") {
  global.fetchUserBudget = fetchUserBudget;
  global.getUserBudget = getUserBudget;
  global.updateUserBudgetAPI = updateUserBudgetAPI;
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
  if (authButton && isAuthenticated()) {
    authButton.textContent = "Dashboard";
    authButton.href = "dashboard.html";
  }
}

/* =====================================================
   HOME PAGE STATISTICS
==================================================== */
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
   DEMO MODE BANNER & UI — shared across all app pages
===================================================== */

/**
 * Injects dismissible info banner and sidebar "Demo Account" badge
 * when Demo Mode is active.
 */
function initDemoBanner() {
  if (!isDemoMode()) return;

  // --- 1. Dismissible info banner with Exit Demo button ---
  const dismissed = sessionStorage.getItem(STORAGE.demoBannerDismissed);
  if (!dismissed && !document.getElementById("demoBanner")) {
    const main = document.querySelector(".main-content") || document.querySelector("main");
    if (main) {
      const banner = document.createElement("div");
      banner.id = "demoBanner";
      banner.className = "demo-banner";
      banner.innerHTML = `
        <span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px;margin-right:6px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <strong>Demo Mode active</strong> — you are viewing sample data.
        </span>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="btn btn-sm btn-demo-active" style="padding:3px 10px;font-size:0.75rem;border-radius:999px;cursor:pointer;" onclick="exitDemoMode(true)">Exit Demo</button>
          <button class="demo-banner-close" aria-label="Dismiss banner" onclick="(function(el){sessionStorage.setItem('${STORAGE.demoBannerDismissed}','1');el.closest('.demo-banner').style.display='none';})(this)">×</button>
        </div>
      `;
      main.insertBefore(banner, main.firstChild);
    }
  }

  // --- 2. Sidebar "Demo Account" label ---
  const sidebarBottom = document.querySelector(".sidebar-bottom");
  if (sidebarBottom && !document.getElementById("sidebarDemoLabel")) {
    const label = document.createElement("div");
    label.id = "sidebarDemoLabel";
    label.className = "sidebar-demo-label";
    label.style.cursor = "pointer";
    label.title = "Click to Exit Demo";
    label.onclick = () => exitDemoMode(true);
    label.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>
      Demo Mode &bull; Exit &rarr;
    `;
    sidebarBottom.appendChild(label);
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
