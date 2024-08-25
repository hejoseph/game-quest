let isDragging = false;
let currentItem = null;
let containerOffsetY = 0;
let initY = 0;

const container = document.querySelector(".objectives");

// Prevent default drag behavior on all drag icons
document.querySelectorAll(".drag").forEach((element) => {
  element.addEventListener("dragstart", (e) => {
    e.preventDefault(); // Prevents the default drag behavior
  });
});

document.addEventListener("mousedown", (e) => {
  if (e.target.matches("img.drag")) {
    e.preventDefault(); // Prevent default behavior just in case
    const item = e.target.closest(".objective");
    isDragging = true;
    currentItem = item;
    containerOffsetY = currentItem.offsetTop;
    currentItem.classList.add("dragging");
    document.body.style.userSelect = "none";
    currentItem.classList.add("insert-animation");
    currentItem.style.top = containerOffsetY + 100 + "px";
    initY = e.clientY;
  }
});

document.addEventListener("mousemove", (e) => {
  if (isDragging && currentItem) {
    currentItem.classList.remove("insert-animation");
    let newTop = containerOffsetY - (initY - e.clientY);
    if (newTop < -50) {
      newTop = -50;
    } else if (newTop > container.offsetHeight - 30) {
      newTop = container.offsetHeight - 30;
    }
    currentItem.style.top = newTop + "px";

    let itemSibilings = [
      ...document.querySelectorAll(".objective:not(.dragging)"),
    ];
    let nextItem = itemSibilings.find((sibling) => {
      return (
        e.clientY - container.getBoundingClientRect().top <=
        sibling.offsetTop + sibling.offsetHeight / 2
      );
    });

    itemSibilings.forEach((sibling) => {
      sibling.style.marginTop = "10px";
    });

    if (nextItem) {
      nextItem.style.marginTop = currentItem.offsetHeight + 20 + "px";
    }
    container.insertBefore(currentItem, nextItem);
  }
});

document.addEventListener("mouseup", () => {
  if (currentItem) {
    currentItem.classList.remove("dragging");
    currentItem.style.top = "auto";
    currentItem = null;
    isDragging = false;

    document.body.style.userSelect = "auto";
  }

  let itemSiblings = [
    ...document.querySelectorAll(".objective:not(.dragging)"),
  ];

  itemSiblings.forEach((sibling) => {
    sibling.style.marginTop = "10px";
  });
});

// Extra: Prevent drag over behavior
document.querySelectorAll(".drag").forEach((element) => {
  element.addEventListener("dragover", (e) => {
    e.preventDefault(); // Prevents default dragover behavior
  });
});

// Select all delete images
const deleteIcons = document.querySelectorAll('img[alt="Delete"]');

// Loop through each delete image and add a click event listener
deleteIcons.forEach((icon) => {
  icon.addEventListener("click", (event) => {
    // Find the closest parent .objective div
    const objectiveDiv = icon.closest(".objective");
    if (objectiveDiv) {
      // Remove the .objective div from the DOM
      objectiveDiv.remove();
    }
  });
});
