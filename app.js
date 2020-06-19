
//Budget controller
var budgetController = (function() {

    var i = 0;

    //assign user input to as one item
    var addIncome = function(id, description, value) {
        
        this.id = id;
        this.description = description;
        this.value = value; 
    };

    var addExpense = function(id,description,value) {
    
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = 0;
    };


    var calculateTotals = function(type) {
        var sum = 0 ;

        data.allItems[type].forEach(function(current) {
            sum = sum + parseInt(current.value);

            console.log(current.value);
            console.log(sum);
        });
        data.totals[type] = sum;
    };

    var data = {

        allItems: {
            inc: [],
            exp: []
        },
        
        totals: {
            inc: 0,
            exp: 0
        },

        budget: 0,
        percentage: 0
    };


    return{
        
        addItem: function(type, description, value) {
            var ID, newItem;

            //create new ID
            if(data.allItems[type].length > 0) {
                ID = (data.allItems[type][data.allItems[type].length - 1].id + 1);
            }else {
                ID = 0;
            }

            //call items constructor funtion
            if(type === 'inc') {
                newItem = new addIncome(ID, description, value);
            }else if(type === 'exp') {
                newItem = new addExpense(ID, description, value);
            }
            
            //item data stored
            data.allItems[type].push(newItem);

            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index; 

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
          
        },

        calculateBudget: function() {

            //calculate total income and expense
            calculateTotals('inc');
            calculateTotals('exp');
        
            //calculate total budget
            data.budget = (data.totals.inc - data.totals.exp);

            //calculate total expenses percentage
            data.percentage = Math.round(((data.totals['exp']/ data.totals['inc']) * 100));
        },

        calculateItemPercentage: function() {
            var temp;

            data.allItems['exp'].forEach(function(current) {
                current.percentage = Math.round((current.value / data.totals['inc'] * 100));
                //console.log(current.percentage);
                temp = current.percentage;
            });

            data.allItems['exp'].percentage = temp;
            return temp;
        },

        getBudget: function() {
            this.calculateBudget();
            UIController.displayBudget(data);
        },

        getItemPercentage: function() {

            this.calculateItemPercentage();

            //for(var i = data.allItems['exp'].id ; i < data.allItems['exp'].length; i++){
            UIController.displayItemPercentage(data);  
        },
        

    }  




})();


//UI controller
var UIController = (function() {

    var DOMstrings = {
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        deleteButton: '.item__delete--btn',
        container: '.container',
        budgetValue: '.budget__value',
        budgetIncomeValue: '.budget__income--value',
        budgetExpenseValue: '.budget__expenses--value',
        budgetExpensePercentage: '.budget__expenses--percentage',
        itemPercenatge: '.item__percentage',
        budgetMonth: '.budget__title--month'
    }

    //format number into indian standard
    var formatNumber = function(num, type) {
        var splitNum, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        splitNum = num.split('.');

        int = splitNum[0];
        if(int.length > 7 ) {
            int = int.substr(0, int.length - 7) + ',' + int.substr(0, int.length - 5) + ',' + int.substr(int.length - 3, 2) + ',' + int.substr(int.length - 3, 3);
        }
        if(int.length > 5 ) {
            int = int.substr(0, int.length - 5) + ',' + int.substr(int.length - 3, 2) + ',' + int.substr(int.length - 3, 3);
        }
        else if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = splitNum[1];
        
        return (type === 'inc' ? '+' : '-') + int + '.' + dec;
        
    };



    
    return {
        
        //get value from user
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value
            };         
        },

        //display item in page
        displayAddItem: function (addItems,type) {

            var html, newHtml;

            if(type === 'inc'){

                element = DOMstrings.incomeContainer;
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            
            } else if(type === 'exp') {

                element = DOMstrings.expensesContainer;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            
            }

            newHtml = html.replace('%id%',addItems.id);
            newHtml = newHtml.replace('%description%',addItems.description);
            newHtml = newHtml.replace('%value%',formatNumber(addItems.value, type));

            //insert the html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },

        displayDeleteItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayBudget: function(data) {
            var type;

            data.budget >= 0 ? type = 'inc' : type = 'exp' ;

            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(data.budget, type);
            document.querySelector(DOMstrings.budgetIncomeValue).textContent = formatNumber(data.totals.inc, 'inc');            
            document.querySelector(DOMstrings.budgetExpenseValue).textContent = formatNumber(data.totals.exp, 'exp');

            if(data.totals['inc'] > 0) {
                document.querySelector(DOMstrings.budgetExpensePercentage).textContent = data.percentage + '%';
            }else {
                document.querySelector(DOMstrings.budgetExpensePercentage).textContent = '---';
            }
            
        },

        displayItemPercentage: function(data) {
            var repeat = document.querySelectorAll(DOMstrings.itemPercenatge);
            
            data.allItems['exp'].forEach(function(current,index) {
               // console.log(index);
               // console.log(current.percentage);
                if(current.percentage > 0 && data.totals['inc'] !== 0) {              
                    repeat[index].textContent = current.percentage + '%';
                }else {
                    repeat[index].textContent = '---';
                }
                //console.log(repeat[index]);
            });             
                    
        },

        /*displayItemPercentage: function(itemPercenatge) {
            
            var fields = document.querySelectorAll(DOMstrings.itemPercenatge);
            console.log(itemPercenatge);

            fields.forEach(function(current, index) {

                if (itemPercenatge[index] > 0) {
                    current.textContent = itemPercenatge[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });            

        },*/

        displayMonth: function() {
            var now, month, months, year;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.budgetMonth).textContent = months[month] + ' ' + year;
        },
        
        addRedFocus: function () {
            
            document.querySelector(DOMstrings.inputType).classList.toggle('red-focus');
            document.querySelector(DOMstrings.inputDescription).classList.toggle('red-focus');
            document.querySelector(DOMstrings.inputValue ).classList.toggle('red-focus');           
            
            document.querySelector(DOMstrings.addButton).classList.toggle('red');
        },

        getDOMstring: function() {

            return DOMstrings;
        }
    }
})();


//Event controller
var controller = (function(budgetController,UIController) {

    //get class name defined in variables
    var DOM = UIController.getDOMstring();

    var setupEventListener = function() {

        //when ever change input type
        document.querySelector(DOM.inputType).addEventListener('change', UIController.addRedFocus);
    
        document.querySelector(DOM.addButton).addEventListener('click', function() {
            addItemList();
            changeInputFiels(DOM);
        });
    
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13){
                addItemList();
                changeInputFiels(DOM);
            }
        });

        document.querySelector(DOM.container).addEventListener('click', deleteItemList);
    }

    
    var addItemList = function() {
        var input, addItems;

        //get user input 
        input = UIController.getInput();        

        //conditions for run add button
        if(input.description !== "" && input.value !== "" && input.value > 0) {
            //create new item instance
            addItems = budgetController.addItem(input.type, input.description, input.value);
               
            //add to income/expense list
            UIController.displayAddItem(addItems, input.type);

            //get budget
            budgetController.getBudget();

            //get budget percentage
            budgetController.getItemPercentage(); 

            //clear input fields
            document.querySelector(DOM.inputDescription).value = "";
            document.querySelector(DOM.inputValue).value = "";            
        }
    }

    var deleteItemList = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            //slipt type and id 
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //delete item record 
            budgetController.deleteItem(type, ID);

            //update item record in UI
            UIController.displayDeleteItem(itemID);

            //update budget 
            budgetController.getBudget();
            budgetController.getItemPercentage();

        }
        
    }


    function changeInputFiels(DOM) {
        document.querySelector(DOM.inputDescription).focus();
    }

    return {
        init: function() {
            console.log('Application has started.');
            UIController.displayMonth();
            UIController.displayBudget({
                budget: 0,
                totals: {
                    inc: 0,
                    exp: 0
                },
                percentage: 0
            });
            setupEventListener();
        }
    }

})(budgetController,UIController);

controller.init();


