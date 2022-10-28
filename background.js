let Dicts = [
  {
    name: "Longmang",
    urlOnlyEnglish: "https://www.ldoceonline.com/dictionary/",
  },
  {
    name: "Cambridge",
    urlOnlyEnglish: "https://dictionary.cambridge.org/us/dictionary/english/",
  },
  {
    name: "Google Images",
    urlOnlyEnglish: "https://www.google.com/search?tbm=isch&q=",
  },
];
let currentDictIndex = -1;

try {
  // On first install open onboarding to allow permissions.

  chrome.runtime.onInstalled.addListener((r) => {
    if (r.reason == "install") {
      //first install
      // show onboarding page
      chrome.tabs.create({
        url: "onboarding-page.html",
      });
    }
  });

  //ON page change
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    //chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) { // <-- can use to grab tabId if not within tabs listener...
    //const tabId = tabs[0].id; // set tabid

    // read changeInfo data and do something with it (like read the url)
    if (changeInfo.url) {
      //if have all_urls permissions...
      chrome.scripting.executeScript({
        files: ["contentScript.js"],
        target: { tabId: tabId },
      });
    }

    //}); // <-- close extra listener for tabid
  });

  //Fires when select omnibox for extension
  chrome.omnibox.onInputStarted.addListener(function () {
    //Set a default ...
    console.log("event started...");
    chrome.omnibox.setDefaultSuggestion({
      description:
        "Enter a word and select the dictionary (for example, <match>hello</match>)",
    });
  });

  //fires when select option and press enter
  chrome.omnibox.onInputEntered.addListener(function (text) {
    //Open selection into a new tab
    chrome.tabs.create({ url: text });
  });

  //fires when input changes e.g keyUp
  chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    //could send a request to my server to autofill resuts to add here....
    //{}

    // Add suggestions to an array
    var suggestions = [];
    //search Longman
    suggestions.push({
      deletable: true,
      content: "https://www.ldoceonline.com/dictionary/" + text,
      description: "(Search on Longman Dictionary) <match>" + text + "</match>",
    });
    //search Cambridge
    suggestions.push({
      deletable: true,
      content: "https://dictionary.cambridge.org/us/dictionary/english/" + text,
      description:
        "(Search on  Cambridge Dictionary) <match>" + text + "</match>",
    });
    // search Google imagenes.
    suggestions.push({
      deletable: true,
      content: "https://www.google.com/search?tbm=isch&q=" + text,
      description: "(Search on Google Images) <match>" + text + "</match>",
    });

    // Return  suggestions
    suggest(suggestions);
  });
} catch (e) {
  console.log(e);
}

chrome.action.onClicked.addListener(function (tab) {
  console.log("clicked");
  chrome.tabs.create({
    url: chrome.runtime.getURL("popup.html#window"),
    active: true,
  });
});

/// Commands and popup windows
let popupId;

chrome.commands.onCommand.addListener(async function (command) {
  console.log(`Command "${command}" triggered`);
  if (command === "openPopup") {
    if (popupId) {
      const [tab] = await chrome.tabs.query({
        windowId: popupId,
      });
      console.log("In if statement and tabs has", tab);
      let [currentWindows] = await chrome.tabs.query({
        currentWindow: true,
      });
      console.log("Current tab is", currentWindows);

      if (tab?.windowId != currentWindows?.windowId) {
        console.log("Not same tab");

        chrome.windows.update(popupId, {
          focused: true,
        });
      }

      if (tab) return;
    }
    //   chrome.windows
    //     .create({
    //       focused: true,
    //       url: "https://developer.chrome.com/docs/extensions/mv3/promises/",
    //       type: "popup",
    //       height: 600,
    //       width: 600,
    //     })
    //     .then((result) => {
    //       console.log("Logging result", result);
    //       popupId = result.id;
    //       return result;
    //     })
    //     .catch((error) => {
    //       console.log("Error", chrome.runtime.lastError);
    //     });

    const resultTab = await chrome.windows.create({
      focused: true,
      url: "https://developer.chrome.com/docs/extensions/mv3/promises/",
      type: "popup",
      height: 600,
      width: 600,
    });
    console.log("Logging result", resultTab);
    popupId = resultTab.id;
    tabAddDiv();
  }
  if (command === "nextDict") {
    await changeDict(true);
    const [tab1] = await chrome.tabs.query({
      windowId: popupId,
    });

    // setTimeout(async function () {
    //   await chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     func: addNavBar,
    //   });
    // }, 1000 * 0);

    // chrome.webNavigation.onDOMContentLoaded.addListener((tab) => {
    //   console.log("webNavigation Content Loaded");
    //   chrome.scripting.executeScript({
    //     target: { tabId: tab1.id },
    //     func: addNavBar,
    //   });
    // });

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
      if (changeInfo.status == "complete") {
        // Adding navbar

        chrome.scripting.executeScript({
          target: { tabId: tab1.id },
          func: addNavBar,
        });
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: removeHeader,
        });
      }
    });
  }
});

async function tabAddDiv() {
  const [tab] = await chrome.tabs.query({
    windowId: popupId,
  });

  console.log("The tab is ", tab);
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: addNavBar,
  });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: removeHeader,
  });
}

function addNavBar() {
  function bootStrapLoader() {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.crossOrigin = "anonymous";
    link.integrity =
      "sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi";

    link.href =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css";
    document.head.appendChild(link);
  }

  bootStrapLoader();
  const navBar = `
  <div class="myClass" style="z-index:99999999999">
  <nav class="navbar fixed-top bg-light">
    <div class="container-fluid">
      <form class="d-flex" role="search">
        <input
          class="form-control me-2"
          type="search"
          placeholder="Search"
          aria-label="Search"
        />
        <button class="btn btn-outline-success" type="submit">Search</button>
      </form>
    </div>
  </nav>
</div>
    `;
  document.body.insertAdjacentHTML("afterbegin", navBar);
  //   const el = document.createElement("div");
  //   el.style.cssText =
  //     "position:fixed; top:0; left:0; right:0; background:red; z-indez:99999999999";
  //   el.style.zIndex = "9999999999";
  //   el.textContent = "DIV";
  //   document.body.appendChild(el);
  //   console.log("Nav bar added.");
}

async function changeDict(way) {
  if (way) {
    if (Dicts.length > currentDictIndex + 1) {
      currentDictIndex++;
    } else {
      currentDictIndex;
    }
  } else {
    if (currentDictIndex != 0) {
      currentDictIndex--;
    }
  }
  let [currentWindows] = await chrome.tabs.query({
    currentWindow: true,
  });
  let url = Dicts[currentDictIndex].urlOnlyEnglish + "test";
  if (currentWindows?.windowId == popupId) {
    chrome.tabs.update(currentWindows.id, {
      url: url,
    });
  }
}

function removeHeader() {
  console.log("Removing header");
  [...document.getElementsByClassName("header")].map((n) => n && n.remove());
  document.getElementById("header").remove();
}
