import { logger } from "../common/logger";
import { getResource, watchPage } from "../common/utils";

logger.log("Twitter detected!");

const downloadIcon = (classNames) => {
  return `
      <svg width="24" height="24" viewBox="0 0 428 428" fill="white" stroke="white" style="width:28px;height:28px;" class="${classNames}">
        <path d="M231 94.0805C231.044 86.3486 224.812 80.0447 217.08 80.0002C209.348 79.9558 203.044 86.1877 203 93.9195L231 94.0805ZM203 93.9195L202 267.92L230 268.08L231 94.0805L203 93.9195Z" />
        <path d="M156.841 207.962C151.342 202.527 142.478 202.579 137.043 208.078C131.607 213.577 131.659 222.442 137.159 227.877L156.841 207.962ZM137.159 227.877L216.159 305.957L235.841 286.043L156.841 207.962L137.159 227.877Z" />
        <path d="M295.779 227.939C301.312 222.538 301.42 213.674 296.019 208.141C290.618 202.608 281.755 202.5 276.221 207.901L295.779 227.939ZM276.221 207.901L196.221 285.981L215.779 306.019L295.779 227.939L276.221 207.901Z" />
        <path d="M295.779 227.939C301.312 222.538 301.42 213.674 296.019 208.141C290.618 202.608 281.755 202.5 276.221 207.901L295.779 227.939ZM276.221 207.901L196.221 285.981L215.779 306.019L295.779 227.939L276.221 207.901Z" />
        <path d="M105 288.92V332.92" stroke-width="28" stroke-linecap="round"/>
        <path d="M105 288.92V332.92" stroke-width="28" stroke-linecap="round"/>
        <path d="M105 288.92V332.92" stroke-width="28" stroke-linecap="round"/>
        <path d="M105 288.92V332.92" stroke-width="28" stroke-linecap="round"/>
        <path d="M105 288.92V332.92" stroke-width="28" stroke-linecap="round"/>
        <path d="M105 288.92V332.92" stroke-width="28" stroke-linecap="round"/>
        <path d="M324 288.92V332.92" stroke-width="28" stroke-linecap="round"/>
        <path d="M324 288.92V332.92" stroke-width="28" stroke-linecap="round"/>
        <path d="M324 288.92V332.92" stroke-width="28" stroke-linecap="round"/>
        <path d="M324 288.92V332.92" stroke-width="28" stroke-linecap="round"/>
        <path d="M324 288.92V332.92" stroke-width="28" stroke-linecap="round"/>
        <path d="M324 288.92V332.92" stroke-width="28" stroke-linecap="round"/>
        <path d="M105 333.92H324" stroke-width="28" stroke-linecap="round"/>
      </svg>
    `;
};

// You have to use the timestamp of the tweet to get the URL of the tweet for some reason
function findHomePageTweetURL(button) {
  function findTheURL(parentElement) {
    if (!parentElement || parentElement === document) {
      return null;
    }

    const timeElements = Array.from(parentElement.getElementsByTagName("time"));

    const timeElement = timeElements.find((time) =>
      time.parentElement.href?.includes("/status/")
    );
    if (timeElement) {
      return timeElement.parentElement.href;
    }

    return findTheURL(parentElement.parentElement);
  }

  return findTheURL(button.parentElement);
}

// There's a little span element inside every quote tweet that says "Quote"
function isTweetAQuoteTweet(button) {
  function findTheURL(parentElement) {
    if (!parentElement || parentElement === document) {
      return null;
    }

    // the highest tag in an individual tweet (even a quote tweet) is an article tag
    if (parentElement.tagName === "ARTICLE") {
      return null;
    }

    const spanElements = Array.from(parentElement.getElementsByTagName("span"));

    const spanElement = spanElements.find((span) => span.innerText === "Quote");
    if (spanElement) {
      return true;
    }

    return findTheURL(parentElement.parentElement);
  }

  return findTheURL(button.parentElement);
}

function addDownloadButton() {
  const templateButtons = document.querySelectorAll("button[aria-label=\"Video Settings\"]");

  templateButtons.forEach((button) => {
    const templateButton = button.parentElement.parentElement;

    if (!templateButton.parentElement.querySelector('[cobalt-ext="twitter"]')) {
      var tweetURL = isTweetAQuoteTweet(templateButton)
        ? undefined
        : window.location.href.includes("/status/")
          ? window.location.href
          : findHomePageTweetURL(templateButton);

      const downloadButton = templateButton.cloneNode(true);
      const downloadButtonInner = downloadButton.querySelector("button");

      downloadButton.setAttribute("cobalt-ext", "twitter");
      downloadButton.querySelector("svg").parentElement.innerHTML =
        downloadIcon(downloadButton.querySelector("svg").classList.toString());
      downloadButtonInner.style.borderRadius = "50%";

      downloadButton.title = tweetURL
        ? "download with cobalt"
        : "cannot find the link associated to this video. if this is a quote tweet, try click on the quote itself and try again.";

      downloadButtonInner.setAttribute(
        "aria-label",
        tweetURL
          ? "download with cobalt"
          : "cannot find the link associated to this video. if this is a quote tweet, try click on the quote itself and try again."
      );

      downloadButtonInner.style.opacity = tweetURL ? "1" : "0.5";
      downloadButtonInner.style.pointerEvents = tweetURL ? "auto" : "none";
      if (!tweetURL) downloadButtonInner.disabled = true;

      downloadButton.addEventListener("click", (e) => {
        getResource(tweetURL);
      });

      downloadButtonInner.addEventListener("mouseover", () => {
        downloadButtonInner.style.backgroundColor = "rgba(255,255,255,0.1)";
      });

      // Emulate focus behavior
      downloadButtonInner.addEventListener("focus", (e) => {
        downloadButtonInner.style.boxShadow =
          "rgba(255,255,255,1) 0px 0px 0px 2px";
        downloadButtonInner.style.backgroundColor = "rgba(255,255,255,0.1)";
      });

      downloadButtonInner.addEventListener("blur", () => {
        downloadButtonInner.style.boxShadow = "none";
        downloadButtonInner.style.backgroundColor = "transparent";
      });

      downloadButton.addEventListener("mouseout", () => {
        downloadButtonInner.style.backgroundColor = "transparent";
      });

      templateButton.parentElement.appendChild(downloadButton);
    }
  });
}

watchPage(addDownloadButton);