// ================= PRODUCTS (WITH AllProducts IN LOCALSTORAGE) =================

// Sample products (also saved in localStorage as AllProducts)
let allProductsLS = JSON.parse(localStorage.getItem('AllProducts'));

if (!Array.isArray(allProductsLS) || !allProductsLS.length) {
    allProductsLS = [
        {
            id: 1,
            name: "Premium Car Seat Covers",
            price: 14489,
            image: "71lnSCyAI9L._AC_UF894,1000_QL80_.jpg",
            category: "Interior",
            description: "High-quality leather seat covers for ultimate comfort and style"
        },
        {
            id: 2,
            name: "LED Headlight Kit",
            price: 20930,
            image: "6X-White-9005-H11-LED-Headlights-High-Low-H11-H8-Fog-Light-Bulbs-Kit_ffced9b7-068f-4076-a44f-6a0732d6b420.4284acc0cb5d4270d13e49100cfef8e3.jpeg.jpg",
            category: "Exterior",
            description: "9005+H11/H8+H9 LED headlights for superior visibility"
        },
        {
            id: 3,
            name: "Wireless Phone Charger",
            price: 6440,
            image: "61-0co+zBCL.jpg",
            category: "Electronics",
            description: "Fast PD30W QC3.0 wireless charging for your devices"
        },
        {
            id: 4,
            name: "Steering Wheel Cover",
            price: 4025,
            image: "71bPFuA9mBL.jpg",
            category: "Interior",
            description: "Comfortable grip and stylish design for better driving experience"
        },
        {
            id: 5,
            name: "Car Vacuum Cleaner",
            price: 8050,
            image: "www.autozone.com_shop-and-garage-tools_vacuum-cleaner-and-components_p_armor-all-utility-vacuum-2-5-gallon_110468_0_0.png.jpg",
            category: "Cleaning",
            description: "Armor All 2.5-gallon utility vacuum for spotless interiors"
        }
    ];

    localStorage.setItem('AllProducts', JSON.stringify(allProductsLS));
}

// Keep using `products` everywhere else
const products = allProductsLS;

// ================= CART & USER DATA =================

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let lastOrder = JSON.parse(localStorage.getItem('lastOrder')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Extra data for assignment
let registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
let allInvoices = JSON.parse(localStorage.getItem('AllInvoices')) || [];
let loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0', 10);
const MAX_LOGIN_ATTEMPTS = 3;

// ================= HELPER FUNCTIONS =================

// Format JMD currency
function formatJMD(amount) {
    return `JMD $${Number(amount || 0).toLocaleString('en-JM')}`;
}

// Calculate age from date
function calculateAge(dobStr) {
    if (!dobStr) return 0;
    const today = new Date();
    const dob = new Date(dobStr);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

// TRN helpers
function formatTRN(trnRaw) {
    if (!trnRaw) return '';
    const digits = trnRaw.replace(/\D/g, '').slice(0, 9);
    if (digits.length !== 9) return trnRaw;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// internal TRN format is 000-000-000
function isValidTRN(trn) {
    return /^\d{3}-\d{3}-\d{3}$/.test(trn);
}

function findUserByTRN(trn) {
    return registrationData.find(u => u.trn === trn);
}

// ================= CREATE DEFAULT LECTURER ACCOUNT =================

function createDefaultLecturerAccount() {
    const lecturerUsername = 'dudleyjwalker@WP25/26';
    const lecturerPassword = 'GroupAutolux';
    const lecturerTRN = '123456789';
    const formattedTRN = formatTRN(lecturerTRN);

    // Check if lecturer account exists by TRN or username
    const lecturerExists = registrationData.some(user =>
        user.trn === formattedTRN || user.username === lecturerUsername
    );

    if (!lecturerExists) {
        const lecturerAccount = {
            username: lecturerUsername,
            trn: formattedTRN,
            password: lecturerPassword,
            dateRegistered: new Date().toISOString(),
            cart: [],
            invoices: []
        };
        registrationData.push(lecturerAccount);
        localStorage.setItem('RegistrationData', JSON.stringify(registrationData));
        console.log('Default lecturer account created.');
    }
}

// ================= INITIALIZE PAGE =================

document.addEventListener('DOMContentLoaded', function () {
    // Create default lecturer account
    createDefaultLecturerAccount();

    // Display products on homepage and products page
    if (document.querySelector('.products-grid')) {
        displayProducts(products);
    }

    // Update cart count
    updateCartCount();

    // Display cart items if on cart page
    if (document.getElementById('cart-items')) {
        displayCartItems();
    }

    // Display checkout items if on checkout page
    if (document.getElementById('checkout-items')) {
        displayCheckoutItems();
    }

    // Display invoice items if on invoice page
    if (document.getElementById('invoice-items')) {
        displayInvoiceItems();
    }

    // Update profile display
    updateProfileDisplay();

    // Add event listeners to buttons and forms
    addEventListeners();

    // Add clear cart button listener
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    // Add print invoice button listener
    const printInvoiceBtn = document.getElementById('print-invoice');
    if (printInvoiceBtn) {
        printInvoiceBtn.addEventListener('click', printInvoice);
    }

    // Cancel button on register page
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }

    // Dashboard page
    if (document.getElementById('gender-frequency')) {
        ShowUserFrequency();
    }
    if (document.getElementById('all-invoices-body')) {
        ShowInvoices();
    }

    const userInvoicesForm = document.getElementById('user-invoices-form');
    if (userInvoicesForm) {
        userInvoicesForm.addEventListener('submit', function (e) {
            e.preventDefault();
            GetUserInvoices();
        });
    }
});

// ================= PROFILE =================

// Update profile display based on login status
function updateProfileDisplay() {
    const profileLink = document.querySelector('.profile-link');
    if (!profileLink) return;

    if (currentUser) {
        // User is logged in 
        profileLink.innerHTML = `
            <a href="#" class="profile-icon logged-in">
                <i class="fas fa-user-circle"></i>
                <span>Hello, ${currentUser.name ? currentUser.name.split(' ')[0] : currentUser.username}</span>
            </a>
            <div class="profile-dropdown">
                <a href="#" class="dropdown-item" id="logout-btn">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </a>
            </div>
        `;

        // Add logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    } else {
        // User is not logged in - show login link
        profileLink.innerHTML = `
            <a href="login.html" class="profile-icon">
                <i class="fas fa-user-circle"></i>
                <span>Login</span>
            </a>
        `;
    }
}

// Handle user logout
function handleLogout(e) {
    e.preventDefault();
    currentUser = null;
    localStorage.removeItem('currentUser');

    loginAttempts = 0;
    localStorage.setItem('loginAttempts', '0');
    localStorage.removeItem('accountLocked');

    updateProfileDisplay();
    showNotification('Logged out successfully!');

    // Redirect to home page after logout
    setTimeout(() => {
        if (window.location.pathname.includes('login.html') ||
            window.location.pathname.includes('register.html')) {
            window.location.href = 'index.html';
        }
    }, 1000);
}

// Registration 

function handleRegister(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const firstName = (formData.get('firstname') || '').trim();
    const lastName = (formData.get('lastname') || '').trim();
    const fullName = `${firstName} ${lastName}`.trim();

    const dob = formData.get('dob');
    const genderRaw = (formData.get('gender') || '').toLowerCase();
    const phone = (formData.get('phone') || '').trim();
    const email = (formData.get('email') || '').trim();
    const trnRaw = (formData.get('trn') || '').trim();
    const password = formData.get('password') || '';
    const confirmPassword = formData.get('confirm-password') || '';

    // Error message elements from your HTML
    const ageError = document.getElementById('age-error');
    const trnError = document.getElementById('trn-error');
    const passwordError = document.getElementById('password-error');

    // Reset errors
    if (ageError) ageError.style.display = 'none';
    if (trnError) trnError.style.display = 'none';
    if (passwordError) passwordError.style.display = 'none';

    // Basic required-field check
    if (!firstName || !lastName || !dob || !genderRaw || !phone || !email || !trnRaw || !password || !confirmPassword) {
        alert('Please fill in all required fields.');
        return;
    }

    // Password validation
    if (password.length < 8) {
        if (passwordError) {
            passwordError.textContent = 'Password must be at least 8 characters long.';
            passwordError.style.display = 'block';
        } else {
            alert('Password must be at least 8 characters long.');
        }
        return;
    }

    if (password !== confirmPassword) {
        if (passwordError) {
            passwordError.textContent = 'Passwords do not match.';
            passwordError.style.display = 'block';
        } else {
            alert('Passwords do not match.');
        }
        return;
    }

    // Age validation (18+)
    const age = calculateAge(dob);
    if (age < 18) {
        if (ageError) {
            ageError.style.display = 'block';
        } else {
            alert('You must be 18 years or older to register.');
        }
        return;
    }

    // TRN must be 9 digits 
    if (!/^\d{9}$/.test(trnRaw)) {
        if (trnError) {
            trnError.style.display = 'block';
        } else {
            alert('TRN must be a 9-digit number (e.g. 123456789).');
        }
        return;
    }

    // Store TRN internally 
    const trn = formatTRN(trnRaw);

    if (!isValidTRN(trn)) {
        if (trnError) trnError.style.display = 'block';
        else alert('TRN format is invalid.');
        return;
    }

    if (findUserByTRN(trn)) {
        alert('This TRN is already registered.');
        return;
    }

    // Normalise gender for stats 
    let gender;
    if (genderRaw === 'male') gender = 'Male';
    else if (genderRaw === 'female') gender = 'Female';
    else gender = 'Other';

    // Use email as username
    const username = email || trn;

    const newUser = {
        firstName,
        lastName,
        name: fullName,
        dob,
        gender,
        phone,
        email,
        username,
        trn,
        password,
        dateRegistered: new Date().toISOString(),
        cart: [],
        invoices: []
    };

    // Save to RegistrationData and currentUser
    registrationData.push(newUser);
    localStorage.setItem('RegistrationData', JSON.stringify(registrationData));

    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Reset login attempt tracking
    loginAttempts = 0;
    localStorage.setItem('loginAttempts', '0');
    localStorage.removeItem('accountLocked');

    showNotification('Registration successful! Welcome, ' + firstName + '!');
    updateProfileDisplay();

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}


//Login – Accepts either TRN  OR username 

function handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const loginInput = (formData.get('username') || '').trim();
    const password = formData.get('password') || '';

    const isLocked = localStorage.getItem('accountLocked') === 'true';
    if (isLocked) {
        alert('Your account is locked after too many failed attempts.');
        window.location.href = 'error.html';
        return;
    }

    let user = null;

    // Try to find user by TRN first (if input looks like a TRN)
    const formattedTRN = formatTRN(loginInput);
    if (isValidTRN(formattedTRN)) {
        user = findUserByTRN(formattedTRN);
    }

    // If not found by TRN, try to find by username or email
    if (!user) {
        user = registrationData.find(u =>
            u.username === loginInput || u.email === loginInput
        );
    }

    if (user && user.password === password) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        loginAttempts = 0;
        localStorage.setItem('loginAttempts', '0');

        showNotification('Login successful! Welcome back!');
        updateProfileDisplay();

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        loginAttempts++;
        localStorage.setItem('loginAttempts', String(loginAttempts));

        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            localStorage.setItem('accountLocked', 'true');
            alert('Too many failed attempts. Your account is now locked.');
            window.location.href = 'error.html';
        } else {
            const remaining = MAX_LOGIN_ATTEMPTS - loginAttempts;
            alert('Invalid credentials. Attempts remaining: ' + remaining);
        }
    }
}

// ================= PRODUCTS DISPLAY =================

function displayProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card bounce';

        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWNmZGZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${formatJMD(product.price)}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;

        productsGrid.appendChild(productCard);
    });
}

// ================= EVENT LISTENERS =================

function addEventListeners() {
    // Add to cart buttons and cart actions
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        }

        // Quantity controls
        if (e.target.classList.contains('quantity-btn')) {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            const isIncrease = e.target.classList.contains('increase');
            updateQuantity(itemId, isIncrease);
        }

        // Remove item
        if (e.target.classList.contains('remove-item')) {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            removeFromCart(itemId);
        }
    });

    // Form submissions
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
}

// ================= CART FUNCTIONS =================

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update UI
    updateCartCount();

    // Show confirmation
    showNotification(`${product.name} added to cart!`);
}

function updateQuantity(itemId, isIncrease) {
    const item = cart.find(item => item.id === itemId);
    if (!item) return;

    if (isIncrease) {
        item.quantity += 1;
    } else {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            removeFromCart(itemId);
            return;
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartCount();
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartCount();

    showNotification('Item removed from cart');
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');
    const cartSubtotalContainer = document.getElementById('cart-subtotal');
    const cartTaxContainer = document.getElementById('cart-tax');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (cartTotalContainer) cartTotalContainer.textContent = formatJMD(0);
        if (cartSubtotalContainer) cartSubtotalContainer.textContent = formatJMD(0);
        if (cartTaxContainer) cartTaxContainer.textContent = formatJMD(0);
        return;
    }

    cartItemsContainer.innerHTML = '';

    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWNmZGZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZjNzU4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <p class="cart-item-price">${formatJMD(item.price)}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
            <div class="cart-item-total">
                ${formatJMD(itemTotal)}
            </div>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    if (cartSubtotalContainer) cartSubtotalContainer.textContent = formatJMD(subtotal);
    if (cartTaxContainer) cartTaxContainer.textContent = formatJMD(tax);
    if (cartTotalContainer) cartTotalContainer.textContent = formatJMD(total);
}

// Display checkout items
function displayCheckoutItems() {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutSubtotalContainer = document.getElementById('checkout-subtotal');
    const checkoutTaxContainer = document.getElementById('checkout-tax');
    const checkoutTotalContainer = document.getElementById('checkout-total');

    if (!checkoutItemsContainer) return;

    if (cart.length === 0) {
        checkoutItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (checkoutSubtotalContainer) checkoutSubtotalContainer.textContent = formatJMD(0);
        if (checkoutTaxContainer) checkoutTaxContainer.textContent = formatJMD(0);
        if (checkoutTotalContainer) checkoutTotalContainer.textContent = formatJMD(0);
        return;
    }

    checkoutItemsContainer.innerHTML = '';

    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.style.cssText = 'display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;';

        checkoutItem.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <div>Qty: ${item.quantity}</div>
            </div>
            <div>${formatJMD(itemTotal)}</div>
        `;

        checkoutItemsContainer.appendChild(checkoutItem);
    });

    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    if (checkoutSubtotalContainer) checkoutSubtotalContainer.textContent = formatJMD(subtotal);
    if (checkoutTaxContainer) checkoutTaxContainer.textContent = formatJMD(tax);
    if (checkoutTotalContainer) checkoutTotalContainer.textContent = formatJMD(total);
}

// Display invoice items
function displayInvoiceItems() {
    const invoiceItemsContainer = document.getElementById('invoice-items');
    const invoiceSubtotalContainer = document.getElementById('invoice-subtotal');
    const invoiceTaxContainer = document.getElementById('invoice-tax');
    const invoiceTotalContainer = document.getElementById('invoice-total');
    const invoiceDateContainer = document.getElementById('invoice-date');

    if (!invoiceItemsContainer) return;

    // Set invoice date
    if (invoiceDateContainer) {
        const today = new Date();
        invoiceDateContainer.textContent = today.toLocaleDateString();
    }

    const invoiceItems = lastOrder.length > 0 ? lastOrder : cart;

    if (invoiceItems.length === 0) {
        invoiceItemsContainer.innerHTML = '<tr><td colspan="4" class="empty-cart">No items in invoice</td></tr>';
        if (invoiceSubtotalContainer) invoiceSubtotalContainer.textContent = formatJMD(0);
        if (invoiceTaxContainer) invoiceTaxContainer.textContent = formatJMD(0);
        if (invoiceTotalContainer) invoiceTotalContainer.textContent = formatJMD(0);
        return;
    }

    invoiceItemsContainer.innerHTML = '';

    let subtotal = 0;

    invoiceItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const invoiceRow = document.createElement('tr');

        invoiceRow.innerHTML = `
            <td>${item.name}</td>
            <td>${formatJMD(item.price)}</td>
            <td>${item.quantity}</td>
            <td>${formatJMD(itemTotal)}</td>
        `;

        invoiceItemsContainer.appendChild(invoiceRow);
    });

    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    if (invoiceSubtotalContainer) invoiceSubtotalContainer.textContent = formatJMD(subtotal);
    if (invoiceTaxContainer) invoiceTaxContainer.textContent = formatJMD(tax);
    if (invoiceTotalContainer) invoiceTotalContainer.textContent = formatJMD(total);
}

// Clear cart function
function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartCount();
    showNotification('Cart cleared');
}

// Print invoice function
function printInvoice() {
    window.print();
    lastOrder = [];
    localStorage.removeItem('lastOrder');
}

// Handle checkout + invoice creation
function handleCheckout(e) {
    e.preventDefault();

    if (cart.length === 0) {
        showNotification('Your cart is empty.');
        return;
    }

    if (!currentUser) {
        showNotification('Please login before checking out.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const formData = new FormData(e.target);

    const shipping = {
        name: formData.get('fullname') || currentUser.name,
        email: formData.get('email') || currentUser.email,
        phone: formData.get('phone') || currentUser.phone,
        address: formData.get('address') || '',
        city: formData.get('city') || '',
        parish: formData.get('parish') || '',
        paymentMethod: formData.get('payment-method') || ''
    };

    let subtotal = 0;

    // Build items for lastOrder 
    const invoiceItems = cart.map(item => {
        const lineTotal = item.price * item.quantity;
        subtotal += lineTotal;
        return {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            lineTotal: lineTotal
        };
    });

    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    const invoiceNumber = 'INV-' + Date.now();
    const now = new Date().toISOString();

    // Items for storing in the invoice object 
    const invoiceItemsForStore = invoiceItems.map(i => ({
        productId: i.id,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.price,
        lineTotal: i.lineTotal
    }));

    const invoice = {
        invoiceNumber,
        trn: currentUser.trn,
        date: now,
        companyName: "Dudley's AutoLux",
        shipping,
        items: invoiceItemsForStore,
        subtotal,
        tax,
        total
    };

    // Save to AllInvoices
    allInvoices.push(invoice);
    localStorage.setItem('AllInvoices', JSON.stringify(allInvoices));

    // Attach invoice to the user inside RegistrationData
    const idx = registrationData.findIndex(u => u.trn === currentUser.trn);
    if (idx !== -1) {
        if (!Array.isArray(registrationData[idx].invoices)) {
            registrationData[idx].invoices = [];
        }
        registrationData[idx].invoices.push(invoice);
        registrationData[idx].cart = []; // optional: clear user cart
        localStorage.setItem('RegistrationData', JSON.stringify(registrationData));

        // Refresh currentUser from the updated copy
        currentUser = registrationData[idx];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // Keep simple items for invoice.html table
    lastOrder = invoiceItems.map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity
    }));
    localStorage.setItem('lastOrder', JSON.stringify(lastOrder));

    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    showNotification('Order placed successfully! Invoice generated.');
    setTimeout(() => {
        window.location.href = 'invoice.html';
    }, 1500);
}

// ================= DASHBOARD & STATISTICS =================

function renderFrequencyBars(containerId, dataObj) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const values = Object.values(dataObj);
    const max = Math.max(...values, 1);

    container.innerHTML = '';

    Object.entries(dataObj).forEach(([label, count]) => {
        const width = (count / max) * 100;

        const row = document.createElement('div');
        row.className = 'freq-row';
        row.innerHTML = `
            <span class="freq-label">${label}</span>
            <div class="freq-bar-bg">
                <div class="freq-bar-fill" style="width:${width}%;"></div>
            </div>
            <span class="freq-value">${count}</span>
        `;
        container.appendChild(row);
    });
}

// ShowUserFrequency(): by gender + age group
function ShowUserFrequency() {
    const users = JSON.parse(localStorage.getItem('RegistrationData')) || [];

    const genderCounts = { Male: 0, Female: 0, Other: 0 };
    const ageCounts = { '18-25': 0, '26-35': 0, '36-50': 0, '50+': 0 };

    users.forEach(u => {
        const gender = u.gender || 'Other';
        if (!genderCounts[gender]) genderCounts[gender] = 0;
        genderCounts[gender]++;

        const age = calculateAge(u.dob);
        if (age >= 18 && age <= 25) ageCounts['18-25']++;
        else if (age <= 35) ageCounts['26-35']++;
        else if (age <= 50) ageCounts['36-50']++;
        else if (age > 50) ageCounts['50+']++;
    });

    renderFrequencyBars('gender-frequency', genderCounts);
    renderFrequencyBars('age-frequency', ageCounts);
}

// ShowInvoices(): all invoices in a table + console summary
function ShowInvoices() {
    const invoices = JSON.parse(localStorage.getItem('AllInvoices')) || [];
    console.log('AllInvoices:', invoices);

    const tbody = document.getElementById('all-invoices-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!invoices.length) {
        tbody.innerHTML = '<tr><td colspan="5">No invoices found.</td></tr>';
        return;
    }

    invoices.forEach(inv => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${inv.invoiceNumber}</td>
            <td>${inv.trn}</td>
            <td>${inv.shipping && inv.shipping.name ? inv.shipping.name : ''}</td>
            <td>${new Date(inv.date).toLocaleDateString()}</td>
            <td>${formatJMD(inv.total || 0)}</td>
        `;
        tbody.appendChild(row);
    });

    // Summary in the console per TRN
    const summaryByTRN = {};
    invoices.forEach(inv => {
        const key = inv.trn || 'Unknown';
        if (!summaryByTRN[key]) {
            summaryByTRN[key] = { count: 0, total: 0 };
        }
        summaryByTRN[key].count++;
        summaryByTRN[key].total += inv.total || 0;
    });
    console.log('Invoice summary by TRN:', summaryByTRN);
}

// GetUserInvoices(): by TRN
function GetUserInvoices(trnInput) {
    const raw = trnInput || (document.getElementById('search-trn')?.value || '');
    const trn = formatTRN(raw.trim());
    const users = JSON.parse(localStorage.getItem('RegistrationData')) || [];
    const user = users.find(u => u.trn === trn);

    console.log(`Invoices for TRN ${trn}:`, user ? (user.invoices || []) : 'No user found');

    const tbody = document.getElementById('user-invoices-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!user) {
        tbody.innerHTML = '<tr><td colspan="5">No user found for this TRN.</td></tr>';
        return;
    }

    const invoices = user.invoices || [];
    if (!invoices.length) {
        tbody.innerHTML = '<tr><td colspan="5">No invoices for this user.</td></tr>';
        return;
    }

    invoices.forEach(inv => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${inv.invoiceNumber}</td>
            <td>${inv.trn}</td>
            <td>${inv.shipping && inv.shipping.name ? inv.shipping.name : ''}</td>
            <td>${new Date(inv.date).toLocaleDateString()}</td>
            <td>${formatJMD(inv.total || 0)}</td>
        `;
        tbody.appendChild(row);
    });
}

// ================= NOTIFICATION & STYLES =================

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #065f46;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add slide animations & profile / dashboard CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes bounceIn {
        0% {
            opacity: 0;
            transform: scale(0.3);
        }
        50% {
            opacity: 1;
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .bounce {
        animation: bounceIn 0.6s ease;
    }
    
    /* Profile dropdown styles */
    .profile-link {
        position: relative;
    }
    
    .profile-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        min-width: 150px;
        display: none;
        z-index: 1000;
    }
    
    .profile-link:hover .profile-dropdown {
        display: block;
    }
    
    .dropdown-item {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        text-decoration: none;
        color: #1f2937;
        transition: background-color 0.3s ease;
    }
    
    .dropdown-item:hover {
        background-color: #ecfdf5;
    }
    
    .dropdown-item i {
        margin-right: 0.5rem;
        color: #065f46;
    }
    
    .logged-in {
        background-color: #065f46 !important;
        color: white !important;
    }
    
    .logged-in i {
        color: white !important;
    }

    /* Dashboard frequency bars */
    .freq-container {
        margin-top: 0.75rem;
    }

    .freq-row {
        display: grid;
        grid-template-columns: 100px 1fr 40px;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
    }

    .freq-label {
        font-weight: 600;
    }

    .freq-bar-bg {
        background: #e5e7eb;
        border-radius: 999px;
        overflow: hidden;
        height: 12px;
    }

    .freq-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #059669);
    }

    .freq-value {
        text-align: right;
        font-weight: 600;
    }
`;
document.head.appendChild(style);