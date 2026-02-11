class Lightbox {
    constructor() {
        this.lightbox = document.getElementById('lightbox');
        this.img = document.getElementById('lightboxImg');
        this.items = [];
        this.currentIndex = 0;
        this.touchStartX = 0;

        this.bindEvents();
    }

    bindEvents() {
        // Close button
        this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.close());

        // Nav buttons
        this.lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.prev());
        this.lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.next());

        // Click background to close
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox || e.target === this.lightbox.querySelector('.lightbox-content')) {
                this.close();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });

        // Touch swipe
        this.lightbox.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.lightbox.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].screenX - this.touchStartX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? this.prev() : this.next();
            }
        }, { passive: true });

        // Gallery item clicks
        document.querySelectorAll('.gallery-item').forEach((item, index) => {
            this.items.push(item.dataset.full);
            item.addEventListener('click', () => this.open(index));
        });
    }

    open(index) {
        this.currentIndex = index;
        this.showImage();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.showImage();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.showImage();
    }

    showImage() {
        this.img.classList.remove('loaded');
        const src = this.items[this.currentIndex];
        const tempImg = new Image();
        tempImg.onload = () => {
            this.img.src = src;
            requestAnimationFrame(() => {
                this.img.classList.add('loaded');
            });
        };
        tempImg.src = src;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Lightbox();
});
