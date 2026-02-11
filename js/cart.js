/* ========================================
   Shopping Cart Module
   ======================================== */
const Cart = {
    items: JSON.parse(localStorage.getItem('cart') || '[]'),

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateBadge();
    },

    add(id, name, nameEn, price, size) {
        const existing = this.items.find(i => i.id === id && i.size === size);
        if (existing) {
            existing.qty++;
        } else {
            this.items.push({ id, name, nameEn, price, size, qty: 1 });
        }
        this.save();
        this.render();
        this.showNotification();
    },

    remove(index) {
        this.items.splice(index, 1);
        this.save();
        this.render();
    },

    updateQty(index, delta) {
        this.items[index].qty += delta;
        if (this.items[index].qty <= 0) {
            this.items.splice(index, 1);
        }
        this.save();
        this.render();
    },

    getTotal() {
        return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    },

    getTotalQty() {
        return this.items.reduce((sum, i) => sum + i.qty, 0);
    },

    clear() {
        this.items = [];
        this.save();
        this.render();
    },

    updateBadge() {
        const badge = document.getElementById('cartBadge');
        const count = this.getTotalQty();
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    showNotification() {
        const notif = document.getElementById('cartNotification');
        if (!notif) return;
        notif.classList.add('show');
        clearTimeout(this._notifTimer);
        this._notifTimer = setTimeout(() => notif.classList.remove('show'), 2000);
    },

    render() {
        const container = document.getElementById('cartItems');
        const totalEl = document.getElementById('cartTotal');
        const emptyEl = document.getElementById('cartEmpty');
        const checkoutBtn = document.getElementById('cartCheckoutBtn');
        if (!container) return;

        const isZh = currentLang === 'zh';

        if (this.items.length === 0) {
            container.innerHTML = '';
            emptyEl.style.display = 'block';
            checkoutBtn.style.display = 'none';
            totalEl.textContent = '$0';
            return;
        }

        emptyEl.style.display = 'none';
        checkoutBtn.style.display = 'block';

        container.innerHTML = this.items.map((item, i) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <span class="cart-item-name">${isZh ? item.name : item.nameEn}${item.size ? ' (' + item.size + ')' : ''}</span>
                    <span class="cart-item-price">$${item.price}</span>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-qty-btn" onclick="Cart.updateQty(${i}, -1)">−</button>
                    <span class="cart-qty">${item.qty}</span>
                    <button class="cart-qty-btn" onclick="Cart.updateQty(${i}, 1)">+</button>
                    <button class="cart-remove-btn" onclick="Cart.remove(${i})">✕</button>
                </div>
            </div>
        `).join('');

        totalEl.textContent = '$' + this.getTotal();
    }
};

/* ========================================
   Cart Drawer Toggle
   ======================================== */
function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    drawer.classList.toggle('open');
    if (drawer.classList.contains('open')) {
        Cart.render();
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.body.style.overflow = '';
}

/* ========================================
   Checkout Flow
   ======================================== */
function openCheckout() {
    if (Cart.items.length === 0) return;
    closeCart();

    const modal = document.getElementById('checkoutModal');
    const isZh = currentLang === 'zh';

    // Render order summary
    const summaryEl = document.getElementById('checkoutSummary');
    summaryEl.innerHTML = Cart.items.map(item =>
        `<div class="checkout-line">
            <span>${isZh ? item.name : item.nameEn}${item.size ? ' (' + item.size + ')' : ''} × ${item.qty}</span>
            <span>$${item.price * item.qty}</span>
        </div>`
    ).join('') + `
        <div class="checkout-line checkout-total">
            <span>${isZh ? '合计' : 'Total'}</span>
            <span>$${Cart.getTotal()}</span>
        </div>`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('checkoutSuccess').style.display = 'none';
    document.getElementById('checkoutForm').style.display = 'block';
    document.body.style.overflow = '';
}

async function submitOrder(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const isZh = currentLang === 'zh';

    submitBtn.disabled = true;
    submitBtn.textContent = isZh ? '提交中...' : 'Submitting...';

    const name = form.customerName.value;
    const contact = form.customerContact.value;
    const payMethod = form.paymentMethod.value;

    // Build order text
    const orderLines = Cart.items.map(item =>
        `${item.name} (${item.nameEn})${item.size ? ' [' + item.size + ']' : ''} x${item.qty} = $${item.price * item.qty}`
    ).join('\n');

    const message = `New Order from SYSU Dragon Boat Merch Store

Customer: ${name}
Contact: ${contact}
Payment: ${payMethod}

Items:
${orderLines}

Total: $${Cart.getTotal()}`;

    try {
        const resp = await fetch('https://formsubmit.co/ajax/winstezzw@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                name: name,
                email: contact,
                _subject: `New Merch Order - $${Cart.getTotal()} - ${name}`,
                message: message
            })
        });

        if (resp.ok) {
            document.getElementById('checkoutForm').style.display = 'none';
            document.getElementById('checkoutSuccess').style.display = 'block';
            Cart.clear();
        } else {
            throw new Error('Failed');
        }
    } catch (err) {
        // Fallback: open mailto
        const mailto = `mailto:winstezzw@gmail.com?subject=${encodeURIComponent(`Merch Order - ${name}`)}&body=${encodeURIComponent(message)}`;
        window.open(mailto);
        document.getElementById('checkoutForm').style.display = 'none';
        document.getElementById('checkoutSuccess').style.display = 'block';
        Cart.clear();
    }

    submitBtn.disabled = false;
    submitBtn.textContent = isZh ? '确认下单' : 'Place Order';
}

/* ========================================
   Size Selector for Add to Cart
   ======================================== */
function addToCart(id, name, nameEn, price, hasSizes) {
    if (hasSizes) {
        const sizeModal = document.getElementById('sizeModal');
        sizeModal.dataset.id = id;
        sizeModal.dataset.name = name;
        sizeModal.dataset.nameEn = nameEn;
        sizeModal.dataset.price = price;
        sizeModal.classList.add('active');
    } else {
        Cart.add(id, name, nameEn, price, null);
    }
}

function selectSize(size) {
    const m = document.getElementById('sizeModal');
    Cart.add(m.dataset.id, m.dataset.name, m.dataset.nameEn, Number(m.dataset.price), size);
    m.classList.remove('active');
}

function closeSizeModal() {
    document.getElementById('sizeModal').classList.remove('active');
}

/* ========================================
   Init
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    Cart.updateBadge();
});
