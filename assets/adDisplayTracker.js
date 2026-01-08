function setupAdDisplayTracker(selector, options = {}) {
    // 默认选项
    const defaultOptions = {
        countdownTime: 1000, // 默认倒计时时间（毫秒）
        visibilityThreshold: 0.1, // 可见性阈值
        onDisplayComplete: null // 显示完成回调函数
    };
    
    const config = { ...defaultOptions, ...options };
    
    // 状态变量
    let timeoutId = null;
    let remainingTime = config.countdownTime;
    let startTimestamp = null;
    let intersectionObserver = null;
    let mutationObserver = null;
    let targetElement = null;
    
    // 清理函数
    function cleanup() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        if (intersectionObserver) {
            intersectionObserver.disconnect();
            intersectionObserver = null;
        }
        if (mutationObserver) {
            mutationObserver.disconnect();
            mutationObserver = null;
        }
    }
    
    // 开始倒计时
    function startCountdown(iframe) {
        startTimestamp = Date.now();
        timeoutId = setTimeout(() => {
            onCountdownEnd(iframe);
        }, remainingTime);
    }
    
    // 暂停倒计时
    function pauseCountdown() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
            if (startTimestamp) {
                remainingTime -= Date.now() - startTimestamp;
                startTimestamp = null;
            }
        }
    }
    
    // 倒计时结束处理
    function onCountdownEnd(iframe) {
        const adContainer = targetElement;
        if (adContainer) {
            const iframeSrc = iframe.getAttribute("src");
            if (iframeSrc) {
                // 触发广告显示跟踪事件
                if (window.ttq) {
                    window.ttq.track("ViewContent");
                }
                
                if (window.fbq) {
                    window.fbq('track', 'ViewContent');
                }
                
                // 如果有自定义回调，则调用
                if (typeof config.onDisplayComplete === 'function') {
                    config.onDisplayComplete({
                        adContainerId: adContainer.getAttribute("id"),
                        googleQueryId: iframe.getAttribute("data-google-query-id"),
                        adDisplayTime: Date.now(),
                        iframeSrc: iframeSrc
                    });
                }
            }
        }
        cleanup();
    }
    
    // 设置交叉观察器以监控可见性
    function setupIntersectionObserver(iframe) {
        intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    startCountdown(iframe);
                } else {
                    pauseCountdown();
                }
            });
        }, { threshold: config.visibilityThreshold });

        intersectionObserver.observe(iframe);
    }
    
    // 处理属性变化
    function handleMutation(mutationsList) {
        for (const mutation of mutationsList) {
            if (
                mutation.type === "attributes" &&
                mutation.attributeName === "data-ad-status"
            ) {
                const status = (mutation.target).getAttribute("data-ad-status");
                if (status === "filled") {
                    const iframe = targetElement.querySelector("iframe");
                    if (iframe) {
                        setupIntersectionObserver(iframe);
                    }
                    if (mutationObserver) {
                        mutationObserver.disconnect();
                    }
                }
                break;
            }
        }
    }
    
    // 初始化函数
    function initialize() {
        // 支持直接传入DOM元素或选择器字符串
        if (selector instanceof HTMLElement) {
            targetElement = selector;
        } else {
            targetElement = document.querySelector(selector);
            if (!targetElement) {
                console.warn(`Ad display tracker: Element with selector "${selector}" not found`);
                return null;
            }
        }
        
        // 检查元素当前是否已经有data-ad-status="filled"属性
        const currentStatus = targetElement.getAttribute("data-ad-status");
        if (currentStatus === "filled") {
            const iframe = targetElement.querySelector("iframe");
            if (iframe) {
                setupIntersectionObserver(iframe);
            }
        } else {
            // 设置MutationObserver来监控属性变化
            mutationObserver = new MutationObserver(handleMutation);
            mutationObserver.observe(targetElement, {
                attributes: true,
                attributeOldValue: true
            });
        }
        
        // 返回控制对象
        return {
            cleanup: cleanup,
            restart: () => {
                cleanup();
                initialize();
            }
        };
    }
    
    // 启动跟踪器
    return initialize();
}

// 初始化所有广告显示跟踪器
function initAllAdDisplayTrackers() {
    // 为页面上所有的adsbygoogle容器设置跟踪器
    const adContainers = document.querySelectorAll('.adsbygoogle');
    adContainers.forEach((container) => {
        // 优先使用ID作为选择器（如果存在）
        const id = container.getAttribute('id');
        const selector = id ? `#${id}` : container;
        setupAdDisplayTracker(selector);
    });
}

// 在DOM加载完成后初始化
if (typeof window !== 'undefined') {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAllAdDisplayTrackers);
    } else {
        initAllAdDisplayTrackers();
    }
}

// 导出主要函数以便在其他地方使用
if (typeof window !== 'undefined') {
    window.setupAdDisplayTracker = setupAdDisplayTracker;
    window.initAllAdDisplayTrackers = initAllAdDisplayTrackers;
}
