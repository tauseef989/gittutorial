function handleformsubmit(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const userObject = {
    username: name,
    useremail: email,
    userphone: phone
  };

  if (typeof Storage !== "undefined") {
    const existingUsers = JSON.parse(localStorage.getItem("userdetails")) || [];
    existingUsers.push(userObject);
    localStorage.setItem("userdetails", JSON.stringify(existingUsers));
    alert("User details stored in Local storage");
    displayUsers();
  }
}

function displayUsers() {
  // Retrieve existing users from Local Storage
  const storedUsers = JSON.parse(localStorage.getItem('userdetails')) || [];

  // Display user information on the webpage
  const userInfoDiv = document.getElementById('userInfo');
  userInfoDiv.innerHTML = '<h2>User Information:</h2>';

  // Display each user with delete and edit buttons
  storedUsers.forEach((user, index) => {
    const userContainer = document.createElement('div');
    userContainer.classList.add('user-container');

    userContainer.innerHTML = `
      <p><strong>Name:</strong> ${user.username}</p>
      <p><strong>Email:</strong> ${user.useremail}</p>
      <p><strong>Phone:</strong> ${user.userphone}</p>
      <button onclick="editUser(${index})">Edit</button>
      <button onclick="deleteUser(${index})">Delete</button>
    `;

    userInfoDiv.appendChild(userContainer);
  });
}

function deleteUser(index) {
  const storedUsers = JSON.parse(localStorage.getItem('userdetails')) || [];
  storedUsers.splice(index, 1);
  localStorage.setItem('userdetails', JSON.stringify(storedUsers));
  displayUsers();
}

function editUser(index) {
  const storedUsers = JSON.parse(localStorage.getItem('userdetails')) || [];
  const userToEdit = storedUsers[index];

  // Populate form fields with the user details for editing
  document.getElementById('name').value = userToEdit.username;
  document.getElementById('email').value = userToEdit.useremail;
  document.getElementById('phone').value = userToEdit.userphone;

  // Delete the user from the array
  storedUsers.splice(index, 1);

  // Update the local storage with the modified array
  localStorage.setItem('userdetails', JSON.stringify(storedUsers));

  // Refresh the user list
  displayUsers();
}

// Call the function to display user details when the page loads
displayUsers();

// Add an event listener for form submission
const userform = document.getElementById("userinput");
userform.addEventListener("submit", handleformsubmit);