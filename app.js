/* =========================================================
   DOMA PROMPTS
   Supabase-powered App
   ========================================================= */

/* =========================
   SUPABASE
========================= */

const SUPABASE_URL = "https://gpxatkpwdekurxjhtguc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_onQaVtWk1QkFqpzN_Dzrsw_AoQ6tEBm";

const { createClient } = window.supabase;

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


/* =========================
   STATE
========================= */

let currentUser = null;
let currentSession = null;
let currentPrompt = "";
let currentEditingId = null;
let savedPrompts = [];
let profile = {
  name: "",
  bio: ""
};


/* =========================
   DOM
========================= */

const ideaInput = document.getElementById("idea");
const projectType = document.getElementById("projectType");
const styleInput = document.getElementById("style");
const technologyInput = document.getElementById("technology");
const detailLevel = document.getElementById("detailLevel");

const generateButton = document.getElementById("generateButton");
const clearButton = document.getElementById("clearButton");

const characterCount = document.getElementById("characterCount");

const output = document.getElementById("output");
const outputTitle = document.getElementById("outputTitle");

const copyButton = document.getElementById("copyButton");
const improveButton = document.getElementById("improveButton");
const regenerateButton = document.getElementById("regenerateButton");
const saveButton = document.getElementById("saveButton");

const promptsContainer = document.getElementById("promptsContainer");

const profileName = document.getElementById("profileName");
const profileBio = document.getElementById("profileBio");
const saveProfileButton = document.getElementById("saveProfileButton");

const promptCount = document.getElementById("promptCount");

const accountEmail = document.getElementById("accountEmail");
const logoutButton = document.getElementById("logoutButton");

const toast = document.getElementById("toast");

const titleEditButton = document.getElementById("titleEditButton");


/* =========================
   AUTH DOM
========================= */

const authModal = document.getElementById("authModal");

const authSignInTab = document.getElementById("authSignInTab");
const authSignUpTab = document.getElementById("authSignUpTab");

const authForm = document.getElementById("authForm");

const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authDisplayName = document.getElementById("authDisplayName");

const authSubmitButton = document.getElementById("authSubmitButton");
const authMessage = document.getElementById("authMessage");

let authMode = "signin";


/* =========================
   HELPERS
========================= */

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.__toastTimer);

  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}


function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function getProfileName() {
  return [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ");
}


function setAuthMessage(message, type = "") {
  if (!authMessage) return;

  authMessage.textContent = message;
  authMessage.className = "auth-message";

  if (type) {
    authMessage.classList.add(type);
  }
}


/* =========================
   NAVIGATION
========================= */

function showPage(page) {
  if (!currentUser) return;

  const pages = document.querySelectorAll("[data-page]");

  pages.forEach((element) => {
    element.classList.remove("active");
  });

  const target = document.querySelector(`[data-page="${page}"]`);

  if (target) {
    target.classList.add("active");
  }

  const navButtons = document.querySelectorAll("[data-nav]");

  navButtons.forEach((button) => {
    button.classList.remove("active");

    if (button.dataset.nav === page) {
      button.classList.add("active");
    }
  });

  if (page === "prompts") {
    renderPrompts();
  }

  if (page === "profile") {
    loadProfileIntoUI();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


document.querySelectorAll("[data-nav]").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.nav);
  });
});


document.querySelectorAll("[data-page-link]").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.pageLink);
  });
});


/* =========================
   CHARACTER COUNT
========================= */

function updateCharacterCount() {
  if (!ideaInput || !characterCount) return;

  characterCount.textContent = ideaInput.value.length;
}

if (ideaInput) {
  ideaInput.addEventListener("input", updateCharacterCount);
}


/* =========================
   CLEAR
========================= */

if (clearButton) {
  clearButton.addEventListener("click", () => {
    if (ideaInput) ideaInput.value = "";

    updateCharacterCount();

    if (output) {
      output.textContent = "Your generated prompt will appear here.";
    }

    currentPrompt = "";
    currentEditingId = null;

    if (outputTitle) {
      outputTitle.value = "Untitled Prompt";
    }

    showToast("Cleared");
  });
}


/* =========================
   PROMPT GENERATOR
========================= */

function buildPrompt({
  idea,
  project,
  style,
  technology,
  detail
}) {
  const level = detail || "standard";

  let prompt = `
You are an expert AI assistant specializing in creating high-quality digital products, websites, applications, and software solutions.

Your task is to transform the user's idea into a clear, detailed, professional implementation prompt.

━━━━━━━━━━━━━━━━━━━━
PROJECT IDEA
━━━━━━━━━━━━━━━━━━━━

${idea}

━━━━━━━━━━━━━━━━━━━━
PROJECT TYPE
━━━━━━━━━━━━━━━━━━━━

${project || "Not specified"}

━━━━━━━━━━━━━━━━━━━━
DESIGN DIRECTION
━━━━━━━━━━━━━━━━━━━━

${style || "Modern, clean, professional"}

━━━━━━━━━━━━━━━━━━━━
TECHNOLOGY
━━━━━━━━━━━━━━━━━━━━

${technology || "Choose the most appropriate technology"}

━━━━━━━━━━━━━━━━━━━━
OBJECTIVE
━━━━━━━━━━━━━━━━━━━━

Turn the idea into a polished, functional, production-ready result.

The result should be practical, coherent, modern, responsive, accessible, and easy to understand.
`;


  if (level === "quick") {
    prompt += `

━━━━━━━━━━━━━━━━━━━━
QUICK REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━

- Focus on the core idea.
- Keep the implementation simple.
- Prioritize the most important functionality.
- Avoid unnecessary features.
`;
  }


  if (level === "standard") {
    prompt += `

━━━━━━━━━━━━━━━━━━━━
REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━

- Define the main user experience.
- Explain the important features.
- Create a clear structure.
- Make the interface responsive.
- Keep the design visually consistent.
- Include useful states such as loading, empty, success, and error states.
`;
  }


  if (level === "professional") {
    prompt += `

━━━━━━━━━━━━━━━━━━━━
PROFESSIONAL SPECIFICATION
━━━━━━━━━━━━━━━━━━━━

1. PRODUCT STRUCTURE
Define the complete structure of the product.

2. USER EXPERIENCE
Explain how users navigate and interact with the product.

3. UI DESIGN
Create a polished modern interface with strong hierarchy, spacing, typography, and visual consistency.

4. RESPONSIVE DESIGN
Make the experience work properly across desktop, tablet, and mobile.

5. FUNCTIONALITY
Define all important interactions and behaviors.

6. STATES
Include loading, empty, success, error, disabled, and hover states where appropriate.

7. ACCESSIBILITY
Use semantic structure, readable contrast, keyboard-friendly interactions, and accessible controls.

8. CODE QUALITY
Use clean, maintainable, organized, reusable code.

9. PERFORMANCE
Avoid unnecessary operations and keep the experience fast.

10. EDGE CASES
Consider unusual inputs, missing data, errors, and unexpected user behavior.
`;
  }


  if (level === "maximum") {
    prompt += `

━━━━━━━━━━━━━━━━━━━━
MAXIMUM DETAIL SPECIFICATION
━━━━━━━━━━━━━━━━━━━━

ROLE
Act as a senior product designer, UX engineer, software architect, and frontend engineer.

PRODUCT VISION
Translate the original idea into a complete digital product with a clear purpose and strong user experience.

USER EXPERIENCE
Describe:
- Target users
- Main user journey
- Navigation
- Primary actions
- Secondary actions
- Feedback
- Empty states
- Error states
- Loading states
- Success states

INFORMATION ARCHITECTURE
Define:
- Pages
- Sections
- Components
- Navigation structure
- Content hierarchy

UI SYSTEM
Specify:
- Typography
- Spacing
- Borders
- Radius
- Shadows
- Cards
- Buttons
- Inputs
- Icons
- Responsive behavior
- Visual hierarchy

FUNCTIONAL REQUIREMENTS
Explain every important feature and how it should behave.

TECHNICAL REQUIREMENTS
Use appropriate architecture and clean separation of concerns.

DATA
If data is required, explain:
- Data structure
- Relationships
- Validation
- Loading
- Updating
- Deleting
- Error handling

SECURITY
Consider:
- Authentication
- Authorization
- Input validation
- Safe data handling
- Protection of private user data

ACCESSIBILITY
The product should be usable with:
- Keyboard navigation
- Screen readers
- Clear labels
- Accessible controls
- Sufficient contrast

PERFORMANCE
Optimize:
- Loading
- Rendering
- Network requests
- Assets
- JavaScript execution

EDGE CASES
Think through unexpected situations before implementation.

QUALITY STANDARD
The final result should feel like a polished modern production product rather than a basic prototype.
`;
  }


  prompt += `

━━━━━━━━━━━━━━━━━━━━
FINAL INSTRUCTION
━━━━━━━━━━━━━━━━━━━━

Based on everything above, produce the complete solution.

Do not ignore important requirements from the original idea.

When something is not explicitly specified, make a sensible professional decision instead of adding unnecessary complexity.

Prioritize:
1. Functionality
2. User experience
3. Visual quality
4. Responsiveness
5. Accessibility
6. Maintainability
7. Performance
`;


  return prompt.trim();
}


function createTitle(idea) {
  if (!idea) return "Untitled Prompt";

  const cleaned = idea
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Untitled Prompt";
  }

  return cleaned.length > 55
    ? cleaned.slice(0, 55) + "..."
    : cleaned;
}


/* =========================
   GENERATE
========================= */

async function generatePrompt() {
  if (!ideaInput) return;

  const idea = ideaInput.value.trim();

  if (!idea) {
    showToast("Write your idea first");
    ideaInput.focus();
    return;
  }

  if (generateButton) {
    generateButton.disabled = true;
    generateButton.classList.add("loading");
  }

  if (output) {
    output.textContent = "Generating...";
  }

  await new Promise((resolve) => setTimeout(resolve, 350));

  currentPrompt = buildPrompt({
    idea,
    project: projectType?.value,
    style: styleInput?.value,
    technology: technologyInput?.value,
    detail: detailLevel?.value
  });

  currentEditingId = null;

  if (output) {
    output.textContent = currentPrompt;
  }

  if (outputTitle) {
    outputTitle.value = createTitle(idea);
  }

  if (generateButton) {
    generateButton.disabled = false;
    generateButton.classList.remove("loading");
  }

  showToast("Prompt generated");
}


if (generateButton) {
  generateButton.addEventListener("click", generatePrompt);
}


/* =========================
   COPY
========================= */

async function copyPrompt() {
  if (!currentPrompt) {
    showToast("Generate a prompt first");
    return;
  }

  try {
    await navigator.clipboard.writeText(currentPrompt);
    showToast("Prompt copied");
  } catch (error) {
    console.error(error);
    showToast("Copy failed");
  }
}


if (copyButton) {
  copyButton.addEventListener("click", copyPrompt);
}


/* =========================
   IMPROVE
========================= */

async function improvePrompt() {
  if (!currentPrompt) {
    showToast("Generate a prompt first");
    return;
  }

  if (improveButton) {
    improveButton.disabled = true;
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  currentPrompt += `

━━━━━━━━━━━━━━━━━━━━
FINAL QUALITY PASS
━━━━━━━━━━━━━━━━━━━━

Before implementation, review the entire specification and improve it where necessary.

Make sure the final result is:
- Clear
- Specific
- Consistent
- Responsive
- Accessible
- Secure
- Performant
- Production-ready

Do not introduce unnecessary complexity.
`;

  if (output) {
    output.textContent = currentPrompt;
  }

  if (improveButton) {
    improveButton.disabled = false;
  }

  showToast("Prompt improved");
}


if (improveButton) {
  improveButton.addEventListener("click", improvePrompt);
}


/* =========================
   REGENERATE
========================= */

if (regenerateButton) {
  regenerateButton.addEventListener("click", generatePrompt);
}


/* =========================
   SUPABASE - LOAD PROMPTS
========================= */

async function loadPrompts() {
  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("prompts")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("updated_at", {
      ascending: false
    });

  if (error) {
    console.error("Load prompts error:", error);
    showToast("Could not load prompts");
    return;
  }

  savedPrompts = data || [];

  updatePromptCount();
  renderPrompts();
}


/* =========================
   SAVE PROMPT
========================= */

async function savePrompt() {
  if (!currentUser) {
    showToast("Please sign in first");
    return;
  }

  if (!currentPrompt.trim()) {
    showToast("Generate a prompt first");
    return;
  }

  const title =
    outputTitle?.value.trim() || "Untitled Prompt";

  const promptData = {
    user_id: currentUser.id,
    title,
    content: currentPrompt,
    project_type: projectType?.value || "",
    style: styleInput?.value || "",
    technology: technologyInput?.value || "",
    detail_level: detailLevel?.value || "standard",
    updated_at: new Date().toISOString()
  };


  let result;

  if (currentEditingId) {
    result = await supabaseClient
      .from("prompts")
      .update(promptData)
      .eq("id", currentEditingId)
      .eq("user_id", currentUser.id)
      .select()
      .single();
  } else {
    result = await supabaseClient
      .from("prompts")
      .insert(promptData)
      .select()
      .single();
  }


  if (result.error) {
    console.error("Save prompt error:", result.error);
    showToast("Could not save prompt");
    return;
  }


  const saved = result.data;

  currentEditingId = saved.id;

  await loadPrompts();

  showToast(
    currentEditingId
      ? "Prompt saved successfully"
      : "Prompt saved"
  );
}


if (saveButton) {
  saveButton.addEventListener("click", savePrompt);
}


/* =========================
   RENDER PROMPTS
========================= */

function renderPrompts() {
  if (!promptsContainer) return;

  if (!currentUser) {
    promptsContainer.innerHTML = "";
    return;
  }

  if (!savedPrompts.length) {
    promptsContainer.innerHTML = `
      <div class="empty-state">
        <h3>No saved prompts yet</h3>
        <p>Create your first prompt and save it here.</p>
      </div>
    `;

    return;
  }


  promptsContainer.innerHTML = savedPrompts
    .map((prompt) => {
      const date = prompt.updated_at
        ? new Date(prompt.updated_at).toLocaleDateString()
        : "";

      return `
        <article class="prompt-card">
          <div class="prompt-card-content">
            <h3>${escapeHTML(prompt.title)}</h3>

            <p>
              ${escapeHTML(
                prompt.content.slice(0, 180)
              )}${prompt.content.length > 180 ? "..." : ""}
            </p>

            <span class="prompt-date">
              ${escapeHTML(date)}
            </span>
          </div>

          <div class="prompt-card-actions">

            <button
              type="button"
              data-action="open"
              data-id="${prompt.id}"
            >
              Open
            </button>

            <button
              type="button"
              data-action="copy"
              data-id="${prompt.id}"
            >
              Copy
            </button>

            <button
              type="button"
              data-action="delete"
              data-id="${prompt.id}"
            >
              Delete
            </button>

          </div>
        </article>
      `;
    })
    .join("");
}


/* =========================
   PROMPT ACTIONS
========================= */

if (promptsContainer) {
  promptsContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    const prompt = savedPrompts.find(
      (item) => item.id === id
    );

    if (!prompt) return;


    if (action === "open") {
      openPrompt(prompt);
      return;
    }


    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(prompt.content);
        showToast("Prompt copied");
      } catch (error) {
        console.error(error);
        showToast("Copy failed");
      }

      return;
    }


    if (action === "delete") {
      await deletePrompt(id);
    }
  });
}


/* =========================
   OPEN PROMPT
========================= */

function openPrompt(prompt) {
  currentPrompt = prompt.content;
  currentEditingId = prompt.id;

  if (ideaInput) {
    ideaInput.value = prompt.title;
    updateCharacterCount();
  }

  if (projectType) {
    projectType.value = prompt.project_type || "";
  }

  if (styleInput) {
    styleInput.value = prompt.style || "";
  }

  if (technologyInput) {
    technologyInput.value = prompt.technology || "";
  }

  if (detailLevel) {
    detailLevel.value = prompt.detail_level || "standard";
  }

  if (output) {
    output.textContent = prompt.content;
  }

  if (outputTitle) {
    outputTitle.value = prompt.title || "Untitled Prompt";
  }

  showPage("home");

  showToast("Prompt opened");
}


/* =========================
   DELETE PROMPT
========================= */

async function deletePrompt(id) {
  if (!currentUser) return;

  const { error } = await supabaseClient
    .from("prompts")
    .delete()
    .eq("id", id)
    .eq("user_id", currentUser.id);

  if (error) {
    console.error("Delete prompt error:", error);
    showToast("Could not delete prompt");
    return;
  }

  if (currentEditingId === id) {
    currentEditingId = null;
  }

  await loadPrompts();

  showToast("Prompt deleted");
}


/* =========================
   PROMPT COUNT
========================= */

function updatePromptCount() {
  if (promptCount) {
    promptCount.textContent = savedPrompts.length;
  }
}


/* =========================
   SUPABASE - LOAD PROFILE
========================= */

async function loadProfile() {
  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .maybeSingle();


  if (error) {
    console.error("Load profile error:", error);
    showToast("Could not load profile");
    return;
  }


  if (data) {
    profile = data;
  } else {
    profile = {
      id: currentUser.id,
      first_name:
        currentUser.user_metadata?.display_name || "",
      last_name: "",
      bio: ""
    };

    await supabaseClient
      .from("profiles")
      .upsert(
        profile,
        {
          onConflict: "id"
        }
      );
  }

  loadProfileIntoUI();
}


/* =========================
   PROFILE UI
========================= */

function loadProfileIntoUI() {
  if (!currentUser) return;

  if (profileName) {
    profileName.value = getProfileName();
  }

  if (profileBio) {
    profileBio.value = profile.bio || "";
  }

  if (accountEmail) {
    accountEmail.textContent =
      currentUser.email || "";
  }

  updatePromptCount();
}


/* =========================
   SAVE PROFILE
========================= */

async function saveProfile() {
  if (!currentUser) {
    showToast("Please sign in first");
    return;
  }


  const name = profileName?.value.trim() || "";
  const bio = profileBio?.value.trim() || "";


  const parts = name
    .split(/\s+/)
    .filter(Boolean);


  const firstName = parts.shift() || "";
  const lastName = parts.join(" ");


  const profileData = {
    id: currentUser.id,
    first_name: firstName,
    last_name: lastName,
    bio: bio,
    updated_at: new Date().toISOString()
  };


  const { data, error } = await supabaseClient
    .from("profiles")
    .upsert(
      profileData,
      {
        onConflict: "id"
      }
    )
    .select()
    .single();


  if (error) {
    console.error("Profile save error:", error);

    showToast("Could not save profile");

    return;
  }


  profile = data;

  loadProfileIntoUI();

  showToast("Profile saved successfully");
}


if (saveProfileButton) {
  saveProfileButton.addEventListener(
    "click",
    saveProfile
  );
}


/* =========================
   LOGOUT
========================= */

async function logout() {
  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    showToast("Could not log out");
    return;
  }

  currentUser = null;
  currentSession = null;
  savedPrompts = [];
  currentPrompt = "";
  currentEditingId = null;

  showToast("Logged out");
}


if (logoutButton) {
  logoutButton.addEventListener(
    "click",
    logout
  );
}


/* =========================
   AUTH MODAL
========================= */

function openAuthModal() {
  if (!authModal) return;

  authModal.classList.add("active");
  document.body.classList.add("auth-open");
}


function closeAuthModal() {
  if (!authModal) return;

  authModal.classList.remove("active");
  document.body.classList.remove("auth-open");
}


function setAuthMode(mode) {
  authMode = mode;

  const isSignUp = mode === "signup";


  if (authSignInTab) {
    authSignInTab.classList.toggle(
      "active",
      !isSignUp
    );
  }


  if (authSignUpTab) {
    authSignUpTab.classList.toggle(
      "active",
      isSignUp
    );
  }


  if (authDisplayName) {
    authDisplayName.style.display =
      isSignUp ? "" : "none";
  }


  if (authSubmitButton) {
    authSubmitButton.textContent =
      isSignUp
        ? "Create Account"
        : "Sign In";
  }


  setAuthMessage("");
}


if (authSignInTab) {
  authSignInTab.addEventListener(
    "click",
    () => setAuthMode("signin")
  );
}


if (authSignUpTab) {
  authSignUpTab.addEventListener(
    "click",
    () => setAuthMode("signup")
  );
}


/* =========================
   AUTH SUBMIT
========================= */

async function handleAuthSubmit(event) {
  event.preventDefault();

  const email =
    authEmail?.value.trim() || "";

  const password =
    authPassword?.value || "";

  const displayName =
    authDisplayName?.value.trim() || "";


  if (!email || !password) {
    setAuthMessage(
      "Enter your email and password.",
      "error"
    );

    return;
  }


  if (
    authMode === "signup" &&
    !displayName
  ) {
    setAuthMessage(
      "Enter your display name.",
      "error"
    );

    return;
  }


  if (authSubmitButton) {
    authSubmitButton.disabled = true;
    authSubmitButton.textContent =
      authMode === "signup"
        ? "Creating..."
        : "Signing in...";
  }


  setAuthMessage("");


  try {

    if (authMode === "signup") {

      const { data, error } =
        await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName
            }
          }
        });


      if (error) {
        throw error;
      }


      /*
        If email confirmation is enabled,
        Supabase may return a user without a session.
      */

      if (!data.session) {
        setAuthMessage(
          "Account created. Check your email to confirm your account, then sign in.",
          "success"
        );

        return;
      }


      currentSession = data.session;
      currentUser = data.user;


      await loadProfile();
      await loadPrompts();

      closeAuthModal();

      showToast("Account created successfully");

    } else {

      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });


      if (error) {
        throw error;
      }


      currentSession = data.session;
      currentUser = data.user;


      await loadProfile();
      await loadPrompts();

      closeAuthModal();

      showToast("Signed in successfully");
    }


  } catch (error) {

    console.error("Authentication error:", error);

    setAuthMessage(
      error.message || "Authentication failed.",
      "error"
    );

  } finally {

    if (authSubmitButton) {
      authSubmitButton.disabled = false;

      authSubmitButton.textContent =
        authMode === "signup"
          ? "Create Account"
          : "Sign In";
    }
  }
}


if (authForm) {
  authForm.addEventListener(
    "submit",
    handleAuthSubmit
  );
}


/* =========================
   AUTH STATE
========================= */

async function handleAuthStateChange(session) {
  currentSession = session;
  currentUser = session?.user || null;


  if (currentUser) {

    closeAuthModal();

    await loadProfile();
    await loadPrompts();

  } else {

    openAuthModal();

    savedPrompts = [];

    currentPrompt = "";
    currentEditingId = null;

    updatePromptCount();
  }
}


/* =========================
   TITLE EDIT
========================= */

if (titleEditButton) {
  titleEditButton.addEventListener(
    "click",
    () => {
      if (!outputTitle) return;

      outputTitle.focus();
      outputTitle.select();
    }
  );
}


/* =========================
   KEYBOARD SHORTCUTS
========================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "enter"
    ) {
      event.preventDefault();
      generatePrompt();
    }


    if (
      event.key === "/" &&
      document.activeElement !== ideaInput &&
      document.activeElement?.tagName !== "INPUT" &&
      document.activeElement?.tagName !== "TEXTAREA"
    ) {
      event.preventDefault();

      if (ideaInput) {
        ideaInput.focus();
      }
    }
  }
);


/* =========================
   INITIALIZATION
========================= */

async function initApp() {

  updateCharacterCount();

  setAuthMode("signin");


  const {
    data: {
      session
    }
  } = await supabaseClient.auth.getSession();


  currentSession = session;
  currentUser = session?.user || null;


  if (currentUser) {

    closeAuthModal();

    await loadProfile();
    await loadPrompts();

  } else {

    openAuthModal();

  }


  /*
    Listen for future login/logout changes.
  */

  supabaseClient.auth.onAuthStateChange(
    async (_event, session) => {

      currentSession = session;
      currentUser = session?.user || null;


      if (currentUser) {

        closeAuthModal();

        await loadProfile();
        await loadPrompts();

      } else {

        openAuthModal();

        savedPrompts = [];

        updatePromptCount();
      }
    }
  );
}


/* =========================
   START
========================= */

initApp();
