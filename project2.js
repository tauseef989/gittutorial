function handleformsubmit(event){
  event.preventDefault();
  const price=document.getElementById("Price").value;
  const dish=document.getElementById("Dish").value;
  const table=document.getElementById("Table").value;
  const object={ "Choose Price":price,"Choose Dish": dish,"Choose Table":table} 
  if (typeof Storage !=="undefined"){
    const existing_user= JSON.parse(localStorage.getItem("customerorders")) || [];
    existing_user.push(object) 
    localStorage.setItem("customerorders",JSON.stringify(existing_user));
    alert("customer order is taken");
    displayUsers();
  }
  
}
function displayUsers(){
  
}

const details =document.getElementById("order");
details.addEventListener("submit",handleformsubmit);