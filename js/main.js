// MyDay Planner inputs in form
const inputs = document.querySelectorAll('.input');

function addFocusClass() {
	const parent = this.parentNode.parentNode;
	parent.classList.add('focus');
}

function removeFocusClass() {
	const parent = this.parentNode.parentNode;
	if(this.value === '') {
		parent.classList.remove('focus');
	}
}

inputs.forEach((input) => {
  	input.addEventListener('focus', addFocusClass);
  	input.addEventListener('blur', removeFocusClass);
});

// App MyDay Planner
const messageFeedback = document.querySelectorAll('.message-feedback');
const todoAddButton = document.querySelector('.js-add-todo');
const todoListDownloadButton = document.querySelector('.js-todo-list-download');
const todoListPrint = document.querySelector('.js-todo-list-print');

let todoList = JSON.parse(localStorage.getItem('todoList')) || [
	{
	  	taskName: 'Testowa nazwa',
	  	taskDescription: 'Testowy opis',
	  	taskDueDate: '31.07.2023 18:40'
	}
];
  
sortTodoListByDate(todoList);
renderTodoList();

todoAddButton.addEventListener('click', handleAddTodo);

todoListDownloadButton.addEventListener('click', () => {
	downloadArrayAsText(todoList, 'todo-list.txt');
});

todoListPrint.addEventListener('click', () => {
	window.print();
});

function sortTodoListByDate(todoList) {
	todoList.sort((a, b) => {
        const dateA = new Date(
            a.taskDueDate.substr(6, 4),
            a.taskDueDate.substr(3, 2) - 1,
            a.taskDueDate.substr(0, 2),
            a.taskDueDate.substr(11, 2),
            a.taskDueDate.substr(14, 2)
        );

        const dateB = new Date(
            b.taskDueDate.substr(6, 4),
            b.taskDueDate.substr(3, 2) - 1,
            b.taskDueDate.substr(0, 2),
            b.taskDueDate.substr(11, 2),
            b.taskDueDate.substr(14, 2)
        );
		
        return dateA - dateB;
    });
}

function formatDatetime(dateTimeValue) {
	const datetime = new Date(dateTimeValue);
	const day = datetime.getDate().toString().padStart(2, '0');
	const month = (datetime.getMonth() + 1).toString().padStart(2, '0');
	const year = datetime.getFullYear();
	const hours = datetime.getHours().toString().padStart(2, '0');
	const minutes = datetime.getMinutes().toString().padStart(2, '0');

	return `${day}.${month}.${year} ${hours}:${minutes}`;
} 

function validateInput(input, index, errorMessage) {
    if (input.trim() === '') {
        messageFeedback[index].textContent = errorMessage;
        return false;
    } else {
        messageFeedback[index].textContent = '';
        return true;
    }
}

function handleAddTodo() {
    const taskNameInput = document.querySelector('.js-task-name');
    const taskDescriptionInput = document.querySelector('.js-task-description');
    const taskDueDateInput = document.querySelector('.js-task-due-date');

    const taskName = taskNameInput.value.trim();
    const taskDescription = taskDescriptionInput.value.trim();
    let taskDueDate = taskDueDateInput.value.trim();

    let isValid = true;

    isValid = validateInput(taskName, 0, 'Wprowadź nazwę zadania.') && isValid;
    isValid = validateInput(taskDescription, 1, 'Wprowadź opis zadania.') && isValid;
    isValid = validateInput(taskDueDate, 2, 'Wprowadź termin wykonania zadania.') && isValid;

    if(!isValid) {
        return;
    }

	taskDueDate = formatDatetime(taskDueDateInput.value.trim());

    todoList.push({
        taskName,
        taskDescription,
        taskDueDate
    });

    taskNameInput.value = '';
    taskDescriptionInput.value = '';
    taskDueDateInput.value = '';

	localStorage.setItem('todoList', JSON.stringify(todoList));

	sortTodoListByDate(todoList);
    renderTodoList();

	inputs.forEach((input) => {
		const parent = input.parentNode.parentNode;
		parent.classList.remove('focus');
  	});
}

function renderTodoList() {
	const tasksList = document.querySelector('.js-tasks-list');
	let tasksListHTML = '';
  
	todoList.forEach((taskObject, taskIndex) => {
		const { taskName, taskDescription, taskDueDate } = taskObject;
		const html = `
			<tr>
				<td>${taskName}</td>
				<td>${taskDescription}</td>
				<td>${taskDueDate}</td>
				<td>
					<button class="js-delete-task author-button color-dark slide-bottom ripple" data-mdb-ripple-color="light" data-task-index="${taskIndex}">Usuń zadanie</button>
				</td>
			</tr>
		`;
		tasksListHTML += html;
	});
  
	tasksList.innerHTML = tasksListHTML;
  
	setupDeleteHandlers();
}

function setupDeleteHandlers() {
	const taskDeleteButtons = document.querySelectorAll('.js-delete-task');
  
	taskDeleteButtons.forEach(deleteButton => {
	  	deleteButton.removeEventListener('click', handleDeleteTask);
	  	deleteButton.addEventListener('click', handleDeleteTask);
	});
}
  
function handleDeleteTask() {
	const taskIndex = this.dataset.taskIndex;

	todoList.splice(taskIndex, 1);

	localStorage.setItem('todoList', JSON.stringify(todoList));

	sortTodoListByDate(todoList);
	renderTodoList();
}

function downloadArrayAsText(arrayToSave, fileName) {
	let isValid = true;
		
	if(arrayToSave.length === 0) {
		messageFeedback[3].textContent = "Zanim pobierzesz plik, upewnij się, że masz stworzone odpowiednie aktywności na swój harmonogram.";
	} else {
		const contentToSave = arrayToSave.map((task, taskIndex) => {
			return `Zadanie ${taskIndex + 1}\n`
				+ `- Nazwa: ${task.taskName}\n`
				+ `- Opis: ${task.taskDescription}\n`
				+ `- Termin: ${task.taskDueDate}\n\n`;
		}).join('');
	
		const blob = new Blob([contentToSave], { type: 'text/plain' });
	
		const downloadLink = document.createElement('a');
		downloadLink.href = URL.createObjectURL(blob);
	
		downloadLink.download = fileName;
	
		downloadLink.style.display = 'none';
		document.body.appendChild(downloadLink);
	
		downloadLink.click();
	
		document.body.removeChild(downloadLink);
	}
}