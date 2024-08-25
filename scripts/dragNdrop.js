let isDragging = false;
  let currentItem = null;
  let containerOffsetY = 0;
  let initY = 0;

  const container = document.querySelector(".objectives");
  // container.style.width = container.offsetWidth + "px";
  // container.style.height = container.offsetHeight + "px";

  document.addEventListener("mousedown", (e) => {
    if (e.target.matches("img.drag")) {
      const item = e.target.closest(".objective");
      isDragging = true;
      currentItem = item;
      containerOffsetY = currentItem.offsetTop;
      currentItem.classList.add("dragging");
      document.body.style.userSelect = "none";
      currentItem.classList.add("insert-animation");
      currentItem.style.top = containerOffsetY + "px";
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
      let nextItem = itemSibilings.find((sibiling) => {
        return (
          e.clientY - container.getBoundingClientRect().top <=
          sibiling.offsetTop + sibiling.offsetHeight / 2
        );
      });

      itemSibilings.forEach((sibiling) => {
        sibiling.style.marginTop = "10px";
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

    let itemSibilings = [
      ...document.querySelectorAll(".objective:not(.dragging)"),
    ];

    itemSibilings.forEach((sibiling) => {
      sibiling.style.marginTop = "10px";
    });
  });