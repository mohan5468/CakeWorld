// script.js

let cart = [];
let totalCost = 0;
let appliedCoupon = null;
let userDetails = {};
let customer = {};
let purchased = null;

function get_user_details() {

        fetch('get_user_details.php', { method: 'POST' ,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
     })
          .then(response => response.text()) // Parse the response as JSON
          .then(data => {
            data.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                userDetails[key] = value;
            });

            names = userDetails.name;
            phone = userDetails.mobile;
            emailid = userDetails.email;

            customer = {names,phone,emailid};

            if (userDetails.status === 'success') {
             // const userDetails = data.userDetails; // Use a different variable name
              console.log('User details:', userDetails);

            } else {
              console.error('Error fetching user details:', data.message);
            }
          })
          .catch(error => {
            console.error('Error fetching user details:', error);
          });
      }
      
function addToCart(cake, price) {
        const existingIndex = cart.findIndex(item => item.cake === cake);
    
        if (existingIndex !== -1) {
            // If the item already exists in the cart, update the quantity
            cart[existingIndex].quantity++;
            cart[existingIndex].subtotal += price;
        } else {
            // If the item is not in the cart, add a new entry
            const subtotal = price;
            cart.push({ cake, quantity: 1, subtotal });
        }
    
        totalCost += price;
        updateCartDisplay();
    }
    
function removeCartItem(cake,price) {
        const indexToRemove = cart.findIndex(item => item.cake === cake);
    
        if (indexToRemove !== -1) {
            const removedItem = cart[indexToRemove];
    
            if (removedItem.quantity > 1) {
                // If the quantity is more than 1, decrement the quantity
                removedItem.quantity--;
                removedItem.subtotal = removedItem.quantity * price;
            } else {
                // If the quantity is 1, remove the entire item from the cart
                cart.splice(indexToRemove, 1);
            }
    
            // Recalculate totalCost
            totalCost -= price;
            updateCartDisplay();

        } else {
            alert('Item not found in the cart.');
        }
    }
    
     
      

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    cart.forEach(item => {
        cartItems.innerHTML += `${item.cake} x ${item.quantity} = ${item.subtotal} Rs<br>`;
    });

    const totalCostElement = document.getElementById('totalCost');
    totalCostElement.textContent = totalCost;
}

function applyCoupon() {
    // Check if a coupon has already been applied
    if (appliedCoupon) {
        alert('Coupon already applied! You can apply only one coupon per order.');
        return;
    }

    const couponCode = prompt('Enter coupon code:');

    // Replace this with your actual coupon logic
    const validCoupons = {
        'coupon1': 0.1,
        'coupon2': 0.2,
        'coupon3': 0.3
    };

    // Check total cost thresholds before applying a coupon
    if (totalCost > 99) {
        if (totalCost > 299 && validCoupons.hasOwnProperty(couponCode)) {
            const discount = validCoupons[couponCode];
            appliedCoupon = { code: couponCode, discount };
            totalCost -= totalCost * discount; // Apply the discount
            updateCartDisplay();
            alert(`Coupon applied successfully! ${discount * 100}% discount`);
        } else if (totalCost > 199 && (couponCode === 'coupon1' || couponCode === 'coupon2')) {
            const discount = validCoupons[couponCode];
            appliedCoupon = { code: couponCode, discount };
            totalCost -= totalCost * discount; // Apply the discount
            updateCartDisplay();
            alert(`Coupon applied successfully! ${discount * 100}% discount`);
        } else if (totalCost > 99 && couponCode === 'coupon1') {
            const discount = validCoupons[couponCode];
            appliedCoupon = { code: couponCode, discount };
            totalCost -= totalCost * discount; // Apply the discount
            updateCartDisplay();
            alert(`Coupon applied successfully! ${discount * 100}% discount`);
        } else {
            alert('Invalid coupon code for the current total cost.');
            appliedCoupon = null;
        }
    } else {
        alert('Total cost must be greater than 99 Rs to apply a coupon.');
        appliedCoupon = null;
    }
}




function buyNow() {

    get_user_details();
    
    if (totalCost !== 0) {
       // const discountedTotalCost = calculateDiscountedTotalCost();
        const orderData = {
            name: customer.names,
            mobile: customer.phone,
            email: customer.emailid,
            items: JSON.stringify(cart),
            totalCost: totalCost
        };

        fetch('order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(orderData).toString(),
        })
        .then(response => response.text())
        .then(data => {
            const parsedData = {};
            data.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                parsedData[key] = value;
            });
            console.log('parsed data:',parsedData );
            purchased = parsedData.status;
            

            if (parsedData.status === 'success') {
                alert(`Order placed successfully! Amount to be paid at the time of delivery is ${parsedData.amountToPay} Rs`);
                printReceipt();
                cart = [];
                totalCost = 0;
                appliedCoupon = null;
                updateCartDisplay();
            } else {
                alert('Failed to place the order. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
    } else {
        alert('Please add to cart before placing an order.');
        
    }
    
}


function generateReceiptHTML(name, mobile, email, items, totalCost, appliedCoupon) {
    let decodedEmail = decodeURIComponent(email);
    let receiptHTML = `<h2>Order Receipt</h2>`;
    receiptHTML += `<p><strong>Customer Name:</strong> ${name}</p>`;
    receiptHTML += `<p><strong>Mobile Number:</strong> ${mobile}</p>`;
    receiptHTML += `<p><strong>Email:</strong> ${decodedEmail}</p>`;
    receiptHTML += `<h3>Items Purchased:</h3>`;
    
    items.forEach(item => {
        receiptHTML += `<p>${item.cake} x ${item.quantity} = ${item.subtotal} Rs</p>`;
    });

    let grossTotal=0;
    cart.forEach(item => {
    grossTotal += item.subtotal;
    });

    const dicountAmount = grossTotal-totalCost;

    receiptHTML += `<p><strong>Gross Total:</strong> ${grossTotal} Rs</p>`;
    receiptHTML += `<p><strong>Applied Coupon:</strong> ${appliedCoupon ? `${appliedCoupon.code} (${appliedCoupon.discount * 100}% off)` : 'None'}</p>`;
    receiptHTML += `<p><strong>Discount:</strong> ${dicountAmount} Rs</p>`;
    receiptHTML += `<p><strong>Amount to be paid:</strong> ${totalCost} Rs</p>`;
    
    return receiptHTML;
}

function printReceipt() {
    if (purchased === 'success') {
        const receiptHTML = generateReceiptHTML(customer.names, customer.phone, customer.emailid, cart, totalCost, appliedCoupon);

        // Open a new window with the generated HTML content
        const receiptWindow = window.open('', '_blank');
        receiptWindow.document.write(receiptHTML);

        // Close the current order_page.php window
        //window.close();
    } else {
        alert('Please buy to generate a receipt.');
    }
}
