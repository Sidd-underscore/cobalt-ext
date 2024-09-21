import { logger } from "../common/logger";
import { getResource, watchPage } from "../common/utils";

logger.log("YouTube detected!");

const downloadIcon = (classNames) => {
  // Use the meta theme color to determine if the user is using dark mode
  var isDarkMode =
    document.head
      .querySelector('meta[name="theme-color"]')
      .getAttribute("content") != "rgba(255, 255, 255, 0.98)";

  return `
    <svg viewBox="0 0 48 48" class="${classNames}">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M38 44H10V42H38V44Z" fill="${
          isDarkMode ? "white" : "black"
        }" fill-rule="evenodd" clip-rule="evenodd"></path>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M23 34.5V4.5H25V34.5H23Z" fill="${
          isDarkMode ? "white" : "black"
        }" fill-rule="evenodd" clip-rule="evenodd"></path>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M24 35.4142L10.5858 22L12 20.5858L24 32.5858L36 20.5858L37.4142 22L24 35.4142Z" fill="${
          isDarkMode ? "white" : "black"
        }" fill-rule="evenodd" clip-rule="evenodd"></path>
    </svg>
    `;
};

function addDownloadButton() {
  const isLiveVideo = document.querySelector('[should-stamp-chat=""]');
  const isShortsVideo = window.location.href.includes("/shorts/");

  if (!isLiveVideo) {
    if (!isShortsVideo) {
      var toolBar = document.querySelector(
        "ytd-watch-flexy #top-level-buttons-computed"
      );
      if (toolBar) {
        // Get a template, normal button (usually the share button) and the we clone it and modify it to our liking
        const templateButton = toolBar.querySelector(
          'yt-button-view-model button-view-model button[aria-label="Share"]'
        ).parentElement.parentElement;

        if (
          !templateButton.parentElement.querySelector('[cobalt-ext="youtube"]')
        ) {
          const downloadButton = templateButton.cloneNode(true);
          console.log(downloadButton);
          const downloadButtonInner = downloadButton.querySelector("button");
          toolBar.insertAdjacentElement("beforeend", downloadButton);

          downloadButton.setAttribute("cobalt-ext", "youtube");
          downloadButton.querySelector("yt-icon").parentElement.innerHTML =
            downloadIcon(
              downloadButton.querySelector("yt-icon").classList.toString()
            );

          downloadButtonInner.title = "download with cobalt";
          downloadButtonInner.setAttribute(
            "aria-label",
            "download with cobalt"
          );

          downloadButton.querySelector(
            ".yt-spec-button-shape-next__button-text-content"
          ).textContent = "Download";

          const styles = document.createElement("style");
          styles.innerHTML = `
            @media screen and (max-width: 1448px) {
              [cobalt-ext="youtube"] .yt-spec-button-shape-next__button-text-content {
                  display: none;
              }

              [cobalt-ext="youtube"] .yt-spec-button-shape-next__icon {
                  margin: -6px !important;
              }
            }`;

          document.head.appendChild(styles);

          toolBar.insertAdjacentElement("beforeend", downloadButton);

          // Let YouTube compute the overflow menu
          document.dispatchEvent(new Event("yt-rendererstamper-finished"));
          document.dispatchEvent(new Event("yt-renderidom-finished"));
          document.dispatchEvent(new Event("yt-masthead-height-changed"));

          downloadButton.addEventListener("click", (e) => {
            getResource(window.location.href);
          });
        }
      }
    } else {
      const toolBars = document.querySelectorAll(".action-container");
      if (toolBars) {
        toolBars.forEach((toolBar) => {
          if (!toolBar.querySelector('[cobalt-ext="youtube"]')) {
            // Get a template, normal button (the share button)
            const template = toolBar.querySelectorAll(
              "div.button-container"
            )[2];

            // Apply all necessary styles and accessibility features to the button wrapper
            const downloadButton = document.createElement("div"); // cloneNode() doesn't work in the scenario because of YouTube rendering system. I hate it here too.
            downloadButton.classList.add(...template.classList);
            downloadButton.setAttribute("cobalt-ext", "youtube");
            downloadButton.title = "Download short with cobalt";
            downloadButton.style.paddingTop = "16px";

            // Create the elements that reside inside the button but don't have any specific properties we need to change
            const downloadButtonInner = document.createElement(
              "ytd-cobalt-button-renderer"
            );
            downloadButtonInner.classList.add(
              ...document.querySelector("#share-button ytd-button-renderer")
                .classList
            );
            downloadButtonInner.setAttribute("vertically-aligned", "");
            const buttonShape = document.createElement(
              "yt-cobalt-button-shape"
            );

            const buttonLabel = document.createElement("label");
            buttonLabel.classList.add(
              ...template.querySelector("yt-button-shape > label").classList
            );

            // This is the actual button inside of the button wrapper
            const buttonLabelInner = document.createElement("button");
            buttonLabelInner.classList.add(
              ...template.querySelector("yt-button-shape > label > button")
                .classList
            );
            buttonLabelInner.setAttribute(
              "aria-label",
              "Download video with cobalt"
            );
            buttonLabelInner.setAttribute("type", "button");
            buttonLabelInner.title = "Download video with cobalt";

            // Feedback shape is responsible for some niche mobile/touch UI response
            const buttonFeedbackShape = document.createElement(
              "yt-touch-feedback-shape"
            );
            buttonFeedbackShape.style.borderRadius = "inherit";

            const buttonFeedbackShapeInner = document.createElement("div");
            buttonFeedbackShapeInner.classList.add(
              ...template.querySelector(
                "yt-button-shape label yt-touch-feedback-shape div"
              ).classList
            );
            buttonFeedbackShapeInner.setAttribute("aria-hidden", true);

            const buttonFeedbackShapeInnerInner1 =
              document.createElement("div");
            buttonFeedbackShapeInnerInner1.classList.add(
              ...template.querySelectorAll(
                "yt-button-shape label yt-touch-feedback-shape div div"
              )[0].classList
            );

            const buttonFeedbackShapeInnerInner2 =
              document.createElement("div");
            buttonFeedbackShapeInnerInner2.classList.add(
              ...template.querySelectorAll(
                "yt-button-shape label yt-touch-feedback-shape div div"
              )[1].classList
            );

            // Put the feedback shape together
            buttonFeedbackShapeInnerInner1.insertAdjacentElement(
              "afterend",
              buttonFeedbackShapeInnerInner2
            );
            buttonFeedbackShapeInner.appendChild(
              buttonFeedbackShapeInnerInner1
            );
            buttonFeedbackShape.appendChild(buttonFeedbackShapeInner);
            buttonLabelInner.appendChild(buttonFeedbackShape);

            // Create the download icon
            const buttonLabelIconOuter = document.createElement("div");
            buttonLabelIconOuter.classList.add(
              ...template.querySelector(
                "yt-button-shape > label > button > div"
              ).classList,
              "yt-cobalt-button-icon"
            );
            buttonLabelIconOuter.setAttribute("aria-hidden", true);

            const buttonLabelIconInner =
              document.createElement("yt-cobalt-icon");
            buttonLabelIconInner.classList.add(
              ...template.querySelector(
                "yt-button-shape > label > button > div > yt-icon"
              ).classList
            );
            buttonLabelIconInner.classList.add(
              "yt-icon",
              "yt-icon-shape",
              "yt-spec-icon-shape"
            );
            buttonLabelIconInner.style.width = "24px";
            buttonLabelIconInner.style.height = "24px";
            buttonLabelIconInner.style.display = "block";
            buttonLabelIconInner.innerHTML = downloadIcon(
              buttonLabelIconInner.classList.toString()
            );

            const buttonIconLabelOuter = document.createElement("div");
            buttonIconLabelOuter.classList.add(
              ...template.querySelector("yt-button-shape > label > div")
                .classList
            );

            buttonIconLabelOuter.setAttribute("aria-hidden", true);

            const buttonIconLabelInner = document.createElement("span");
            buttonIconLabelInner.classList.add(
              ...template.querySelector("yt-button-shape > label > div > span")
                .classList
            );

            buttonIconLabelInner.setAttribute("role", "text");
            buttonIconLabelInner.innerText = "Save"; // "Save" instead of "Download" because "Download" is too long lol

            // Put everything together (I hate this so much)
            buttonIconLabelOuter.appendChild(buttonIconLabelInner);
            buttonLabelIconOuter.appendChild(buttonLabelIconInner);
            buttonLabelInner.appendChild(buttonLabelIconOuter);
            buttonLabel.appendChild(buttonLabelInner);
            buttonLabel.appendChild(buttonIconLabelOuter);
            buttonShape.appendChild(buttonLabel);
            downloadButtonInner.appendChild(buttonShape);
            downloadButton.appendChild(downloadButtonInner);

            downloadButton.addEventListener("click", (e) => {
              getResource(window.location.href);
            });

            toolBar
              ?.querySelector("#share-button")
              .insertAdjacentElement("afterend", downloadButton);

            // YouTube slightly changes the look of the action buttons (like, comment, etc) when the description and comment section panels are expanded
            // Both of these event listeners run in parallel to ensure that the correct button styles are applied even when simply toggling between the panels
            // Reverse-engineering YouTue's code is a pain, but this is the best I could come up with
            document.addEventListener("yt-action", (e) => {
              if (
                e.detail &&
                e.detail.args &&
                e?.detail?.args[1] === "ENGAGEMENT_PANEL_VISIBILITY_EXPANDED" &&
                (e?.detail?.args[2] === "engagement-panel-comments-section" ||
                  e?.detail?.args[2] ===
                    "engagement-panel-structured-description")
              ) {
                logger.log("engagement panel shown", e);
                buttonLabelInner.classList.add(
                  "yt-spec-button-shape-next--overlay-dark"
                );
                downloadButton.style.paddingTop = "0px";
              }
            });
            document.addEventListener("yt-action", (e) => {
              if (
                e.detail &&
                e.detail.args &&
                e?.detail?.args[1] === "ENGAGEMENT_PANEL_VISIBILITY_HIDDEN" &&
                (e?.detail?.args[2] === "engagement-panel-comments-section" ||
                  e?.detail?.args[2] ===
                    "engagement-panel-structured-description")
              ) {
                logger.log("engagement panel hidden", e);
                buttonLabelInner.classList.remove(
                  "yt-spec-button-shape-next--overlay-dark"
                );
                downloadButton.style.paddingTop = "16px";
              }
            });
          }
        });
      }
    }
  }
}

watchPage(addDownloadButton);
