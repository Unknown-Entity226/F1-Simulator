/**
 * F1 Digital Twin - Strategy & Physics Engine
 * Optimized for Flask SPA Integration
 */

const TOTAL_LAPS = 15;
const SIMULATION_TICK_MS = 100; 
const TIME_SCALE = 4.0; 
const TRACK_LENGTH_M = 5000; 

const formatTime = (s) => s ? `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}.${Math.floor((s%1)*1000).toString().padStart(3,'0')}` : "--:--.---";

class Car {
    constructor(id, name, team, color, baseSpeed, tireDegRate, fuelBurnRate) {
        this.id = id; this.name = name; this.team = team; this.color = color;
        this.baseSpeed = baseSpeed; this.tireDegRate = tireDegRate; this.fuelBurnRate = fuelBurnRate;
        this.currentSpeed = 0; this.tireHealth = 100; this.fuel = 110;
        this.lapDistance = 0; this.lapsCompleted = 0; this.isPitting = 0;
        this.history = { lapTimes: [], tireHealths: [] };
        this.ui = {};
    }

    update(dt) {
        if (this.lapsCompleted >= TOTAL_LAPS) { this.currentSpeed = 0; return; }

        if (this.isPitting > 0) {
            this.isPitting -= dt;
            this.currentSpeed = 80;
            if (this.isPitting <= 0) this.tireHealth = 100;
        } else {
            const tirePenalty = (100 - this.tireHealth) * 0.15;
            const fuelBonus = (110 - this.fuel) * 0.1;
            this.currentSpeed = Math.max(100, Math.min(360, this.baseSpeed - tirePenalty + fuelBonus + (Math.random()-0.5)*10));
            
            const dist = (this.currentSpeed / 3.6) * dt;
            this.lapDistance += dist;
            this.tireHealth = Math.max(0, this.tireHealth - (this.tireDegRate / TRACK_LENGTH_M) * dist);
            this.fuel = Math.max(0, this.fuel - (this.fuelBurnRate / TRACK_LENGTH_M) * dist);
        }

        if (this.lapDistance >= TRACK_LENGTH_M) {
            this.lapDistance -= TRACK_LENGTH_M;
            this.lapsCompleted++;
            this.history.tireHealths.push(this.tireHealth);
            this.history.lapTimes.push(90 + (Math.random()*2));
        }
    }
}

class RaceSimulation {
    constructor() {
        this.cars = [
            new Car('c1', 'A. MAXWELL', 'Redline', '#FF003C', 302, 3.5, 4.0),
            new Car('c2', 'L. HAMLET', 'Neon', '#00F0FF', 300, 3.0, 3.8),
            new Car('c3', 'C. LECLERC', 'Horse', '#FFB800', 301, 4.0, 4.2)
        ];
        this.isRunning = false;
        this.interval = null;
        this.initUI();
    }

    initUI() {
        const container = document.getElementById('telemetryGrid');
        const template = document.getElementById('telemetryCardTemplate');
        if(!container || !template) return;

        container.innerHTML = '';
        this.cars.forEach(car => {
            const clone = template.content.cloneNode(true);
            car.ui.speed = clone.querySelector('.speed-val');
            car.ui.tireBar = clone.querySelector('.tire-bar');
            car.ui.fuelBar = clone.querySelector('.fuel-bar');
            clone.querySelector('.driver-name').textContent = car.name;
            container.appendChild(clone);
        });
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('startBtn')?.addEventListener('click', () => this.start());
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.stop());
        document.getElementById('playerPitBtn')?.addEventListener('click', () => {
            this.cars[0].isPitting = 22;
        });
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.interval = setInterval(() => this.tick(), SIMULATION_TICK_MS);
        
        // UI Updates
        document.getElementById('raceStatusIndicator').textContent = "RACE STATUS: LIVE";
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
    }

    stop() {
        clearInterval(this.interval);
        this.isRunning = false;
        document.getElementById('raceStatusIndicator').textContent = "RACE STATUS: PAUSED";
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }

    tick() {
        this.cars.forEach(c => {
            c.update((SIMULATION_TICK_MS / 1000) * TIME_SCALE);
            if(c.ui.speed) c.ui.speed.textContent = Math.round(c.currentSpeed);
            if(c.ui.tireBar) c.ui.tireBar.style.width = `${c.tireHealth}%`;
            if(c.ui.fuelBar) c.ui.fuelBar.style.width = `${(c.fuel/110)*100}%`;
        });
        
        // Update Global Lap Counter (using leading car)
        const leadLap = Math.max(...this.cars.map(c => c.lapsCompleted));
        document.getElementById('currentLap').textContent = Math.min(TOTAL_LAPS, leadLap + 1);
    }
}

let activeSim = null;

/**
 * Main Entry Point for app.js
 */
function initSimulator() {
    if (activeSim) activeSim.stop();
    activeSim = new RaceSimulation();
    console.log("Telemetry Online: Simulation Initialized");
}