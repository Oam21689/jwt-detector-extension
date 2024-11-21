const jwtMap = {};
let isDetectionActive = false;

// Paths to icons
const icons = {
    off: "icons/red-icon.png",
    onNoToken: "icons/orange-icon.png",
    onWithToken: "icons/green-icon.png"
};

// Helper function to set the icon based on status
function updateIcon(status) {
    browser.browserAction.setIcon({ path: icons[status] });
}

// Helper function to decode JWT and get the algorithm type
function getJwtAlgorithm(token) {
    try {
        const header = JSON.parse(atob(token.split('.')[0])); // Decode JWT header
        return header.alg || 'Unknown';
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return 'Unknown';
    }
}

// Capture JWTs in Authorization headers
browser.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        if (!isDetectionActive) return; // Ignore if detection is off

        const tabId = details.tabId;
        if (tabId === -1) return; // Ignore non-tab requests

        for (let header of details.requestHeaders) {
            if (header.name.toLowerCase() === "authorization" && header.value.startsWith("Bearer ")) {
                const token = header.value.split(" ")[1];
                const algorithm = getJwtAlgorithm(token); // Extract algorithm

                // Store the token and algorithm in jwtMap for this tab
                jwtMap[tabId] = { token, algorithm };

                // Update the icon to green since a token is found for this tab
                updateIcon("onWithToken");

                // Notify the popup, if open, about the token update
                browser.runtime.sendMessage({ command: "updateJWT", token, algorithm, tabId });
                break;
            }
        }
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
);

// Handle tab changes to update the icon accordingly
function handleTabChange(tabId) {
    if (!isDetectionActive) {
        updateIcon("off");
    } else if (jwtMap[tabId]) {
        // Set to green if a JWT is found in the current tab
        updateIcon("onWithToken");
    } else {
        // Set to orange if detection is on but no JWT is detected
        updateIcon("onNoToken");
    }
}

// Listen for tab activation to update icon based on JWT presence
browser.tabs.onActivated.addListener((activeInfo) => {
    handleTabChange(activeInfo.tabId);
});

// Listen for tab updates (e.g., refresh) to re-check JWT status
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        handleTabChange(tabId);
    }
});

// Remove JWT from memory when a tab is closed
browser.tabs.onRemoved.addListener((tabId) => {
    delete jwtMap[tabId];
});

// Listen for messages from popup.js to toggle detection
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "toggleDetection") {
        isDetectionActive = message.isActivated;
        const activeTabId = message.activeTabId;

        // Update icon immediately based on current state for active tab
        handleTabChange(activeTabId);
    }
});

// Respond to requests from popup.js to get the JWT and algorithm for the active tab
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "getJWTForTab") {
        const tabId = message.tabId;
        const jwtData = jwtMap[tabId];
        
        sendResponse({
            token: jwtData ? jwtData.token : null,
            algorithm: jwtData ? jwtData.algorithm : null
        });
    }
});
