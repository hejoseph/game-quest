document.addEventListener('DOMContentLoaded', () => {
    function updateObjectiveProgress(objective) {
        const steps = objective.querySelectorAll('.step');
        let totalNodes = 0;
        let completedNodes = 0;

        steps.forEach(step => {
            const subSteps = step.querySelectorAll('.sub-step');
            if(subSteps.length == 0){
                totalNodes += 1;
                if(step.style.textDecoration === 'line-through'){
                    completedNodes++;
                }
            } else {
                // Count completed sub-steps
                const completedSubSteps = Array.from(subSteps).filter(subStep => subStep.style.textDecoration === 'line-through').length;
                completedNodes += completedSubSteps;
            }
            totalNodes += subSteps.length;
        });

        // Update progress bar
        const objectiveProgress = objective.querySelector('.progress');
        const totalNodesCount = totalNodes; // Total nodes (including steps and sub-steps)
        const progressPercentage = totalNodesCount === 0 ? 0 : (completedNodes / totalNodesCount) * 100;
        objectiveProgress.style.width = progressPercentage + '%';
    }

    function updateStepProgress(step) {
        const subSteps = step.querySelectorAll('.sub-step');
        const completedSubSteps = Array.from(subSteps).filter(subStep => subStep.style.textDecoration === 'line-through').length;
        const allSubStepsCompleted = subSteps.length === completedSubSteps;

        // Mark the step as done if all sub-steps are completed
        if (allSubStepsCompleted) {
            step.style.textDecoration = 'line-through';
            step.style.color = '#aaa';
        } else {
            step.style.textDecoration = '';
            step.style.color = '#ccc';
        }
    }

    function handleDoubleClick(event) {
        const target = event.target;

        if (target.classList.contains('objective') || target.classList.contains('step') || target.classList.contains('sub-step')) {
            const originalText = target.textContent;
            target.classList.add('editable');
            target.contentEditable = true;
            target.focus();

            // Disable click handling while editing
            document.querySelector('.objectives').removeEventListener('click', handleClick);
            
            target.addEventListener('blur', function () {
                if (target.textContent.trim() === '') {
                    target.textContent = originalText; // Revert if empty
                }
                target.classList.remove('editable');
                target.contentEditable = false;

                // Re-enable click handling after editing
                document.querySelector('.objectives').addEventListener('click', handleClick);
            }, { once: true });
        }
    }

    function handleClick(event) {
        const objective = event.target.closest('.objective');
        if (!objective) return; // Ignore clicks outside objectives

        if (event.target.classList.contains('sub-step')) {
            const subStep = event.target;
            const step = subStep.closest('.step');
            const subSteps = step.querySelectorAll('.sub-step');

            // Toggle the sub-step
            if (subStep.style.textDecoration === 'line-through') {
                subStep.style.textDecoration = '';
                subStep.style.color = '#ccc';
            } else {
                subStep.style.textDecoration = 'line-through';
                subStep.style.color = '#aaa';
            }

            // Update step and objective progress
            updateStepProgress(step);
            updateObjectiveProgress(objective);
        }

        if (event.target.classList.contains('step')) {
            const step = event.target;
            const subSteps = step.querySelectorAll('.sub-step');

            // Toggle the step
            if (step.style.textDecoration === 'line-through') {
                step.style.textDecoration = '';
                step.style.color = '#ccc';
                subSteps.forEach(subStep => {
                    subStep.style.textDecoration = '';
                    subStep.style.color = '#ccc';
                });
            } else {
                step.style.textDecoration = 'line-through';
                step.style.color = '#aaa';
                subSteps.forEach(subStep => {
                    subStep.style.textDecoration = 'line-through';
                    subStep.style.color = '#aaa';
                });
            }

            // Update objective progress
            updateObjectiveProgress(objective);
        }
    }

    function handleDragStart(event) {
        event.target.classList.add('dragging');
        event.dataTransfer.setData('text/plain', event.target.dataset.id);
    }

    function handleDragEnd(event) {
        event.target.classList.remove('dragging');
    }

    function handleDragOver(event) {
        event.preventDefault();
        const target = event.target;
        const draggingElement = document.querySelector('.dragging');
        const isDraggingSubStep = draggingElement.classList.contains('sub-step');
        const targetIsStep = target.classList.contains('step');
        const targetIsSubStep = target.classList.contains('sub-step');

        if (isDraggingSubStep && (targetIsStep || targetIsSubStep)) {
            // Prevent sub-step from being dropped outside its parent step
            if (targetIsStep || (targetIsSubStep && target.closest('.step') === draggingElement.closest('.step'))) {
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
        const draggableElements = [...container.querySelectorAll('.step, .sub-step')].filter(el => el !== document.querySelector('.dragging'));
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    document.querySelector('.objectives').addEventListener('dblclick', handleDoubleClick);
    document.querySelector('.objectives').addEventListener('click', handleClick);

    // Enable drag and drop
    document.querySelectorAll('.step, .sub-step').forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.setAttribute('draggable', true);
    });
});
