const API_URL = "http://localhost:8080/api/tasks";

document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');

    // 1. INITIAL FETCH: Get existing tasks from MySQL
    const loadTasks = async () => {
        try {
            const response = await fetch(API_URL);
            const tasks = await response.json();
            tasks.forEach(task => renderTask(task));
        } catch (error) {
            console.error("NEURAL LINK FAILURE: Could not connect to backend", error);
        }
    };

    // 2. RENDER FUNCTION: Creates the UI elements
    const renderTask = (task) => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        
        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.title;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'TERMINATE';

        // Checkbox Logic (Update Backend)
        checkbox.addEventListener('change', async () => {
            li.classList.toggle('completed');
            await fetch(`${API_URL}/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...task, completed: checkbox.checked })
            });
        });

        // Delete Logic (Update Backend)
        deleteBtn.addEventListener('click', async () => {
            li.style.transform = 'translateX(50px)';
            li.style.opacity = '0';
            
            try {
                await fetch(`${API_URL}/${task.id}`, { method: 'DELETE' });
                setTimeout(() => li.remove(), 300);
            } catch (err) {
                console.error("DELETION FAILED", err);
                li.style.transform = 'translateX(0)';
                li.style.opacity = '1';
            }
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    };

    // 3. ADD TASK: Send to Backend
    const addTask = async () => {
        const text = taskInput.value.trim();
        if (text === '') return;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: text, completed: false })
            });
            const newTask = await response.json();
            renderTask(newTask);
            taskInput.value = '';
        } catch (error) {
            alert("SYSTEM ERROR: Data stream interrupted.");
        }
    };

    // Event Listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Initial Load
    loadTasks();
});