const jobsContainer = document.querySelector("#jobs-container");
const jobModal = document.querySelector("#job-modal");
const jobForm = document.querySelector("#job-form");
const message = document.querySelector("#message");
const searchInput = document.querySelector("#search-input");
const statusFilter = document.querySelector("#status-filter");

const addJobButton = document.querySelector("#add-job-button");
const closeModalButton = document.querySelector("#close-modal");
const cancelButton = document.querySelector("#cancel-button");
const modalTitle = document.querySelector("#modal-title");

let editingJobId = null;

// Safely display text inside HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Show a message to the user
function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#ff9da9" : "#48d6ad";
}

// Open the form
function openModal(job = null) {
    jobForm.reset();
    editingJobId = job ? job.id : null;

    modalTitle.textContent = job ? "Edit application" : "Add application";

    if (job) {
        document.querySelector("#company").value = job.company;
        document.querySelector("#position").value = job.position;
        document.querySelector("#status").value = job.status;
        document.querySelector("#applied-date").value = job.applied_date || "";
        document.querySelector("#job-url").value = job.job_url || "";
        document.querySelector("#notes").value = job.notes || "";
    }

    jobModal.classList.remove("hidden");
}

// Close the form
function closeModal() {
    jobModal.classList.add("hidden");
    jobForm.reset();
    editingJobId = null;
}

addJobButton.addEventListener("click", () => openModal());
closeModalButton.addEventListener("click", closeModal);
cancelButton.addEventListener("click", closeModal);

// Retrieve dashboard statistics
async function loadStats() {
    try {
        const response = await fetch("/api/stats");

        if (!response.ok) {
            throw new Error("Unable to load statistics.");
        }

        const stats = await response.json();

        document.querySelector("#total-count").textContent = stats.total;
        document.querySelector("#applied-count").textContent = stats.applied;
        document.querySelector("#interview-count").textContent = stats.interviews;
        document.querySelector("#offer-count").textContent = stats.offers;
        document.querySelector("#rejected-count").textContent = stats.rejected;
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Retrieve and display applications
async function loadJobs() {
    try {
        const search = encodeURIComponent(searchInput.value.trim());
        const status = encodeURIComponent(statusFilter.value);

        const response = await fetch(
            `/api/jobs?search=${search}&status=${status}`
        );

        if (!response.ok) {
            throw new Error("Unable to load job applications.");
        }

        const jobs = await response.json();

        displayJobs(jobs);
        await loadStats();
    } catch (error) {
        showMessage(error.message, true);
        jobsContainer.innerHTML = `
            <p class="empty-state">Unable to connect to JobTrack.</p>
        `;
    }
}

// Display job application cards
function displayJobs(jobs) {
    if (jobs.length === 0) {
        jobsContainer.innerHTML = `
            <p class="empty-state">
                No applications found. Add your first job application!
            </p>
        `;
        return;
    }

    jobsContainer.innerHTML = jobs.map(job => `
        <article class="job-card">
            <span class="status status-${escapeHTML(job.status)}">
                ${escapeHTML(job.status)}
            </span>

            <h3>${escapeHTML(job.position)}</h3>
            <p class="company">${escapeHTML(job.company)}</p>

            <div class="details">
                <p>Applied: ${escapeHTML(job.applied_date || "Not specified")}</p>
                <p>Notes: ${escapeHTML(job.notes || "No notes")}</p>
                ${
                    job.job_url
                    ? `<p><a href="${escapeHTML(job.job_url)}" target="_blank" rel="noopener noreferrer">View job listing</a></p>`
                    : ""
                }
            </div>

            <div class="job-actions">
                <button class="edit-button" data-action="edit" data-id="${job.id}">
                    Edit
                </button>

                <button class="delete-button" data-action="delete" data-id="${job.id}">
                    Delete
                </button>
            </div>
        </article>
    `).join("");
}

// Add or update an application
jobForm.addEventListener("submit", async event => {
    event.preventDefault();

    const jobData = {
        company: document.querySelector("#company").value.trim(),
        position: document.querySelector("#position").value.trim(),
        status: document.querySelector("#status").value,
        applied_date: document.querySelector("#applied-date").value,
        job_url: document.querySelector("#job-url").value.trim(),
        notes: document.querySelector("#notes").value.trim()
    };

    const editing = editingJobId !== null;

    const url = editing
        ? `/api/jobs/${editingJobId}`
        : "/api/jobs";

    const method = editing ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jobData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to save application.");
        }

        closeModal();
        showMessage(editing ? "Application updated!" : "Application added!");
        await loadJobs();
    } catch (error) {
        showMessage(error.message, true);
    }
});

// Handle edit and delete buttons
jobsContainer.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "edit") {
        try {
            const response = await fetch("/api/jobs");
            const jobs = await response.json();
            const job = jobs.find(item => item.id === id);

            if (!job) {
                throw new Error("Application not found.");
            }

            openModal(job);
        } catch (error) {
            showMessage(error.message, true);
        }
    }

    if (action === "delete") {
        const confirmed = confirm(
            "Are you sure you want to delete this application?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/jobs/${id}`, {
                method: "DELETE"
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to delete application.");
            }

            showMessage("Application deleted successfully!");
            await loadJobs();
        } catch (error) {
            showMessage(error.message, true);
        }
    }
});

// Search and filter applications
let searchTimeout;

searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadJobs, 300);
});

statusFilter.addEventListener("change", loadJobs);

// Load applications when the page opens
loadJobs();