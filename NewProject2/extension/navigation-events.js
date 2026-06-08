(() => {
  // src/navigation-events/navigation-events.ts
  var originalPushState = history.pushState;
  var originalReplaceState = history.replaceState;
  function notify(type) {
    const config = {
      source: "faircado",
      type
    };
    window.postMessage(config, "*");
  }
  history.pushState = function(...args) {
    notify("pushStateFaircado");
    return originalPushState.apply(this, args);
  };
  history.replaceState = function(...args) {
    notify("replaceStateFaircado");
    return originalReplaceState.apply(this, args);
  };
  window.addEventListener("popstate", function() {
    notify("popstateFaircado");
  });
})();
