def permutation(num,start=0):
  if start==len(num)-1:
    permu.append("".join(num))
    return
  for i in range(start,len(num)):
    num[start],num[i]=num[i],num[start] 
    permutation(num,start+1)
    num[start],num[i]=num[i],num[start] 


permu=[]
arr="abc"
permutation(list(arr)) 
print(permu)

def subsequence(num,start=0,curr=[]):
  if start==len(num):
    subseq.append(curr[:])
  else:
    subsequence(num,start+1,curr+[num[start]])
    subsequence(num,start+1,curr)
arr=[1,2,3]
subseq=[]
subsequence(arr)
print(subseq)
              