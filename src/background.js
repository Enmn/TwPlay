// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.message === 'contentScriptLoaded') {
        // Send a message to the content script to confirm that the background script has been loaded
        chrome.tabs.sendMessage(sender.tab.id, { message: 'backgroundScriptLoaded' });
    }
});