document.getElementById('order').addEventListener('submit', handleFormSubmit);

function handleFormSubmit(event) {
  event.preventDefault();

  const price = document.getElementById('Price').value;
  const dish = document.getElementById('Dish').value;
  const table = document.getElementById('Table').value;

  const order = {
    "Choose Price": price,
    "Choose Dish": dish,
    "Choose Table": table
  };

  axios.post('https://crudcrud.com/api/b9c76d7fe18448afa6fcca68dd9b88fe/orders', order)
    .then(response => {
      console.log(response.data);
      alert('Order placed successfully!');
      document.getElementById('order').reset();
      displayOrders();
    })
    .catch(error => {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    });
}

function displayOrders() {
  axios.get('https://crudcrud.com/api/b9c76d7fe18448afa6fcca68dd9b88fe/orders')
    .then(response => {
      console.log(response.data);

      const displayInfoElement = document.getElementById('displayInfo');
      displayInfoElement.innerHTML = '<h3>Order Information:</h3>';

      response.data.forEach(order => {
        const orderId = order._id;

        displayInfoElement.innerHTML += `
          <p><strong>Price:</strong> ${order["Choose Price"]}</p>
          <p><strong>Dish:</strong> ${order["Choose Dish"]}</p>
          <p><strong>Table:</strong> ${order["Choose Table"]}</p>
          <button class="delete-btn" onclick="deleteOrder('${orderId}')">Delete</button>
          <button class="edit-btn" onclick="editOrder('${orderId}')">Edit</button>
          <hr>
        `;
      });
    })
    .catch(error => {
      console.error('Error retrieving orders:', error);
    });
}

function deleteOrder(orderId) {
  axios.delete(`https://crudcrud.com/api/b9c76d7fe18448afa6fcca68dd9b88fe/orders/${orderId}`)
    .then(() => {
      console.log('Order deleted successfully!');
      alert('Order deleted successfully!');
      displayOrders();
    })
    .catch(error => {
      console.error('Error deleting order:', error);
      alert('Error deleting order. Please try again.');
    });
}

function editOrder(orderId) {
  axios.get(`https://crudcrud.com/api/b9c76d7fe18448afa6fcca68dd9b88fe/orders/${orderId}`)
    .then(response => {
      const order = response.data;
      document.getElementById('Price').value = order["Choose Price"];
      document.getElementById('Dish').value = order["Choose Dish"];
      document.getElementById('Table').value = order["Choose Table"];
      document.getElementById('order').removeEventListener('submit', handleFormSubmit);
      document.getElementById('order').addEventListener('submit', event => submitEditedForm(event, orderId));
    })
    .catch(error => {
      console.error('Error retrieving order for editing:', error);
      alert('Error retrieving order for editing. Please try again.');
    });
}

function submitEditedForm(event, orderId) {
  event.preventDefault();

  const price = document.getElementById('Price').value;
  const dish = document.getElementById('Dish').value;
  const table = document.getElementById('Table').value;

  const updatedOrder = {
    "Choose Price": price,
    "Choose Dish": dish,
    "Choose Table": table
  };

  axios.put(`https://crudcrud.com/api/b9c76d7fe18448afa6fcca68dd9b88fe/orders/${orderId}`, updatedOrder)
    .then(response => {
      console.log(response.data);
      alert('Order updated successfully!');
      document.getElementById('order').
