document.querySelectorAll('.objective').forEach(objective => {
    const steps = objective.querySelectorAll('li');
    const progressBar = objective.querySelector('.progress');
    let completedSteps = 0; // Track the number of completed steps

    steps.forEach(step => {
        step.addEventListener('click', () => {
            // Check if the step is already completed
            if (step.style.textDecoration === 'line-through') {
                // Undo the task
                step.style.textDecoration = '';
                step.style.color = '#ccc';
                completedSteps--; // Decrease completed steps count
            } else {
                // Complete the task
                step.style.textDecoration = 'line-through';
                step.style.color = '#aaa';
                completedSteps++; // Increase completed steps count
            }

            // Update progress bar
            const progressPercentage = (completedSteps / steps.length) * 100;
            progressBar.style.width = progressPercentage + '%';
        });
    });
});
