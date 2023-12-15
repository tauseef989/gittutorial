x= "azxxzy"
x=list(x)
i=1
while i<len(x):
  if x[i]==x[i-1]:
    x.pop(i-1)
    x.pop(i-1)
    i=i-1
  else:
    i+=1
print(("").join(x))
x= "azxxzy"
arr=[]
arr.append(x[0])
for i in range(1,len(x)):
  arr.append(x[i])
  if len(arr)>=2 and arr[-1]==arr[-2]:
    arr.pop()
    arr.pop()
print(("").join(arr))

