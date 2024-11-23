// Canvas Animation Setup
let canvas = document.querySelector('canvas');
        let c = canvas.getContext('2d');
        
        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        let HorizontalArray = [];
        
        function Horizontal(y) {
            this.y = y;
            this.dy = 0.5;
            this.opacity = 0;
            
            this.draw = () => {
                c.beginPath();
                c.lineWidth = 3;
                c.strokeStyle = `rgba(255, 0, 255, ${this.opacity})`;
                c.moveTo(0, this.y);
                c.lineTo(canvas.width, this.y);
                c.stroke();
            }
            
            this.update = () => {
                if(this.y >= canvas.height) {
                    HorizontalArray.splice(HorizontalArray.indexOf(this), 1);
                }
                this.opacity += 0.003;
                this.dy += 0.05;
                this.y += this.dy;
                this.draw();
            }
        }

        let grad = c.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop("0", "rgba(255, 0, 255, 0.5)");
        grad.addColorStop("0.55", "rgba(255, 0, 255, 0)");
        grad.addColorStop("1.0", "rgba(255, 0, 255, 0)");
        
        let VerticalArray = [];
        
        function Vertical(x) {
            this.x = x;
            
            this.draw = () => {
                c.beginPath();
                c.lineWidth = 3;
                c.strokeStyle = grad;
                c.moveTo(canvas.width / 2, 200);
                c.lineTo(this.x, canvas.height);
                c.stroke();
            }
            
            this.update = () => {
                this.draw();
            }
        }

        function initVerticalLines() {
            VerticalArray = [];
            let interval = (canvas.width / 10);
            let cross = 0 - interval * 8;
            for(let i = 0; i < 27; i++) {
                VerticalArray.push(new Vertical(cross));
                cross += interval;
            }
        }
        
        initVerticalLines();
        window.addEventListener('resize', initVerticalLines);

        setInterval(() => {
            HorizontalArray.push(new Horizontal(canvas.height / 2));
        }, 300);

        function animate() {
            requestAnimationFrame(animate);
            c.clearRect(0, 0, canvas.width, canvas.height);
            
            for(let i = 0; i < HorizontalArray.length; i++) {
                HorizontalArray[i].update();
            }
            
            for(let i = 0; i < VerticalArray.length; i++) {
                VerticalArray[i].update();
            }
        }
        
        animate();

        // Carousel Implementation
        const track = document.querySelector('.carousel-track');
        const items = document.querySelectorAll('.carousel-item');
        const prevBtn = document.querySelector('.nav-button.prev');
        const nextBtn = document.querySelector('.nav-button.next');
        const dotsContainer = document.querySelector('.carousel-dots');
        
        let currentIndex = 0;
        const itemWidth = items[0].offsetWidth + 32;
        const maxIndex = items.length - 1;
        
        items.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
        
        function updateDots() {
            document.querySelectorAll('.dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
        
        function goToSlide(index) {
            currentIndex = index;
            track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
            updateDots();
        }
        
        function next() {
            currentIndex = currentIndex === maxIndex ? 0 : currentIndex + 1;
            goToSlide(currentIndex);
        }
        
        function prev() {
            currentIndex = currentIndex === 0 ? maxIndex : currentIndex - 1;
            goToSlide(currentIndex);
        }
        
        nextBtn.addEventListener('click', next);
        prevBtn.addEventListener('click', prev);
        
        items.forEach(item => {
            item.addEventListener('click', () => {
                const href = item.getAttribute('data-href');
                if (href) {
                    window.open(href, '_blank'); 
                }
            });
        });
        
        // Auto-play
        const autoPlayInterval = 5000;
        let autoPlayTimer = setInterval(next, autoPlayInterval);
        
        const carousel = document.querySelector('.carousel');
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoPlayTimer);
        });
        
        carousel.addEventListener('mouseleave', () => {
            autoPlayTimer = setInterval(next, autoPlayInterval);
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        });