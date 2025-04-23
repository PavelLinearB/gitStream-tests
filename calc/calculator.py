from operator import add, sub, mul
 
def calc():
   op = input("Enter operator +-*: ")
   n1 = int(input('Fist number: '))
   n2 = int(input('Second number: '))
   operators = {'+': add(n1, n2), '-': sub(n1, n2), '*': mul(n1, n2)}
   if op in operators:
       print('{} {} {} = {}'.format(n1, op, n2, operators[op]))
   input('Press enter to return menu\n')
 
def menu():
   while True:
       print('(1) Calculate 2 numbers')
       print('(Q) Quit')
       choice = input('Enter your choice: ').lower()
       if choice == '1':
           calc()
       elif choice == 'q':
           return False
       else:
           print('Not a correct choice: <{}>,try again'.format(choice))
 
if __name__ == '__main__':
   menu()
