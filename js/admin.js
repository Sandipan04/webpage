let currentEditorMode = null;
let currentEditId = null;
let activeFormData = {};
let currentListItems = {}; // Stores lists for reordering

const formSchemas = {
  contacts: [
    { key: "type", label: "Type", type: "text" },
    { key: "icon", label: "Icon", type: "text" },
    { key: "label", label: "Label", type: "text" },
    { key: "url", label: "URL", type: "text" },
  ],
  skills: [
    { key: "category", label: "Category", type: "text" },
    {
      key: "items_json",
      label: "Skills",
      type: "list_generic",
      subFields: [
        { key: "label", label: "Name" },
        { key: "url", label: "URL (optional)" },
      ],
    },
  ],
  research: [
    { key: "title", label: "Title", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "text" },
    { key: "place", label: "Location", type: "text" },
    { key: "timeline", label: "Timeline", type: "text" },
    { key: "guide", label: "Guide", type: "text" },
    { key: "collaborators", label: "Collaborators", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "report_url", label: "Report File", type: "file" },
    { key: "slides_url", label: "Slides File", type: "file" },
    {
      key: "links_json",
      label: "Links",
      type: "list_generic",
      subFields: [
        { key: "name", label: "Text" },
        { key: "url", label: "URL" },
        { key: "icon", label: "Icon" },
      ],
    },
  ],
  qualifications: [
    { key: "institution", label: "Institution", type: "text" },
    { key: "program", label: "Program", type: "text" },
    { key: "timeline", label: "Timeline", type: "text" },
    { key: "overall_score", label: "Overall Score/CGPA", type: "text" },
    {
      key: "semesters_json",
      label: "Semesters & Courses",
      type: "list_semesters",
    },
  ],
  awards: [
    { key: "title", label: "Title", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "text" },
    { key: "date", label: "Date", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "link", label: "Link URL", type: "text" },
  ],
  achievements: [
    { key: "title", label: "Title", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "text" },
    { key: "date", label: "Date", type: "text" },
    {
      key: "scores_json",
      label: "Scores",
      type: "list_generic",
      subFields: [
        { key: "label", label: "Label" },
        { key: "value", label: "Value" },
      ],
    },
    { key: "asset_url", label: "Asset File", type: "file" },
  ],
  clubs: [
    { key: "name", label: "Club Name", type: "text" },
    {
      key: "roles_json",
      label: "Roles",
      type: "list_generic",
      subFields: [
        { key: "title", label: "Role" },
        { key: "timeline", label: "Timeline" },
      ],
    },
  ],
  club_activities: [
    { key: "club_name", label: "Parent Club Name", type: "text" },
    { key: "type", label: "Activity Type (e.g. Talk)", type: "text" },
    { key: "title", label: "Title", type: "text" },
    {
      key: "subtitle",
      label: "Subtitle/Event Name",
      type: "text",
    } /* <-- NEW FIELD */,
    { key: "date", label: "Date", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "assets_json", label: "Assets (Files)", type: "list_files" },
    {
      key: "links_json",
      label: "Links",
      type: "list_generic",
      subFields: [
        { key: "name", label: "Text" },
        { key: "url", label: "URL" },
      ],
    },
  ],
  volunteering: [
    { key: "event_name", label: "Event Name", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "text" },
    { key: "date", label: "Date", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "assets_json", label: "Assets (Files)", type: "list_files" },
    {
      key: "links_json",
      label: "Links",
      type: "list_generic",
      subFields: [
        { key: "name", label: "Text" },
        { key: "url", label: "URL" },
      ],
    },
  ],
  competitions: [
    { key: "title", label: "Title", type: "text" },
    { key: "date", label: "Date", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "placement", label: "Placement", type: "text" },
    { key: "link", label: "Link", type: "text" },
  ],
  lab: [
    { key: "title", label: "Title", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "text" },
    { key: "status", label: "Status", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "cover_image_url", label: "Cover Image", type: "image" },
    { key: "assets_json", label: "Assets (Files)", type: "list_files" },
    { key: "tags_json", label: "Tags", type: "list_tags" },
    {
      key: "links_json",
      label: "Links",
      type: "list_generic",
      subFields: [
        { key: "name", label: "Text" },
        { key: "url", label: "URL" },
        { key: "icon", label: "Icon" },
      ],
    },
  ],
  gallery: [
    { key: "canvas_id", label: "Canvas ID", type: "text" },
    { key: "title", label: "Album Title", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "images_json", label: "Gallery Images", type: "list_images" },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the interactive background from global.js
  if (typeof initBackground === "function") {
    initBackground();
  }

  if (sessionStorage.getItem("adminToken")) initDashboard();
  document.getElementById("login-btn").addEventListener("click", async () => {
    const password = document.getElementById("admin-password").value;
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/verify-admin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        sessionStorage.setItem("adminToken", password);
        initDashboard();
      } else document.getElementById("login-error").style.display = "block";
    } catch (e) {
      console.error(e);
    }
  });
  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.clear();
    location.reload();
  });
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".tab-btn, .tab-content")
        .forEach((el) => el.classList.remove("active"));
      e.currentTarget.classList.add("active");
      document
        .getElementById(e.currentTarget.getAttribute("data-tab"))
        .classList.add("active");
    });
  });
});

async function initDashboard() {
  document.getElementById("login-overlay").style.display = "none";
  document.getElementById("admin-dashboard").style.display = "flex";
  loadProfileData();
  Object.keys(formSchemas).forEach((table) =>
    loadListData(`/${table}`, `${table}-list`, table),
  );
}

async function adminFetch(endpoint, method = "GET", body = null) {
  const token = sessionStorage.getItem("adminToken");
  const options = { method, headers: { Authorization: `Bearer ${token}` } };
  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, options);
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

async function loadProfileData() {
  const p = await adminFetch("/profile");
  if (p) {
    document.getElementById("profile-name").value = p.name || "";
    document.getElementById("profile-tagline").value = p.tagline || "";
    document.getElementById("profile-image").value = p.profile_image_url || "";
    document.getElementById("profile-about").value = p.about_markdown || "";
  }
}
async function saveProfile() {
  const data = {
    name: document.getElementById("profile-name").value,
    tagline: document.getElementById("profile-tagline").value,
    profile_image_url: document.getElementById("profile-image").value,
    about_markdown: document.getElementById("profile-about").value,
  };
  await adminFetch("/update", "POST", {
    table: "site_profile",
    action: "update",
    id: 1,
    data,
  });
  alert("Profile saved!");
}

async function loadListData(endpoint, containerId, type) {
  const items = await adminFetch(endpoint);
  currentListItems[type] = items;

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = items
    .map(
      (item, index) => `
        <div class="list-item-wrapper">
            <div class="sort-controls">
                <button class="sort-btn" onclick="moveItem('${type}', ${index}, -1)" ${index === 0 ? 'disabled style="opacity:0.2"' : ""}><i class="fa-solid fa-chevron-up"></i></button>
                <button class="sort-btn" onclick="moveItem('${type}', ${index}, 1)" ${index === items.length - 1 ? 'disabled style="opacity:0.2"' : ""}><i class="fa-solid fa-chevron-down"></i></button>
            </div>
            <div class="item-info"><h4>${item.title || item.name || item.event_name || item.institution || item.category || item.type || "Item"}</h4></div>
            <div class="item-actions">
                <button class="action-btn" onclick='editItem("${type}", ${JSON.stringify(item).replace(/'/g, "&#39;")})'><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete" onclick="deleteItem('${type}', ${item.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `,
    )
    .join("");
}

async function moveItem(type, index, direction) {
  const items = currentListItems[type];
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return;

  // Swap sort_order
  let temp = items[index].sort_order || index;
  items[index].sort_order = items[targetIndex].sort_order || targetIndex;
  items[targetIndex].sort_order = temp;

  // Save to DB
  const payload = {
    table: type,
    items: [
      { id: items[index].id, sort_order: items[index].sort_order },
      { id: items[targetIndex].id, sort_order: items[targetIndex].sort_order },
    ],
  };
  await adminFetch("/reorder", "POST", payload);
  loadListData(`/${type}`, `${type}-list`, type);
}

function deleteItem(type, id) {
  if (confirm("Delete this?"))
    adminFetch("/update", "POST", { table: type, action: "delete", id }).then(
      () => loadListData(`/${type}`, `${type}-list`, type),
    );
}

function openEditor(type) {
  currentEditorMode = type;
  currentEditId = null;
  document.getElementById("editor-title").innerText = `New ${type}`;
  buildForm(type, {});
  document.getElementById("editor-modal").style.display = "flex";
}
function editItem(type, item) {
  currentEditorMode = type;
  currentEditId = item.id;
  document.getElementById("editor-title").innerText = `Edit ${type}`;
  buildForm(type, item);
  document.getElementById("editor-modal").style.display = "flex";
}

function buildForm(type, data) {
  activeFormData = JSON.parse(JSON.stringify(data));
  Object.keys(activeFormData).forEach((k) => {
    if (k.includes("json") && typeof activeFormData[k] === "string") {
      try {
        activeFormData[k] = JSON.parse(activeFormData[k] || "[]");
      } catch (e) {
        activeFormData[k] = [];
      }
    }
  });

  const formHTML = formSchemas[type]
    .map((f) => {
      let inputHTML = "";
      if (f.type.startsWith("list_")) {
        inputHTML = `<div id="container_${f.key}">${generateDynamicListHTML(f.key, f.type, f.subFields)}</div>`;
      } else if (f.type === "textarea") {
        inputHTML = `<textarea id="edit_${f.key}" class="admin-input" rows="4">${activeFormData[f.key] || ""}</textarea>`;
      } else if (f.type === "image" || f.type === "file") {
        const acceptAttr =
          f.type === "image" ? 'accept="image/*"' : 'accept="*"';
        const icon = f.type === "image" ? "fa-image" : "fa-file";
        inputHTML = `
            <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="edit_${f.key}" class="admin-input" value="${activeFormData[f.key] || ""}" style="flex: 1;">
                <button type="button" class="admin-btn" onclick="document.getElementById('file_${f.key}').click()" style="width: auto;"><i class="fa-solid fa-upload"></i></button>
                <input type="file" id="file_${f.key}" style="display: none;" ${acceptAttr} onchange="handleInlineUpload(this, 'edit_${f.key}')">
            </div>`;
      } else {
        inputHTML = `<input type="text" id="edit_${f.key}" class="admin-input" value="${activeFormData[f.key] || ""}">`;
      }
      return `<div class="form-group"><label>${f.label}</label>${inputHTML}</div>`;
    })
    .join("");

  document.getElementById("editor-form").innerHTML = formHTML;
}

// --- Dynamic List Generators ---
function generateDynamicListHTML(key, type, subFields) {
  let items = activeFormData[key] || [];
  if (!Array.isArray(items)) items = [];
  activeFormData[key] = items;

  let html = `<div class="dynamic-list" id="dyn_${key}">`;

  items.forEach((item, index) => {
    html += `<div class="dynamic-row" style="flex-direction: column;">`;

    if (type === "list_images" || type === "list_files") {
      html += `<div style="display:flex; gap:0.8rem; width: 100%;">`;
      if (type === "list_images")
        html += `<img src="${item.url || "https://placehold.net/60"}" class="dyn-thumb">`;
      html += `<div class="dyn-inputs">
                <input type="text" class="admin-input" placeholder="File URL" value="${item.url || ""}" onchange="window.updateDyn('${key}', ${index}, 'url', this.value)">
                <input type="text" class="admin-input" placeholder="Caption/Name" value="${item.caption || item.name || ""}" onchange="window.updateDyn('${key}', ${index}, '${type === "list_images" ? "caption" : "name"}', this.value)">
            </div>`;
      html += `<button type="button" class="action-btn delete" onclick="window.removeDyn('${key}', ${index})"><i class="fa-solid fa-xmark"></i></button></div>`;
    } else if (type === "list_tags") {
      const val = typeof item === "string" ? item : item.value || "";
      html += `<div style="display:flex; gap:0.8rem; width: 100%;"><div class="dyn-inputs"><input type="text" class="admin-input" placeholder="Tag Name" value="${val}" onchange="window.updateDyn('${key}', ${index}, null, this.value)"></div><button type="button" class="action-btn delete" onclick="window.removeDyn('${key}', ${index})"><i class="fa-solid fa-xmark"></i></button></div>`;
    } else if (type === "list_semesters") {
      html += `
                <div style="display:flex; gap:0.5rem; width:100%; align-items:center;">
                    <div style="display:flex; flex-direction:column; gap:0.2rem;">
                        <button type="button" class="sort-btn" onclick="window.moveDynItem('${key}', ${index}, -1)" ${index === 0 ? 'disabled style="opacity:0.2"' : ""}><i class="fa-solid fa-chevron-up"></i></button>
                        <button type="button" class="sort-btn" onclick="window.moveDynItem('${key}', ${index}, 1)" ${index === items.length - 1 ? 'disabled style="opacity:0.2"' : ""}><i class="fa-solid fa-chevron-down"></i></button>
                    </div>
                    <input type="text" class="admin-input" placeholder="Semester Name" value="${item.name || ""}" onchange="window.updateDyn('${key}', ${index}, 'name', this.value)">
                    <input type="text" class="admin-input" placeholder="Overall Score" value="${item.score || ""}" onchange="window.updateDyn('${key}', ${index}, 'score', this.value)">
                    <button type="button" class="action-btn delete" onclick="window.removeDyn('${key}', ${index})"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div style="margin: 0.5rem 0 0 2rem; padding-left: 1rem; border-left: 2px solid var(--card-border); width: calc(100% - 2rem);">
                    <h5 style="margin-bottom:0.5rem; color:var(--text-muted); font-size:0.8rem;">Courses</h5>`;
      const courses = item.courses || [];
      courses.forEach((c, cIdx) => {
        html += `<div class="semester-course-row">
                        <input type="text" class="admin-input" placeholder="Course Name" value="${c.name || ""}" onchange="window.updateCourse('${key}', ${index}, ${cIdx}, 'name', this.value)">
                        <input type="text" class="admin-input" placeholder="Grade/Score" value="${c.score || ""}" onchange="window.updateCourse('${key}', ${index}, ${cIdx}, 'score', this.value)">
                        <button type="button" class="action-btn delete" style="width:28px; height:28px;" onclick="window.removeCourse('${key}', ${index}, ${cIdx})"><i class="fa-solid fa-xmark"></i></button>
                    </div>`;
      });
      html += `<button type="button" class="admin-btn sm-btn" onclick="window.addCourse('${key}', ${index})">+ Add Course</button></div>`;
    } else {
      html += `<div style="display:flex; gap:0.8rem; width: 100%;"><div class="dyn-inputs">`;
      subFields.forEach((sf) => {
        html += `<input type="text" class="admin-input" placeholder="${sf.label}" value="${item[sf.key] || ""}" onchange="window.updateDyn('${key}', ${index}, '${sf.key}', this.value)">`;
      });
      html += `</div><button type="button" class="action-btn delete" onclick="window.removeDyn('${key}', ${index})"><i class="fa-solid fa-xmark"></i></button></div>`;
    }

    html += `</div>`;
  });

  if (type === "list_images" || type === "list_files") {
    const acceptAttr =
      type === "list_images" ? 'accept="image/*"' : 'accept="*"';
    html += `<div style="display:flex; align-items:center; gap: 1rem; margin-top: 0.5rem;">
                    <input type="file" id="file_${key}" multiple ${acceptAttr} style="display:none;" onchange="window.handleMultipleUpload(this, '${key}')">
                    <button type="button" class="admin-btn sm-btn" onclick="document.getElementById('file_${key}').click()"><i class="fa-solid fa-cloud-arrow-up"></i> Bulk Upload</button>
                    <span id="loader_${key}" style="color: var(--accent-cyan); font-size: 0.85rem; display: none;">Uploading...</span>
                 </div>`;
  } else {
    html += `<button type="button" class="admin-btn sm-btn" style="margin-top:0.5rem;" onclick="window.addDyn('${key}', '${type}')"><i class="fa-solid fa-plus"></i> Add Row</button>`;
  }
  html += `</div>`;
  return html;
}

window.updateDyn = function (key, index, field, value) {
  if (field === null) activeFormData[key][index] = value;
  else activeFormData[key][index][field] = value;
};
window.removeDyn = function (key, index) {
  activeFormData[key].splice(index, 1);
  rebuildDynamicList(key);
};
window.addDyn = function (key, type) {
  if (!activeFormData[key]) activeFormData[key] = [];
  if (type === "list_tags") activeFormData[key].push("");
  else activeFormData[key].push({});
  rebuildDynamicList(key);
};
window.moveDynItem = function (key, index, direction) {
  const items = activeFormData[key];
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return;

  // Swap items in memory
  let temp = items[index];
  items[index] = items[targetIndex];
  items[targetIndex] = temp;

  rebuildDynamicList(key);
};

// Nested Course Logic
window.updateCourse = function (key, semIndex, courseIndex, field, value) {
  activeFormData[key][semIndex].courses[courseIndex][field] = value;
};
window.removeCourse = function (key, semIndex, courseIndex) {
  activeFormData[key][semIndex].courses.splice(courseIndex, 1);
  rebuildDynamicList(key);
};
window.addCourse = function (key, semIndex) {
  if (!activeFormData[key][semIndex].courses)
    activeFormData[key][semIndex].courses = [];
  activeFormData[key][semIndex].courses.push({});
  rebuildDynamicList(key);
};

function rebuildDynamicList(key) {
  const fieldDef = formSchemas[currentEditorMode].find((x) => x.key === key);
  document.getElementById(`container_${key}`).innerHTML =
    generateDynamicListHTML(key, fieldDef.type, fieldDef.subFields);
}

function closeEditor() {
  document.getElementById("editor-modal").style.display = "none";
}

async function saveItem() {
  let payloadData = {};
  formSchemas[currentEditorMode].forEach((f) => {
    if (f.type.startsWith("list_")) {
      let finalArr = activeFormData[f.key] || [];
      if (f.type === "list_tags")
        finalArr = finalArr
          .map((v) => v.value || v)
          .filter((v) => v.trim() !== "");
      payloadData[f.key] = JSON.stringify(finalArr);
    } else {
      payloadData[f.key] = document.getElementById(`edit_${f.key}`).value;
    }
  });

  if (!currentEditId)
    payloadData.sort_order = currentListItems[currentEditorMode].length; // Put new items at bottom

  await adminFetch("/update", "POST", {
    table: currentEditorMode,
    action: currentEditId ? "update" : "insert",
    id: currentEditId,
    data: payloadData,
  });
  closeEditor();
  loadListData(
    `/${currentEditorMode}`,
    `${currentEditorMode}-list`,
    currentEditorMode,
  );
}

// --- R2 UPLOAD LOGIC ---
async function uploadFileToAPI(file) {
  const token = sessionStorage.getItem("adminToken");
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_CONFIG.BASE_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

async function handleInlineUpload(inputElement, targetInputId) {
  if (!inputElement.files.length) return;
  const targetInput = document.getElementById(targetInputId);
  const originalVal = targetInput.value;
  targetInput.value = "Uploading...";
  try {
    const result = await uploadFileToAPI(inputElement.files[0]);
    targetInput.value = result.url;
  } catch (e) {
    targetInput.value = originalVal;
    alert("Upload error.");
  }
  inputElement.value = "";
}

window.handleMultipleUpload = async function (inputElement, key) {
  if (!inputElement.files.length) return;
  if (!activeFormData[key]) activeFormData[key] = [];
  const loader = document.getElementById(`loader_${key}`);
  loader.style.display = "inline";

  for (let i = 0; i < inputElement.files.length; i++) {
    try {
      const result = await uploadFileToAPI(inputElement.files[i]);
      activeFormData[key].push({
        url: result.url,
        caption: "",
        name: inputElement.files[i].name,
      });
    } catch (e) {
      console.error("Failed to upload file", i);
    }
  }
  inputElement.value = "";
  loader.style.display = "none";
  rebuildDynamicList(key);
};

// --- COMMAND PALETTE LOGIC ---

const commands = [
  {
    name: "Go to Homepage Profile",
    icon: "fa-house",
    action: () => switchTab("tab-home"),
  },
  {
    name: "Go to Academics",
    icon: "fa-graduation-cap",
    action: () => switchTab("tab-academics"),
  },
  {
    name: "Go to Extracurriculars",
    icon: "fa-users",
    action: () => switchTab("tab-extra"),
  },
  {
    name: "Go to The Lab",
    icon: "fa-flask",
    action: () => switchTab("tab-lab"),
  },
  {
    name: "Go to Gallery",
    icon: "fa-image",
    action: () => switchTab("tab-gallery"),
  },
  {
    name: "New Lab Project",
    icon: "fa-plus",
    action: () => {
      switchTab("tab-lab");
      openEditor("lab");
    },
  },
  {
    name: "New Research Entry",
    icon: "fa-plus",
    action: () => {
      switchTab("tab-academics");
      openEditor("research");
    },
  },
  {
    name: "New Gallery Album",
    icon: "fa-plus",
    action: () => {
      switchTab("tab-gallery");
      openEditor("gallery");
    },
  },
  {
    name: "Logout",
    icon: "fa-right-from-bracket",
    action: () => document.getElementById("logout-btn").click(),
  },
];

let cmdSelectedIndex = 0;
let filteredCommands = [];

document.addEventListener("keydown", (e) => {
  // Trigger on Ctrl+K or Cmd+K
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    const palette = document.getElementById("cmd-palette");
    if (palette.style.display === "none") {
      palette.style.display = "flex";
      const input = document.getElementById("cmd-input");
      input.value = "";
      renderCommands("");
      setTimeout(() => input.focus(), 50);
    } else {
      palette.style.display = "none";
    }
  }

  const palette = document.getElementById("cmd-palette");
  if (palette.style.display === "flex") {
    if (e.key === "Escape") palette.style.display = "none";

    // Keyboard navigation
    if (e.key === "ArrowDown") {
      e.preventDefault();
      cmdSelectedIndex = (cmdSelectedIndex + 1) % filteredCommands.length;
      highlightCommand();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      cmdSelectedIndex =
        (cmdSelectedIndex - 1 + filteredCommands.length) %
        filteredCommands.length;
      highlightCommand();
    }
    if (e.key === "Enter" && filteredCommands[cmdSelectedIndex]) {
      e.preventDefault();
      palette.style.display = "none";
      filteredCommands[cmdSelectedIndex].action();
    }
  }
});

document.getElementById("cmd-input")?.addEventListener("input", (e) => {
  renderCommands(e.target.value);
});

function renderCommands(query) {
  const q = query.toLowerCase();
  filteredCommands = commands.filter((c) => c.name.toLowerCase().includes(q));
  cmdSelectedIndex = 0;

  const resultsDiv = document.getElementById("cmd-results");
  resultsDiv.innerHTML = filteredCommands
    .map(
      (c, index) => `
        <div class="cmd-item ${index === 0 ? "selected" : ""}" onclick="document.getElementById('cmd-palette').style.display='none'; commands.find(cmd => cmd.name === '${c.name}').action();">
            <i class="fa-solid ${c.icon}"></i>
            <span>${c.name}</span>
        </div>
    `,
    )
    .join("");
}

function highlightCommand() {
  const items = document.querySelectorAll(".cmd-item");
  items.forEach((item, index) => {
    if (index === cmdSelectedIndex) {
      item.classList.add("selected");
      item.scrollIntoView({ block: "nearest" });
    } else {
      item.classList.remove("selected");
    }
  });
}

function switchTab(tabId) {
  document
    .querySelectorAll(".tab-btn, .tab-content")
    .forEach((el) => el.classList.remove("active"));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");
}
