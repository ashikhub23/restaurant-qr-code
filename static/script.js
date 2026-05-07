// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAeRUYkSL_yByWJElwufEfzgB9LKwKQ6vU",
  authDomain: "restaurent-qr-e8116.firebaseapp.com",
  projectId: "restaurent-qr-e8116",
  storageBucket: "restaurent-qr-e8116.firebasestorage.app",
  messagingSenderId: "104832565067",
  appId: "1:104832565067:web:f914266fb3bd04525732ce",
  measurementId: "G-8WVTSKCCNT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------- CART SYSTEM ----------------

let cart = {};

// Get table number
const params = new URLSearchParams(window.location.search);
const table = params.get("table");

// Add item
window.addItem = function(name, price) {
  if (!cart[name]) {
    cart[name] = { qty: 0, price: price };
  }
  cart[name].qty++;
  updateUI();
}

// Remove item
window.removeItem = function(name) {
  if (cart[name] && cart[name].qty > 0) {
    cart[name].qty--;
  }
  updateUI();
}

// Update UI
function updateUI() {
  let total = 0;

  for (let item in cart) {
    let qty = cart[item].qty;
    let price = cart[item].price;

    const safeId = "qty-" + item.replace(/\s+/g, '-');
const el = document.getElementById(safeId);
    if (el) el.innerText = qty;

    total += qty * price;
  }

  document.getElementById("total").innerText = "Total: ₹" + total.toFixed(2);
}

window.placeOrder = async function() {

  const orderItems = [];

  for (let item in cart) {
    if (cart[item].qty > 0) {
      orderItems.push({
        name: item,
        qty: cart[item].qty,
        price: cart[item].price
      });
    }
  }

  if (orderItems.length === 0) {
    alert("🛒 Your cart is empty! Please add some items.");
    return;
  }

  // Check if table number exists
  let tableNumber = table;
  if (!tableNumber) {
    tableNumber = prompt("🍽️ Please enter your table number:");
    if (!tableNumber || tableNumber.trim() === "") {
      alert("❌ Table number is required to place an order!");
      return;
    }
  }

  try {
    console.log("Placing order...", {
      table: tableNumber,
      items: orderItems,
      status: "Pending",
      time: new Date().toLocaleTimeString()
    });

    const docRef = await addDoc(collection(db, "orders"), {
      table: tableNumber,
      items: orderItems,
      status: "Pending",
      time: new Date().toLocaleTimeString()
    });

    console.log("Order placed with ID:", docRef.id);

    // ✅ SUCCESS MESSAGE (MODERN STYLE)
    const msg = document.createElement("div");
    msg.innerText = "✅ Order Placed Successfully!";
    msg.style.position = "fixed";
    msg.style.top = "20px";
    msg.style.left = "50%";
    msg.style.transform = "translateX(-50%)";
    msg.style.background = "linear-gradient(135deg, #28a745, #20bf55)";
    msg.style.color = "white";
    msg.style.padding = "15px 30px";
    msg.style.borderRadius = "12px";
    msg.style.zIndex = "9999";
    msg.style.fontSize = "16px";
    msg.style.fontWeight = "bold";
    msg.style.boxShadow = "0 10px 30px rgba(40, 167, 69, 0.4)";
    msg.style.animation = "slideDown 0.5s ease";

    document.body.appendChild(msg);

    setTimeout(() => {
      msg.style.animation = "slideUp 0.5s ease";
      setTimeout(() => msg.remove(), 500);
    }, 2500);

    // 🔄 CLEAR CART
    cart = {};
    updateUI();

    // Optional: Show order tracking link
    setTimeout(() => {
      const trackMsg = document.createElement("div");
      trackMsg.innerHTML = `
        <div style="position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); 
                    background: white; padding: 15px 25px; border-radius: 12px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2); z-index: 9999; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #333; font-weight: 600;">
            📦 Want to track your order?
          </p>
          <a href="/track?orderId=${docRef.id}" 
             style="background: linear-gradient(135deg, #667eea, #764ba2); 
                    color: white; padding: 10px 20px; border-radius: 8px; 
                    text-decoration: none; font-weight: bold; display: inline-block;">
            Track Order →
          </a>
        </div>
      `;
      document.body.appendChild(trackMsg);
      setTimeout(() => trackMsg.remove(), 8000);
    }, 1000);

  } catch (error) {
    console.error("❌ Order placement error:", error);
    
    // Show detailed error message
    const errorMsg = document.createElement("div");
    errorMsg.style.position = "fixed";
    errorMsg.style.top = "20px";
    errorMsg.style.left = "50%";
    errorMsg.style.transform = "translateX(-50%)";
    errorMsg.style.background = "linear-gradient(135deg, #f5576c, #ff6b6b)";
    errorMsg.style.color = "white";
    errorMsg.style.padding = "15px 25px";
    errorMsg.style.borderRadius = "12px";
    errorMsg.style.zIndex = "9999";
    errorMsg.style.fontSize = "14px";
    errorMsg.style.fontWeight = "bold";
    errorMsg.style.boxShadow = "0 10px 30px rgba(245, 87, 108, 0.4)";
    errorMsg.style.maxWidth = "400px";
    errorMsg.style.textAlign = "center";
    
    let errorText = "❌ Order failed! ";
    if (error.code === "permission-denied") {
      errorText += "Firebase permissions issue. Please check Firebase rules.";
    } else if (error.code === "unavailable") {
      errorText += "Network error. Please check your connection.";
    } else {
      errorText += error.message;
    }
    
    errorMsg.innerText = errorText;
    document.body.appendChild(errorMsg);
    setTimeout(() => errorMsg.remove(), 5000);
  }
}