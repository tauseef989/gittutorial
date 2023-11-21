
var headerTitle = document.getElementById('header-title');
var helloNode1 = document.createTextNode('Hello ');
headerTitle.parentElement.insertBefore(helloNode1, headerTitle);

var itemsList = document.getElementById('items');
var firstItem = itemsList.firstElementChild;
var helloNode2 = document.createTextNode('Hello ');
itemsList.insertBefore(helloNode2, firstItem);