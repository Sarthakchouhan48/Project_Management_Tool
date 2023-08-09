let users = JSON.parse(localStorage.getItem('users')) || [];

function initializeUserChips() {
  userChips.innerHTML = ''; // Clear existing chips
  users.forEach(user => {
    userChips.appendChild(createUserChip(user.name)); // Add chips to the UI
  });
}

// Initialize user chips when the page loads
initializeUserChips();

const addUser = document.getElementById('addUser');
const saveUserEl = document.getElementById('saveUser');
const modal = document.getElementById('myModal');
const modalUserInput = document.getElementById('modalUserInput');
const close = document.getElementById('close');
const userSelect = document.getElementById('userSelect');

addUser.addEventListener('click', openModal);
close.addEventListener('click', closeModal);
saveUserEl.addEventListener('click', saveUser);
function openModal() {
  modal.style.display = 'block';
}

function closeModal() {
  modal.style.display = 'none';
  modalUserInput.value = '';
}

function createUserChip(userName) {
  const chip = document.createElement('div');
  chip.classList.add('user-chip');
  chip.innerHTML = `<span class="user-name">${userName}</span> <span class="delete-button" onclick="deleteUser(this)">×</span>`;
  return chip;
}
function saveUsersToLocalStorage() {
  localStorage.setItem('users', JSON.stringify(users));
}
function saveUser() {
  const userName = modalUserInput.value.trim();
  if (userName !== '') {
    const user = {
      id: Date.now().toString(),
      name: userName,
      task: [],
      messages: []
    };
    users.push(user);
    userChips.appendChild(createUserChip(userName)); // Also add a chip to the UI
    saveUsersToLocalStorage();
    closeModal();
  }
}

// Function to delete a user
function deleteUser(deleteButton) {
  const chip = deleteButton.closest('.user-chip');
  const userName = chip.querySelector('.user-name').textContent;
  const userId = users.find(user => user.name === userName).id;
  users = users.filter(user => user.id !== userId);
  saveUsersToLocalStorage();
  chip.remove();
}
function updateTaskTable() {
  taskTableBody.innerHTML = ''; // Clear existing table rows

  users.forEach(user => {
    user.task.forEach(task => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${task.id}</td>
        <td>${task.name}</td>
        <td class="status-cell" data-task-id="${task.id}">
          <select class="status-select">
            <option value="Progress" ${task.status === 'Progress' ? 'selected' : ''}>Progress</option>
            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td>${task.isStarted ? 'Yes' : 'No'}</td> 
        <td>${calculateDuration(task.started, task.ended)}</td>
        <td><button class="edit-button" data-task-id="${task.id}" style="margin: 0.5rem 0.5rem ;" >Edit</button>
        <button class="timer-button" data-task-id="${task.id}" style="margin: 0.5rem 0.5rem ;">${task.isStarted ? 'End' : 'Start'} Timer</button>
        </td>
      `;
      taskTableBody.appendChild(row);
    });
  });
}
function getCurrentTimeInTaskStartEndFormat() {
  let current_datetime = new Date();
  var date = current_datetime.getDate();
  date = date < 10 ? "0" + date : date;
  var month = current_datetime.getMonth() + 1;
  month = month < 10 ? "0" + month : month;
  var hours = current_datetime.getHours();
  hours = hours < 10 ? "0" + hours : hours;
  var minutes = current_datetime.getMinutes();
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var seconds = current_datetime.getSeconds();
  seconds = seconds < 10 ? "0" + seconds : seconds;
  let formatted_date =
    current_datetime.getFullYear() +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;
  return formatted_date;
}

const taskModal = document.getElementById('taskModal');
const modalUserSelect = document.getElementById('userSelect');
const modalTaskInput = document.getElementById('modalTaskInput');
const modalTaskButton = document.getElementById('modalTaskButton');

// Function to open the task modal for adding/editing tasks
function openTaskModal(mode, taskId = null) {
  console.log(taskId, mode)
  if (mode === 'add') {
    modalTaskButton.textContent = 'Add Task';
    modalUserSelect.innerHTML = '';
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.name;
      option.textContent = user.name;
      modalUserSelect.appendChild(option);
    });
    modalUserSelect.disabled = false;  
    modalUserSelect.value = ''; // Clear previous selection
    modalTaskInput.value = ''; // Clear previous task input
    modalTaskButton.onclick = saveTask;
  } else if (mode === 'edit' && taskId !== null) {
    const selectedTask = findTaskById(taskId);
    if (selectedTask) {
      modalTaskButton.textContent = 'Edit Task';
      modalUserSelect.disabled = true; // Disabling user selection for editing
      modalUserSelect.value = selectedTask.user; // Set the user for the selected task
      modalTaskInput.value = selectedTask.name;
      modalTaskButton.onclick = function() {
        editTask(taskId);
      };
    }
  }
  taskModal.style.display = 'block';
}

// ... (your existing functions for openModal, closeModal, saveUser, deleteUser, createUserChip, initializeUserChips, initializeUserSelect, assignTask, changeTaskStatus, updateTaskTable, and saveTask) ...

// Function to edit a task
function editTask(taskId) {
  console.log("In editTask")
  const newName = modalTaskInput.value.trim();
  if (newName !== '') {
    const selectedTask = findTaskById(taskId);
    if (selectedTask) {
      selectedTask.name = newName;
      saveUsersToLocalStorage();
      closeTaskModal();
      updateTaskTable();
    }
  }
}

// Function to save a task
function saveTask() {
  const userName = modalUserSelect.value;
  const taskText = modalTaskInput.value.trim();

  if (userName !== '' && taskText !== '') {
    const user = users.find(user => user.name === userName);
    if (user) {
      const task = {
        id: "T_" + userName + "_" +  (Math.random().toFixed(2) * 100 +  user?.task?.length),
        name: taskText,
        status: 'Progress',
        isStarted: false,
        logs: [],
        started: getCurrentTimeInTaskStartEndFormat(),
        ended: '',
        user: userName // Add the user's name to the task object
      };
      user.task.push(task);
      saveUsersToLocalStorage();
      closeTaskModal();
      updateTaskTable();
    }
  }
}

// Function to find a task by its ID
function findTaskById(taskId) {
  for (const user of users) {
    const task = user.task.find(task => task.id === taskId);
    if (task) {
      return task;
    }
  }
  return null;
}


function initializeUserSelect() {
  userSelect.innerHTML = '<option value="">Select a user</option>';
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.name;
    option.textContent = user.name;
    userSelect.appendChild(option);
  });
}

function changeTaskStatus(taskId, newStatus) {
  users.forEach(user => {
    const taskToUpdate = user.task.find(task => task.id === taskId);
    if (taskToUpdate) {
      taskToUpdate.status = newStatus;
    }
  });
  saveUsersToLocalStorage();
  updateTaskTable(); // Update the task table after changing the status
}

 
// Add event listener to task table for changing status
taskTableBody.addEventListener('click', function (event) {
  const target = event.target;
  if (target.tagName === 'TD' && target.classList.contains('status-cell')) {
    const taskId = parseInt(target.getAttribute('data-task-id'));
    const newStatus = target.querySelector('.status-select').value;
    changeTaskStatus(taskId, newStatus);
  }

  if (target.tagName === 'BUTTON' && target.classList.contains('edit-button')) {
    const taskId = target.getAttribute('data-task-id');
    console.log(taskId)
    const selectedTask = users.reduce((acc, user) => {
      const task = user.task.find(task => task.id === taskId);
      if (task) {
        acc = task;
      }
      return acc;
    }, null);

    openTaskModal('edit', selectedTask?.id);
  }

  if (target.tagName === 'BUTTON' && target.classList.contains('timer-button')) {
    const taskId =  target.getAttribute('data-task-id');
    toggleTaskTimer(taskId);
  }
});

function closeTaskModal() {
  taskModal.style.display = 'none';
  modalUserSelect.value = '';
  modalTaskInput.value = '';
}

// Add event listener to close button in task modal
const closeTaskModalButton = document.querySelector('.modal .close');
if (closeTaskModalButton) {
  closeTaskModalButton.addEventListener('click', closeTaskModal);
}

 // Function to start or end the timer for a task
 function toggleTaskTimer(taskId) {
  const selectedTask = findTaskById(taskId);
  if (selectedTask) {
    if (!selectedTask.isStarted) {
      selectedTask.isStarted = true;
      selectedTask.started = getCurrentTimeInTaskStartEndFormat();
      updateTaskTable();
    } else {
      selectedTask.isStarted = false;
      selectedTask.ended = getCurrentTimeInTaskStartEndFormat();
      selectedTask.logs.push(`Duration: ${calculateDuration(selectedTask.started, selectedTask.ended)}`);
      updateTaskTable();
    }
    console.log(selectedTask)
    saveUsersToLocalStorage();
  }
}

// Function to calculate duration between two times (in HH:mm:ss format)
function calculateDuration(start, end) {
  console.log('calc', start, end)
  const startTime = new Date(start);
  const endTime = new Date(end);
  const durationMillis = endTime - startTime;
  const hours = Math.floor(durationMillis / (60 * 60 * 1000));
  const minutes = Math.floor((durationMillis % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((durationMillis % (60 * 1000)) / 1000);
  return `${hours}:${minutes}:${seconds}`;
}

const chatModal = document.getElementById('chatModal');
const recipientSelect = document.getElementById('recipientSelect');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messageList = document.getElementById('messageList'); // Add this line

  // Function to close the chat modal
  function closeChatModal() {
    chatModal.style.display = 'none';
    recipientSelect.value = '';
    messageInput.value = '';
  }

  // Function to send a message
  function sendMessage() {
    const recipientName = recipientSelect.value;
    const messageText = messageInput.value.trim();

    if (recipientName !== '' && messageText !== '') {
      const recipient = users.find(user => user.name === recipientName);
      if (recipient) {
        const message = {
          sender:  "Admin",
          content: messageText,
          timestamp: new Date().toLocaleDateString()
        };
        recipient?.messages?.push(message);
        saveUsersToLocalStorage();
        closeChatModal()
      }
    }
  }

function openChatModal() {
  recipientSelect.innerHTML = '';
  users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.name;
      option.textContent = user.name;
      recipientSelect.appendChild(option);
  });
  recipientSelect.value = ''; // Clear previous selection
  messageInput.value = ''; // Clear previous message

  // Clear existing messages and populate with selected recipient's messages
  messageList.innerHTML = '';
  const selectedRecipient = recipientSelect.value;
  const recipient = users.find(user => user.name === selectedRecipient);
  if (recipient) {
    recipient.messages.forEach(message => {
      displayMessage(message.sender, message.content, message.timestamp);
    });
  }

  chatModal.style.display = 'block';
}

// ... (your existing functions for closeChatModal, sendMessage, and other functions) ...

// Function to display a message in the chat modal
function displayMessage(sender, content, timestamp) {
  const messageItem = document.createElement('li');
  messageItem.innerHTML = `<strong>${sender}:</strong> ${content} (${timestamp})`;
  messageList.appendChild(messageItem);
}

recipientSelect.addEventListener('change', function() {
  const selectedRecipient = recipientSelect.value;
  const recipient = users.find(user => user.name === selectedRecipient);
  if (recipient) {
    messageList.innerHTML = ''; // Clear existing messages
    recipient.messages.forEach(message => {
      displayMessage(message.sender, message.content, message.timestamp);
    });
  }
});

// Initialize user select options when the page loads
initializeUserSelect();

updateTaskTable()