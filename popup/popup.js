document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const jwtDisplay = document.getElementById('jwt-info');
    const jwtAlgorithm = document.getElementById('jwt-algorithm');
    const copyButton = document.getElementById('copy-btn');
    const copyMessage = document.getElementById('copy-message');
    const statusText = document.getElementById('status');

    // Set initial toggle state
    browser.storage.local.get("isActivated").then(result => {
        const isActivated = result.isActivated ?? false;
        toggleSwitch.checked = isActivated;
        updateStatus(isActivated);
    });

    // Listen for toggle changes
    toggleSwitch.addEventListener('change', () => {
        const isActivated = toggleSwitch.checked;
        
        // Update activation state in storage and send to background script
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            const activeTabId = tabs[0].id;

            browser.storage.local.set({ isActivated });
            browser.runtime.sendMessage({ command: "toggleDetection", isActivated, activeTabId });
            updateStatus(isActivated);
        });
    });

    // Get JWT and algorithm for the active tab
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        const activeTabId = tabs[0].id;

        // Request JWT details for this tab
        browser.runtime.sendMessage({ command: "getJWTForTab", tabId: activeTabId }).then((response) => {
            if (response.token) {
                // Display JWT and enable copy button
                jwtDisplay.textContent = response.token;
                jwtAlgorithm.textContent = response.algorithm ? `Algorithm: ${response.algorithm}` : "Algorithm: N/A";
                copyButton.disabled = false;
            } else {
                // No JWT detected
                jwtDisplay.textContent = "No JWT detected for this tab.";
                jwtAlgorithm.textContent = "Algorithm: N/A";
                copyButton.disabled = true;
            }
        });
    });

    // Copy JWT to clipboard and show confirmation message
    copyButton.addEventListener('click', () => {
        const textToCopy = jwtDisplay.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            showCopyMessage();
        }).catch(err => {
            console.error("Failed to copy JWT: ", err);
        });
    });
});

// Update status display based on activation state
function updateStatus(isActivated) {
    const status = document.getElementById("status");
    status.textContent = isActivated ? "Status: Active" : "Status: Inactive";
}

// Show confirmation message after copying JWT
function showCopyMessage() {
    const copyMessage = document.getElementById('copy-message');
    copyMessage.classList.add('show');

    setTimeout(() => {
        copyMessage.classList.remove('show');
    }, 2000);
}
