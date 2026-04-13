const newsletterSteps = [
  { day: 1, subject: "Manifesto" },
  { day: 2, subject: "Deep Research" },
  { day: 3, subject: "Maslow" },
];

function simulate(joinedAtStr) {
  const now = new Date();
  const createdAt = new Date(joinedAtStr);
  const diffTime = now.getTime() - createdAt.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const step = newsletterSteps.find((s) => s.day === diffDays);
  console.log(`Joined: ${joinedAtStr} | DiffDays: ${diffDays} | Step: ${step ? step.subject : 'None'}`);
}

const now = new Date();
const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000 + 1000)); // 24h 1s ago
const twoDaysAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000 + 1000)); // 48h 1s ago
const justNow = new Date(now.getTime() - (1 * 60 * 60 * 1000)); // 1h ago

console.log('--- Simulation Results ---');
simulate(yesterday.toISOString());
simulate(twoDaysAgo.toISOString());
simulate(justNow.toISOString());
