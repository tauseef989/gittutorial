const num1element=document.getElementById('num1') as HTMLInputElement;
const num2element=document.getElementById('num2') as HTMLInputElement;
const buttonelement=document.querySelector('button');

const numresult:number[]=[];
const textresult:string[]=[];
function add(num1:number|string,num2:number|string){
  if(typeof num1==='number' && typeof num2==='number'){
    return num1+num2;
  }

  else if(typeof num1==='string' && typeof num2==='string'){
    return num1+''+num2;
  return +num1 + +num2;
}
}
buttonelement.addEventListener('click',()=>{
  const num1=num1element.value ;
  const num2=num2element.value;
  const result=add(+num1,+num2);
  numresult.push(result as number)
  const stringedresult=add(+num1,+num2);
  textresult.push(stringedresult as string)
  console.log(result);
  console.log(stringedresult);
  console.log(numresult,textresult)
});