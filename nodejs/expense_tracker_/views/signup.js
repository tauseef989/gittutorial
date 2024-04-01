document.getElementById('submitForm').addEventListener('click', (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const obj = {
    Name: name,
    Email: email,
    Password: password
  };

  axios.post("http://44.204.25.6:8000/signup", obj) // Send POST request to backend
    .then(response => {
      console.log("Sent successfully", response.data);
      window.location.replace('./login.html');
    })
    .catch(error => {
      console.log("Failed", error.response.data.error);
    });
});