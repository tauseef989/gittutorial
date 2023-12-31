# n=10 
# s=["*","/","+","-"]
# arr=[]
# for i in range(n,0,-1):
#   arr.append(i)
#   if i!=1:
#     y=(n-i)%len(s)
#     arr.append(s[y])
# print(arr)
# fact=0
# i=0
# while len(arr)>i:
#   if arr[i]=="*" or arr[i]=="/":
#     if arr[i]=="*":
#       x=arr[i-1]*arr[i+1]
#       arr.pop(i-1)
#       arr.pop(i-1)
#       arr.pop(i-1)
#       arr.insert(i-1,x)
#       i=0
#     else:
#       y=arr[i-1]/arr[i+1]
#       arr.pop(i-1)
#       arr.pop(i-1)
#       arr.pop(i-1)
#       arr.insert(i-1,y)
#       i=0

#   else:
#     i+=1
# i=0
# while len(arr)>i:
#   if arr[i]=="+" or arr[i]=="-":
#     if arr[i]=="+":
#       x=arr[i-1]+arr[i+1]
#       arr.pop(i-1)
#       arr.pop(i-1)
#       arr.pop(i-1)
#       arr.insert(i-1,x)
#       i=0
#     else:
#       y=arr[i-1]-arr[i+1]
#       arr.pop(i-1)
#       arr.pop(i-1)
#       arr.pop(i-1)
#       arr.insert(i-1,y)
#       i=0

#   else:
#     i+=1
# print(arr)
k=10 
n=10
arr=[] 
while len(arr)<n:
  l=k
  s=0
  while k>0:
    rem=k%10
    s=s+rem
    k=k//10
  if l%s==0:
    arr.append(l) 
  else:
    k=l+1  
print(arr)

  
    
    

  