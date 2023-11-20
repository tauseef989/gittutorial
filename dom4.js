var secondItem = document.querySelectorAll('.li')[1];
secondItem.style.color = 'green';

var oddItems = document.querySelectorAll('.li:nth-child(odd)');
oddItems.forEach(function(li) {
  li.style.backgroundColor = 'green';