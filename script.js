document.addEventListener('DOMContentLoaded', () => {
    function updateObjectiveProgress(objective) {
        const steps = objective.querySelectorAll('.step');
        let totalNodes = 0;
        let completedNodes = 0;

        steps.forEach(step => {
            const subSteps = step.querySelectorAll('.sub-step');
            if(subSteps.length==0){
                totalNodes += 1
                if(step.style.textDecoration === 'line-through'){
                    completedNodes++;
                }
            }else{
                // Count completed sub-steps
                const completedSubSteps = Array.from(subSteps).filter(subStep => subStep.style.textDecoration === 'line-through').length;
                completedNodes += completedSubSteps;
                // Check if step is completed
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

    document.querySelector('.objectives').addEventListener('click', (event) => {
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
    });
});
