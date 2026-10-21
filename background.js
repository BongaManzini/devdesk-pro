chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("SidePanel error:", error));
  
  chrome.storage.local.set({
    automationRunningState: false,
    unlockLoopActiveState: false,
    closedTicketsCount: 0
  });
  console.log("DevDesk Pro Engine Initialized.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SAVE_STEPS") {
    let saveObj = {};
    saveObj[message.targetKey || "savedMacroSteps"] = message.steps;
    chrome.storage.local.set(saveObj, () => sendResponse({ status: "SAVED" }));
    return true;
  }
});