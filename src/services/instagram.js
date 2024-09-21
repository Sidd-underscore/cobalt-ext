import { logger } from "../common/logger";
import { getResource, watchPage } from "../common/utils";

logger.log("Instagram detected!");

const downloadIcon = (classNames) => {
  return `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-label="Download video with cobalt" class="${classNames}">
            <title>Download video with cobalt</title>
            <path d="M3 21C3 20.4477 3.44772 20 4 20H20C20.5523 20 21 20.4477 21 21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21Z" fill="white"/>
            <path d="M16.2071 11.7071C16.5976 11.3166 16.5976 10.6834 16.2071 10.2929C15.8166 9.90237 15.1834 9.90237 14.7929 10.2929L13 12.0858V13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13V12.0858L9.20711 10.2929C8.81658 9.90237 8.18342 9.90237 7.79289 10.2929C7.40237 10.6834 7.40237 11.3166 7.79289 11.7071L11.2929 15.2071C11.6834 15.5976 12.3166 15.5976 12.7071 15.2071L16.2071 11.7071Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C11.4477 2 11 2.44772 11 3V12.0858L12 13.0858L13 12.0858V3C13 2.44772 12.5523 2 12 2Z" fill="white"/>
            <path d="M11 13C11 13.5523 11.4477 14 12 14C12.5523 14 13 13.5523 13 13V12.0858L12 13.0858L11 12.0858V13Z" fill="white"/>
        </svg>
      `;
};

function findReelLink(button) {
  function findAnchor(parentElement) {
    if (!parentElement || parentElement === document) {
      return null;
    }

    const anchors = Array.from(parentElement.getElementsByTagName("a"));
    const reelLinkAnchor = anchors.find((a) => a.href.includes("liked_by"));
    if (reelLinkAnchor) {
      return reelLinkAnchor.href.replace("liked_by/", "");
    }

    return findAnchor(parentElement.parentElement);
  }

  return findAnchor(button.parentElement);
}

function addDownloadButton() {
  const muteButtonSelector = 'button[aria-label="Toggle audio"]';
  const muteButton = document.querySelectorAll(muteButtonSelector);

  muteButton.forEach((button) => {
    if (!button.parentElement.querySelector('[cobalt-ext="instagram"]')) {
      const reelId =
        window.location.href.includes("/reel/") ||
        window.location.href.includes("/p/")
          ? window.location.href
          : findReelLink(button);

      const downloadButton = document.createElement("button");
      downloadButton.classList.add(...button.classList);
      downloadButton.setAttribute("aria-label", "Download video with cobalt");
      downloadButton.setAttribute("type", "button");
      downloadButton.setAttribute("cobalt-ext", "instagram");

      const downloadButtonInner = document.createElement("div");
      downloadButtonInner.classList.add(
        ...button.querySelector("div").classList
      );

      downloadButtonInner.style.padding = "7px";

      const svgClassNames = button
        .querySelector("div")
        .querySelector("svg")
        .classList.toString();

      downloadButtonInner.innerHTML = downloadIcon(svgClassNames);

      downloadButton.appendChild(downloadButtonInner);

      downloadButton.addEventListener("click", (e) => {
        getResource(reelId);
      });

      button.parentElement.appendChild(downloadButton);
    }
  });
}

watchPage(addDownloadButton);