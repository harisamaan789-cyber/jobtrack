const express = require("express");
const path = require("path");
require("dotenv").config();

const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Allowed application statuses
const allowedStatuses = [
    "Applied",
    "Interview",
    "Offer",
    "Rejected"
];

// GET: Retrieve all applications
app.get("/api/jobs", (req, res) => {
    const { search, status } = req.query;

    let sql = "SELECT * FROM jobs WHERE 1 = 1";
    const params = [];

    if (search && search.trim()) {
        sql += " AND (company LIKE ? OR position LIKE ?)";
        params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (status && status !== "All") {
        sql += " AND status = ?";
        params.push(status);
    }

    sql += " ORDER BY id DESC";

    const jobs = db.prepare(sql).all(...params);
    res.json(jobs);
});

// GET: Dashboard statistics
app.get("/api/stats", (req, res) => {
    const total = db.prepare(
        "SELECT COUNT(*) AS count FROM jobs"
    ).get().count;

    const applied = db.prepare(
        "SELECT COUNT(*) AS count FROM jobs WHERE status = 'Applied'"
    ).get().count;

    const interviews = db.prepare(
        "SELECT COUNT(*) AS count FROM jobs WHERE status = 'Interview'"
    ).get().count;

    const offers = db.prepare(
        "SELECT COUNT(*) AS count FROM jobs WHERE status = 'Offer'"
    ).get().count;

    const rejected = db.prepare(
        "SELECT COUNT(*) AS count FROM jobs WHERE status = 'Rejected'"
    ).get().count;

    res.json({ total, applied, interviews, offers, rejected });
});

// POST: Create a new application
app.post("/api/jobs", (req, res) => {
    const {
        company,
        position,
        status,
        applied_date,
        job_url,
        notes
    } = req.body;

    if (
        typeof company !== "string" ||
        !company.trim() ||
        typeof position !== "string" ||
        !position.trim()
    ) {
        return res.status(400).json({
            error: "Company and position are required."
        });
    }

    const jobStatus = status || "Applied";

    if (!allowedStatuses.includes(jobStatus)) {
        return res.status(400).json({
            error: "Invalid application status."
        });
    }

    const result = db.prepare(`
        INSERT INTO jobs
        (company, position, status, applied_date, job_url, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        company.trim(),
        position.trim(),
        jobStatus,
        applied_date || null,
        job_url || null,
        notes || null
    );

    const newJob = db.prepare(
        "SELECT * FROM jobs WHERE id = ?"
    ).get(result.lastInsertRowid);

    res.status(201).json(newJob);
});

// PUT: Update an existing application
app.put("/api/jobs/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid job ID."
        });
    }

    const existingJob = db.prepare(
        "SELECT * FROM jobs WHERE id = ?"
    ).get(id);

    if (!existingJob) {
        return res.status(404).json({
            error: "Job application not found."
        });
    }

    const {
        company,
        position,
        status,
        applied_date,
        job_url,
        notes
    } = req.body;

    const updatedCompany = company ?? existingJob.company;
    const updatedPosition = position ?? existingJob.position;
    const updatedStatus = status ?? existingJob.status;

    if (
        typeof updatedCompany !== "string" ||
        !updatedCompany.trim() ||
        typeof updatedPosition !== "string" ||
        !updatedPosition.trim()
    ) {
        return res.status(400).json({
            error: "Company and position are required."
        });
    }

    if (!allowedStatuses.includes(updatedStatus)) {
        return res.status(400).json({
            error: "Invalid application status."
        });
    }

    db.prepare(`
        UPDATE jobs
        SET company = ?,
            position = ?,
            status = ?,
            applied_date = ?,
            job_url = ?,
            notes = ?
        WHERE id = ?
    `).run(
        updatedCompany.trim(),
        updatedPosition.trim(),
        updatedStatus,
        applied_date ?? existingJob.applied_date,
        job_url ?? existingJob.job_url,
        notes ?? existingJob.notes,
        id
    );

    const updatedJob = db.prepare(
        "SELECT * FROM jobs WHERE id = ?"
    ).get(id);

    res.json(updatedJob);
});

// DELETE: Remove an application
app.delete("/api/jobs/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid job ID."
        });
    }

    const result = db.prepare(
        "DELETE FROM jobs WHERE id = ?"
    ).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Job application not found."
        });
    }

    res.json({
        message: "Job application deleted successfully."
    });
});

// Handle unexpected errors
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({
        error: "Internal server error."
    });
});

app.listen(PORT, () => {
    console.log(`JobTrack server is running on port ${PORT}`);
});