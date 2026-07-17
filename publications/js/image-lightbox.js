(() => {
  const triggers = document.querySelectorAll(".zoomable-image");
  if (!triggers.length) return;

  const dialog = document.createElement("dialog");
  dialog.className = "image-lightbox";
  dialog.id = "image-lightbox";
  dialog.setAttribute("aria-label", "Full-screen image viewer");

  const closeButton = document.createElement("button");
  closeButton.className = "lightbox-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close full-screen image");

  const expandedImage = document.createElement("img");
  expandedImage.className = "lightbox-image";
  expandedImage.alt = "";

  dialog.append(closeButton, expandedImage);
  document.body.append(dialog);

  let lastTrigger = null;

  const closeViewer = () => {
    if (dialog.open) dialog.close();
  };

  const openViewer = (trigger) => {
    lastTrigger = trigger;
    expandedImage.src = trigger.currentSrc || trigger.src;
    expandedImage.alt = trigger.alt;
    document.body.classList.add("lightbox-open");
    dialog.showModal();
  };

  triggers.forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-haspopup", "dialog");
    image.setAttribute("aria-controls", dialog.id);
    image.setAttribute("aria-label", `View full screen: ${image.alt || "image"}`);

    image.addEventListener("click", () => openViewer(image));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openViewer(image);
      }
    });
  });

  closeButton.addEventListener("click", closeViewer);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeViewer();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
    expandedImage.removeAttribute("src");
    if (lastTrigger) lastTrigger.focus();
  });
})();
