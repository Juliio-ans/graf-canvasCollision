const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Dimensiones de la pantalla
let window_height = window.innerHeight;
let window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;

// Colección de emojis para dar variedad visual
const EMOJIS = ["😀", "😎", "🚀", "🔥", "⭐", "🎉", "👾", "👻", "🦄", "🤖"];

// Variables del juego
let score = 0;
let objects = [];
const TOTAL_OBJECTS = 25;

// Parámetros de física (caída libre y parábola de rebote)
const gravity = 0.25;      // Aceleración vertical
const bounce = -0.65;      // Pérdida de energía vertical al rebotar
const friction = 0.98;     // Fricción horizontal para definir la parábola

class FallingEmoji {
    constructor(id) {
        this.id = id;
        this.size = Math.random() * 20 + 35; // Tamaño del emoji (35px a 55px)
        this.radius = this.size / 2;         // Radio aproximado para detección de clics
        this.resetPosition();
    }

    // Reinicia la posición arriba iniciando justo después del margen superior
    resetPosition() {
        this.emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        this.posX = Math.random() * (window_width - this.size * 2) + this.size;
        this.posY = -this.size; // Inicia arriba fuera del marco de canvas

        // Reglas de velocidad según el contador de objetos eliminados
        let speedMultiplier = 1.0;
        if (score > 20) {
            speedMultiplier = 2.2; // Velocidad alta
        } else if (score > 10) {
            speedMultiplier = 1.6; // Velocidad media
        }

        // Caída con velocidades y zonas iniciales diferentes
        this.dy = (Math.random() * 2 + 1) * speedMultiplier;
        this.dx = (Math.random() - 0.5) * 4 * speedMultiplier; // Inercia horizontal para la parábola
        this.bounceCount = 0;
    }

    draw(context) {
        context.save();
        context.font = `${this.size}px Arial`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this.emoji, this.posX, this.posY);
        context.restore();
    }

    update(context) {
        // Efecto de caída libre
        this.dy += gravity;
        this.dx *= friction;

        // Actualizar posición
        this.posX += this.dx;
        this.posY += this.dy;

        // Rebote en los bordes laterales del canvas
        if (this.posX + this.radius > window_width) {
            this.posX = window_width - this.radius;
            this.dx = -this.dx;
        } else if (this.posX - this.radius < 0) {
            this.posX = this.radius;
            this.dx = -this.dx;
        }

        // Rebote tipo pelota al llegar al límite inferior del canvas
        if (this.posY + this.radius >= window_height) {
            this.posY = window_height - this.radius;
            this.dy *= bounce; // Invierte el sentido y reduce la fuerza generando la parábola
            this.bounceCount++;

            // Cuando pierde la fuerza o rebota demasiado, desaparece y reaparece arriba
            if (Math.abs(this.dy) < 1.5 || this.bounceCount > 6) {
                this.resetPosition();
            }
        }

        this.draw(context);
    }

    // Algoritmo para detectar clic en el emoji mediante coordenadas mouseX y mouseY
    isClicked(mouseX, mouseY) {
        // Distancia euclidiana entre la posición del mouse y el centro del emoji
        let distance = Math.hypot(mouseX - this.posX, mouseY - this.posY);
        return distance <= this.radius;
    }
}

// Dibujar el fondo combinado con degradado tipo wallpaper
function drawBackground() {
    let gradient = ctx.createLinearGradient(0, 0, 0, window_height);
    gradient.addColorStop(0, "#0f2027");
    gradient.addColorStop(0.5, "#203a43");
    gradient.addColorStop(1, "#2c5364");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window_width, window_height);
}

// Dibujar el contador en la parte superior derecha
function drawScore() {
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "right";
    ctx.shadowBlur = 4;
    ctx.shadowColor = "#000";
    ctx.fillText(`Eliminados: ${score}`, window_width - 30, 40);
    ctx.restore();
}

// Inicializar la lista con la cantidad fija de 25 objetos
function initObjects() {
    objects = [];
    for (let i = 0; i < TOTAL_OBJECTS; i++) {
        objects.push(new FallingEmoji(i));
    }
}

// Evento para capturar el clic izquierdo del mouse y eliminar objetos
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    
    // Obtención de coordenadas mouseX y mouseY dentro del Canvas
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Recorrer los emojis para comprobar la colisión con el clic
    for (let i = 0; i < objects.length; i++) {
        if (objects[i].isClicked(mouseX, mouseY)) {
            score++;                   // Incrementar contador
            objects[i].resetPosition(); // Desaparece y vuelve a caer desde arriba
            break;                     // Un solo objeto eliminado por clic
        }
    }
});

// Ajustar el canvas dinámicamente si cambia el tamaño de la ventana
window.addEventListener("resize", () => {
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    canvas.height = window_height;
    canvas.width = window_width;
});

// Bucle principal de animación
function animate() {
    drawBackground();
    
    // Renderizar y actualizar la posición de los 25 emojis
    objects.forEach(obj => {
        obj.update(ctx);
    });

    drawScore();
    requestAnimationFrame(animate);
}

// Ejecución
initObjects();
animate();