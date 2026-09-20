/* =========================================
   DOMA PROMPTS
   V2 — SUPABASE WORKSPACE
========================================= */


/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
  "https://gpxatkpwdekurxjhtguc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_onQaVtWk1QkFqpzN_Dzrsw_AoQ6tEBm";

const {
  createClient
} = window.supabase;

const supabaseClient =
  createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================
   ELEMENTS
========================================= */

const ideaInput =
  document.getElementById("idea");

const projectType =
  document.getElementById("projectType");

const styleInput =
  document.getElementById("style");

const technology =
  document.getElementById("technology");

const detail =
  document.getElementById("detail");

const generateButton =
  document.getElementById("generateButton");

const clearIdea =
  document.getElementById("clearIdea");

const characterCount =
  document.getElementById("characterCount");

const emptyOutput =
  document.getElementById("emptyOutput");

const generatedOutput =
  document.getElementById("generatedOutput");

const promptText =
  document.getElementById("promptText");

const promptTitle =
  document.getElementById("promptTitle");

const outputStatus =
  document.getElementById("outputStatus");

const copyButton =
  document.getElementById("copyButton");

const improveButton =
  document.getElementById("improveButton");

const regenerateButton =
  document.getElementById("regenerateButton");

const saveButton =
  document.getElementById("saveButton");

const promptsContainer =
  document.getElementById("promptsContainer");

const promptCount =
  document.getElementById("promptCount");

const profileName =
  document.getElementById("profileName");

const profileBio =
  document.getElementById("profileBio");

const profileAvatar =
  document.getElementById("profileAvatar");

const saveProfile =
  document.getElementById("saveProfile");

const logoutButton =
  document.getElementById("logoutButton");

const accountEmail =
  document.getElementById("accountEmail");

const toast =
  document.getElementById("toast");

const toastMessage =
  document.getElementById("toastMessage");


/* =========================================
   AUTH ELEMENTS
========================================= */

const authGate =
  document.getElementById("authGate");

const loginForm =
  document.getElementById("loginForm");

const signupForm =
  document.getElementById("signupForm");

const loginEmail =
  document.getElementById("loginEmail");

const loginPassword =
  document.getElementById("loginPassword");

const signupName =
  document.getElementById("signupName");

const signupEmail =
  document.getElementById("signupEmail");

const signupPassword =
  document.getElementById("signupPassword");

const authTitle =
  document.getElementById("authTitle");

const authDescription =
  document.getElementById("authDescription");

const authSwitchText =
  document.getElementById("authSwitchText");

const authSwitchButton =
  document.getElementById("authSwitchButton");

const loginButton =
  document.getElementById("loginButton");

const signupButton =
  document.getElementById("signupButton");


/* =========================================
   STATE
========================================= */

let currentPrompt = "";

let savedPrompts = [];

let profile = {
  name: "",
  bio: ""
};

let currentUser = null;

let currentSession = null;


/* =========================================
   NAVIGATION
========================================= */

const pages = {
  home: document.getElementById("homePage"),
  prompts: document.getElementById("promptsPage"),
  profile: document.getElementById("profilePage")
};

const navLinks =
  document.querySelectorAll(
    "[data-page]"
  );


function showPage(pageName) {

  Object.values(pages).forEach(
    page => {

      page.classList.remove(
        "active-page"
      );

    }
  );


  if (pages[pageName]) {

    pages[pageName].classList.add(
      "active-page"
    );

  }


  document
    .querySelectorAll(".nav-link")
    .forEach(link => {

      link.classList.remove(
        "active"
      );

    });


  document
    .querySelectorAll(
      `.nav-link[data-page="${pageName}"]`
    )
    .forEach(link => {

      link.classList.add(
        "active"
      );

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (pageName === "prompts") {

    loadPrompts();

  }


  if (pageName === "profile") {

    loadProfile();

  }

}


navLinks.forEach(
  element => {

    element.addEventListener(
      "click",
      event => {

        event.preventDefault();

        const page =
          element.dataset.page;

        showPage(page);

      }
    );

  }
);


/* =========================================
   AUTH MODE
========================================= */

let authMode = "login";


function setAuthMode(mode) {

  authMode = mode;


  if (mode === "login") {

    loginForm.classList.remove(
      "hidden"
    );

    signupForm.classList.add(
      "hidden"
    );


    authTitle.textContent =
      "Welcome back.";


    authDescription.textContent =
      "Sign in to access your private prompt workspace.";


    authSwitchText.textContent =
      "Don't have an account?";


    authSwitchButton.textContent =
      "Create account";

  } else {

    loginForm.classList.add(
      "hidden"
    );

    signupForm.classList.remove(
      "hidden"
    );


    authTitle.textContent =
      "Create your workspace.";


    authDescription.textContent =
      "Create a private account for your prompts and profile.";


    authSwitchText.textContent =
      "Already have an account?";


    authSwitchButton.textContent =
      "Sign in";

  }

}


authSwitchButton.addEventListener(
  "click",
  () => {

    setAuthMode(
      authMode === "login"
        ? "signup"
        : "login"
    );

  }
);


/* =========================================
   AUTH GATE
========================================= */

function showAuthGate() {

  authGate.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "auth-locked"
  );

}


function hideAuthGate() {

  authGate.classList.add(
    "hidden"
  );

  document.body.classList.remove(
    "auth-locked"
  );

}


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const email =
      loginEmail.value.trim();

    const password =
      loginPassword.value;


    if (!email || !password) {

      showToast(
        "Enter your email and password."
      );

      return;

    }


    loginButton.disabled = true;

    loginButton.textContent =
      "Signing in...";


    const {
      data,
      error
    } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });


    loginButton.disabled = false;

    loginButton.textContent =
      "Sign In";


    if (error) {

      showToast(
        error.message
      );

      return;

    }


    currentSession =
      data.session;

    currentUser =
      data.user;


    loginForm.reset();


    await initializeUser();


    showToast(
      "Welcome back."
    );

  }
);


/* =========================================
   SIGN UP
========================================= */

signupForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const name =
      signupName.value.trim();

    const email =
      signupEmail.value.trim();

    const password =
      signupPassword.value;


    if (!name || !email || !password) {

      showToast(
        "Complete all fields."
      );

      return;

    }


    if (password.length < 6) {

      showToast(
        "Password must be at least 6 characters."
      );

      return;

    }


    signupButton.disabled = true;

    signupButton.textContent =
      "Creating...";


    const {
      data,
      error
    } =
      await supabaseClient.auth.signUp({

        email,

        password,

        options: {

          data: {

            first_name: name

          }

        }

      });


    signupButton.disabled = false;

    signupButton.textContent =
      "Create Account";


    if (error) {

      showToast(
        error.message
      );

      return;

    }


    /*
      If email confirmation is enabled,
      Supabase may create the account
      without creating a session.
    */

    if (!data.session) {

      signupForm.reset();

      setAuthMode("login");

      showToast(
        "Account created. Check your email to confirm your account."
      );

      return;

    }


    currentSession =
      data.session;

    currentUser =
      data.user;


    signupForm.reset();


    await initializeUser();


    showToast(
      "Account created successfully."
    );

  }
);


/* =========================================
   AUTH STATE
========================================= */

supabaseClient.auth.onAuthStateChange(
  async (
    event,
    session
  ) => {

    currentSession =
      session;

    currentUser =
      session?.user || null;


    if (session) {

      await initializeUser();

    } else {

      currentUser = null;

      savedPrompts = [];

      profile = {
        name: "",
        bio: ""
      };

      updatePromptCount();

      showAuthGate();

    }

  }
);


/* =========================================
   INITIALIZE USER
========================================= */

async function initializeUser() {

  if (!currentUser) {
    return;
  }


  hideAuthGate();


  accountEmail.textContent =
    currentUser.email || "—";


  await ensureProfile();


  await loadPrompts();


  loadProfile();

}


/* =========================================
   ENSURE PROFILE
========================================= */

async function ensureProfile() {

  if (!currentUser) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();


  if (error) {

    console.error(
      "Profile load error:",
      error
    );

    return;

  }


  if (data) {

    profile = {

      name:
        data.first_name || "",

      bio:
        data.bio || ""

    };

    return;

  }


  const name =
    currentUser.user_metadata
      ?.first_name || "";


  const {
    data: createdProfile,
    error: createError
  } =
    await supabaseClient
      .from("profiles")
      .insert({

        id: currentUser.id,

        first_name:
          name,

        last_name:
          ""

      })
      .select()
      .single();


  if (createError) {

    console.error(
      "Profile creation error:",
      createError
    );

    return;

  }


  profile = {

    name:
      createdProfile.first_name || "",

    bio:
      createdProfile.bio || ""

  };

}


/* =========================================
   CHARACTER COUNT
========================================= */

ideaInput.addEventListener(
  "input",
  updateCharacterCount
);


function updateCharacterCount() {

  const count =
    ideaInput.value.length;


  characterCount.textContent =
    `${count} characters`;

}


/* =========================================
   CLEAR IDEA
========================================= */

clearIdea.addEventListener(
  "click",
  () => {

    ideaInput.value = "";

    updateCharacterCount();

    ideaInput.focus();

  }
);


/* =========================================
   GENERATE PROMPT
========================================= */

generateButton.addEventListener(
  "click",
  () => {

    const idea =
      ideaInput.value.trim();


    if (!idea) {

      showToast(
        "Describe your idea first."
      );

      ideaInput.focus();

      return;

    }


    generatePrompt();

  }
);


function generatePrompt() {

  const idea =
    ideaInput.value.trim();

  const type =
    projectType.value;

  const design =
    styleInput.value;

  const tech =
    technology.value;

  const level =
    detail.value;


  currentPrompt =
    buildPrompt(
      idea,
      type,
      design,
      tech,
      level
    );


  promptText.textContent =
    currentPrompt;


  emptyOutput.classList.add(
    "hidden"
  );


  generatedOutput.classList.remove(
    "hidden"
  );


  outputStatus.textContent =
    "Generated";


  outputStatus.style.color =
    "#4ade80";


  promptTitle.value =
    createTitle(idea);


  showToast(
    "Prompt generated successfully."
  );

}


/* =========================================
   PROMPT ENGINE
========================================= */

function buildPrompt(
  idea,
  type,
  design,
  tech,
  level
) {

  let prompt = "";


  prompt +=
`ROLE

You are an expert product designer, software engineer, UX strategist, and technical architect.

Your job is to transform the following idea into a complete, practical, polished result.

PROJECT IDEA

${idea}

PROJECT TYPE

${type}

DESIGN DIRECTION

${design}

TECHNOLOGY

${tech}

`;


  if (level === "Quick") {

    prompt +=
`OBJECTIVE

Turn the idea into a clear and functional ${type}.

Focus on:
- Core functionality
- Clean structure
- Good usability
- Responsive behavior
- A polished final result

OUTPUT

Provide the implementation clearly and explain the important decisions.
`;

  }


  else if (level === "Standard") {

    prompt +=
`OBJECTIVE

Build a complete ${type} based on the project idea.

REQUIREMENTS

- Create a clear and intuitive user experience.
- Make the interface responsive.
- Keep the design visually consistent.
- Use ${tech} correctly.
- Organize the project cleanly.
- Make all major interactions functional.
- Avoid unnecessary features.

UI / UX

Use a ${design} visual direction.

The interface should feel modern, intentional, and easy to understand.

FUNCTIONALITY

Identify the core features required by the idea and implement them properly.

TECHNICAL REQUIREMENTS

- Use clean and maintainable code.
- Follow appropriate best practices.
- Handle empty states and errors.
- Make the experience work on desktop and mobile.

OUTPUT

Return the complete solution with the required code and a short explanation.
`;

  }


  else if (level === "Professional") {

    prompt +=
`OBJECTIVE

Design and implement a production-quality ${type} based on the provided idea.

PRODUCT REQUIREMENTS

First understand the idea and convert it into clear product requirements.

Identify:
- Primary users
- Main user goal
- Core user flows
- Required features
- Important edge cases
- Necessary states

FEATURES

Define and implement the features that provide real value to the user.

Do not add random features simply to make the project larger.

UI / UX REQUIREMENTS

Create a premium ${design} interface.

The experience should include:

- Strong visual hierarchy
- Clear navigation
- Consistent spacing
- Responsive layouts
- Accessible controls
- Useful feedback states
- Loading states where appropriate
- Empty states
- Error states
- Success states

TECHNICAL REQUIREMENTS

Use ${tech}.

Code should be:

- Modular
- Maintainable
- Readable
- Responsive
- Efficient
- Easy to extend

SECURITY & RELIABILITY

Consider:

- Input validation
- Safe data handling
- Error handling
- Unexpected user behavior
- Missing data
- Network failures where relevant

QUALITY BAR

The final result should feel like a real product rather than a basic demo.

OUTPUT

Provide the complete implementation.

Explain the architecture briefly and identify any assumptions you made.
`;

  }


  else {

    prompt +=
`OBJECTIVE

Create a highly polished, production-ready ${type} from the idea above.

Before implementing anything, deeply analyze the product requirements.

1. PRODUCT ANALYSIS

Explain:

- What the product does
- Who it is for
- The primary user goal
- The core problem being solved
- The most important user flow

2. INFORMATION ARCHITECTURE

Define:

- Pages
- Sections
- Navigation
- Components
- Important states

3. FEATURES

Identify every necessary feature.

Separate them into:

- Core features
- Supporting features
- Optional features

Do not invent unnecessary functionality.

4. USER EXPERIENCE

Design a ${design} experience with:

- Strong visual hierarchy
- Clear navigation
- Excellent spacing
- Responsive behavior
- Accessibility
- Keyboard usability
- Clear feedback
- Loading states
- Empty states
- Error states
- Success states

5. TECHNICAL ARCHITECTURE

Use ${tech}.

Explain:

- Project structure
- Components
- Data flow
- State management
- Important dependencies
- API interactions if required

6. SECURITY

Consider:

- Input validation
- Data protection
- Safe handling of user input
- Error handling
- Authentication where appropriate
- Authorization where appropriate

7. EDGE CASES

Think about:

- Empty input
- Invalid input
- Missing data
- Slow connections
- Failed requests
- Duplicate actions
- Mobile screens
- Very long content

8. IMPLEMENTATION

Provide complete, working code.

Do not leave placeholder functionality unless absolutely necessary.

9. QUALITY CHECKLIST

Before finishing, verify:

- The interface is responsive.
- Main interactions work.
- No obvious broken states exist.
- The code is organized.
- The design is consistent.
- The implementation matches the original idea.

10. FINAL OUTPUT

Return the complete implementation followed by a concise explanation of the architecture and important decisions.
`;

  }


  return prompt.trim();

}


/* =========================================
   CREATE TITLE
========================================= */

function createTitle(
  idea
) {

  const clean =
    idea
      .replace(/\s+/g, " ")
      .trim();


  if (clean.length <= 38) {

    return clean;

  }


  return (
    clean.substring(0, 38) +
    "..."
  );

}


/* =========================================
   COPY
========================================= */

copyButton.addEventListener(
  "click",
  async () => {

    if (!currentPrompt) {

      showToast(
        "Generate a prompt first."
      );

      return;

    }


    try {

      await navigator.clipboard.writeText(
        currentPrompt
      );


      showToast(
        "Prompt copied."
      );

    } catch {

      showToast(
        "Copy failed."
      );

    }

  }
);


/* =========================================
   IMPROVE
========================================= */

improveButton.addEventListener(
  "click",
  () => {

    if (!currentPrompt) {

      showToast(
        "Generate a prompt first."
      );

      return;

    }


    currentPrompt =
      currentPrompt
        .replace(
          "PROJECT REQUIREMENTS",
          "ADVANCED PROJECT REQUIREMENTS"
        )
        .replace(
          "OUTPUT",
          "EXPECTED OUTPUT"
        );


    currentPrompt +=
`
    
FINAL IMPROVEMENT PASS

Before producing the final result:

- Check the requirements against the original idea.
- Remove unnecessary assumptions.
- Improve clarity.
- Identify missing functionality.
- Make the final implementation practical.
- Prefer simple solutions when they are sufficient.
- Ensure the final result is consistent and polished.
`;


    promptText.textContent =
      currentPrompt;


    outputStatus.textContent =
      "Improved";


    showToast(
      "Prompt improved."
    );

  }
);


/* =========================================
   REGENERATE
========================================= */

regenerateButton.addEventListener(
  "click",
  () => {

    if (!ideaInput.value.trim()) {

      showToast(
        "Describe your idea first."
      );

      return;

    }


    generatePrompt();

  }
);


/* =========================================
   SAVE PROMPT
========================================= */

saveButton.addEventListener(
  "click",
  async () => {

    if (!currentUser) {

      showToast(
        "Please sign in first."
      );

      showAuthGate();

      return;

    }


    if (!currentPrompt) {

      showToast(
        "Generate a prompt first."
      );

      return;

    }


    const title =
      promptTitle.value.trim() ||
      "Untitled Prompt";


    const editingId =
      window.currentEditingId || null;


    saveButton.disabled = true;

    saveButton.textContent =
      "Saving...";


    let result;


    if (editingId) {

      result =
        await supabaseClient
          .from("prompts")
          .update({

            title,

            content:
              currentPrompt,

            project_type:
              projectType.value,

            style:
              styleInput.value,

            technology:
              technology.value,

            detail_level:
              detail.value

          })
          .eq(
            "id",
            editingId
          )
          .eq(
            "user_id",
            currentUser.id
          )
          .select()
          .single();

    } else {

      result =
        await supabaseClient
          .from("prompts")
          .insert({

            user_id:
              currentUser.id,

            title,

            content:
              currentPrompt,

            project_type:
              projectType.value,

            style:
              styleInput.value,

            technology:
              technology.value,

            detail_level:
              detail.value

          })
          .select()
          .single();

    }


    saveButton.disabled = false;

    saveButton.textContent =
      "Save Prompt";


    if (result.error) {

      console.error(
        result.error
      );

      showToast(
        "Could not save prompt."
      );

      return;

    }


    window.currentEditingId =
      result.data.id;


    await loadPrompts();


    showToast(
      editingId
        ? "Prompt updated."
        : "Prompt saved."
    );

  }
);


/* =========================================
   LOAD PROMPTS
========================================= */

async function loadPrompts() {

  if (!currentUser) {

    savedPrompts = [];

    updatePromptCount();

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("prompts")
      .select("*")
      .eq(
        "user_id",
        currentUser.id
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Prompts load error:",
      error
    );

    showToast(
      "Could not load your prompts."
    );

    return;

  }


  savedPrompts =
    (data || []).map(
      prompt => ({

        id:
          prompt.id,

        title:
          prompt.title,

        content:
          prompt.content,

        projectType:
          prompt.project_type,

        style:
          prompt.style,

        technology:
          prompt.technology,

        detail:
          prompt.detail_level,

        createdAt:
          prompt.created_at,

        updatedAt:
          prompt.updated_at

      })
    );


  updatePromptCount();


  if (
    document
      .getElementById("promptsPage")
      .classList
      .contains("active-page")
  ) {

    renderPrompts();

  }

}


/* =========================================
   PROMPTS LIST
========================================= */

function renderPrompts() {

  updatePromptCount();


  if (
    savedPrompts.length === 0
  ) {

    promptsContainer.innerHTML = `
      <div class="no-prompts">

        <div class="empty-icon">
          ◇
        </div>

        <h3>
          No saved prompts yet
        </h3>

        <p>
          Generate your first prompt and save it here.
        </p>

        <button
          class="primary-small"
          data-page="home"
        >
          Create First Prompt
        </button>

      </div>
    `;


    promptsContainer
      .querySelector(
        "[data-page='home']"
      )
      .addEventListener(
        "click",
        () => showPage("home")
      );


    return;

  }


  promptsContainer.innerHTML =
    savedPrompts
      .map(
        prompt => {

          const date =
            new Date(
              prompt.updatedAt
            ).toLocaleDateString();


          const preview =
            escapeHTML(
              prompt.content.substring(
                0,
                260
              )
            );


          return `
            <article
              class="prompt-card"
              data-id="${prompt.id}"
            >

              <div class="prompt-card-top">

                <div>

                  <h3>
                    ${escapeHTML(
                      prompt.title
                    )}
                  </h3>

                </div>

                <span class="prompt-date">
                  ${date}
                </span>

              </div>


              <p class="prompt-card-preview">
                ${preview}
              </p>


              <div class="prompt-card-actions">

                <button
                  data-action="open"
                  data-id="${prompt.id}"
                >
                  Open
                </button>

                <button
                  data-action="copy"
                  data-id="${prompt.id}"
                >
                  Copy
                </button>

                <button
                  data-action="delete"
                  data-id="${prompt.id}"
                >
                  Delete
                </button>

              </div>

            </article>
          `;

        }
      )
      .join("");


  promptsContainer
    .querySelectorAll(
      "[data-action]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const action =
              button.dataset.action;

            const id =
              button.dataset.id;


            handlePromptAction(
              action,
              id
            );

          }
        );

      }
    );

}


/* =========================================
   PROMPT ACTIONS
========================================= */

async function handlePromptAction(
  action,
  id
) {

  const prompt =
    savedPrompts.find(
      item => item.id === id
    );


  if (!prompt) {
    return;
  }


  if (action === "open") {

    openPrompt(prompt);

    return;

  }


  if (action === "copy") {

    try {

      await navigator.clipboard.writeText(
        prompt.content
      );

      showToast(
        "Prompt copied."
      );

    } catch {

      showToast(
        "Copy failed."
      );

    }

    return;

  }


  if (action === "delete") {

    const confirmed =
      confirm(
        "Delete this prompt?"
      );


    if (!confirmed) {
      return;
    }


    const {
      error
    } =
      await supabaseClient
        .from("prompts")
        .delete()
        .eq(
          "id",
          id
        )
        .eq(
          "user_id",
          currentUser.id
        );


    if (error) {

      console.error(
        error
      );

      showToast(
        "Could not delete prompt."
      );

      return;

    }


    savedPrompts =
      savedPrompts.filter(
        item => item.id !== id
      );


    if (
      window.currentEditingId === id
    ) {

      window.currentEditingId =
        null;

    }


    renderPrompts();


    showToast(
      "Prompt deleted."
    );

  }

}


/* =========================================
   OPEN PROMPT
========================================= */

function openPrompt(
  prompt
) {

  window.currentEditingId =
    prompt.id;


  ideaInput.value =
    prompt.title;


  projectType.value =
    prompt.projectType;


  styleInput.value =
    prompt.style;


  technology.value =
    prompt.technology;


  detail.value =
    prompt.detail;


  currentPrompt =
    prompt.content;


  promptTitle.value =
    prompt.title;


  promptText.textContent =
    prompt.content;


  emptyOutput.classList.add(
    "hidden"
  );


  generatedOutput.classList.remove(
    "hidden"
  );


  outputStatus.textContent =
    "Saved";


  outputStatus.style.color =
    "#4ade80";


  updateCharacterCount();


  showPage("home");


  showToast(
    "Prompt opened."
  );

}


/* =========================================
   PROFILE
========================================= */

async function loadProfile() {

  if (!currentUser) {
    return;
  }


  await ensureProfile();


  profileName.value =
    profile.name || "";


  profileBio.value =
    profile.bio || "";


  profileAvatar.textContent =
    getInitial(
      profile.name
    );


  accountEmail.textContent =
    currentUser.email || "—";

}


saveProfile.addEventListener(
  "click",
  async () => {

    if (!currentUser) {

      showToast(
        "Please sign in first."
      );

      return;

    }


    const name =
      profileName.value.trim();

    const bio =
      profileBio.value.trim();


    saveProfile.disabled = true;

    saveProfile.textContent =
      "Saving...";


    const {
      error
    } =
      await supabaseClient
        .from("profiles")
        .upsert({

          id:
            currentUser.id,

          first_name:
            name,

          bio:
            bio

        });


    saveProfile.disabled = false;

    saveProfile.textContent =
      "Save Profile";


    if (error) {

      console.error(
        error
      );

      showToast(
        "Could not save profile."
      );

      return;

    }


    profile = {

      name,

      bio

    };


    profileAvatar.textContent =
      getInitial(
        profile.name
      );


    showToast(
      "Profile saved."
    );

  }
);


/* =========================================
   LOGOUT
========================================= */

logoutButton.addEventListener(
  "click",
  async () => {

    logoutButton.disabled = true;

    logoutButton.textContent =
      "Logging out...";


    const {
      error
    } =
      await supabaseClient.auth.signOut();


    logoutButton.disabled = false;

    logoutButton.textContent =
      "Log Out";


    if (error) {

      console.error(
        error
      );

      showToast(
        "Could not log out."
      );

      return;

    }


    currentUser = null;

    currentSession = null;

    savedPrompts = [];

    profile = {
      name: "",
      bio: ""
    };


    updatePromptCount();

    setAuthMode("login");

    showAuthGate();


    showToast(
      "You have been logged out."
    );

  }
);


/* =========================================
   PROFILE INITIAL
========================================= */

function getInitial(
  name
) {

  if (!name) {
    return "D";
  }


  return name
    .trim()
    .charAt(0)
    .toUpperCase();

}


/* =========================================
   PROMPT COUNT
========================================= */

function updatePromptCount() {

  promptCount.textContent =
    savedPrompts.length;

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
  value
) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(
  message
) {

  toastMessage.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}


/* =========================================
   TITLE EDIT
========================================= */

const editTitle =
  document.getElementById(
    "editTitle"
  );


editTitle.addEventListener(
  "click",
  () => {

    promptTitle.focus();

    promptTitle.select();

  }
);


/* =========================================
   INITIALIZE
========================================= */

async function initializeApp() {

  updateCharacterCount();

  updatePromptCount();

  setAuthMode("login");


  const {
    data,
    error
  } =
    await supabaseClient.auth.getSession();


  if (error) {

    console.error(
      "Session error:",
      error
    );

    showAuthGate();

    return;

  }


  currentSession =
    data.session;

  currentUser =
    data.session?.user || null;


  if (currentSession) {

    await initializeUser();

  } else {

    showAuthGate();

  }

}


initializeApp();
