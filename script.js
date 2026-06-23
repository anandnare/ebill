// ==========================================
// 1. PRODUCT DATABASE (Real Retail Goods with Global Barcodes)
// ==========================================
const productDatabase = {
    // --- Newly Added Products ---
    "8908013522712": { name: "Vithoba Premium Ayurvedic Tooth Powder", price: 60.00 },
    "8901719101038": { name: "Parle-G Original Gluco Biscuits (55g)", price: 5.00 },
    "8901063017627": { name: "Britannia 50-50 Maska Chaska (71g)", price: 10.00 },
    "8901233021782": { name: "Cadbury 5 Star Chocolate Bar", price: 10.00 },
    "8901725121747": { name: "Aashirvaad Shudh Chakki Atta (1kg)", price: 65.00 },
    "8901030761623": { name: "Lux Velvet Touch Soap Bar (100g)", price: 42.00 },
    "101": { name: "Organic Basmati Rice (1kg) [Demo]", price: 110.00 },
    "102": { name: "Cold Pressed Sunflower Oil (1L) [Demo]", price: 175.00 },

    // --- Pre-existing System Products ---
    "8901491101831": { name: "Lays Classic Salted Chips (50g)", price: 20.00 },
    "8901030753032": { name: "Dove Cream Beauty Bathing Bar (100g)", price: 68.00 },
    "8901058002310": { name: "Coca-Cola Original Soft Drink (500ml)", price: 40.00 },
    "8901262010010": { name: "Parle-G Original Gluco Biscuits (80g)", price: 10.00 },
    "8901030814399": { name: "Red Label Natural Care Tea (250g)", price: 140.00 },
    "8901138006116": { name: "Dabur Honey Pure Gold (250g)", price: 115.00 },
    "4902430907149": { name: "Head & Shoulders Anti-Dandruff Shampoo (180ml)", price: 165.00 }
};

// Application Billing Cart Cache State
let cart = [];
let html5QrcodeScanner = null;

// ==========================================
// 2. LIGHT & DARK THEME ENGINE
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleIcon = document.getElementById('theme-toggle-icon');

themeToggleBtn.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        themeToggleIcon.textContent = '🌙';
        localStorage.setItem('billing-theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        themeToggleIcon.textContent = '☀️';
        localStorage.setItem('billing-theme', 'dark');
    }
});

// Configure client's caching theme state
if (localStorage.getItem('billing-theme') === 'light') {
    document.documentElement.classList.remove('dark');
    themeToggleIcon.textContent = '🌙';
}

// ==========================================
// 3. HARDWARE CAMERA SCANNER INTERFACE
// ==========================================
function startScanner() {
    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5Qrcode("reader");
    }
    
    // Set aspect ratios and scaling configurations
    const config = { 
        fps: 12, 
        qrbox: { width: 280, height: 160 } 
    };
    
    html5QrcodeScanner.start(
        { facingMode: "environment" }, // Standard Back Camera deployment
        config,
        onScanSuccess,
        onScanFailure
    ).catch(err => {
        alert("Camera configuration initialization failed. Verify permissions or switch to https context: " + err);
    });
}

function stopScanner() {
    if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop().then(() => {
            console.log("Barcode scanner device feed terminated securely.");
        });
    }
}

function onScanSuccess(decodedText) {
    playScanBeep();
    addItemToCart(decodedText);
}

function onScanFailure(error) {
    // Dynamic background parser processing frame context dropouts
}

// Manual Keyboard Fallback Scanner Simulation Engine
function simulateScan() {
    const inputField = document.getElementById('manual-barcode');
    const code = inputField.value.trim();
    if (code) {
        addItemToCart(code);
        inputField.value = '';
    }
}

// ==========================================
// 4. INVOICE CART MANAGEMENT LOGIC
// ==========================================
function addItemToCart(barcode) {
    const product = productDatabase[barcode];
    
    if (!product) {
        alert(`Unregistered Product Barcode: "${barcode}"`);
        return;
    }

    const existingItem = cart.find(item => item.barcode === barcode);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            barcode: barcode,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    updateUI();
}

// Changes quantity from the UI panel
function changeQuantity(barcode, delta) {
    const item = cart.find(item => item.barcode === barcode);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeItem(barcode);
            return;
        }
        updateUI();
    }
}

function removeItem(barcode) {
    cart = cart.filter(item => item.barcode !== barcode);
    updateUI();
}

function clearCart() {
    cart = [];
    updateUI();
}

// ==========================================
// 5. DOM VIEW ARCHITECTURE RENDERING
// ==========================================
function updateUI() {
    const tbody = document.getElementById('cart-table-body');
    const emptyState = document.getElementById('empty-state');
    const grandTotalDisplay = document.getElementById('grand-total');
    
    tbody.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
    }

    cart.forEach(item => {
        const rowTotal = item.price * item.quantity;
        total += rowTotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="font-weight: 500;">${item.name}</div>
                <div style="font-size: 11px; color: var(--text-muted); font-family: monospace; margin-top: 2px;">Barcode: ${item.barcode}</div>
            </td>
            <td>₹${item.price.toFixed(2)}</td>
            <td class="text-center">
                <div class="qty-controls">
                    <button onclick="changeQuantity('${item.barcode}', -1)" class="btn-qty">-</button>
                    <span style="font-weight: 600; min-width: 20px; display: inline-block;">${item.quantity}</span>
                    <button onclick="changeQuantity('${item.barcode}', 1)" class="btn-qty">+</button>
                </div>
            </td>
            <td class="text-right" style="font-weight: 600;">₹${rowTotal.toFixed(2)}</td>
            <td class="text-center">
                <button onclick="removeItem('${item.barcode}')" style="background:none; border:none; cursor:pointer; font-size:14px;">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    grandTotalDisplay.textContent = `₹${total.toFixed(2)}`;
}

// ==========================================
// 6. PRINT INVOICE PIPELINE
// ==========================================
function prepareAndPrint() {
    if (cart.length === 0) {
        alert("The cart is empty. Cannot compile print data.");
        return;
    }

    const printTbody = document.getElementById('print-table-body');
    const printGrandTotal = document.getElementById('print-grand-total');
    const printDate = document.getElementById('print-date');
    const printReceiptId = document.getElementById('print-receipt-id');

    printTbody.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const amount = item.price * item.quantity;
        total += amount;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">₹${item.price.toFixed(2)}</td>
            <td class="text-right">₹${amount.toFixed(2)}</td>
        `;
        printTbody.appendChild(tr);
    });

    printGrandTotal.textContent = `₹${total.toFixed(2)}`;
    printDate.textContent = new Date().toLocaleString();
    
    // Generate Random Unique Invoice ID String Structure
    printReceiptId.textContent = 'GB-' + Math.floor(100000 + Math.random() * 900000);

    // Call Native Operating System Printer Window Interface
    window.print();
}

// ==========================================
// 7. POS AUDIO AUDIO SYNTHESIZER FEEDBACK
// ==========================================
function playScanBeep() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 1400; // Crisp retail POS tone frequency
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime); // Subtle volume profile
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.08);
}
