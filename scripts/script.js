document.addEventListener("DOMContentLoaded", () => {
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


  // Mark the step as done or undone if all sub-steps are completed or not
  function updateStepProgress(step) {
    const subSteps = step.querySelectorAll(".sub-step_text");
    const step_coin_number = getCoinFromCurrentStepOrSubStep(step);
    const step_text = step.querySelector(".step_text");
    const completedSubSteps = Array.from(subSteps).filter(
      (subStep) => subStep.style.textDecoration === "line-through"
    ).length;
    const allSubStepsCompleted = subSteps.length === completedSubSteps;

    if (allSubStepsCompleted) {
      step_text.style.textDecoration = "line-through";
      step_text.style.color = "#aaa";
      addToWallet(step_coin_number);
    } else {
      if(step_text.style.textDecoration=="line-through"){
        addToWallet("-"+step_coin_number);
        step_text.style.textDecoration = "";
        step_text.style.color = "#ccc";
      }
    }
  }

  function handleDoubleClick(event) {
    return;
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

  function getWalletCoin() {
    const totalCoinElement = document.querySelector("#total_coin");
    const currentValue = totalCoinElement.textContent;
    return currentValue;
  }

  function setWalletCoin(coin_number) {
    const totalCoinElement = document.querySelector('#total_coin');
    totalCoinElement.textContent = coin_number;
  }

  function addToWallet(number){
    if(number=="0") return;
    const totalCoinElement = document.querySelector("#total_coin");
    const currentValue = totalCoinElement.textContent;
    let sum = Number(currentValue) + Number(number);
    totalCoinElement.textContent = sum;
  }

  function getCoinFromCurrentStepOrSubStep(stepOrSubStep){
    return stepOrSubStep.querySelector(".coin_number")
    ? stepOrSubStep.querySelector(".coin_number").textContent
    : "0";
  }

  function onSubStepClicked(subStep_text, objective) {
    const step = subStep_text.closest(".step");
    const subStep = subStep_text.closest(".sub-step");
    const sub_step_coin_number = getCoinFromCurrentStepOrSubStep(subStep);
    const step_coin_number = getCoinFromCurrentStepOrSubStep(step);
    const subSteps = step.querySelectorAll(".sub-step");

    // Toggle the sub-step
    if (subStep_text.style.textDecoration === "line-through") {
      subStep_text.style.textDecoration = "";
      subStep_text.style.color = "#ccc";
      addToWallet("-"+sub_step_coin_number);
    } else {
      subStep_text.style.textDecoration = "line-through";
      subStep_text.style.color = "#aaa";
      addToWallet(sub_step_coin_number);
    }

    // Update step and objective progress
    updateStepProgress(step);
    updateObjectiveProgress(objective);
  }

  function onStepClicked(step_text, objective) {
    const step = step_text.closest(".step");
    const subSteps_text = step.querySelectorAll(".sub-step_text");
    const step_coin_number = getCoinFromCurrentStepOrSubStep(step);

    // Toggle the step
    if (step_text.style.textDecoration === "line-through") {
      step_text.style.textDecoration = "";
      step_text.style.color = "#ccc";
      addToWallet("-"+step_coin_number);
      subSteps_text.forEach((subStep_text) => {
        const subStep = subStep_text.closest(".sub-step");
        const sub_step_coin_number = getCoinFromCurrentStepOrSubStep(subStep);
        // subStep_text = subStep.querySelector(".sub-step_text");
        subStep_text.style.textDecoration = "";
        subStep_text.style.color = "#ccc";
        addToWallet("-"+sub_step_coin_number);
      });
    } else {
      step_text.style.textDecoration = "line-through";
      step_text.style.color = "#aaa";
      addToWallet(step_coin_number);
      subSteps_text.forEach((subStep_text) => {
        const subStep = subStep_text.closest(".sub-step");
        const sub_step_coin_number = getCoinFromCurrentStepOrSubStep(subStep);
        // subStep_text = subStep.querySelector(".sub-step_text");
        subStep_text.style.textDecoration = "line-through";
        subStep_text.style.color = "#aaa";
        addToWallet(sub_step_coin_number);
      });
    }

    // Update objective progress
    updateObjectiveProgress(objective);
  }

  function handleClick(event) {
    const objective = event.target.closest(".objective");
    if (!objective) return; // Ignore clicks outside objectives

    if (event.target.classList.contains("sub-step_text") && event.target.getAttribute("contenteditable") === "false") {
      onSubStepClicked(event.target, objective);
    }

    if (event.target.classList.contains("step_text") && event.target.getAttribute("contenteditable") === "false") {
      onStepClicked(event.target, objective);
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
