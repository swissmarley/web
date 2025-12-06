export default class WindowManager {
    constructor() {
        this.windows = [];
        this.id = Date.now();
        this.winShape = { x: 0, y: 0, w: 0, h: 0, meta: {} };
        this.init();
    }

    init() {
        this.setupLocalStorage();
        
        window.addEventListener('storage', (event) => {
            if (event.key === 'windows') {
                this.windows = JSON.parse(event.newValue);
            }
        });

        setInterval(() => {
            this.updateShape();
            this.windows = JSON.parse(localStorage.getItem('windows') || '[]');
        }, 10);

        window.addEventListener('beforeunload', () => {
            let wins = JSON.parse(localStorage.getItem('windows') || '[]');
            wins = wins.filter(w => w.id !== this.id);
            localStorage.setItem('windows', JSON.stringify(wins));
        });
    }

    // New: Allow passing metadata (like text/actions)
    updateShape(metaData = {}) {
        const shape = {
            x: window.screenX,
            y: window.screenY,
            w: window.innerWidth,
            h: window.innerHeight,
            meta: metaData // Holds current text or status
        };
        
        let wins = JSON.parse(localStorage.getItem('windows') || '[]');
        const idx = wins.findIndex(w => w.id === this.id);
        if (idx !== -1) {
            wins[idx].shape = shape;
            localStorage.setItem('windows', JSON.stringify(wins));
        }
    }

    setupLocalStorage() {
        const shape = { x: window.screenX, y: window.screenY, w: window.innerWidth, h: window.innerHeight, meta: {} };
        let wins = JSON.parse(localStorage.getItem('windows') || '[]');
        wins.push({ id: this.id, shape: shape });
        localStorage.setItem('windows', JSON.stringify(wins));
    }

    getWindows() { return this.windows; }
    getThisWindowData() { return this.windows.find(x => x.id === this.id); }
}