(() => {
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

  // src/common/utils/get-uuidv4-string.ts
  function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(
      /[018]/g,
      (c) => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
  }

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

  // src/common/constants/ab-tests-names.constants.ts
  var AB_TEST_NAMES = {
    EXTENSION_TO_WEBSITE: "extension_to_website",
    AMAZON_VIEW: "amazon_view"
  };

  // src/common/constants/config-placeholder.constants.ts
  var AFTER_EXTENSION_INSTALL_URL = "https://faircado.com/after-extension-install-versioned?v=3-8";
  var AFTER_EXTENSION_INSTALL_URL_EXTENSION_TO_WEBSITE = "https://faircado.com/extension-to-website-onboarding";
  var EXTENSION_AB_TESTS_API = "https://cms-api.faircado.com/api/extension-ab-tests/list";

  // src/common/utils/add-query-to-url.util.ts
  function addQueryToUrl(url, query) {
    const urlObj = new URL(url);
    Object.entries(query).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
    return urlObj.toString();
  }

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

  // src/background/ab-tests/fetch-ab-tests-data/fetch-ab-tests-data.ts
  async function fetchAbTestsConfig() {
    return getCachedApiData({
      storageKey: STORAGE_KEY.AB_TESTS_CACHED_CONFIG,
      apiUrl: EXTENSION_AB_TESTS_API
    });
  }

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

  // src/data-control/index.ts
  document.getElementById("uninstallBtn")?.addEventListener("click", function() {
    browser.management.uninstallSelf({ showConfirmDialog: false });
  });
  document.getElementById("activateBtn")?.addEventListener("click", async function() {
    const machineKey = await getMachineKey();
    const afterExtensionInstallUrl = await getAfterExtensionInstallUrl(machineKey);
    localStorage.setItem(STORAGE_KEY.ACTIVATED, "1");
    window.location.href = afterExtensionInstallUrl;
  });
})();
