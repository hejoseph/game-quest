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

  saveData();
});

// Extra: Prevent drag over behavior
document.querySelectorAll(".drag").forEach((element) => {
  element.addEventListener("dragover", (e) => {
    e.preventDefault(); // Prevents default dragover behavior
  });
});

function saveCoin() {
  let tempData = JSON.parse(localStorage.getItem("appData")) || {
    totalCoin: "0",
  };
  tempData.totalCoin = document.querySelector("#total_coin").innerText;

  localStorage.setItem("appData", JSON.stringify(tempData));
}

function saveData() {
  const objectives = [];
  console.log(document.querySelectorAll(".objective").length);
  document.querySelectorAll(".objective").forEach((objective) => {
    const objId = objective.dataset.id;
    const objText = objective.querySelector(".objective_text").innerText;

    const steps = [];
    objective.querySelectorAll(".step").forEach((step) => {
      const stepId = step.dataset.id;
      const stepText = step.querySelector(".step_text");
      const stepDone =
        stepText.style.textDecoration === "line-through" ? true : false;
      const coins = step.querySelector(".coin_number").innerText;

      const subSteps = [];
      step.querySelectorAll(".sub-step").forEach((subStep) => {
        const subStepId = subStep.dataset.id;
        const subStepText = subStep.querySelector(".sub-step_text");
        const subStepDone =
          subStepText.style.textDecoration === "line-through" ? true : false;
        const subStepCoins =
          subStep.querySelector(".coin_number")?.innerText || "0";

        subSteps.push({
          id: subStepId,
          done: subStepDone,
          text: subStepText.innerText,
          coins: subStepCoins,
        });
      });

      steps.push({
        id: stepId,
        done: stepDone,
        text: stepText.innerText,
        coins: coins,
        subSteps: subSteps,
      });
    });

    objectives.push({ id: objId, text: objText, steps: steps });
  });

  var totalCoin = document.querySelector("#total_coin").innerText;
  totalCoin = totalCoin === "" ? "0" : totalCoin;

  localStorage.setItem(
    "appData",
    JSON.stringify({
      questTitle: document.querySelector(".quest-title").innerText,
      questDescription: document.querySelector(".quest-description").innerText,
      totalCoin: totalCoin,
      objectives: objectives,
    })
  );
}

function loadState() {
  const savedData = localStorage.getItem("appData");
  if (savedData === "undefined" || !savedData) return;
  const data = JSON.parse(savedData);

  if (data) {
    data.objectives.forEach((objData) => {
      objData.steps.forEach((stepData) => {
        const stepElement = document.querySelector(
          `.step[data-id="${stepData.id}"] .step_text`
        );
        if (stepElement) {
          stepElement.style.textDecoration = stepData.done
            ? "line-through"
            : "none";
        }
        stepData.subSteps.forEach((subStepData) => {
          const subStepElement = document.querySelector(
            `.sub-step[data-id="${subStepData.id}"] .sub-step_text`
          );
          if (subStepElement) {
            subStepElement.style.textDecoration = subStepData.done
              ? "line-through"
              : "none";
          }
        });
      });
    });
  }
}

function updateItemState(itemId, isDone) {
  let data = JSON.parse(localStorage.getItem("appData")) || { objectives: [] };

  data.objectives.forEach((objective) => {
    objective.steps.forEach((step) => {
      if (step.id === itemId) {
        step.done = isDone;
      }
      step.subSteps.forEach((subStep) => {
        if (subStep.id === itemId) {
          subStep.done = isDone;
        }
      });
    });
  });

  localStorage.setItem("appData", JSON.stringify(data));
}

function loadData() {
  const savedData = localStorage.getItem("appData");
  if (!savedData || savedData === "undefined") {
    saveData();
    return;
  }

  const data = JSON.parse(savedData);

  document.querySelector(".quest-title").innerText = data.questTitle;
  document.querySelector(".quest-description").innerText =
    data.questDescription;
  document.querySelector("#total_coin").innerText = data.totalCoin;

  const objectivesContainer = document.querySelector(".objectives");
  data.objectives.forEach((objData) => {
    const objectiveElement = document.createElement("div");
    objectiveElement.classList.add("objective");
    objectiveElement.dataset.id = objData.id;

    objectiveElement.innerHTML = `
      <p class="objective_text" contenteditable="false">${objData.text}</p>
      <div class="menu_container">
        <div class="menu_action">
          <img src="images/hide.svg" alt="Hide" class="toggle-visibility"/>
          <img src="images/edit.svg" alt="Edit" class="edit-button"/>
          <img src="images/delete.svg" class="delete-objective" alt="Delete_objective" />
          <img class="drag" src="images/drag.svg" alt="Drag" draggable="false"/>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress" style="width: 0%;"></div>
      </div>
      <ul class="steps">
      </ul>
      <button class="add-step-button">Add Step</button>
    `;

    objData.steps.forEach((stepData) => {
      const stepHTML = `
        <li class="step" data-id="${stepData.id}">
          <span class="step_text" contenteditable="false">${stepData.text}</span>
          <span class="coin"><span class="coin_number" contenteditable="false">${stepData.coins}</span><img class="coin_img" src="images/coin.svg"></span>
          <img src="images/delete.svg" alt="Delete" class="delete-step" />
          <ul class="sub-steps">
          </ul>
          <button class="add-sub-step-button">Add Sub-Step</button>
        </li>
      `;
      objectiveElement
        .querySelector(".steps")
        .insertAdjacentHTML("beforeend", stepHTML);

      const step = objectiveElement.querySelector(
        `li[data-id="${stepData.id}"]`
      );
      stepData.subSteps.forEach((subStepData) => {
        const subStepHTML = `
          <li class="sub-step" data-id="${subStepData.id}">
            <span class="sub-step_text" contenteditable="false">${subStepData.text}</span>
            <span class="coin"><span class="coin_number" contenteditable="false">${subStepData.coins}</span><img class="coin_img" src="images/coin.svg"></span>
            <img src="images/delete.svg" alt="Delete" class="delete-sub-step" />
          </li>
        `;
        const subStepsList = step.querySelector(".sub-steps");
        subStepsList.insertAdjacentHTML("beforeend", subStepHTML);
      });
    });

    objectivesContainer.appendChild(objectiveElement);
  });
}

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
    const itemId = step.dataset.id;
    let isDone = false;

    const completedSubSteps = Array.from(subSteps).filter(
      (subStep) => subStep.style.textDecoration === "line-through"
    ).length;
    const allSubStepsCompleted = subSteps.length === completedSubSteps;

    if (allSubStepsCompleted) {
      if (step_text.style.textDecoration == "line-through") {
      } else {
        step_text.style.textDecoration = "line-through";
        step_text.style.color = "#aaa";
        addToWallet(step_coin_number);
      }
      isDone = true;
    } else {
      isDone = false;
      if (step_text.style.textDecoration == "line-through") {
        addToWallet("-" + step_coin_number);
        step_text.style.textDecoration = "";
        step_text.style.color = "#ccc";
      }
    }

    updateItemState(itemId, isDone);
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
    const totalCoinElement = document.querySelector("#total_coin");
    totalCoinElement.textContent = coin_number;
  }

  function addToWallet(number) {
    if (number == "0") return;
    const totalCoinElement = document.querySelector("#total_coin");
    const currentValue = totalCoinElement.textContent;
    let sum = Number(currentValue) + Number(number);
    totalCoinElement.textContent = sum;
    saveCoin();
  }

  function getCoinFromCurrentStepOrSubStep(stepOrSubStep) {
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
    const itemId = subStep.dataset.id;
    let isDone = false;

    // Toggle the sub-step
    if (subStep_text.style.textDecoration === "line-through") {
      subStep_text.style.textDecoration = "";
      subStep_text.style.color = "#ccc";
      addToWallet("-" + sub_step_coin_number);
      isDone = false;
    } else {
      subStep_text.style.textDecoration = "line-through";
      subStep_text.style.color = "#aaa";
      addToWallet(sub_step_coin_number);
      isDone = true;
    }

    updateItemState(itemId, isDone);

    // Update step and objective progress
    updateStepProgress(step);
    updateObjectiveProgress(objective);
  }

  function crossIt(textItem){
    textItem.style.textDecoration = "line-through";
    textItem.style.color = "#aaa";
  }

  function unCrossIt(textItem){
    textItem.style.textDecoration = "";
    textItem.style.color = "#ccc";
  }

  function isCrossed(textItem){
    return textItem.style.textDecoration === "line-through";
  }

  function onStepClicked(step_text, objective) {
    const step = step_text.closest(".step");
    const subSteps_text = step.querySelectorAll(".sub-step_text");
    const step_coin_number = getCoinFromCurrentStepOrSubStep(step);
    const stepId = step.dataset.id;
    let isStepDone = isCrossed(step_text);

    // Toggle the step
    if (isStepDone) {
      unCrossIt(step_text);
      isStepDone = !isStepDone;
      addToWallet("-" + step_coin_number);
      subSteps_text.forEach((subStep_text) => {
        const subStep = subStep_text.closest(".sub-step");
        const sub_step_coin_number = getCoinFromCurrentStepOrSubStep(subStep);
        const subStepId = subStep.dataset.id;
        let isSubDone = false;
        updateItemState(subStepId, isSubDone);
        if(isCrossed(subStep_text)){
          unCrossIt(subStep_text);
          addToWallet("-" + sub_step_coin_number);
        }
      });
    } else {
      crossIt(step_text);
      isStepDone = true;
      addToWallet(step_coin_number);
      subSteps_text.forEach((subStep_text) => {
        const subStep = subStep_text.closest(".sub-step");
        const sub_step_coin_number = getCoinFromCurrentStepOrSubStep(subStep);
        const subStepId = subStep.dataset.id;
        let isSubDone = true;
        updateItemState(subStepId, isSubDone);
        if (!isCrossed(subStep_text)) {
          addToWallet(sub_step_coin_number);
          crossIt(subStep_text);
        }
      });
    }

    updateItemState(stepId, isStepDone);

    // Update objective progress
    updateObjectiveProgress(objective);
  }

  function handleClick(event) {
    const objective = event.target.closest(".objective");
    if (!objective) return; // Ignore clicks outside objectives

    if (
      event.target.classList.contains("sub-step_text") &&
      event.target.getAttribute("contenteditable") === "false"
    ) {
      onSubStepClicked(event.target, objective);
    }

    if (
      event.target.classList.contains("step_text") &&
      event.target.getAttribute("contenteditable") === "false"
    ) {
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

  loadData();
  loadState();

  function loadProgressBars() {
    // Get all elements with the class "objective"
    const objectives = document.querySelectorAll(".objective");

    // Loop through each "objective" element
    objectives.forEach((objective) => {
      updateObjectiveProgress(objective);
    });
  }

  loadProgressBars();

  function toggleEditLockIcon(element) {
    console.log(element.src);
    // Check if currently in edit mode by checking the current icon src or a data attribute
    const isEditMode = element.src.includes("edit");

    // Toggle the mode
    if (isEditMode) {
      // Switch to lock mode
      element.src = "images/lock.svg"; // Set to lock icon
      // saveData();
    } else {
      // Switch to edit mode
      element.src = "images/edit.svg"; // Set to edit icon
    }
  }

  function toggleEditMode(objectiveElement, enable) {
    const actionButtons = objectiveElement.querySelectorAll(
      ".add-step-button, .add-sub-step-button"
    );
    const textElements = objectiveElement.querySelectorAll(
      ".objective_text, .step_text, .sub-step_text, .coin_number"
    );
    const deleteButtons = objectiveElement.querySelectorAll(
      ".delete-step, .delete-sub-step"
    );

    if (enable) {
      objectiveElement.classList.add("edit-mode");
      textElements.forEach((el) => el.setAttribute("contenteditable", "true"));
    } else {
      objectiveElement.classList.remove("edit-mode");
      textElements.forEach((el) => el.setAttribute("contenteditable", "false"));
      saveData();
      loadProgressBars();
    }

    deleteButtons.forEach(
      (btn) => (btn.style.display = enable ? "inline" : "none")
    );
  }

  // Event delegation for handling clicks on edit buttons
  document.body.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit-button")) {
      const objectiveElement = event.target.closest(".objective");
      const isEditing = objectiveElement.classList.contains("edit-mode");
      toggleEditLockIcon(event.target);
      toggleEditMode(objectiveElement, !isEditing);
    } else if (event.target.classList.contains("add-step-button")) {
      const objectiveElement = event.target.closest(".objective");
      addStep(objectiveElement);
    } else if (event.target.classList.contains("add-sub-step-button")) {
      const stepElement = event.target.closest(".step");
      addSubStep(stepElement);
    } else if (event.target.classList.contains("delete-step")) {
      // if (confirm('Are you sure you want to delete this step?')) {
      //     event.target.closest('.step').remove();
      // }
    } else if (event.target.classList.contains("delete-sub-step")) {
      // if (confirm('Are you sure you want to delete this sub-step?')) {
      //     event.target.closest('.sub-step').remove();
      // }
    }
  });

  // Function to generate a new unique ID
  function generateUniqueId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  function saveNewItem(itemId) {
    let data = JSON.parse(localStorage.getItem("appData")) || {
      objectives: [],
    };

    data.objectives.forEach((objective) => {
      objective.steps.forEach((step) => {
        if (step.subSteps) {
          step.subSteps.push({ id: itemId, done: false });
        }
      });
    });

    localStorage.setItem("appData", JSON.stringify(data));
  }

  // Function to add a new step
  function addStep(objectiveElement) {
    const stepsList = objectiveElement.querySelector(".steps");
    const stepId = generateUniqueId("step");
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
    stepsList.insertAdjacentHTML("beforeend", stepHTML);
    saveNewItem(stepId);
  }

  // Function to add a new sub-step
  function addSubStep(stepElement) {
    const subStepsList = stepElement.querySelector(".sub-steps");
    const subStepId = generateUniqueId("sub-step");
    const subStepHTML = `
          <li class="sub-step" data-id="${subStepId}">
              <span class="sub-step_text" contenteditable="true">New Sub-Step</span>
              <span class="coin"><span class="coin_number" contenteditable="true">0</span><img class="coin_img" src="images/coin.svg"></span>
              <img src="images/delete.svg" alt="Delete" class="delete-sub-step" />
          </li>
      `;
    subStepsList.insertAdjacentHTML("beforeend", subStepHTML);
    saveNewItem(subStepId);
  }

  function refreshHookMiniMaximize() {
    const toggleIcons = document.querySelectorAll(".toggle-visibility");

    // Loop through each toggle icon
    toggleIcons.forEach((icon) => {
      icon.addEventListener("click", () => {
        // Get the closest parent .objective div
        const objectiveDiv = icon.closest(".objective");

        // Get the .steps element within the current .objective
        const stepsList = objectiveDiv.querySelector(".steps");
        const addStepBtn = objectiveDiv.querySelector(".add-step-button");

        // Toggle the display of the steps list
        if (stepsList.style.display === "none") {
          stepsList.style.display = "block"; // Show steps
          // addStepBtn.style.display = "block";
          icon.src = "images/hide.svg"; // Change icon to "hide"
          icon.alt = "Hide";
        } else {
          stepsList.style.display = "none"; // Hide steps
          // addStepBtn.style.display = "block";
          icon.src = "images/show.svg"; // Change icon to "show"
          icon.alt = "Show";
        }
      });
    });
  }
  refreshHookMiniMaximize();

  // Add Objective
  const addObjectiveButton = document.querySelector(".add-objective-button");
  addObjectiveButton.addEventListener("click", addObjective);

  function addObjective() {
    const objectivesContainer = document.querySelector(".objectives");
    const newObjective = document.createElement("div");
    const stepId = generateUniqueId("step");
    const subStepId = generateUniqueId("sub-step");
    const objId = generateUniqueId("objective");
    newObjective.classList.add("objective");
    newObjective.dataset.id = objId;

    newObjective.innerHTML = `
          <p class="objective_text" contenteditable="true">New Objective</p>
          <div class="menu_container">
          <div class="menu_action">
            <img src="images/hide.svg" alt="Hide" class="toggle-visibility"/>
            <img src="images/edit.svg" alt="Edit" class="edit-button"/>
            <img src="images/delete.svg" class="delete-objective" alt="Delete_objective" />
            <img class="drag" src="images/drag.svg" alt="Drag" draggable="false"/>
          </div>
        </div>
          <div class="progress-bar">
              <div class="progress" style="width: 0%;"></div>
          </div>
          <ul class="steps">
            <li class="step" data-id="${stepId}">
              <span class="step_text" contenteditable="false">New Step</span>
              <span class="coin"><span class="coin_number" contenteditable="false">0</span><img class="coin_img" src="images/coin.svg"></span>
              <img src="images/delete.svg" alt="Delete" class="delete-step" />
              <ul class="sub-steps">
                <li class="sub-step" data-id="${subStepId}">
                  <span class="sub-step_text" contenteditable="false">New Sub Step</span>
                  <span class="coin"><span class="coin_number" contenteditable="false">0</span><img class="coin_img" src="images/coin.svg"></span>
                  <img src="images/delete.svg" alt="Delete" class="delete-sub-step" />
                </li>
              </ul>
              <button class="add-sub-step-button">Add Sub-Step</button>
              
            </li>
          </ul>
          <button class="add-step-button">Add Step</button>
      `;
    saveNewItem(stepId);
    saveNewItem(subStepId);
    objectivesContainer.appendChild(newObjective);

    // Attach event listener to the new "Add Step" button
    // newObjective
    //   .querySelector(".add-step-button")
    //   .addEventListener("click", () => addStep(newObjective));

    refreshHookMiniMaximize();
    if (typeof window.refreshDeleteObjectiveHook === "function") {
      window.refreshDeleteObjectiveHook();
    }
  }
});

document.getElementById("export-button").addEventListener("click", () => {
  const data = {
    questTitle: document.querySelector(".quest-title").innerText,
    questDescription: document.querySelector(".quest-description").innerText,
    totalCoin: document.querySelector("#total_coin").innerText,
    objectives: [],
  };

  document.querySelectorAll(".objective").forEach((objective) => {
    const objId = objective.dataset.id;
    const objText = objective.querySelector(".objective_text").innerText;

    const steps = [];
    objective.querySelectorAll(".step").forEach((step) => {
      const stepId = step.dataset.id;
      const stepText = step.querySelector(".step_text").innerText;
      const coins = step.querySelector(".coin_number").innerText;

      const subSteps = [];
      step.querySelectorAll(".sub-step").forEach((subStep) => {
        const subStepId = subStep.dataset.id;
        const subStepText = subStep.querySelector(".sub-step_text").innerText;
        const subStepCoins =
          subStep.querySelector(".coin_number")?.innerText || "0";

        subSteps.push({
          id: subStepId,
          text: subStepText,
          coins: subStepCoins,
        });
      });

      steps.push({
        id: stepId,
        text: stepText,
        coins: coins,
        subSteps: subSteps,
      });
    });

    data.objectives.push({ id: objId, text: objText, steps: steps });
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "appData.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("import-button").addEventListener("click", () => {
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      document.querySelector(".quest-title").innerText = data.questTitle;
      document.querySelector(".quest-description").innerText =
        data.questDescription;
      document.querySelector("#total_coin").innerText = data.totalCoin;

      const objectivesContainer = document.querySelector(".objectives");
      objectivesContainer.innerHTML = ""; // Clear existing objectives

      data.objectives.forEach((objData) => {
        const objectiveElement = document.createElement("div");
        objectiveElement.classList.add("objective");
        objectiveElement.dataset.id = objData.id;

        objectiveElement.innerHTML = `
          <p class="objective_text" contenteditable="true">${objData.text}</p>
          <div class="menu_container">
            <div class="menu_action">
              <img src="images/hide.svg" alt="Hide" class="toggle-visibility"/>
              <img src="images/edit.svg" alt="Edit" class="edit-button"/>
              <img src="images/delete.svg" class="delete-objective" alt="Delete_objective" />
              <img class="drag" src="images/drag.svg" alt="Drag" draggable="false"/>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress" style="width: 0%;"></div>
          </div>
          <ul class="steps">
          </ul>
          <button class="add-step-button">Add Step</button>
        `;

        objData.steps.forEach((stepData) => {
          const stepHTML = `
            <li class="step" data-id="${stepData.id}">
              <span class="step_text" contenteditable="false">${stepData.text}</span>
              <span class="coin"><span class="coin_number" contenteditable="false">${stepData.coins}</span><img class="coin_img" src="images/coin.svg"></span>
              <img src="images/delete.svg" alt="Delete" class="delete-step" />
              <ul class="sub-steps">
              </ul>
              <button class="add-sub-step-button">Add Sub-Step</button>
            </li>
          `;
          objectiveElement
            .querySelector(".steps")
            .insertAdjacentHTML("beforeend", stepHTML);

          stepData.subSteps.forEach((subStepData) => {
            const subStepHTML = `
              <li class="sub-step" data-id="${subStepData.id}">
                <span class="sub-step_text" contenteditable="false">${subStepData.text}</span>
                <span class="coin"><span class="coin_number" contenteditable="true">${subStepData.coins}</span><img class="coin_img" src="images/coin.svg"></span>
                <img src="images/delete.svg" alt="Delete" class="delete-sub-step" />
              </li>
            `;
            objectiveElement
              .querySelector(".sub-steps")
              .insertAdjacentHTML("beforeend", subStepHTML);
          });
        });

        objectivesContainer.appendChild(objectiveElement);
      });
    } catch (error) {
      alert("Failed to load data: " + error.message);
    }
  };
  reader.readAsText(file);
});
