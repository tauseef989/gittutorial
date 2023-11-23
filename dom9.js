    // Function to handle form submission
    function handleFormSubmit(event) {
      event.preventDefault(); // Prevents the default form submission

      // Get user details from the form
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const date = document.getElementById('meeting-date').value;
      const time = document.getElementById('meeting-time').value;

      // Create a user object
      const user = {
        name: name,
        email: email,
        phone: phone,
        date: date,
        time: time
      };

      // Check if Local Storage is supported by the browser
      if (typeof(Storage) !== 'undefined') {
        // Retrieve existing users from Local Storage
        const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

        // Add the new user to the array
        existingUsers.push(user);

        // Store the updated array in Local Storage
        localStorage.setItem('users', JSON.stringify(existingUsers));

        alert('User details stored in Local Storage!');
      } else {
        alert('Local Storage is not supported by your browser.');
      }
    }

    // Attach the form submission event listener
    const userForm = document.getElementById('userForm');
    userForm.addEventListener('submit', handleFormSubmit);