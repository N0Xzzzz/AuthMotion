const authCard = document.querySelector(".auth-card");
const tabs = [...document.querySelectorAll(".form-tab")];
const forms = [...document.querySelectorAll(".auth-form")];
const panels = {
  login: document.querySelector("#login-panel"),
  register: document.querySelector("#register-panel"),
  reset: document.querySelector("#reset-panel"),
  terms: document.querySelector("#terms-panel"),
};

function setView(view, focusSelector) {
  const target = panels[view];
  if (!target) return;
  const current = document.querySelector(".auth-form.active");
  if (current !== target) {
    current?.classList.add("leaving-left");
    window.setTimeout(() => current?.classList.remove("leaving-left"), 320);
  }
  forms.forEach((form) => {
    const active = form === target;
    form.classList.toggle("active", active);
    form.setAttribute("aria-hidden", String(!active));
    if (!active) clearFormMessage(form);
  });

  const tabView = view === "reset" || view === "terms" ? (view === "terms" ? "register" : "login") : view;
  authCard.dataset.mode = view;
  tabs.forEach((tab) => {
    const active = tab.id === `${tabView}-tab`;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  if (focusSelector) window.setTimeout(() => target.querySelector(focusSelector)?.focus(), 60);
  else target.querySelector("input:not([type=checkbox])")?.focus({ preventScroll: true });
}

function clearFormMessage(form) {
  const message = form.querySelector(".form-message");
  if (message) {
    message.textContent = "";
    message.classList.remove("error");
  }
  form.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
  form.querySelectorAll(".field.invalid").forEach((field) => field.classList.remove("invalid"));
  form.querySelectorAll('input[aria-invalid="true"]').forEach((input) => input.removeAttribute("aria-invalid"));
}

function showFieldError(input, message) {
  const field = input.closest(".field");
  const error = field?.querySelector(".field-error");
  if (!field || !error) return;
  field.classList.add("invalid");
  input.setAttribute("aria-invalid", "true");
  error.textContent = message;
}

function clearFieldError(input) {
  const field = input.closest(".field");
  const error = field?.querySelector(".field-error");
  field?.classList.remove("invalid");
  input.removeAttribute("aria-invalid");
  if (error) error.textContent = "";
}

function showFormMessage(form, text, isError = false) {
  const message = form.querySelector(".form-message");
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function updateStrength(password) {
  const meter = document.querySelector("#password-strength");
  const label = meter.querySelector(".strength-label");
  if (!password) {
    meter.removeAttribute("data-strength");
    label.textContent = "Use 8+ characters with a mix of types";
    return;
  }
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  if (password.length < 8) score = Math.min(score, 1);
  meter.dataset.strength = String(score);
  label.textContent = ["Too short", "Getting started", "Fair", "Good", "Strong"][score];
}

function validateEmail(input) {
  const value = input.value.trim();
  if (!value) {
    showFieldError(input, "Please enter your email address.");
    return false;
  }
  if (!validEmail(value)) {
    showFieldError(input, "Enter a valid email address.");
    return false;
  }
  clearFieldError(input);
  return true;
}

function validateRequired(input, label) {
  if (!input.value.trim()) {
    showFieldError(input, `Please enter ${label}.`);
    return false;
  }
  clearFieldError(input);
  return true;
}

document.querySelector("#login-panel").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  clearFormMessage(form);
  const emailOk = validateEmail(form.elements.email);
  const passwordOk = validateRequired(form.elements.password, "your password");
  if (!emailOk || !passwordOk) {
    showFormMessage(form, "Check the highlighted fields and try again.", true);
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  showFormMessage(form, "Looks good! This frontend demo doesn’t sign you in or send your details.");
});

document.querySelector("#register-panel").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  clearFormMessage(form);
  const nameOk = validateRequired(form.elements.name, "your name");
  const emailOk = validateEmail(form.elements.email);
  const passwordOk = validateRequired(form.elements.password, "a password");
  const passwordLongEnough = form.elements.password.value.length >= 8;
  if (passwordOk && !passwordLongEnough) {
    showFieldError(form.elements.password, "Use at least 8 characters.");
  }
  const confirmOk = validateRequired(form.elements["confirm-password"], "your password again");
  if (confirmOk && form.elements["confirm-password"].value !== form.elements.password.value) {
    showFieldError(form.elements["confirm-password"], "Those passwords don’t match.");
  }
  const termsOk = form.elements["accept-terms"].checked;
  if (!termsOk) {
    form.elements["accept-terms"].focus();
    showFormMessage(form, "Please agree to the demo terms to continue.", true);
  }
  if (!nameOk || !emailOk || !passwordOk || !passwordLongEnough || !confirmOk
    || form.elements["confirm-password"].value !== form.elements.password.value || !termsOk) {
    if (termsOk) showFormMessage(form, "Check the highlighted fields and try again.", true);
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  showFormMessage(form, "You’re all set! This frontend demo doesn’t create or save an account.");
});

document.querySelector("#reset-panel").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  clearFormMessage(form);
  if (!validateEmail(form.elements.email)) {
    showFormMessage(form, "Enter a valid email address to preview the confirmation.", true);
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  showFormMessage(form, "If this were a real service, reset instructions would arrive by email. Nothing was sent.");
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;
    if (view === "terms") setView("terms");
    else setView(view);
  });
});

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setView(tab.id === "register-tab" ? "register" : "login"));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = tabs[(index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    setView(next.id === "register-tab" ? "register" : "login");
    next.focus();
  });
});

document.querySelectorAll(".visibility-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);
    const visible = input.type === "password";
    input.type = visible ? "text" : "password";
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute("aria-label", visible ? "Hide password" : "Show password");
    input.focus({ preventScroll: true });
  });
});

const registerPassword = document.querySelector("#register-password");
registerPassword.addEventListener("input", () => {
  updateStrength(registerPassword.value);
  if (registerPassword.getAttribute("aria-invalid") === "true" && registerPassword.value.length >= 8) {
    clearFieldError(registerPassword);
  }
  const confirm = document.querySelector("#register-confirm");
  if (confirm.value && confirm.getAttribute("aria-invalid") === "true" && confirm.value === registerPassword.value) {
    clearFieldError(confirm);
  }
});

document.querySelectorAll(".auth-form input").forEach((input) => {
  input.addEventListener("input", () => {
    const field = input.closest(".field");
    if (field?.classList.contains("invalid")) clearFieldError(input);
  });
  input.addEventListener("change", () => {
    if (input.type === "checkbox") {
      input.closest(".auth-form")?.querySelector(".form-message")?.classList.remove("error");
    }
  });
});

document.querySelector("#register-confirm").addEventListener("input", (event) => {
  const confirm = event.currentTarget;
  if (confirm.getAttribute("aria-invalid") === "true" && confirm.value === registerPassword.value) {
    clearFieldError(confirm);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const activePanel = document.querySelector(".auth-form.active");
    if (activePanel === panels.reset) setView("login");
    if (activePanel === panels.terms) setView("register");
  }
});

authCard.dataset.mode = "login";
tabs.forEach((tab, index) => {
  tab.tabIndex = index === 0 ? 0 : -1;
});
