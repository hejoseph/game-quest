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

function saveData() {
  const objectives = [];
  document.querySelectorAll('.objective').forEach(objective => {
    const objId = objective.dataset.id;
    const objText = objective.querySelector('.objective_text').innerText;
    
    const steps = [];
    objective.querySelectorAll('.step').forEach(step => {
      const stepId = step.dataset.id;
      const stepText = step.querySelector('.step_text').innerText;
      const coins = step.querySelector('.coin_number').innerText;

      const subSteps = [];
      step.querySelectorAll('.sub-step').forEach(subStep => {
        const subStepId = subStep.dataset.id;
        const subStepText = subStep.querySelector('.sub-step_text').innerText;
        const subStepCoins = subStep.querySelector('.coin_number')?.innerText || "0";
        
        subSteps.push({ id: subStepId, text: subStepText, coins: subStepCoins });
      });

      steps.push({ id: stepId, text: stepText, coins: coins, subSteps: subSteps });
    });

    objectives.push({ id: objId, text: objText, steps: steps });
  });

  localStorage.setItem('appData', JSON.stringify({ 
    questTitle: document.querySelector('.quest-title').innerText,
    questDescription: document.querySelector('.quest-description').innerText,
    totalCoin: document.querySelector('#total_coin').innerText,
    objectives: objectives
  }));
}

function loadData() {
  const savedData = localStorage.getItem('appData');
  if (!savedData) return;

  const data = JSON.parse(savedData);

  document.querySelector('.quest-title').innerText = data.questTitle;
  document.querySelector('.quest-description').innerText = data.questDescription;
  document.querySelector('#total_coin').innerText = data.totalCoin;

  const objectivesContainer = document.querySelector('.objectives');
  data.objectives.forEach(objData => {
    const objectiveElement = document.createElement('div');
    objectiveElement.classList.add('objective');
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
    
    objData.steps.forEach(stepData => {
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
      objectiveElement.querySelector('.steps').insertAdjacentHTML('beforeend', stepHTML);

      stepData.subSteps.forEach(subStepData => {
        const subStepHTML = `
          <li class="sub-step" data-id="${subStepData.id}">
            <span class="sub-step_text" contenteditable="false">${subStepData.text}</span>
            <span class="coin"><span class="coin_number" contenteditable="false">${subStepData.coins}</span><img class="coin_img" src="images/coin.svg"></span>
            <img src="images/delete.svg" alt="Delete" class="delete-sub-step" />
          </li>
        `;
        objectiveElement.querySelector('.sub-steps').insertAdjacentHTML('beforeend', subStepHTML);
      });
    });

    objectivesContainer.appendChild(objectiveElement);
  });
}



document.addEventListener("DOMContentLoaded", () => {
  loadData();

  function toggleEditLockIcon(element){
    console.log(element.src);
    // Check if currently in edit mode by checking the current icon src or a data attribute
    const isEditMode = element.src.includes("edit");

    // Toggle the mode
    if (isEditMode) {
        // Switch to lock mode
        element.src = "images/lock.svg"; // Set to lock icon
        
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
      saveData();
      textElements.forEach((el) => el.setAttribute("contenteditable", "false"));
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
    newObjective.classList.add("objective");

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
            <li class="step" data-id="1-1">
              <span class="step_text" contenteditable="false">New Step</span>
              <span class="coin"><span class="coin_number" contenteditable="false">0</span><img class="coin_img" src="images/coin.svg"></span>
              <img src="images/delete.svg" alt="Delete" class="delete-step" />
              <ul class="sub-steps">
                <li class="sub-step" data-id="1-1-1">
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



document.getElementById('export-button').addEventListener('click', () => {
  const data = {
    questTitle: document.querySelector('.quest-title').innerText,
    questDescription: document.querySelector('.quest-description').innerText,
    totalCoin: document.querySelector('#total_coin').innerText,
    objectives: []
  };

  document.querySelectorAll('.objective').forEach(objective => {
    const objId = objective.dataset.id;
    const objText = objective.querySelector('.objective_text').innerText;
    
    const steps = [];
    objective.querySelectorAll('.step').forEach(step => {
      const stepId = step.dataset.id;
      const stepText = step.querySelector('.step_text').innerText;
      const coins = step.querySelector('.coin_number').innerText;

      const subSteps = [];
      step.querySelectorAll('.sub-step').forEach(subStep => {
        const subStepId = subStep.dataset.id;
        const subStepText = subStep.querySelector('.sub-step_text').innerText;
        const subStepCoins = subStep.querySelector('.coin_number')?.innerText || "0";
        
        subSteps.push({ id: subStepId, text: subStepText, coins: subStepCoins });
      });

      steps.push({ id: stepId, text: stepText, coins: coins, subSteps: subSteps });
    });

    data.objectives.push({ id: objId, text: objText, steps: steps });
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'appData.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('import-button').addEventListener('click', () => {
  document.getElementById('import-file').click();
});

document.getElementById('import-file').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      document.querySelector('.quest-title').innerText = data.questTitle;
      document.querySelector('.quest-description').innerText = data.questDescription;
      document.querySelector('#total_coin').innerText = data.totalCoin;

      const objectivesContainer = document.querySelector('.objectives');
      objectivesContainer.innerHTML = ''; // Clear existing objectives

      data.objectives.forEach(objData => {
        const objectiveElement = document.createElement('div');
        objectiveElement.classList.add('objective');
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

        objData.steps.forEach(stepData => {
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
          objectiveElement.querySelector('.steps').insertAdjacentHTML('beforeend', stepHTML);

          stepData.subSteps.forEach(subStepData => {
            const subStepHTML = `
              <li class="sub-step" data-id="${subStepData.id}">
                <span class="sub-step_text" contenteditable="false">${subStepData.text}</span>
                <span class="coin"><span class="coin_number" contenteditable="true">${subStepData.coins}</span><img class="coin_img" src="images/coin.svg"></span>
                <img src="images/delete.svg" alt="Delete" class="delete-sub-step" />
              </li>
            `;
            objectiveElement.querySelector('.sub-steps').insertAdjacentHTML('beforeend', subStepHTML);
          });
        });

        objectivesContainer.appendChild(objectiveElement);
      });

    } catch (error) {
      alert('Failed to load data: ' + error.message);
    }
  };
  reader.readAsText(file);
});
