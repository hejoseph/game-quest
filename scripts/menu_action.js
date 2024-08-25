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

document.addEventListener('DOMContentLoaded', () => {

  function toggleEditMode(objectiveElement, enable) {
      const actionButtons = objectiveElement.querySelectorAll('.add-step-button, .add-sub-step-button');
      const textElements = objectiveElement.querySelectorAll('.objective_text, .step_text, .sub-step_text, .coin_number');
      const deleteButtons = objectiveElement.querySelectorAll('.delete-step, .delete-sub-step');
      
      if (enable) {
          objectiveElement.classList.add('edit-mode');
          textElements.forEach(el => el.setAttribute('contenteditable', 'true'));
      } else {
          objectiveElement.classList.remove('edit-mode');
          textElements.forEach(el => el.setAttribute('contenteditable', 'false'));
      }

      deleteButtons.forEach(btn => btn.style.display = enable ? 'inline' : 'none');
  }

  // Event delegation for handling clicks on edit buttons
  document.body.addEventListener('click', (event) => {
      if (event.target.classList.contains('edit-button')) {
          const objectiveElement = event.target.closest('.objective');
          const isEditing = objectiveElement.classList.contains('edit-mode');
          toggleEditMode(objectiveElement, !isEditing);
      } else if (event.target.classList.contains('add-step-button')) {
          const objectiveElement = event.target.closest('.objective');
          addStep(objectiveElement);
      } else if (event.target.classList.contains('add-sub-step-button')) {
          const stepElement = event.target.closest('.step');
          addSubStep(stepElement);
      } else if (event.target.classList.contains('delete-step')) {
          // if (confirm('Are you sure you want to delete this step?')) {
          //     event.target.closest('.step').remove();
          // }
      } else if (event.target.classList.contains('delete-sub-step')) {
          // if (confirm('Are you sure you want to delete this sub-step?')) {
          //     event.target.closest('.sub-step').remove();
          // }
      }
  });

  // Function to generate a new unique ID
  function generateUniqueId(prefix) {
      return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  // Function to add a new step
  function addStep(objectiveElement) {
      const stepsList = objectiveElement.querySelector('.steps');
      const stepId = generateUniqueId('step');
      const stepHTML = `
          <li class="step" data-id="${stepId}">
              <span class="step_text" contenteditable="true">New Step</span> 
              <span class="coin"><span class="coin_number" contenteditable="true">0</span><img class="coin_img" src="images/coin.svg"></span>
              <img src="images/delete.svg" alt="Delete" class="delete-step" />
              <ul class="sub-steps">
                  <!-- New sub-steps will be added here -->
              </ul>
              <button class="add-sub-step-button">Add Sub-Step</button>
              
          </li>
      `;
      stepsList.insertAdjacentHTML('beforeend', stepHTML);
  }

  // Function to add a new sub-step
  function addSubStep(stepElement) {
      const subStepsList = stepElement.querySelector('.sub-steps');
      const subStepId = generateUniqueId('sub-step');
      const subStepHTML = `
          <li class="sub-step" data-id="${subStepId}">
              <span class="sub-step_text" contenteditable="true">New Sub-Step</span>
              <span class="coin"><span class="coin_number" contenteditable="true">0</span><img class="coin_img" src="images/coin.svg"></span>
              <img src="images/delete.svg" alt="Delete" class="delete-sub-step" />
          </li>
      `;
      subStepsList.insertAdjacentHTML('beforeend', subStepHTML);
  }
});
