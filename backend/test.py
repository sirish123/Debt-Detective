import numpy as np
import matplotlib.pyplot as plt
import yaml


b = np.array([3/2,7/2,15/2,31/2])
n_values = [20,40,60,80,100]
k = 3
ystr = yaml.dump({'a0': 1, 'a1': 2, 'a2': 3})
y = yaml.load(ystr)
yaml.dump(y)
def cal_beta(gama):
    num=0
    for i in range(k+1):
        num = num + pow(gama,i)
    
    dem =0
    for i in range(k+1):
        dem = dem+b[i]*pow(gama,i)

    return num/dem



def cal_gama(beta,n):
    return 1-pow((1-beta),n-1)


final_converged_gama = []

def cal_goodput(n,gama):
    return n*gama*(1-gama)**(n-1)

