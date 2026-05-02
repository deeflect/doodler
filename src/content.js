const STORAGE_KEY = "handDrawnXEnabled";
const ROOT_CLASS = "hand-drawn-x";
const DISABLED_CLASS = "hand-drawn-x-disabled";
const SKETCH_CLASSES = [
  "hand-drawn-x-sketch-0",
  "hand-drawn-x-sketch-1",
  "hand-drawn-x-sketch-2",
  "hand-drawn-x-sketch-3",
  "hand-drawn-x-sketch-4",
  "hand-drawn-x-sketch-5"
];
const BORDER_SHAPES = [
  "polygon(1.2% 1.8%, 33% 0.8%, 66% 1.3%, 98.5% 1.1%, 99.1% 44%, 98.2% 98.3%, 62% 98.8%, 29% 98.4%, 1.3% 98.7%, 0.9% 50%)",
  "polygon(.9% 1.1%, 20% 2%, 37% .4%, 54% 1.2%, 71% 2%, 98.8% 1.7%, 98.9% 53%, 98.2% 98.1%, 42% 98.4%, 1.5% 98.1%, 1.3% 47%)",
  "polygon(1.6% 1.4%, 31% 1.9%, 48% .8%, 64% .2%, 98.4% 1.1%, 98.9% 50%, 98.8% 98.6%, 48% 98.2%, 1.2% 98.5%, 1.1% 51%)",
  "polygon(1.1% 2.2%, 35% 1.8%, 51% .6%, 98.7% 1.5%, 98.6% 56%, 97.9% 98.4%, 46% 98.6%, 1.7% 98.9%, 1% 48%)",
  "polygon(1.8% .9%, 31% .5%, 49% 1.4%, 98.2% 1.9%, 99.1% 52%, 98.8% 97.8%, 49% 99%, 1.1% 98.2%, 1.6% 43%)",
  "polygon(.8% 1.7%, 36% 2.1%, 53% .9%, 99% 1.2%, 98.7% 51%, 98.1% 98.8%, 47% 98.5%, 1.6% 98.3%, .7% 49%)"
];
const sketchAssignments = new WeakMap();

const NAV_MARKS = [
  { match: /\/home\b|^Home$/i, icon: "home", label: "Home" },
  { match: /\/explore\b|Search and explore|^Explore$/i, icon: "search", label: "Explore" },
  { match: /\/notifications\b|^Notifications$/i, icon: "bell", label: "Notifications" },
  { match: /\/i\/connect_people\b|^Follow$/i, icon: "follow", label: "Follow" },
  { match: /\/i\/chat\b|Direct Messages|^Messages$|^Chat$/i, icon: "message", label: "Chat" },
  { match: /\/i\/grok\b|^Grok$|^SuperGrok$/i, icon: "grok", label: "Grok" },
  { match: /\/i\/bookmarks\b|^Bookmarks$/i, icon: "bookmark", label: "Bookmarks" },
  { match: /\/i\/jf\/creators\/studio\b|^Creator Studio$/i, icon: "studio", label: "Creator Studio" },
  { match: /\/i\/premium_sign_up\b|^Premium$|^Premium\+$/i, icon: "premium", label: "Premium" },
  { match: /\/i\/articles\b|^Articles$/i, icon: "post", label: "Articles" },
  { match: /^Profile$|^\/[^/]+$/i, icon: "profile", label: "Profile" },
  { match: /more|^More menu items$/i, icon: "more", label: "More" }
];
const iconUrlCache = new Map();

function addClass(element, className) {
  if (!element.classList.contains(className)) {
    element.classList.add(className);
  }
}

function setStyleProperty(element, property, value) {
  if (element.style.getPropertyValue(property) !== value) {
    element.style.setProperty(property, value);
  }
}

function setDatasetValue(element, key, value) {
  if (element.dataset[key] !== value) {
    element.dataset[key] = value;
  }
}

function getIconUrl(icon) {
  if (!iconUrlCache.has(icon)) {
    iconUrlCache.set(icon, chrome.runtime.getURL(`assets/icons/${icon}.svg`));
  }

  return iconUrlCache.get(icon);
}

function setDoodleIcon(element, icon) {
  setStyleProperty(element, "--hdx-icon-url", `url("${getIconUrl(icon)}")`);
}

function applyEnabledState(isEnabled) {
  document.documentElement.classList.toggle(ROOT_CLASS, isEnabled);
  document.documentElement.classList.toggle(DISABLED_CLASS, !isEnabled);
  if (isEnabled) {
    decoratePage();
  }
}

function getNavMark(anchor) {
  const label = anchor.getAttribute("aria-label") || anchor.textContent || "";
  const href = anchor.getAttribute("href") || "";
  const candidate = `${href} ${label}`;
  return NAV_MARKS.find(({ match }) => match.test(href) || match.test(label) || match.test(candidate));
}

function decorateNavigation() {
  document.querySelectorAll('header[role="banner"] nav a, header[role="banner"] nav [role="link"]').forEach((item) => {
    const navItem = getNavMark(item);
    if (!navItem) {
      return;
    }

    setDoodleIcon(item, navItem.icon);
    setDatasetValue(item, "handDrawnLabel", navItem.label);
    addClass(item, "hand-drawn-x-nav-item");

    const svg = item.querySelector("svg");
    if (svg && svg.getAttribute("aria-hidden") !== "true") {
      svg.setAttribute("aria-hidden", "true");
    }
  });

  const moreButton = document.querySelector('header[role="banner"] [data-testid="AppTabBar_More_Menu"]');
  if (moreButton) {
    setDoodleIcon(moreButton, "more");
    setDatasetValue(moreButton, "handDrawnLabel", "More");
    addClass(moreButton, "hand-drawn-x-nav-item");
  }
}

function decorateActionIcons() {
  const iconTargets = [
    ['[data-testid="reply"]', "reply"],
    ['[data-testid="retweet"]', "repost"],
    ['[data-testid="like"]', "heart"],
    ['[data-testid="bookmark"]', "bookmark"],
    ['[data-testid="share"]', "share"],
    ['[aria-label="Share post"]', "share"],
    ['a[href$="/analytics"]', "views"],
    ['[aria-label="Add photos or video"]', "photo"],
    ['[aria-label="Add a GIF"]', "gif"],
    ['[aria-label="Add poll"]', "poll"],
    ['[aria-label="Add emoji"]', "emoji"],
    ['[aria-label="Schedule post"]', "schedule"]
  ];

  iconTargets.forEach(([selector, icon]) => {
    document.querySelectorAll(selector).forEach((item) => {
      setDoodleIcon(item, icon);
      addClass(item, "hand-drawn-x-icon-button");
    });
  });
}

function assignSketchVariant(element, salt = "") {
  if (!element) {
    return;
  }

  let sketchClass = sketchAssignments.get(element);
  if (!sketchClass) {
    const source =
      salt ||
      element.getAttribute("aria-label") ||
      element.getAttribute("data-testid") ||
      element.textContent ||
      element.tagName ||
      "surface";
    let hash = 0;

    for (let index = 0; index < source.length; index += 1) {
      hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
    }

    hash = (hash + Math.floor(Math.random() * SKETCH_CLASSES.length)) % SKETCH_CLASSES.length;
    sketchClass = SKETCH_CLASSES[hash];
    sketchAssignments.set(element, sketchClass);
  }

  const hasWrongSketchClass = SKETCH_CLASSES.some((className) => className !== sketchClass && element.classList.contains(className));
  if (!element.classList.contains(sketchClass) || hasWrongSketchClass) {
    element.classList.remove(...SKETCH_CLASSES);
    element.classList.add(sketchClass);
  }

  setStyleProperty(element, "--hdx-border-shape", BORDER_SHAPES[SKETCH_CLASSES.indexOf(sketchClass)]);
}

function decoratePanels() {
  document.querySelectorAll('article[data-testid="tweet"], [data-testid="sidebarColumn"] section').forEach((panel, index) => {
    addClass(panel, "hand-drawn-x-panel");
    assignSketchVariant(panel, `${index}-${panel.textContent.slice(0, 80)}`);
    setStyleProperty(panel, "--hdx-tilt", `${index % 2 === 0 ? "-0.12deg" : "0.1deg"}`);
  });

  document.querySelectorAll('[data-testid="sidebarColumn"] h1, [data-testid="sidebarColumn"] h2, [data-testid="sidebarColumn"] [role="heading"]').forEach((heading) => {
    const label = heading.textContent.trim();
    if (!/Today’s News|Today's News|Subscribe to Premium|Who to follow|What’s happening|What's happening/i.test(label)) {
      return;
    }

    const panel = findSidebarPanel(heading);
    if (panel) {
      addClass(panel, "hand-drawn-x-panel");
      assignSketchVariant(panel, label);
    }
  });
}

function decorateFloatingSurfaces() {
  document
    .querySelectorAll(
      '[role="menu"], [role="dialog"], [role="listbox"], [data-testid="HoverCard"], [data-testid="Dropdown"], [data-testid="toast"], [role="status"], [role="alert"], [aria-live="polite"], [aria-live="assertive"]'
    )
    .forEach((surface) => {
      if (surface.matches('[data-testid="Dropdown"]') && surface.closest('[role="menu"], [role="dialog"], [role="listbox"]')) {
        return;
      }

      const text = surface.textContent.trim();
      const isKnownFloatingSurface = surface.matches(
        '[role="menu"], [role="dialog"], [role="listbox"], [data-testid="HoverCard"], [data-testid="Dropdown"], [data-testid="toast"]'
      );
      const isPostedToast = /^posted$/i.test(text) || /\bposted\b/i.test(text);

      if (!isKnownFloatingSurface && !isPostedToast) {
        return;
      }

      addClass(surface, "hand-drawn-x-floating-surface");
      assignSketchVariant(surface, `${surface.getAttribute("role") || ""}-${surface.getAttribute("data-testid") || ""}-${text.slice(0, 80)}`);

      if (isPostedToast) {
        addClass(surface, "hand-drawn-x-posted-toast");
      }
    });
}

function findSidebarPanel(heading) {
  const headingRect = heading.getBoundingClientRect();
  let element = heading.parentElement;

  while (element && element !== document.body) {
    const rect = element.getBoundingClientRect();
    const isRightRailCard =
      rect.width >= 280 &&
      rect.width <= 430 &&
      rect.height >= 90 &&
      rect.height <= 720 &&
      rect.top <= headingRect.top + 16;

    if (isRightRailCard) {
      return element;
    }

    element = element.parentElement;
  }

  return null;
}

function decorateComposer() {
  document.querySelectorAll('[data-testid="tweetTextarea_0"], [contenteditable="true"][role="textbox"]').forEach((composer) => {
    if (!composer.dataset.handDrawnPlaceholder) {
      setDatasetValue(composer, "handDrawnPlaceholder", "true");
    }
  });
}

function decoratePage() {
  decorateNavigation();
  decorateActionIcons();
  decoratePanels();
  decorateFloatingSurfaces();
  decorateComposer();
}

function watchPage() {
  let isDecorateScheduled = false;

  function scheduleDecorate() {
    if (isDecorateScheduled) {
      return;
    }

    isDecorateScheduled = true;
    window.requestAnimationFrame(() => {
      isDecorateScheduled = false;
      if (document.documentElement.classList.contains(ROOT_CLASS)) {
        decoratePage();
      }
    });
  }

  const observer = new MutationObserver(() => {
    scheduleDecorate();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["aria-disabled"],
    childList: true,
    subtree: true
  });
}

chrome.storage.sync.get({ [STORAGE_KEY]: false }).then((values) => {
  applyEnabledState(Boolean(values[STORAGE_KEY]));
  watchPage();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync" || !changes[STORAGE_KEY]) {
    return;
  }

  applyEnabledState(Boolean(changes[STORAGE_KEY].newValue));
});
