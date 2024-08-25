document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("confirmation-modal");
  const confirmButton = document.getElementById("confirm-button");
  const cancelButton = document.getElementById("cancel-button");
  const closeButton = document.querySelector(".close-button");
  let itemToDelete;

  // Function to open the modal
  function openModal(message, item) {
    document.getElementById("modal-message").textContent = message;
    itemToDelete = item;
    modal.style.display = "block";
  }

  // Function to close the modal
  function closeModal() {
    modal.style.display = "none";
    itemToDelete = null; // Clear the item reference
  }

  // Event listener for delete button
  document.body.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-step")) {
      event.preventDefault(); // Prevent default action
      openModal(
        "Are you sure you want to delete this step?",
        event.target.closest(".step")
      );
    } else if (event.target.classList.contains("delete-sub-step")) {
      event.preventDefault(); // Prevent default action
      openModal(
        "Are you sure you want to delete this sub-step?",
        event.target.closest(".sub-step")
      );
    }
  });

  // Confirm deletion
  confirmButton.addEventListener("click", () => {
    if (itemToDelete) {
      itemToDelete.remove();
      closeModal();
    }
  });

  // Cancel deletion
  cancelButton.addEventListener("click", closeModal);

  // Close modal when clicking outside the modal content
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Close modal when clicking the close button
  closeButton.addEventListener("click", closeModal);

  function refreshDeleteObjectiveHook(){
    const deleteObjIcons = document.querySelectorAll(
      'img[alt="Delete_objective"]'
    );
    deleteObjIcons.forEach((icon) => {
      icon.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default action if needed
        currentObjectiveToDelete = icon.closest(".objective");
  
        if (currentObjectiveToDelete) {
          // Show the confirmation modal
          openModal(
            "Are you sure you want to delete this objective ?",
            currentObjectiveToDelete.closest(".objective")
          );
        }
      });
    });
  }

  // Expose refreshDeleteObjectiveHook to the global scope
  window.refreshDeleteObjectiveHook = refreshDeleteObjectiveHook;

  // Initial call to set up delete objective hooks
  refreshDeleteObjectiveHook();
});
