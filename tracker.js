(function () {
  const ZISTO_ENDPOINT =
    "https://zistogr.vercel.app/api/track";

  const ZISTO_PROJECT_KEY =
    "7b3738aa-b22a-40ff-8bfc-5d38b2e6b1f5";

  function createId(prefix) {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return `${prefix}_${crypto.randomUUID()}`;
    }

    return `${prefix}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
  }

  function getVisitorId() {
    const key = "zisto_visitor_id";

    try {
      let id = localStorage.getItem(key);

      if (!id) {
        id = createId("zv");
        localStorage.setItem(key, id);
      }

      return id;
    } catch {
      return createId("zv");
    }
  }

  function getSessionId() {
    const key = "zisto_session_id";

    try {
      let id = sessionStorage.getItem(key);

      if (!id) {
        id = createId("zs");
        sessionStorage.setItem(key, id);
      }

      return id;
    } catch {
      return createId("zs");
    }
  }

  function getDeviceType() {
    const userAgent =
      navigator.userAgent.toLowerCase();

    if (
      /ipad|tablet|playbook|silk/.test(
        userAgent,
      )
    ) {
      return "tablet";
    }

    if (
      /mobile|iphone|ipod|android/.test(
        userAgent,
      )
    ) {
      return "mobile";
    }

    return "desktop";
  }

  function getBrowser() {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Edg/")) {
      return "Edge";
    }

    if (
      userAgent.includes("Chrome/") &&
      !userAgent.includes("Edg/")
    ) {
      return "Chrome";
    }

    if (
      userAgent.includes("Safari/") &&
      !userAgent.includes("Chrome/")
    ) {
      return "Safari";
    }

    if (userAgent.includes("Firefox/")) {
      return "Firefox";
    }

    return "Other";
  }

  function getOperatingSystem() {
    const userAgent = navigator.userAgent;

    if (/iPhone|iPad|iPod/.test(userAgent)) {
      return "iOS";
    }

    if (/Android/.test(userAgent)) {
      return "Android";
    }

    if (/Macintosh|Mac OS X/.test(userAgent)) {
      return "macOS";
    }

    if (/Windows/.test(userAgent)) {
      return "Windows";
    }

    if (/Linux/.test(userAgent)) {
      return "Linux";
    }

    return "Other";
  }

  function getSource() {
    const params = new URLSearchParams(
      window.location.search,
    );

    return (
      params.get("source") ||
      params.get("utm_source") ||
      "direct"
    );
  }

  function trackEvent(
    eventType,
    metadata = {},
  ) {
    const params = new URLSearchParams(
      window.location.search,
    );

    const payload = {
      project_key: ZISTO_PROJECT_KEY,
      event_type: eventType,

      session_id: getSessionId(),
      visitor_id: getVisitorId(),

      page_url: window.location.href,
      page_path: window.location.pathname,
      referrer: document.referrer || null,

      device_type: getDeviceType(),
      browser: getBrowser(),
      operating_system:
        getOperatingSystem(),

      utm_source:
        params.get("utm_source"),

      utm_medium:
        params.get("utm_medium"),

      utm_campaign:
        params.get("utm_campaign"),

      utm_content:
        params.get("utm_content"),

      utm_term:
        params.get("utm_term"),

      metadata: {
        source: getSource(),
      
        card_token:
          params.get("card") ||
          params.get("card_id") ||
          null,
      
        language: navigator.language,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
      
        ...metadata,
      },
    };

    fetch(ZISTO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function (error) {
      console.warn(
        "Zisto tracking failed:",
        error,
      );
    });
  }

  function trackPageView() {
    const pageViewKey =
      `zisto_page_view:${window.location.href}`;

    try {
      if (
        sessionStorage.getItem(pageViewKey)
      ) {
        return;
      }

      sessionStorage.setItem(
        pageViewKey,
        "true",
      );
    } catch {
      // Συνεχίζουμε χωρίς storage.
    }

    trackEvent("page_view");
  }

  window.Zisto = {
    track: trackEvent,
  };

  trackPageView();
})();
