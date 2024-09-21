import { logger } from "./logger";

export const version = "0.1.0";

export async function getResource(url) {
  logger.log("redirecting to cobalt website for " + url + "...");

  return new Promise((resolve, reject) => {
    window.open("https://cobalt.tools/#" + url, "_blank");
    resolve(true);
  });
}

export function watchPage(callback) {
  let scheduled = false;

  const observerCallback = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        callback();
        scheduled = false;
      });
    }
  };

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        observerCallback();
        break;
      }
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
}
