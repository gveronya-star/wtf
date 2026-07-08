/*
  TELEGRAM USERNAME: Replace YOUR_USERNAME below with the correct Telegram username.
  TEXT CONTENT: Button and popup messages can be edited in the strings below.
  ANIMATIONS: Popup timing and evasive-button movement are controlled in this file and style.css.
*/
const telegramLink = 'https://t.me/YOUR_USERNAME';

const eyes = document.querySelectorAll('.eye');
const catFace = document.getElementById('catFace');
const popupLayer = document.getElementById('popupLayer');
const primaryButton = document.getElementById('primaryButton');
const secondaryButton = document.getElementById('secondaryButton');
const buttonStage = document.querySelector('.button-stage');

let evasiveAttempts = 0;
let lastEvasiveMove = 0;
const evasiveWarnings = [
  'Are you sure?',
  'Linka is watching.',
  'This decision will be remembered.'
];

function showPopup(message, anchor, options = {}) {
  const popup = document.createElement('div');
  popup.className = `floating-popup ${options.tone || ''}`.trim();
  popup.innerHTML = message;
  popupLayer.appendChild(popup);

  const rect = anchor.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  const gap = options.gap ?? 16;
  const preferredTop = options.position === 'below'
    ? rect.bottom + gap
    : rect.top - popupRect.height - gap;
  const fallbackTop = rect.bottom + gap;
  const top = preferredTop < 12 ? fallbackTop : preferredTop;
  const left = rect.left + rect.width / 2 - popupRect.width / 2;

  popup.style.left = `${Math.min(Math.max(12, left), window.innerWidth - popupRect.width - 12)}px`;
  popup.style.top = `${Math.min(Math.max(12, top), window.innerHeight - popupRect.height - 12)}px`;

  window.setTimeout(() => popup.classList.add('is-visible'), 20);
  window.setTimeout(() => {
    popup.classList.remove('is-visible');
    popup.classList.add('is-leaving');
  }, options.duration || 2600);
  window.setTimeout(() => popup.remove(), (options.duration || 2600) + 420);
}

function showSecret(anchor = catFace) {
  showPopup('<strong>Secret information unlocked:</strong><br>Linka is actually the CEO of this operation.', anchor, {
    position: 'below',
    duration: 3200
  });
}

function trackPupils(event) {
  let shouldUnlockSecret = false;

  eyes.forEach((eye) => {
    const pupil = eye.querySelector('.pupil');
    const rect = eye.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;
    const distanceX = event.clientX - eyeCenterX;
    const distanceY = event.clientY - eyeCenterY;
    const angle = Math.atan2(distanceY, distanceX);
    const distance = Math.min(15, Math.hypot(distanceX, distanceY) / 16);

    pupil.style.transform = `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px))`;

    if (Math.hypot(distanceX, distanceY) < 165) {
      eye.classList.add('is-alert');
      shouldUnlockSecret = true;
    } else {
      eye.classList.remove('is-alert');
    }
  });

  if (shouldUnlockSecret && !catFace.dataset.secretRecentlyShown) {
    catFace.dataset.secretRecentlyShown = 'true';
    showSecret(catFace);
    window.setTimeout(() => delete catFace.dataset.secretRecentlyShown, 4200);
  }
}

function moveEvasiveButton(anchorEvent) {
  const now = Date.now();
  if (now - lastEvasiveMove < 280) return;
  lastEvasiveMove = now;

  evasiveAttempts += 1;
  const warning = evasiveWarnings[Math.min(evasiveAttempts - 1, evasiveWarnings.length - 1)];
  showPopup(warning, secondaryButton, { duration: 1900 });

  const stageRect = buttonStage.getBoundingClientRect();
  const buttonRect = secondaryButton.getBoundingClientRect();
  const padding = 8;
  const maxLeft = Math.max(padding, stageRect.width - buttonRect.width - padding);
  const maxTop = Math.max(padding, stageRect.height - buttonRect.height - padding);
  let nextLeft = Math.random() * (maxLeft - padding) + padding;
  let nextTop = Math.random() * (maxTop - padding) + padding;

  if (anchorEvent) {
    const cursorX = anchorEvent.clientX - stageRect.left;
    const cursorY = anchorEvent.clientY - stageRect.top;
    if (Math.hypot(nextLeft - cursorX, nextTop - cursorY) < 130) {
      nextLeft = cursorX < stageRect.width / 2 ? maxLeft : padding;
      nextTop = cursorY < stageRect.height / 2 ? maxTop : padding;
    }
  }

  secondaryButton.style.left = `${nextLeft}px`;
  secondaryButton.style.top = `${nextTop}px`;
}

function detectButtonApproach(event) {
  const rect = secondaryButton.getBoundingClientRect();
  const closestX = Math.max(rect.left, Math.min(event.clientX, rect.right));
  const closestY = Math.max(rect.top, Math.min(event.clientY, rect.bottom));
  const distance = Math.hypot(event.clientX - closestX, event.clientY - closestY);

  if (distance < 92) {
    moveEvasiveButton(event);
  }
}

primaryButton.addEventListener('click', () => {
  showPopup('Mission authorization approved.<br>Connecting to the Gift Officer...', primaryButton, {
    position: 'above',
    duration: 2100
  });
  setTimeout(() => {
    window.open(telegramLink, '_blank', 'noopener,noreferrer');
  }, 950);
});

secondaryButton.addEventListener('click', () => {
  showPopup('Mission aborted.<br><br>Linka has noticed your failure.<br><br>Consequences are currently being evaluated.', secondaryButton, {
    tone: 'danger',
    duration: 3600
  });
});

catFace.addEventListener('mouseenter', () => showSecret(catFace));
catFace.addEventListener('click', () => showSecret(catFace));
document.addEventListener('mousemove', trackPupils);
document.addEventListener('mousemove', detectButtonApproach);

window.addEventListener('resize', () => {
  secondaryButton.style.left = '';
  secondaryButton.style.top = '';
});
