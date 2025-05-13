// Buttons
const activeButton = document.getElementById("active");
const disableButton = document.getElementById("disable");
const downloadButton = document.getElementById("download");

const spinner = document.getElementById("spinner");


// Download
var isFile = false;
var fileId, tokenCookie, machineCookie, referralCookie;

chrome.runtime.onMessage.addListener(message => {
    if (message.action === "changeFileStatus") {
        // TODO: debug
        //console.log("New file status received");
        isFile = message.status;

        updateDownloadButton();
    } else if (message.action === "downloadInfo") {
        fileId = message.fileId;
        tokenCookie = message.tokenCookie;
        machineCookie = message.machineCookie;
        referralCookie = message.referralCookie;
    }
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];

    const isWuolah = /(https:\/\/)(wuolah\.com)\/.*/gm.test(activeTab.url);

    if (isWuolah) {
        // In wuolah

        // We get the current file status
        chrome.tabs.sendMessage(activeTab.id, { action: "getFileStatus" });
        // TODO: debug
        //console.log("Requesting file status");

        activeButton.classList.remove("hide");
        disableButton.classList.add("hide");

        downloadButton.classList.remove("hide");
        updateDownloadButton();
    } else {
        // Not in wuolah
        activeButton.classList.add("hide");
        disableButton.classList.remove("hide");

        downloadButton.classList.add("hide");
    }
});

function download() {
    console.log("clicking");
    console.log(fileId, tokenCookie, machineCookie, referralCookie);
    if (!fileId || !tokenCookie || !machineCookie) return;

    spinner.classList.remove("hide"); // We show a spinner
    downloadButton.classList.add("hide"); // We hide the button

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.wuolah.com/v2/download", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${tokenCookie}`);

    const jsonData = JSON.stringify({
        "adblockDetected": false,
        "ads": [],
        "fileId": parseInt(fileId),
        "machineId": machineCookie,
        "noAdsWithCoins": false,
        "referralCode": (referralCookie ? referralCookie : ""),
        "ubication17ExpectedPubs": 1,
        "ubication17RequestedPubs": 1,
        "ubication1ExpectedPubs": 1,
        "ubication1RequestedPubs": 1,
        "ubication2ExpectedPubs": 5,
        "ubication2RequestedPubs": 5,
        "ubication3ExpectedPubs": 15,
        "ubication3RequestedPubs": 15
    });

    xhr.onreadystatechange = function () {
        if (this.readyState != 4) return;
        // TODO: fire captcha check
        if (this.status === 429) return updateDownloadButton(true);

        if (this.status != 200) return;
        const response = JSON.parse(this.response);
        if (!response.url) return;

        // TODO: debug
        //console.log("Got url", response.url)

        chrome.tabs.create({ url: response.url });
        /* 
        Big L to Wuolah.
        
        Thanks to Taxalo for reversing the algorithm.
        (https://github.com/taxalo)
        */
       
        // I think this is unnecesarry
        spinner.classList.add("hide");
        downloadButton.classList.remove("hide");
    };

    xhr.send(jsonData);
    // TODO: debug
    //console.log("Downloading file", fileId)
}

function updateDownloadButton(error = false) {
    if (error) {
        downloadButton.classList.add("btn-error");
        downloadButton.classList.remove("hide");
        downloadButton.removeAttribute("onclick");

        spinner.classList.add("hide");
    } else if (isFile) {
        downloadButton.classList.remove("btn-disable");
        downloadButton.onclick = () => download();
    } else {
        downloadButton.classList.add("btn-disable");
        downloadButton.removeAttribute("onclick");

        spinner.classList.add("hide");
    }
}
