(() => {
  // src/common/constants/config-placeholder.constants.ts
  var IS_SUPPORTED_WEBSITE_API = "https://catalog-service-api.faircado.com/api/v1/supported-website";
  var WEB_APP_ADDRESS = "https://extension-v3-8.faircado.com";
  var EXTENSION_VERSION = "3.8.12";
  var MIXPANEL_TOKEN = "da4c2acce5534ed207f1112cdd4b3997";
  var AFTER_EXTENSION_INSTALL_URL = "https://faircado.com/after-extension-install-versioned?v=3-8";
  var AFTER_EXTENSION_INSTALL_URL_EXTENSION_TO_WEBSITE = "https://faircado.com/extension-to-website-onboarding";
  var SUPPORTED_WEBSITES_API = "https://cms-api.faircado.com/api/supported-websites/list";
  var IS_PRODUCT_PAGE_HEURISTIC_API = "https://cms-api.faircado.com/api/is-product-page-heuristic?populate=regexpsUrl&populate=keyphrasesOnPage&populate=keyphrasesOnPage.keyphrases&populate=elementsOnPage&populate=elementsOnPage.regexps&populate=regexpsIsOnPage&populate=stopKeyphrasesOnPage&populate=stopKeyphrasesOnPage.keyphrases";
  var EXTENSION_AB_TESTS_API = "https://cms-api.faircado.com/api/extension-ab-tests/list";
  var EXTENSION_CONFIG_API = "https://cms-api.faircado.com/api/extension-config";
  var IS_E2E_TESTS_ENV = "false";

  // src/common/constants/media-types.constants.ts
  var MediaTypes = {
    SearchPage: "search-page",
    SearchSelection: "search-selection",
    SearchImage: "search-image"
  };

  // src/common/utils/add-query-to-url.util.ts
  function addQueryToUrl(url, query) {
    const urlObj = new URL(url);
    Object.entries(query).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
    return urlObj.toString();
  }

  // src/background/constants/http-statuses.constants.ts
  var HTTP_STATUS = {
    OK: 200,
    NOT_FOUND: 404,
    NOT_MODIFIED: 304
  };

  // src/background/constants/mixpanel.constants.ts
  var MIXPANEL_URL = "https://api.mixpanel.com";

  // src/common/constants/storage-keys.constants.ts
  var STORAGE_KEY = {
    AUTH_KEY: "authKey",
    AUTH_VALUE: "authValue",
    MACHINE_KEY: "machineKey",
    SUPPORTED_WEBSITES_DATA: "supportedSitesData",
    IS_PRODUCT_PAGE_HEURISTICS_DATA: "isProductPageHeuristicsData",
    // cached data
    AB_TESTS_CACHED_CONFIG: "abTestsCachedConfig",
    // cached data
    EXTENSION_CACHED_CONFIG: "extensionCachedConfig",
    // cached data
    AB_TEST_VARIANT_RECORDS: "abTestVariantRecords",
    // assigned variant records
    ACTIVATED: "activated",
    USER_SETTINGS: "userSettings"
  };

  // src/common/constants/internal-message-types.constants.ts
  var InternalMessageTypes = {
    IsActivated: "isActivated",
    GetAbTestsConfig: "getAbTestsConfig",
    GetHeuristicData: "getHeuristicData",
    SetItemToSessionStorage: "setItemToSessionStorage",
    GetItemFromSessionStorage: "getItemFromSessionStorage",
    ClearDataFromSessionStorage: "clearDataFromSessionStorage",
    RemoveItemFromSessionStorage: "removeItemFromSessionStorage",
    GetMachineKey: "getMachineKey",
    GetExtensionConfig: "getExtensionConfig"
  };

  // src/common/utils/is-in-background-script.ts
  var checkIfInBackgroundScript = () => typeof browser !== "undefined" && !!browser.tabs || !!chrome.tabs;

  // src/common/utils/browser-storage.ts
  var setupStorageArea = (area) => {
    const hasChromeApi = typeof chrome !== "undefined";
    const hasBrowserApi = typeof browser !== "undefined";
    if (hasBrowserApi) {
      return browser.storage[area];
    } else if (hasChromeApi) {
      return chrome.storage[area];
    }
    throw new Error(`Storage area "${area}" not defined for the browser`);
  };
  var createStorage = (area) => {
    const storage2 = setupStorageArea(area);
    return {
      async setItem(items) {
        try {
          await storage2.set(items);
        } catch (e) {
          console.error(`Failed to set item in ${area} storage:`, e);
        }
      },
      async getItem(key) {
        try {
          const result = await storage2.get(key);
          const value = result[key];
          if (!value) {
            return undefined;
          }
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        } catch (e) {
          console.error(`Failed to get item from ${area} storage:`, e);
        }
        return undefined;
      },
      async removeItem(key) {
        try {
          await storage2.remove(key);
        } catch (e) {
          console.error(`Failed to remove item from ${area} storage:`, e);
        }
      },
      async clear() {
        try {
          await storage2.clear();
        } catch (e) {
          console.error(`Failed to clear ${area} storage:`, e);
        }
      }
    };
  };
  var createSessionStorage = () => {
    const sessionStorage2 = createStorage("session");
    const isBackground = checkIfInBackgroundScript();
    if (isBackground) {
      return sessionStorage2;
    }
    return {
      clear: () => chrome.runtime.sendMessage({ type: InternalMessageTypes.ClearDataFromSessionStorage }),
      getItem: (key) => chrome.runtime.sendMessage({ type: InternalMessageTypes.GetItemFromSessionStorage, key }),
      removeItem: (key) => chrome.runtime.sendMessage({ type: InternalMessageTypes.RemoveItemFromSessionStorage, key }),
      setItem: (items) => chrome.runtime.sendMessage({
        type: InternalMessageTypes.SetItemToSessionStorage,
        items
      })
    };
  };
  var storage = createStorage("local");
  var syncStorage = createStorage("sync");
  var sessionStorage = createSessionStorage();

  // src/common/utils/get-cached-api-data.ts
  async function getCachedApiData({
    storageKey,
    apiUrl,
    getDataFromResponse = (response) => response
  }) {
    try {
      const cachedData = await storage.getItem(storageKey);
      const cachingTimeMs = (cachedData?.data.cachingTimeMins ?? 0) * 60 * 1e3;
      const isCacheExpired = cachedData ? Date.now() - cachedData.fetchedAt > cachingTimeMs : true;
      if (cachedData?.data && !isCacheExpired) {
        return cachedData.data;
      }
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.error(`${getCachedApiData.name}: API response not ok`, response);
        return null;
      }
      const responseData = await response.json();
      const data = getDataFromResponse(responseData);
      if (!data) {
        console.error(`${getCachedApiData.name}: Data not found in response`);
        return null;
      }
      const newCachedData = {
        fetchedAt: Date.now(),
        data
      };
      await storage.setItem({
        [storageKey]: newCachedData
      });
      return data;
    } catch (error) {
      console.error(`${getCachedApiData.name}: Error fetching data`, error);
      return null;
    }
  }

  // src/background/heuristics/get-is-product-page-heuristics-data/get-is-product-page-heuristics-data.ts
  async function getIsProductPageHeuristicsData() {
    return getCachedApiData({
      storageKey: STORAGE_KEY.IS_PRODUCT_PAGE_HEURISTICS_DATA,
      apiUrl: IS_PRODUCT_PAGE_HEURISTIC_API,
      getDataFromResponse: (response) => response?.data?.attributes
    });
  }

  // src/common/utils/get-uuidv4-string.ts
  function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(
      /[018]/g,
      (c) => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
  }

  // src/common/utils/get-machine-key.ts
  async function getMachineKey() {
    const isBackground = checkIfInBackgroundScript();
    if (!isBackground) {
      return chrome.runtime.sendMessage({
        type: InternalMessageTypes.GetMachineKey
      });
    }
    if (typeof localStorage !== "undefined") {
      let machineKey = localStorage.getItem(STORAGE_KEY.MACHINE_KEY);
      if (null === machineKey) {
        machineKey = uuidv4();
        localStorage.setItem(STORAGE_KEY.MACHINE_KEY, machineKey);
      }
      return machineKey;
    } else {
      const machineKey = await syncStorage.getItem(STORAGE_KEY.MACHINE_KEY);
      if (typeof machineKey === "undefined") {
        const machineKey2 = uuidv4();
        await syncStorage.setItem({ machineKey: machineKey2 });
        return machineKey2;
      }
      return machineKey;
    }
  }

  // src/background/supported-websites/fetch-is-supported-website.ts
  async function fetchIsSupportedWebsite(url) {
    try {
      const data = { url };
      const machineKey = await getMachineKey();
      const response = await fetch(IS_SUPPORTED_WEBSITE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Machine-Key": machineKey
        },
        body: JSON.stringify(data)
      });
      const supportedSiteResponse = await response.json();
      return supportedSiteResponse;
    } catch (error) {
      console.error("Error fetching is supported website", error);
      return { isSupported: false };
    }
  }

  // src/background/supported-websites/retrieve-supported-sites-data.ts
  var INTERVAL_TO_CHECK_NEW_DATA_MIN = 15;
  async function retrieveSupportedSitesData() {
    const supportedSitesDataFromStorage = await getSupportedSitesDataFromStorage();
    if (supportedSitesDataFromStorage?.checkTime) {
      const shouldCheckIfSupportedSitesChanged = new Date(supportedSitesDataFromStorage.checkTime).getTime() < (/* @__PURE__ */ new Date()).getTime();
      if (shouldCheckIfSupportedSitesChanged) {
        return await updateSupportedSitesData();
      }
    }
    if (Array.isArray(supportedSitesDataFromStorage?.supportedSites)) {
      return {
        status: null,
        supportedSites: supportedSitesDataFromStorage.supportedSites
      };
    }
    return await updateSupportedSitesData();
  }
  async function getSupportedSitesDataFromStorage() {
    return storage.getItem(STORAGE_KEY.SUPPORTED_WEBSITES_DATA);
  }
  async function updateSupportedSitesData() {
    const options = {
      cache: "no-store"
    };
    try {
      const response = await fetch(SUPPORTED_WEBSITES_API, options);
      if (response.status === HTTP_STATUS.OK) {
        const supportedSites = await response.json();
        storeSupportedSitesData(supportedSites);
        return {
          status: response.status,
          supportedSites
        };
      }
      if (response.status === HTTP_STATUS.NOT_MODIFIED) {
        const supportedSitesDataFromStorage2 = await getSupportedSitesDataFromStorage();
        const withUpdatedCheckTime = {
          ...supportedSitesDataFromStorage2,
          checkTime: getSupportedSitesCheckTime()
        };
        await storage.setItem({
          [STORAGE_KEY.SUPPORTED_WEBSITES_DATA]: withUpdatedCheckTime
        });
        return {
          status: response.status,
          supportedSites: supportedSitesDataFromStorage2?.supportedSites
        };
      }
      if (response.status === HTTP_STATUS.NOT_FOUND) {
        return {
          status: response.status
        };
      }
      const supportedSitesDataFromStorage = await getSupportedSitesDataFromStorage();
      return {
        status: response.status,
        supportedSites: supportedSitesDataFromStorage?.supportedSites
      };
    } catch {
      const supportedSitesDataFromStorage = await getSupportedSitesDataFromStorage();
      return {
        status: null,
        supportedSites: supportedSitesDataFromStorage?.supportedSites
      };
    }
  }
  async function storeSupportedSitesData(supportedSites) {
    const supportedSitesData = {
      supportedSites,
      updateTime: (/* @__PURE__ */ new Date()).toISOString(),
      checkTime: getSupportedSitesCheckTime()
    };
    await storage.setItem({
      [STORAGE_KEY.SUPPORTED_WEBSITES_DATA]: supportedSitesData
    });
  }
  function getSupportedSitesCheckTime() {
    return addMillisecondsToDate(
      /* @__PURE__ */ new Date(),
      1e3 * 60 * INTERVAL_TO_CHECK_NEW_DATA_MIN
    ).toISOString();
  }
  function addMillisecondsToDate(date, milliseconds) {
    const newDate = new Date(date.getTime() + milliseconds);
    return newDate;
  }

  // src/common/utils/get-browser/get-browser.ts
  function getBrowser() {
    const userAgentString = navigator.userAgent;
    let browserName = "Other" /* Other */;
    if (userAgentString.indexOf("Edg") > -1) {
      browserName = "Edge" /* Edge */;
    } else if (userAgentString.indexOf("Chrome") > -1) {
      browserName = "Chrome" /* Chrome */;
    } else if (userAgentString.indexOf("Firefox") > -1) {
      browserName = "Firefox" /* Firefox */;
    } else if (userAgentString.indexOf("Safari") > -1) {
      browserName = "Safari" /* Safari */;
    } else if (userAgentString.indexOf("MSIE") > -1 || userAgentString.indexOf("rv:") > -1) {
      browserName = "IE" /* IE */;
    }
    return browserName;
  }

  // src/background/utils/track-event.ts
  function trackEvent(request) {
    mixpanelEventTrack(request);
  }
  async function mixpanelEventTrack(request) {
    const reqUrl = MIXPANEL_URL + "/track";
    const mixpanelData = request.data;
    mixpanelData.properties = {
      ...mixpanelData.properties,
      token: MIXPANEL_TOKEN,
      distinct_id: await getMachineKey(),
      browser: getBrowser(),
      time: Date.now(),
      $insert_id: Math.random()
    };
    fetch(reqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify([mixpanelData])
    }).catch((error) => {
      console.error("Error:", error);
    });
  }

  // src/data-control/open-data-control-page/open-data-control-page.ts
  var openDataControlPage = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("data-control.html") });
  };

  // src/background/utils/check-if-activated/check-if-activated.ts
  var checkIfActivated = () => {
    return localStorage?.getItem(STORAGE_KEY.ACTIVATED) === "1";
  };

  // src/background/utils/check-if-data-control-accepted/check-if-data-control-accepted.ts
  var checkIfDataControlAcceptedBackground = () => {
    const isFirefox = getBrowser() === "Firefox" /* Firefox */;
    if (!isFirefox) {
      return true;
    }
    return checkIfActivated();
  };

  // src/common/constants/message-types.constants.ts
  var messageTypes = {
    showExtension: "showExtension",
    closeExtension: "closeExtension",
    hasResult: "hasResult",
    noResult: "noResult",
    setAuth: "setAuth",
    clearAuth: "clearAuth",
    webAppReady: "webAppReady",
    embeddedAppReady: "embeddedAppReady",
    setFilter: "setFilter",
    init: "init",
    login: "login",
    logout: "logout",
    error: "error",
    iconMode: "iconMode",
    fullMode: "fullMode",
    openOnFullMode: "openOnFullMode",
    iconClicked: "iconClicked",
    isSupportedWebsite: "isSupportedWebsite",
    mixpanel: "mixpanel",
    colorScheme: "colorScheme",
    setDocumentBackgroundColor: "setDocumentBackgroundColor",
    toggleEmbeddedAccordion: "toggleEmbeddedAccordion",
    setToExtensionStorage: "setToExtensionStorage",
    initializeAppSettings: "initializeAppSettings",
    removeExtensionFromDOM: "removeExtensionFromDOM"
  };

  // src/background/ab-tests/fetch-ab-tests-data/fetch-ab-tests-data.ts
  async function fetchAbTestsConfig() {
    return getCachedApiData({
      storageKey: STORAGE_KEY.AB_TESTS_CACHED_CONFIG,
      apiUrl: EXTENSION_AB_TESTS_API
    });
  }

  // src/background/extension-config/fetch-extension-config-data/fetch-extension-config-data.ts
  async function fetchExtensionConfig() {
    return getCachedApiData({
      storageKey: STORAGE_KEY.EXTENSION_CACHED_CONFIG,
      apiUrl: EXTENSION_CONFIG_API
    });
  }

  // src/common/constants/ab-tests-names.constants.ts
  var AB_TEST_NAMES = {
    EXTENSION_TO_WEBSITE: "extension_to_website",
    AMAZON_VIEW: "amazon_view"
  };

  // src/common/utils/is-e2e-tests-env.ts
  var isE2eTestsEnv = () => {
    return IS_E2E_TESTS_ENV === "true";
  };

  // src/common/utils/get-ab-test-config.ts
  var getAbTestsConfig = async () => {
    const isInBackground = checkIfInBackgroundScript();
    return isInBackground ? await fetchAbTestsConfig() : chrome.runtime.sendMessage({
      type: InternalMessageTypes.GetAbTestsConfig
    });
  };

  // src/content/ab-test/ab-test.ts
  var assignVariant = (variants) => {
    const totalPercentage = variants.reduce((sum, variant) => sum + variant.percentage, 0);
    const randomValue = Math.random() * totalPercentage;
    let cumulativePercentage = 0;
    for (const variant of variants) {
      cumulativePercentage += variant.percentage;
      if (randomValue <= cumulativePercentage) {
        return variant.name;
      }
    }
    return variants[variants.length - 1].name;
  };
  var getAbTestByKey = async (testKey, onlyEnabled = true) => {
    const abTestsConfig = await getAbTestsConfig();
    return abTestsConfig?.tests.find(
      (abTest) => abTest.key === testKey && (!onlyEnabled || abTest.isEnabled)
    );
  };
  var setupAbTestVariants = async (testKey, assignedVariantsFromStorage) => {
    const assignedAbTestVariants = assignedVariantsFromStorage ? { ...assignedVariantsFromStorage } : await getAssignedAbTestVariants();
    const abTest = await getAbTestByKey(testKey);
    if (abTest && !assignedAbTestVariants[testKey]) {
      assignedAbTestVariants[testKey] = assignVariant(
        abTest.variants
      );
      await storage.setItem({
        [STORAGE_KEY.AB_TEST_VARIANT_RECORDS]: assignedAbTestVariants
      });
    }
    return assignedAbTestVariants;
  };
  var isVariantAssigned = async (testKey, variantName, shouldAssignIfMissing) => {
    const assignedVariantsFromStorage = await getAssignedAbTestVariants();
    if (assignedVariantsFromStorage[testKey]) {
      return assignedVariantsFromStorage[testKey] === variantName;
    }
    if (!shouldAssignIfMissing) {
      return false;
    }
    const assignedVariants = await setupAbTestVariants(testKey, assignedVariantsFromStorage);
    return assignedVariants[testKey] === variantName;
  };
  var getAssignedAbTestVariants = async () => {
    return await storage.getItem(STORAGE_KEY.AB_TEST_VARIANT_RECORDS) || {};
  };
  var isTestAndVariantEnabled = async (testKey, variantName, shouldAssignIfMissing) => {
    const abTest = await getAbTestByKey(testKey);
    if (!abTest) {
      return false;
    }
    const finalVariant = abTest.variants.find((variant) => variant.isFinal)?.name;
    if (finalVariant) {
      return finalVariant === variantName;
    }
    const isVariantAssignedResult = await isVariantAssigned(
      testKey,
      variantName,
      shouldAssignIfMissing
    );
    return isVariantAssignedResult;
  };

  // src/background/extension-lifecycle/after-extension-install/get-after-extension-install-url.ts
  var getAfterExtensionInstallUrl = async (machineKey) => {
    const extensionToWebsiteAbTest = await isTestAndVariantEnabled(
      AB_TEST_NAMES.EXTENSION_TO_WEBSITE,
      "enabled",
      false
    );
    return extensionToWebsiteAbTest ? AFTER_EXTENSION_INSTALL_URL_EXTENSION_TO_WEBSITE : addQueryToUrl(AFTER_EXTENSION_INSTALL_URL, {
      mk: machineKey
    });
  };

  // src/background/extension-lifecycle/after-extension-install/open-tab-after-extension-install.ts
  var openTabAfterExtensionInstall = async (machineKey) => {
    const afterExtensionInstallUrl = await getAfterExtensionInstallUrl(machineKey);
    if (getBrowser() === "Firefox") {
      chrome.tabs.create({ url: chrome.runtime.getURL("data-control.html") });
    } else {
      chrome.tabs.create({ url: afterExtensionInstallUrl });
    }
  };

  // src/background/extension-lifecycle/after-extension-install/run-after-extension-install.ts
  var runAfterExtensionInstall = async (machineKey) => {
    if (!isE2eTestsEnv()) {
      await setupAbTestVariants(AB_TEST_NAMES.EXTENSION_TO_WEBSITE);
    }
    trackEvent({
      data: {
        event: "extension_installed_background"
      }
    });
    await openTabAfterExtensionInstall(machineKey);
  };

  // src/background/index.ts
  var GREEN_ICON = {
    16: "./icons/green/icon-16.png",
    32: "./icons/green/icon-32.png",
    48: "./icons/green/icon-48.png",
    128: "./icons/green/icon-128.png"
  };
  var GREEN_SNOOZED_ICON = {
    16: "./icons/green-snoozed/icon-16.png",
    32: "./icons/green-snoozed/icon-32.png",
    48: "./icons/green-snoozed/icon-48.png",
    128: "./icons/green-snoozed/icon-128.png"
  };
  var WHITE_ICON = {
    16: "./icons/white/icon-16.png",
    32: "./icons/white/icon-32.png",
    48: "./icons/white/icon-48.png",
    128: "./icons/white/icon-128.png"
  };
  chrome.tabs.onActivated.addListener(function() {
    setPopupAction();
  });
  chrome.tabs.onUpdated.addListener(function() {
    setPopupAction();
  });
  (chrome.browserAction || chrome.action).onClicked.addListener(async function(tab) {
    const isDataControlAccepted = await checkIfDataControlAcceptedBackground();
    if (!isDataControlAccepted) {
      openDataControlPage();
      return;
    }
    setPopupAction();
    getAuthData().then((authData) => {
      chrome.tabs.sendMessage(tab.id, {
        type: messageTypes.showExtension,
        manualExtensionOpen: true,
        machineKey: authData.machineKey
      });
    });
  });
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.type) {
      case messageTypes.init:
        setIcon({
          path: GREEN_ICON
        });
        getAuthData().then((authData) => {
          sendResponse(authData);
        }).catch((e) => console.error({ e }));
        return true;
      case messageTypes.login:
        if (request.authKey && request.authValue) {
          storeAuthData(request.authKey, request.authValue);
          distributeAuthData(request.authKey, request.authValue);
        }
        break;
      case messageTypes.logout:
        clearAuthData();
        distributeLogout();
        break;
      case messageTypes.error:
        trackEvent({
          data: {
            event: request.detail,
            properties: {
              message: request.message,
              url: request.url
            }
          }
        });
        break;
      case messageTypes.mixpanel:
        trackEvent({
          data: {
            event: request.eventName,
            properties: {
              ...request.payload
            }
          }
        });
        break;
      case messageTypes.hasResult:
        if (!request.isSnoozed) {
          setIcon({
            path: GREEN_ICON
          });
        } else {
          setIcon({
            path: GREEN_SNOOZED_ICON
          });
        }
        break;
      case messageTypes.noResult:
        setIcon({
          path: WHITE_ICON
        });
        break;
      case messageTypes.isSupportedWebsite:
        retrieveSupportedSitesData().then(async (supportedSitesData) => {
          const shouldFallbackToSupportedWebsite = supportedSitesData.status !== null && supportedSitesData.status === HTTP_STATUS.NOT_FOUND;
          if (shouldFallbackToSupportedWebsite) {
            const supportedResponse = await fetchIsSupportedWebsite(request.url);
            sendResponse({
              ...supportedResponse,
              isEnabled: supportedResponse.isSupported
            });
            return;
          }
          const supportedSites = supportedSitesData.supportedSites || [];
          const websiteData = findSite(request.url, supportedSites);
          if (websiteData) {
            sendResponse({
              isSupported: true,
              parameters: websiteData.parameters,
              isEnabled: !!websiteData.is_enabled,
              isMetadataAllowed: !!websiteData.is_metadata_allowed
            });
            return;
          }
          sendResponse({ isSupported: false });
        });
        return true;
      case InternalMessageTypes.GetHeuristicData:
        getIsProductPageHeuristicsData().then(
          (heuristicData) => {
            sendResponse(heuristicData);
          }
        );
        return true;
      case InternalMessageTypes.IsActivated:
        sendResponse(checkIfActivated());
        return true;
      case InternalMessageTypes.GetAbTestsConfig:
        fetchAbTestsConfig().then((abTestsConfig) => {
          sendResponse(abTestsConfig);
        });
        return true;
      case InternalMessageTypes.GetExtensionConfig:
        fetchExtensionConfig().then((extensionConfig) => {
          sendResponse(extensionConfig);
        });
        return true;
      case InternalMessageTypes.SetItemToSessionStorage:
        if (typeof request.items === "object") {
          sessionStorage.setItem(request.items).then(sendResponse);
        }
        return true;
      case InternalMessageTypes.GetItemFromSessionStorage:
        if (typeof request.key === "string") {
          sessionStorage.getItem(request.key).then(sendResponse);
        }
        return true;
      case InternalMessageTypes.RemoveItemFromSessionStorage:
        if (typeof request.key === "string") {
          sessionStorage.removeItem(request.key).then(sendResponse);
        }
        return true;
      case InternalMessageTypes.ClearDataFromSessionStorage:
        sessionStorage.clear().then(sendResponse);
        return true;
      case InternalMessageTypes.GetMachineKey:
        getMachineKey().then(sendResponse);
        return true;
    }
  });
  chrome.contextMenus.onClicked.addListener(contextMenuItemClickHandler);
  function contextMenuItemClickHandler(info, tab) {
    switch (info.menuItemId) {
      case MediaTypes.SearchImage:
        getAuthData().then((authData) => {
          chrome.tabs.sendMessage(tab.id, {
            type: messageTypes.showExtension,
            machineKey: authData.machineKey,
            imageUrl: info.srcUrl,
            manualImageSearch: true,
            info
          });
        });
        break;
      default:
    }
  }
  chrome.runtime.onInstalled.addListener(async function(details) {
    const machineKey = await getMachineKey();
    chrome.runtime.setUninstallURL(
      addQueryToUrl(`${WEB_APP_ADDRESS}/uninstall`, {
        extensionVersion: EXTENSION_VERSION,
        mk: machineKey
      })
    );
    chrome.contextMenus.create({
      title: "Search this image on faircado",
      contexts: ["image"],
      id: MediaTypes.SearchImage
    });
    if (details.reason === "install") {
      await runAfterExtensionInstall(machineKey);
    } else if (details.reason === "update") {
      mixpanelUserProfile({
        data: [{ $set: { extension_updated_on: /* @__PURE__ */ new Date() } }]
      });
    }
  });
  chrome.runtime.onStartup.addListener(() => retrieveSupportedSitesData());
  function distributeAuthData(authKey, authValue) {
    chrome.tabs.query({}, (tabs) => {
      for (const index in tabs) {
        const tab = tabs[index];
        chrome.tabs.sendMessage(tab.id, {
          type: messageTypes.setAuth,
          authKey,
          authValue
        });
      }
    });
  }
  function distributeLogout() {
    chrome.tabs.query({}, (tabs) => {
      for (const index in tabs) {
        const tab = tabs[index];
        chrome.tabs.sendMessage(tab.id, { type: messageTypes.clearAuth });
      }
    });
  }
  function setIcon(icon) {
    (chrome.browserAction || chrome.action).setIcon(icon);
  }
  async function storeAuthData(authKey, authValue) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY.AUTH_KEY, authKey);
      localStorage.setItem(STORAGE_KEY.AUTH_VALUE, authValue);
    } else {
      await syncStorage.setItem({
        authKey,
        authValue
      });
    }
  }
  async function getAuthData() {
    if (typeof localStorage !== "undefined") {
      const machineKey = await getMachineKey();
      return new Promise((resolve) => {
        resolve({
          authKey: localStorage.getItem(STORAGE_KEY.AUTH_KEY),
          authValue: localStorage.getItem(STORAGE_KEY.AUTH_VALUE),
          machineKey
        });
      });
    } else {
      const [authKey, authValue, machineKey] = await Promise.all([
        syncStorage.getItem(STORAGE_KEY.AUTH_KEY),
        syncStorage.getItem(STORAGE_KEY.AUTH_VALUE),
        getMachineKey()
      ]);
      return { authKey, authValue: JSON.stringify(authValue), machineKey };
    }
  }
  async function clearAuthData() {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY.AUTH_KEY);
      localStorage.removeItem(STORAGE_KEY.AUTH_VALUE);
    } else {
      await syncStorage.removeItem([STORAGE_KEY.AUTH_KEY, STORAGE_KEY.AUTH_VALUE]);
    }
  }
  async function mixpanelUserProfile(request) {
    try {
      const machineKey = await getMachineKey();
      const reqUrl = MIXPANEL_URL + "/engage#profile-batch-update";
      const mixpanelData = request.data.map((i) => {
        i.$token = MIXPANEL_TOKEN;
        i.$distinct_id = machineKey;
        return i;
      });
      const response = await fetch(reqUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mixpanelData)
      });
      if (!response.ok) {
        throw new Error(
          `Failed to update mixpanel profile. Status text: '${response.statusText}'; Status: '${response.status}'`
        );
      }
      return response.json();
    } catch (error) {
      console.error("Error:", error);
    }
  }
  function browserTabs() {
    switch (getBrowser()) {
      case "Firefox":
        return browser.tabs;
      default:
        return chrome.tabs;
    }
  }
  function setPopupAction() {
    browserTabs().query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const url = tabs.length > 0 && tabs[0].url ? tabs[0].url : "";
      if (url !== "" && !url.startsWith("http")) {
        (chrome.browserAction || chrome.action).setPopup({ popup: "popup.html" });
      } else {
        (chrome.browserAction || chrome.action).setPopup({ popup: "" });
      }
    });
  }
  function getSiteName(url) {
    const domainName = url.replace(/http(s)?:\/\/|www\.|\/.*/g, "");
    return removeSubdomain(domainName).split(".")[0].toLowerCase();
  }
  function removeSubdomain(domainName) {
    const firstTLDs = "ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|be|bf|bg|bh|bi|bj|bm|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|cl|cm|cn|co|cr|cu|cv|cw|cx|cz|de|dj|dk|dm|do|dz|ec|ee|eg|es|et|eu|fi|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jo|jp|kg|ki|km|kn|kp|kr|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|na|nc|ne|nf|ng|nl|no|nr|nu|nz|om|pa|pe|pf|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|yt".split(
      "|"
    );
    const secondTLDs = "com|edu|gov|net|mil|org|nom|sch|caa|res|off|gob|int|tur|ip6|uri|urn|asn|act|nsw|qld|tas|vic|pro|biz|adm|adv|agr|arq|art|ato|bio|bmd|cim|cng|cnt|ecn|eco|emp|eng|esp|etc|eti|far|fnd|fot|fst|g12|ggf|imb|ind|inf|jor|jus|leg|lel|mat|med|mus|not|ntr|odo|ppg|psc|psi|qsl|rec|slg|srv|teo|tmp|trd|vet|zlg|web|ltd|sld|pol|fin|k12|lib|pri|aip|fie|eun|sci|prd|cci|pvt|mod|idv|rel|sex|gen|nic|abr|bas|cal|cam|emr|fvg|laz|lig|lom|mar|mol|pmn|pug|sar|sic|taa|tos|umb|vao|vda|ven|mie|\u5317\u6D77\u9053|\u548C\u6B4C\u5C71|\u795E\u5948\u5DDD|\u9E7F\u5150\u5CF6|ass|rep|tra|per|ngo|soc|grp|plc|its|air|and|bus|can|ddr|jfk|mad|nrw|nyc|ski|spy|tcm|ulm|usa|war|fhs|vgs|dep|eid|fet|fla|fl\xE5|gol|hof|hol|sel|vik|cri|iwi|ing|abo|fam|gok|gon|gop|gos|aid|atm|gsm|sos|elk|waw|est|aca|bar|cpa|jur|law|sec|plo|www|bir|cbg|jar|khv|msk|nov|nsk|ptz|rnd|spb|stv|tom|tsk|udm|vrn|cmw|kms|nkz|snz|pub|fhv|red|ens|nat|rns|rnu|bbs|tel|bel|kep|nhs|dni|fed|isa|nsn|gub|e12|tec|\u043E\u0440\u0433|\u043E\u0431\u0440|\u0443\u043F\u0440|alt|nis|jpn|mex|ath|iki|nid|gda|inc".split(
      "|"
    );
    const knownSubdomains = "suche|moebel|baumarkt|haushalt|elektronik|kleinanzeige|books|suchen|en|www|studio|mail|remote|blog|webmail|server|ns1|ns2|smtp|secure|vpn|m|shop|ftp|mail2|test|portal|ns|ww1|host|support|dev|web|bbs|ww42|squatter|mx|email|1|mail1|2|forum|owa|www2|gw|admin|store|mx1|cdn|api|exchange|app|gov|2tty|vps|govyty|hgfgdf|news|1rer|lkjkui";
    const knownSubdomainsRegExp = new RegExp(`^(${knownSubdomains})\\.`, "i");
    const s = domainName.replace(knownSubdomainsRegExp, "");
    const parts = s.split(".");
    while (parts.length > 3) {
      parts.shift();
    }
    if (parts.length === 3 && (parts[1].length > 2 && parts[2].length > 2 || secondTLDs.indexOf(parts[1]) === -1 && firstTLDs.indexOf(parts[2]) === -1)) {
      parts.shift();
    }
    return parts.join(".");
  }
  function findSite(url, supportedSites) {
    const siteName = getSiteName(url);
    const websiteData = supportedSites.find(
      (site) => site.website_name !== undefined && site.website_name === siteName
    );
    return websiteData;
  }
})();
