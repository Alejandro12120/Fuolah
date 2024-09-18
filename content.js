chrome.runtime.onMessage.addListener(message => {
    if (message.action === "getFileStatus") {
        // TODO: debug
        //console.log("File status requested!");

        const parent = document.querySelector("div.css-ftq10c");

        if (!parent) return sendFileStatus(false); // If no parent found return

        let identificator;

        for (let i = 0; i < parent.childNodes.length; i++) {
            const file = parent.childNodes[i];

            if (!file.href) continue;
            if (!file.href.match(/(https:\/\/wuolah\.com\/apuntes\/)(?<=\/)(.*?)(?=\/).*/gm)) continue;

            try {
                identificator = file.href.split("-").at(-1);
                console.log(identificator)

                if (identificator) break;
            } catch (error) {
                continue;
            }
        }

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