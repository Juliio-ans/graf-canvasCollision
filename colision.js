const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.originalColor = color; // Guardamos el color original
        this.color = color;
        this.text = text;
        this.speed = speed;
        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed;
        this.isColliding = false; // Estado de colisión
    }

    draw(context) {
        context.beginPath();
        
        // Cambiar a color azul si está en colisión, de lo contrario usar el original
        if (this.isColliding) {
            context.strokeStyle = "#0000FF";
        } else {
            context.strokeStyle = this.originalColor;
        }

        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context) {
        this.draw(context);

        // Actualizar la posición X
        this.posX += this.dx;
        // Cambiar la dirección si el círculo llega al borde del canvas en X
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        // Actualizar la posición Y
        this.posY += this.dy;
        // Cambiar la dirección si el círculo llega al borde del canvas en Y
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }
    }
}

// Crear un array para almacenar N círculos
let circles = [];

// Función para generar círculos aleatorios
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Color aleatorio
        let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5 unidades
        let text = `C${i + 1}`; // Etiqueta del círculo
        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

// Función para detectar colisiones entre círculos usando la fórmula de distancias
function checkCollisions() {
    // Primero, asumimos que ningún círculo está colisionando al inicio del fotograma
    for (let i = 0; i < circles.length; i++) {
        circles[i].isColliding = false;
    }

    // Comparamos cada par de círculos únicos
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            let circleA = circles[i];
            let circleB = circles[j];

            // Fórmula de distancia entre los centros: d = sqrt((x2 - x1)^2 + (y2 - y1)^2)
            let dx = circleB.posX - circleA.posX;
            let dy = circleB.posY - circleA.posY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Condición de colisión: la distancia es menor a la suma de los radios
            if (distance < circleA.radius + circleB.radius) {
                circleA.isColliding = true;
                circleB.isColliding = true;
            }
        }
    }
}

// Función para animar los círculos
function animate() {
    ctx.clearRect(0, 0, window_width, window_height); // Limpiar el canvas

    // Verificar colisiones antes de actualizar y dibujar
    checkCollisions();

    circles.forEach(circle => {
        circle.update(ctx); // Actualizar cada círculo
    });

    requestAnimationFrame(animate); // Repetir la animación
}

// Generar 20 círculos y comenzar la animación
generateCircles(20);
animate();