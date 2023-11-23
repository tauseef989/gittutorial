
// Function to handle form submission
function handleFormSubmit(event) {
  event.preventDefault(); // Prevents the default form submission

  // Get user details from the form
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const date = document.getElementById('meeting-date').value;
  const time = document.getElementById('meeting-time').value;

  // Check if Local Storage is supported by the browser
  if (typeof(Storage) !== 'undefined') {
    // Store user details in Local Storage
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('userDate', date);
    localStorage.setItem('userTime', time);

    alert('User details stored in Local Storage!');
  } else {
    alert('Local Storage is not supported by your browser.');
  }
}

// Attach the form submission event listener
const userForm = document.getElementById('userForm');
userForm.addEventListener('submit', handleFormSubmit);
