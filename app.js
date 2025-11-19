const timelineSteps = [
  { key: 'Submitted', label: 'Submitted' },
  { key: 'Under Review', label: 'Under Review' },
  { key: 'Estimate Prepared', label: 'Estimate Prepared' },
  { key: 'Approved', label: 'Approved / Denied' },
  { key: 'Payment Sent', label: 'Payment Sent' }
];

const statusExplainers = {
  'Submitted': {
    now: 'We received your claim and created a file for our adjusters. We’re organizing the details you shared.',
    next: 'An adjuster will start reviewing everything you provided to make sure we have what we need.'
  },
  'Under Review': {
    now: 'Our team is reviewing your claim details and documents. This usually takes 1–3 business days. If we need more information, we’ll ask you below.',
    next: 'Next, we’ll create an estimate for the damage and share what we can cover.'
  },
  'Estimate Prepared': {
    now: 'We’ve prepared an estimate of the damage and are double-checking coverage details.',
    next: 'We’ll finalize a decision. You’ll see either “Approved” or “Denied” here next.'
  },
  'Approved': {
    now: 'Great news—your claim is approved. We’re setting up payment based on the approved amount.',
    next: 'We’ll send payment right after this. You’ll see “Payment Sent” once it’s on the way.'
  },
  'Denied': {
    now: 'We reviewed the details but couldn’t approve this claim. The denial letter includes the reason and next options.',
    next: 'If you have new information, reply with details in the questions box and we’ll re-open the conversation.'
  },
  'Payment Sent': {
    now: 'Payment is on its way. You should see it in your account within 1–3 business days.',
    next: 'No further steps are required. Keep this page for your records.'
  }
};

const claims = [
  {
    claimNumber: 'CLM-1024',
    customerLastName: 'Garcia',
    claimType: 'Auto',
    incidentDate: '2024-01-10',
    currentStatus: 'Under Review',
    statusHistory: ['Submitted', 'Under Review'],
    requiredDocuments: [
      { documentName: 'Accident photos', status: 'received' },
      { documentName: 'Police report', status: 'missing' },
      { documentName: 'Proof of insurance', status: 'received' }
    ],
    questions: [
      { text: 'Will my rental car be covered while you review?', timestamp: '2024-06-01T10:12:00Z' }
    ]
  },
  {
    claimNumber: 'CLM-2388',
    customerLastName: 'Lee',
    claimType: 'Home',
    incidentDate: '2023-12-02',
    currentStatus: 'Estimate Prepared',
    statusHistory: ['Submitted', 'Under Review', 'Estimate Prepared'],
    requiredDocuments: [
      { documentName: 'Photos of damage', status: 'received' },
      { documentName: 'Repair quotes', status: 'missing' }
    ],
    questions: []
  },
  {
    claimNumber: 'CLM-7781',
    customerLastName: 'Patel',
    claimType: 'Auto',
    incidentDate: '2024-02-18',
    currentStatus: 'Payment Sent',
    statusHistory: ['Submitted', 'Under Review', 'Estimate Prepared', 'Approved', 'Payment Sent'],
    requiredDocuments: [
      { documentName: 'Accident photos', status: 'received' },
      { documentName: 'Police report', status: 'received' },
      { documentName: 'Bank details for payment', status: 'received' }
    ],
    questions: [
      { text: 'Can I download the breakdown of the estimate?', timestamp: '2024-07-12T14:30:00Z' },
      { text: 'Will you notify me when payment clears?', timestamp: '2024-07-13T09:10:00Z' }
    ]
  }
];

const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

const lookupForm = document.getElementById('lookupForm');
const claimView = document.getElementById('claimView');
const lookupError = document.getElementById('lookupError');
const claimNumberInput = document.getElementById('claimNumber');
const lastNameInput = document.getElementById('lastName');
const timelineContainer = document.getElementById('timelineSteps');
const currentStatusLabel = document.getElementById('currentStatus');
const claimTypeLabel = document.getElementById('claimType');
const claimTitle = document.getElementById('claimTitle');
const incidentDateLabel = document.getElementById('incidentDate');
const currentStepTitle = document.getElementById('currentStepTitle');
const stepPill = document.getElementById('stepPill');
const currentStepDescription = document.getElementById('currentStepDescription');
const nextStepTitle = document.getElementById('nextStepTitle');
const nextStepDescription = document.getElementById('nextStepDescription');
const documentSummary = document.getElementById('documentSummary');
const documentList = document.getElementById('documentList');
const documentMessage = document.getElementById('documentMessage');
const questionForm = document.getElementById('questionForm');
const questionInput = document.getElementById('questionInput');
const questionsList = document.getElementById('questionsList');

let activeClaim = null;

function renderTimeline(currentStatus) {
  timelineContainer.innerHTML = '';
  const displayStatus = currentStatus === 'Denied' ? 'Approved' : currentStatus;
  const currentIndex = timelineSteps.findIndex((step) => step.key === displayStatus);

  timelineSteps.forEach((step, index) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'step';

    if (index < currentIndex) stepEl.classList.add('completed');
    if (index === currentIndex) stepEl.classList.add('active');

    const title = document.createElement('h4');
    title.textContent = step.label;

    const detail = document.createElement('p');
    if (step.key === 'Approved' && currentStatus === 'Denied') {
      detail.textContent = 'Outcome: Denied';
    } else if (step.key === 'Payment Sent' && currentStatus !== 'Payment Sent') {
      detail.textContent = 'Pending';
    } else {
      detail.textContent = index < currentIndex ? 'Done' : 'Upcoming';
    }

    stepEl.appendChild(title);
    stepEl.appendChild(detail);
    timelineContainer.appendChild(stepEl);
  });
}

function renderDocuments(claim) {
  documentList.innerHTML = '';
  const missingDocs = claim.requiredDocuments.filter((doc) => doc.status === 'missing');
  documentSummary.textContent = missingDocs.length === 0 ? 'All set' : `${missingDocs.length} item(s) needed`;
  documentSummary.style.color = missingDocs.length === 0 ? 'var(--emerald-600)' : 'var(--amber-500)';

  claim.requiredDocuments.forEach((doc) => {
    const li = document.createElement('li');
    li.className = 'document';

    const name = document.createElement('span');
    name.textContent = doc.documentName;

    const badge = document.createElement('span');
    badge.className = `badge ${doc.status}`;
    badge.textContent = doc.status === 'received' ? 'Received' : 'Missing';

    li.appendChild(name);
    li.appendChild(badge);
    documentList.appendChild(li);
  });

  documentMessage.textContent = missingDocs.length === 0
    ? 'You’ve provided everything we need right now. Thank you!'
    : 'We’re waiting on a few items from you. Upload or email them whenever you can.';
}

function renderQuestions(claim) {
  questionsList.innerHTML = '';
  if (claim.questions.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'No questions yet. Ask anything and we’ll respond by email or text.';
    questionsList.appendChild(empty);
    return;
  }

  claim.questions.forEach((q) => {
    const card = document.createElement('div');
    card.className = 'question';

    const time = document.createElement('time');
    time.textContent = new Date(q.timestamp || Date.now()).toLocaleString();

    const text = document.createElement('p');
    text.textContent = q.text;

    card.appendChild(time);
    card.appendChild(text);
    questionsList.appendChild(card);
  });
}

function renderClaim(claim) {
  activeClaim = claim;
  claimView.hidden = false;
  claimTypeLabel.textContent = `${claim.claimType} claim`;
  claimTitle.textContent = `Claim ${claim.claimNumber}`;
  incidentDateLabel.textContent = `Incident on ${formatDate(claim.incidentDate)}`;
  currentStatusLabel.textContent = claim.currentStatus;

  renderTimeline(claim.currentStatus);

  const explainer = statusExplainers[claim.currentStatus] || statusExplainers['Submitted'];
  currentStepTitle.textContent = claim.currentStatus;
  stepPill.textContent = claim.currentStatus;
  currentStepDescription.textContent = explainer.now;

  const next = getNextStep(claim.currentStatus);
  nextStepTitle.textContent = next.title;
  nextStepDescription.textContent = next.description;

  renderDocuments(claim);
  renderQuestions(claim);
}

function getNextStep(status) {
  if (status === 'Payment Sent') {
    return { title: 'All set', description: statusExplainers['Payment Sent'].next };
  }
  if (status === 'Denied') {
    return { title: 'Share more details', description: statusExplainers['Denied'].next };
  }
  const displayStatus = status === 'Denied' ? 'Approved' : status;
  const currentIndex = timelineSteps.findIndex((s) => s.key === displayStatus);
  const nextStep = timelineSteps[Math.min(currentIndex + 1, timelineSteps.length - 1)];
  const explainer = statusExplainers[nextStep.key];
  return { title: nextStep.label, description: explainer ? explainer.now : 'We’ll keep you posted on the next milestone.' };
}

lookupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const claimNumber = claimNumberInput.value.trim();
  const lastName = lastNameInput.value.trim().toLowerCase();

  const match = claims.find(
    (c) => c.claimNumber.toLowerCase() === claimNumber.toLowerCase() && c.customerLastName.toLowerCase() === lastName
  );

  if (!match) {
    lookupError.textContent = 'We couldn’t find a claim with that number and last name. Please check and try again.';
    claimView.hidden = true;
    return;
  }

  lookupError.textContent = '';
  renderClaim(match);
});

questionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!activeClaim) return;
  const text = questionInput.value.trim();
  if (!text) return;
  activeClaim.questions.unshift({ text, timestamp: new Date().toISOString() });
  questionInput.value = '';
  renderQuestions(activeClaim);
});

// Prefill for quick demos
claimNumberInput.value = 'CLM-1024';
lastNameInput.value = 'Garcia';
