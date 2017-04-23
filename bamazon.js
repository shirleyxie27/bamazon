// Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.
// The app should then prompt users with two messages.
// The first should ask - What is the item ID of the item in which you would like to purchase?
// The second message should ask - What quantity of this item would you like to purchase?
// Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
// If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.
// However, if your store does have enough of the product, you should fulfill the customer's order.
// This means updating the SQL database to reflect the remaining quantity.
// Once the update goes through, show the customer the total cost of their purchase.


var mysql = require("mysql");
var inquirer = require("inquirer");

// sql database connection
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",
  password: "",
  database: "bamazonDB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
});

// starting purchasing app
start();

function start() {

  // showing the current list of products, departments, price, and quantities
  function showProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
      console.log("-----------------------------------------------------------------------");
      for (var i = 0; i < res.length; i++) {
        console.log(" Item: " + res[i].item_id + " | " + res[i].product_name + " | " + "Department: " + res[i].department_name + " | " + "$" + res[i].price + " | " + "Inventory: " + res[i].stock_quantity);
      }
      console.log("-----------------------------------------------------------------------\n");
    });
  };
  showProducts();

  // prompting client to select an item and quantity to purchase
  purchase();

  function purchase() {
    inquirer.prompt([{
        type: "input",
        name: "inputId",
        message: "What is the item# of the product you would like to purchase?\n"

      },
      {
        type: "input",
        name: "inputQuantity",
        message: "How many many would you like to purchase?"
      }
      // verifying stock is on-hand
    ]).then(function(chosen) {
      connection.query("SELECT * FROM products where item_id = ?", chosen.inputId, function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
          if (chosen.inputQuantity > res[i].stock_quantity) {
            console.log("Your order request exceeds out current stock. Please try again");
            start();
          } else {
            console.log(" ORDER TOTAL: " + "$" + ((res[i].price * chosen.inputQuantity).toFixed(2)));

            newStock = (res[i].stock_quantity - chosen.inputQuantity);
            productID = (chosen.inputId);

            orderConfirmation();
          };
        };
      });
    });
  };

  var newStock;
  var productID;
  // confirming order and updating product quantity in database
  function orderConfirmation() {
    inquirer.prompt([{
      type: "confirm",
      name: "placeOrder",
      message: "Would you like to place your order?"
    }]).then(function(userOrder) {
      if (userOrder.placeOrder === true) {
        connection.query("UPDATE products SET ? WHERE ?", [{
          stock_quantity: newStock
        }, {
          item_id: productID
        }], function(err, res) {});
        console.log("Thank you for your business!");
        start();
      } else {
        console.log("...maybe next time");
        // restarting the purchasing app
        start();
      };
    });
  };
};
Contact GitHub API Training Shop Blog About
