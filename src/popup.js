const STORAGE_KEY = "handDrawnXEnabled";
const enabledInput = document.querySelector("#enabled");

if (enabledInput) {
  chrome.storage.sync.get({ [STORAGE_KEY]: false }).then((values) => {
    enabledInput.checked = Boolean(values[STORAGE_KEY]);
  });

  enabledInput.addEventListener("change", () => {
    chrome.storage.sync.set({ [STORAGE_KEY]: enabledInput.checked });
  });
}
