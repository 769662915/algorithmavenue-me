function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function collectAdData() {
    try {
        const activeElement = document.activeElement;
        if (!activeElement || activeElement.tagName !== "IFRAME") return null;

        const adContainer = activeElement.closest(".adsbygoogle");
        const iframeSrc = activeElement.getAttribute("src");
        if (adContainer && iframeSrc) {
            const formatIframeSrc = new URL(iframeSrc);
            const iframeSearchParams = new URLSearchParams(formatIframeSrc.search);
            return {
                adContainerId: adContainer.getAttribute("id"),
                googleQueryId: activeElement.getAttribute("data-google-query-id"),
                adClickTime: Date.now(),
                publisherId: iframeSearchParams.get("client"),
                adk: iframeSearchParams.get("adk"),
                adf: iframeSearchParams.get("adf"),
                slotname: iframeSearchParams.get("slotname"),
                adSize: iframeSearchParams.get("format")
            };
        }
        return null;
    } catch (error) {
        console.error("Error collecting ad data:", error);
        return null;
    }
}

function trackAdClick() {
    const adData = collectAdData();
    if (adData) {
        if (window.ttq) {
            window.ttq.track("ClickButton");
        }
        
        if (window.fbq) {
            window.fbq('track', 'ClickButton');
        }
    }
}

const debouncedTrackAdClick = debounce(trackAdClick, 500);

let isBlurTriggered = false;
let isBeforeUnloadHandled = false;

function handleBeforeUnload() {
    if (isBeforeUnloadHandled) return;
    const adData = collectAdData();
    if (adData) {
        if (window.ttq) {
            window.ttq.track("ClickButton");
        }
        
        if (window.fbq) {
            window.fbq('track', 'ClickButton');
        }
        
        isBeforeUnloadHandled = true;
    }
}

// 监听页面跳转（链接点击）并触发 clickbutton 事件
function handleLinkClick(event) {
    // 检查点击的目标是否为链接或包含在链接内
    const target = event.target;
    const link = target.closest('a');
    
    if (link && link.href) {
      try {
        // 阻止默认跳转行为
        event.preventDefault();
        
        // 收集所有需要执行的事件跟踪函数
        const trackingPromises = [];
        
        if (window.fbq) {
          trackingPromises.push(new Promise((resolve) => {
            try {
              window.fbq('track', 'ClickButton');
              resolve();
            } catch (error) {
              console.error("Error tracking fbq event:", error);
              resolve();
            }
          }));
        }
        
        Promise.all(trackingPromises)
          .then(() => {
            setTimeout(() => {
              window.location.href = link.href;
            }, 300);
          })
          .catch((error) => {
            console.error("Error in tracking promises:", error);
            window.location.href = link.href;
          });
      } catch (error) {
        console.error("Error processing link click:", error);
        window.location.href = link.href;
      }
    }
  }

function handleBlur() {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === "IFRAME") {
        isBlurTriggered = true;
        setTimeout(() => {
            isBlurTriggered = false;
        }, 300);
    }
}

function handleVisibilityChange() {
    if (document.visibilityState === "hidden" && isBlurTriggered) {
        debouncedTrackAdClick();
    }
}

function addEventListeners() {
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // 添加链接点击事件监听器
    document.addEventListener("click", handleLinkClick);
}

function removeEventListeners() {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.removeEventListener("blur", handleBlur);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    // 移除链接点击事件监听器
    document.removeEventListener("click", handleLinkClick);
}

function initAdTracker() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addEventListeners);
    } else {
        addEventListeners();
    }
}

if (typeof window !== 'undefined') {
    initAdTracker();
}