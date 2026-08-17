/**
 * Seed script for the LIMS application.
 * Creates 3 demo users and ~30 sample records across various statuses,
 * each with realistic audit log entries.
 *
 * This script seeds via the HTTP API, so it works with any database backend
 * (including in-memory MongoDB). The server must be running on PORT 5001.
 *
 * Usage: npm run seed  (while the server is running)
 */

const BASE = process.env.API_URL || 'http://localhost:5001/api';

// ── Demo users ──────────────────────────────────────────────────────────────

const USERS = [
  { name: 'Alice Chen', email: 'admin@lims.dev', password: 'admin123', role: 'admin' },
  { name: 'Bob Martinez', email: 'tech@lims.dev', password: 'tech1234', role: 'technician' },
  { name: 'Carol Park', email: 'viewer@lims.dev', password: 'view1234', role: 'viewer' },
];

// ── Sample definitions ──────────────────────────────────────────────────────

// 30 samples with pre-defined status pipelines to create realistic workflows
const SAMPLE_DEFS = [
  // 5 × received (just created, no transitions)
  { type: 'water', pipeline: ['received'] },
  { type: 'food', pipeline: ['received'] },
  { type: 'soil', pipeline: ['received'] },
  { type: 'water', pipeline: ['received'] },
  { type: 'food', pipeline: ['received'] },

  // 6 × in_progress (received → in_progress)
  { type: 'water', pipeline: ['received', 'in_progress'] },
  { type: 'soil', pipeline: ['received', 'in_progress'] },
  { type: 'food', pipeline: ['received', 'in_progress'] },
  { type: 'water', pipeline: ['received', 'in_progress'] },
  { type: 'soil', pipeline: ['received', 'in_progress'] },
  { type: 'food', pipeline: ['received', 'in_progress'] },

  // 5 × qc_review (received → in_progress → qc_review)
  { type: 'water', pipeline: ['received', 'in_progress', 'qc_review'] },
  { type: 'food', pipeline: ['received', 'in_progress', 'qc_review'] },
  { type: 'soil', pipeline: ['received', 'in_progress', 'qc_review'] },
  { type: 'water', pipeline: ['received', 'in_progress', 'qc_review'] },
  { type: 'food', pipeline: ['received', 'in_progress', 'qc_review'] },

  // 8 × completed (full pipeline)
  { type: 'water', pipeline: ['received', 'in_progress', 'qc_review', 'completed'] },
  { type: 'food', pipeline: ['received', 'in_progress', 'qc_review', 'completed'] },
  { type: 'soil', pipeline: ['received', 'in_progress', 'qc_review', 'completed'] },
  { type: 'water', pipeline: ['received', 'in_progress', 'qc_review', 'completed'] },
  { type: 'food', pipeline: ['received', 'in_progress', 'qc_review', 'completed'] },
  { type: 'soil', pipeline: ['received', 'in_progress', 'qc_review', 'completed'] },
  { type: 'water', pipeline: ['received', 'in_progress', 'qc_review', 'completed'] },
  { type: 'food', pipeline: ['received', 'in_progress', 'qc_review', 'completed'] },

  // 4 × rejected (at various stages)
  { type: 'soil', pipeline: ['received', 'rejected'] },
  { type: 'water', pipeline: ['received', 'in_progress', 'rejected'] },
  { type: 'food', pipeline: ['received', 'in_progress', 'qc_review', 'rejected'] },
  { type: 'soil', pipeline: ['received', 'rejected'] },

  // 2 more for variety
  { type: 'water', pipeline: ['received', 'in_progress', 'qc_review', 'completed'] },
  { type: 'soil', pipeline: ['received', 'in_progress'] },
];

// ── Notes templates ─────────────────────────────────────────────────────────

const NOTE_TEMPLATES = [
  'Sample received in good condition. Container sealed properly.',
  'Slight discoloration observed. Flagging for priority processing.',
  'Initial screening completed. Moving to detailed analysis.',
  'Temperature recorded at 4°C upon receipt. Within acceptable range.',
  'pH measured at 7.2 — within normal parameters.',
  'Turbidity higher than expected. Recommend re-sampling if inconclusive.',
  'Analysis complete. Results within expected ranges.',
  'QC check passed. Ready for final review.',
  'Calibration verified before analysis. All instruments within spec.',
  'Results reviewed and approved by lab supervisor.',
];

// ── Helper ──────────────────────────────────────────────────────────────────

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    // If user already exists, that's ok — just log in
    if (res.status === 409 && path.includes('register')) {
      return null; // signal to login instead
    }
    throw new Error(`${method} ${path} failed (${res.status}): ${data.error || JSON.stringify(data)}`);
  }
  return data;
}

// ── Main seed function ──────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 Starting LIMS seed...\n');

  // 1. Register users (or login if they already exist)
  const tokens = {};
  for (const u of USERS) {
    let result = await api('POST', '/auth/register', {
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
    });

    if (!result) {
      // User exists — login instead
      result = await api('POST', '/auth/login', {
        email: u.email,
        password: u.password,
      });
    }

    tokens[u.role] = result.token;
    console.log(`  ✓ ${u.role.padEnd(11)} — ${u.email} / ${u.password}`);
  }

  // Use admin token for creating samples
  const adminToken = tokens['admin'];
  const techToken = tokens['technician'];

  // 2. Create samples and transition them through their pipelines
  let created = 0;
  const statusCounts = {};

  for (const def of SAMPLE_DEFS) {
    // Create the sample
    const { sample } = await api('POST', '/samples', { type: def.type }, adminToken);
    created++;

    let currentVersion = sample.__v;
    let sampleId = sample._id;

    // Add a random note on some samples
    if (def.pipeline.length > 1 && Math.random() > 0.3) {
      const token = Math.random() > 0.5 ? adminToken : techToken;
      const noteResult = await api('POST', `/samples/${sampleId}/notes`, {
        text: randomElement(NOTE_TEMPLATES),
      }, token);
      // Note addition modifies __v (array push), so update version
      currentVersion = noteResult.sample.__v;
    }

    // Transition through the pipeline (skip 'received' since that's the initial state)
    for (let i = 1; i < def.pipeline.length; i++) {
      const newStatus = def.pipeline[i];
      const token = Math.random() > 0.5 ? adminToken : techToken;

      const result = await api('PATCH', `/samples/${sampleId}/status`, {
        status: newStatus,
        version: currentVersion,
      }, token);

      currentVersion = result.sample.__v;

      // Add another note after some transitions
      if (Math.random() > 0.6) {
        const noteResult = await api('POST', `/samples/${sampleId}/notes`, {
          text: randomElement(NOTE_TEMPLATES),
        }, token);
        currentVersion = noteResult.sample.__v;
      }
    }

    const finalStatus = def.pipeline[def.pipeline.length - 1];
    statusCounts[finalStatus] = (statusCounts[finalStatus] || 0) + 1;
  }

  console.log(`\n  ✓ Created ${created} samples with audit trails\n`);

  console.log('  📊 Sample distribution:');
  for (const [status, count] of Object.entries(statusCounts).sort()) {
    console.log(`     ${status}: ${count}`);
  }

  console.log('\n  🔐 Login credentials:');
  for (const u of USERS) {
    console.log(`     ${u.role.padEnd(11)} → ${u.email} / ${u.password}`);
  }

  console.log('\n✅ Seed complete!\n');
}

// ── Run ─────────────────────────────────────────────────────────────────────

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  console.error('   Make sure the server is running: npm run dev');
  process.exit(1);
});
