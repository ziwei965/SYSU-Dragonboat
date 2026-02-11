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
   Variant Definitions
   ======================================== */
const variantConfig = {
    size: {
        titleZh: '选择尺码', titleEn: 'Select Size',
        options: [
            { value: 'S', label: 'S' },
            { value: 'M', label: 'M' },
            { value: 'L', label: 'L' },
            { value: 'XL', label: 'XL' },
            { value: '2XL', label: '2XL' }
        ]
    },
    color: {
        titleZh: '选择颜色', titleEn: 'Select Color',
        options: [
            { value: '白/White', labelZh: '白色', labelEn: 'White' },
            { value: '黑/Black', labelZh: '黑色', labelEn: 'Black' }
        ]
    },
    sticker: {
        titleZh: '选择款式', titleEn: 'Select Design',
        options: [
            { value: 'Q版校门/Campus Gate', labelZh: 'Q版校门', labelEn: 'Campus Gate' },
            { value: '校徽/Emblem', labelZh: '校徽', labelEn: 'SYSU Emblem' },
            { value: '像素鸭/Pixel Duck', labelZh: '像素鸭', labelEn: 'Pixel Duck' },
            { value: '经典Logo/Classic Logo', labelZh: '经典Logo', labelEn: 'Classic Logo' }
        ]
    }
};

/* ========================================
   Add to Cart with Variant Selection
   ======================================== */
function addToCart(id, name, nameEn, price, variantType) {
    if (!variantType) {
        Cart.add(id, name, nameEn, price, null);
        return;
    }

    const modal = document.getElementById('variantModal');
    const titleEl = document.getElementById('variantModalTitle');
    const optionsEl = document.getElementById('variantOptions');
    const config = variantConfig[variantType];
    const isZh = currentLang === 'zh';

    modal.dataset.id = id;
    modal.dataset.name = name;
    modal.dataset.nameEn = nameEn;
    modal.dataset.price = price;

    titleEl.textContent = isZh ? config.titleZh : config.titleEn;

    optionsEl.innerHTML = config.options.map(opt => {
        const label = opt.label || (isZh ? opt.labelZh : opt.labelEn);
        return `<button class="variant-btn" onclick="selectVariant('${opt.value}')">${label}</button>`;
    }).join('');

    modal.classList.add('active');
}

function selectVariant(value) {
    const m = document.getElementById('variantModal');
    Cart.add(m.dataset.id, m.dataset.name, m.dataset.nameEn, Number(m.dataset.price), value);
    m.classList.remove('active');
}

function closeVariantModal() {
    document.getElementById('variantModal').classList.remove('active');
}

/* ========================================
   Merch Image Zoom
   ======================================== */
function zoomMerch(el) {
    const img = el.querySelector('img');
    if (!img) return;
    const overlay = document.getElementById('merchZoom');
    const zoomImg = document.getElementById('merchZoomImg');
    zoomImg.src = img.src;
    zoomImg.alt = img.alt;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMerchZoom() {
    document.getElementById('merchZoom').classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('merchZoom').classList.contains('active')) closeMerchZoom();
        if (document.getElementById('variantModal').classList.contains('active')) closeVariantModal();
    }
});

/* ========================================
   Init
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    Cart.updateBadge();
});
