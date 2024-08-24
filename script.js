document.querySelectorAll('.objective').forEach(objective => {
    const steps = objective.querySelectorAll('.step');
    const progressBar = objective.querySelector('.progress');
    
    // Function to update the progress bar of the objective
    const updateObjectiveProgress = () => {
        const totalSteps = steps.length;
        let completedSteps = 0;

        steps.forEach(step => {
            if (step.style.textDecoration === 'line-through') {
                completedSteps++;
            }
        });

        const progressPercentage = (completedSteps / totalSteps) * 100;
        progressBar.style.width = progressPercentage + '%';
    };

    steps.forEach(step => {
        const subSteps = step.querySelectorAll('.sub-step');
        let completedSubSteps = 0;

        // Function to update the parent step's progress
        const updateParentProgress = () => {
            const totalSubSteps = subSteps.length;
            if (totalSubSteps === 0) return; // No sub-steps to update

            const progressPercentage = (completedSubSteps / totalSubSteps) * 100;
            const progressElement = step.querySelector('.progress');

            if (progressElement) {
                progressElement.style.width = progressPercentage + '%';
            }

            // Mark the parent step as done if all sub-steps are done
            if (completedSubSteps === totalSubSteps) {
                step.style.textDecoration = 'line-through';
                step.style.color = '#aaa';
            } else {
                step.style.textDecoration = '';
                step.style.color = '#ccc';
            }

            // Update the objective progress bar
            updateObjectiveProgress();
        };

        // Add event listeners to sub-steps
        subSteps.forEach(subStep => {
            subStep.addEventListener('click', () => {
                // Toggle the sub-step
                if (subStep.style.textDecoration === 'line-through') {
                    subStep.style.textDecoration = '';
                    subStep.style.color = '#ccc';
                    completedSubSteps--; // Decrease completed sub-steps count
                } else {
                    subStep.style.textDecoration = 'line-through';
                    subStep.style.color = '#aaa';
                    completedSubSteps++; // Increase completed sub-steps count
                }

                // Update parent step progress
                updateParentProgress();
            });
        });

        // Initialize progress for steps with sub-steps
        updateParentProgress();
    });

    // Add event listeners to steps
    steps.forEach(step => {
        if (step.querySelectorAll('.sub-step').length === 0) {
            step.addEventListener('click', () => {
                if (step.style.textDecoration === 'line-through') {
                    step.style.textDecoration = '';
                    step.style.color = '#ccc';
                } else {
                    step.style.textDecoration = 'line-through';
                    step.style.color = '#aaa';
                }

                // Update the objective progress bar
                updateObjectiveProgress();
            });
        }
    });

    // Initial progress update for objectives
    updateObjectiveProgress();
});
