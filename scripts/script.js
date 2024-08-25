document.addEventListener("DOMContentLoaded", () => {

  // Select all delete images
// const deleteIcons = document.querySelectorAll('img[alt="Delete"]');

// // Loop through each delete image and add a click event listener
// deleteIcons.forEach((icon) => {
//     icon.addEventListener('click', (event) => {
//         // Find the closest parent .objective div
//         const objectiveDiv = icon.closest('.objective');
//         if (objectiveDiv) {
//             // Remove the .objective div from the DOM
//             objectiveDiv.remove();
//         }
//     });
// });



  // Add Objective
  // const addObjectiveButton = document.querySelector('.add-objective-button');
  // addObjectiveButton.addEventListener('click', addObjective);

  // function addObjective() {
  //     const objectivesContainer = document.querySelector('.objectives');
  //     const newObjective = document.createElement('div');
  //     newObjective.classList.add('objective');

  //     newObjective.innerHTML = `
  //         <p class="objective_text" contenteditable="true">New Objective</p>
  //         <span class="material-icons-round">drag_indicator</span>
  //         <div class="progress-bar">
  //             <div class="progress" style="width: 0%;"></div>
  //         </div>
  //         <ul>
  //             <!-- Steps will be added here -->
  //         </ul>
  //         <button class="add-step-button gamify-button">Add Step</button>
  //     `;

  //     objectivesContainer.appendChild(newObjective);

  //     // Attach event listener to the new "Add Step" button
  //     newObjective.querySelector('.add-step-button').addEventListener('click', () => addStep(newObjective));
  // }

  // function addStep(objective) {
  //     const stepsList = objective.querySelector('ul');
  //     const newStep = document.createElement('li');
  //     newStep.classList.add('step');

  //     newStep.innerHTML = `
  //         <span class="step_text" contenteditable="true">New Step</span>
  //         <span class="coin-input">
  //             <input type="number" min="0" placeholder="Coins" class="coin-number">
  //             <img class="coin_img" src="images/coin.svg" alt="coin">
  //         </span>
  //         <button class="add-substep-button gamify-button">Add Sub-step</button>
  //         <ul class="sub-steps"></ul>
  //     `;

  //     stepsList.appendChild(newStep);

  //     // Attach event listener to the new "Add Sub-step" button
  //     newStep.querySelector('.add-substep-button').addEventListener('click', () => addSubStep(newStep));
  // }

  // function addSubStep(step) {
  //     const subStepsList = step.querySelector('.sub-steps');
  //     const newSubStep = document.createElement('li');
  //     newSubStep.classList.add('sub-step');

  //     newSubStep.innerHTML = `
  //         <span class="sub-step_text" contenteditable="true">New Sub-step</span>
  //         <span class="coin-input">
  //             <input type="number" min="0" placeholder="Coins" class="coin-number">
  //             <img class="coin_img" src="images/coin.svg" alt="coin">
  //         </span>
  //     `;

  //     subStepsList.appendChild(newSubStep);
  // }




  function updateObjectiveProgress(objective) {
    const steps = objective.querySelectorAll(".step");
    let totalNodes = 0;
    let completedNodes = 0;

    steps.forEach((step) => {
      const subSteps = step.querySelectorAll(".sub-step_text");
      if (subSteps.length == 0) {
        totalNodes += 1;
        step_text = step.querySelector(".step_text");
        if (step_text.style.textDecoration === "line-through") {
          completedNodes++;
        }
      } else {
        // Count completed sub-steps
        const completedSubSteps = Array.from(subSteps).filter(
          (subStep) => subStep.style.textDecoration === "line-through"
        ).length;
        completedNodes += completedSubSteps;
      }
      totalNodes += subSteps.length;
    });

    // Update progress bar
    const objectiveProgress = objective.querySelector(".progress");
    const totalNodesCount = totalNodes; // Total nodes (including steps and sub-steps)
    const progressPercentage =
      totalNodesCount === 0 ? 0 : (completedNodes / totalNodesCount) * 100;
    objectiveProgress.style.width = progressPercentage + "%";
  }

  function updateStepProgress(step) {
    const subSteps = step.querySelectorAll(".sub-step_text");
    const step_text = step.querySelector(".step_text");
    const completedSubSteps = Array.from(subSteps).filter(
      (subStep) => subStep.style.textDecoration === "line-through"
    ).length;
    const allSubStepsCompleted = subSteps.length === completedSubSteps;

    // Mark the step as done if all sub-steps are completed
    if (allSubStepsCompleted) {
      step_text.style.textDecoration = "line-through";
      step_text.style.color = "#aaa";
    } else {
      step_text.style.textDecoration = "";
      step_text.style.color = "#ccc";
    }
  }

  function handleDoubleClick(event) {
    const target = event.target;

    if (
      target.classList.contains("objective_text") ||
      target.classList.contains("step_text") ||
      target.classList.contains("sub-step_text")
    ) {
      const originalText = target.textContent;
      target.classList.add("editable");
      target.contentEditable = true;
      target.focus();

      // Disable click handling while editing
      document
        .querySelector(".objectives")
        .removeEventListener("click", handleClick);

      target.addEventListener(
        "blur",
        function () {
          if (target.textContent.trim() === "") {
            target.textContent = originalText; // Revert if empty
          }
          target.classList.remove("editable");
          target.contentEditable = false;

          // Re-enable click handling after editing
          document
            .querySelector(".objectives")
            .addEventListener("click", handleClick);
        },
        { once: true }
      );
    }
  }

  function handleClick(event) {
    const objective = event.target.closest(".objective");
    if (!objective) return; // Ignore clicks outside objectives

    if (event.target.classList.contains("sub-step_text")) {
      const subStep_text = event.target;
      const step = event.target.closest(".step");
      const subSteps = step.querySelectorAll(".sub-step");

      // Toggle the sub-step
      if (subStep_text.style.textDecoration === "line-through") {
        subStep_text.style.textDecoration = "";
        subStep_text.style.color = "#ccc";
      } else {
        subStep_text.style.textDecoration = "line-through";
        subStep_text.style.color = "#aaa";
      }

      // Update step and objective progress
      updateStepProgress(step);
      updateObjectiveProgress(objective);
    }

    if (event.target.classList.contains("step_text")) {
      const step_text = event.target;
      const step = event.target.closest(".step");
      const subSteps_text = step.querySelectorAll(".sub-step_text");

      // Toggle the step
      if (step_text.style.textDecoration === "line-through") {
        step_text.style.textDecoration = "";
        step_text.style.color = "#ccc";
        subSteps_text.forEach((subStep) => {
          // subStep_text = subStep.querySelector(".sub-step_text");
          subStep.style.textDecoration = "";
          subStep.style.color = "#ccc";
        });
      } else {
        step_text.style.textDecoration = "line-through";
        step_text.style.color = "#aaa";
        subSteps_text.forEach((subStep) => {
          // subStep_text = subStep.querySelector(".sub-step_text");
          subStep.style.textDecoration = "line-through";
          subStep.style.color = "#aaa";
        });
      }

      // Update objective progress
      updateObjectiveProgress(objective);
    }
  }

  function handleDragStart(event) {
    event.target.classList.add("dragging");
    event.dataTransfer.setData("text/plain", event.target.dataset.id);
  }

  function handleDragEnd(event) {
    event.target.classList.remove("dragging");
  }

  function handleDragOver(event) {
    event.preventDefault();
    const target = event.target;
    const draggingElement = document.querySelector(".dragging");
    const isDraggingSubStep = draggingElement.classList.contains("sub-step");
    const targetIsStep = target.classList.contains("step");
    const targetIsSubStep = target.classList.contains("sub-step");

    if (isDraggingSubStep && (targetIsStep || targetIsSubStep)) {
      // Prevent sub-step from being dropped outside its parent step
      if (
        targetIsStep ||
        (targetIsSubStep &&
          target.closest(".step") === draggingElement.closest(".step"))
      ) {
        const afterElement = getDragAfterElement(target, event.clientY);
        const container = target.parentElement;
        if (afterElement == null) {
          container.appendChild(draggingElement);
        } else {
          container.insertBefore(draggingElement, afterElement);
        }
      }
    } else if (targetIsStep) {
      // Allow reordering steps
      const afterElement = getDragAfterElement(target, event.clientY);
      const container = target.parentElement;
      if (afterElement == null) {
        container.appendChild(draggingElement);
      } else {
        container.insertBefore(draggingElement, afterElement);
      }
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    handleDragEnd(event);
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".step, .sub-step"),
    ].filter((el) => el !== document.querySelector(".dragging"));
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  document
    .querySelector(".objectives")
    .addEventListener("dblclick", handleDoubleClick);
  document.querySelector(".objectives").addEventListener("click", handleClick);

  // Enable drag and drop
  document.querySelectorAll(".step, .sub-step").forEach((item) => {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragend", handleDragEnd);
    item.addEventListener("dragover", handleDragOver);
    item.addEventListener("drop", handleDrop);
    item.setAttribute("draggable", true);
  });
});
