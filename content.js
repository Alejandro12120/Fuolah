chrome.runtime.onMessage.addListener(message => {
    if (message.action === "getFileStatus") {
        // TODO: debug
        //console.log("File status requested!");

        const previewButton = document.querySelector("a[data_testid='open-document-preview-button']");
        if (!previewButton || !previewButton.href) return sendFileStatus(false); // If file not loaded return

        const identificator = previewButton.href.split("-").at(-1);

        if (!identificator) return sendFileStatus(false);

        sendFileStatus(true, identificator);
    }
});

function sendFileStatus(status, identificator = undefined) {
    chrome.runtime.sendMessage({ action: "changeFileStatus", status: status });

    if (status) {
        chrome.runtime.sendMessage({ 
            action: "downloadInfo", 
            fileId: identificator, 
            tokenCookie: Cookies.get("token"), 
            machineCookie: Cookies.get("segMachineId"), 
            referralCookie: Cookies.get("invitationCode") 
        });
    }
    // TODO: debug
    //console.log("Sending file status", status);
}