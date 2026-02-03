import React, { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 15 + 2; // Tamaños variados (cuadrados más grandes)
        this.speedY = Math.random() * 1 + 0.2; // Velocidad vertical (subiendo)
        this.opacity = Math.random() * 0.5 + 0.1;
        this.type = Math.random() > 0.7 ? 'stroke' : 'fill'; // Algunos rellenos, otros solo borde
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      }

      update() {
        this.y -= this.speedY; // Mover hacia arriba
        this.rotation += this.rotationSpeed;

        // Reiniciar si sale por arriba
        if (this.y < -50) {
          this.y = canvas.height + 50;
          this.x = Math.random() * canvas.width;
          this.size = Math.random() * 15 + 2;
          this.speedY = Math.random() * 1 + 0.2;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'fill') {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.2})`;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }
        
        ctx.restore();
      }
    }

    const initParticles = () => {
      particles = [];
      // Menos partículas pero más grandes para un look más limpio
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default ParticlesBackground;