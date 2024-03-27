var num1element = document.getElementById('num1');
var num2element = document.getElementById('num2');
var buttonelement = document.querySelector('button');
var numresult = [];
var textresult = [];
function add(num1, num2) {
    if (typeof num1 === 'number' && typeof num2 === 'number') {
        return num1 + num2;
    }
    else if (typeof num1 === 'string' && typeof num2 === 'string') {
        return num1 + '' + num2;
        return +num1 + +num2;
    }
}
buttonelement.addEventListener('click', function () {
    var num1 = num1element.value;
    var num2 = num2element.value;
    var result = add(+num1, +num2);
    numresult.push(result);
    var stringedresult = add(+num1, +num2);
    textresult.push(stringedresult);
    console.log(result);
    console.log(stringedresult);
    console.log(numresult, textresult);
});
