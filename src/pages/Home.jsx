import React, { useRef, useMemo } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';

// Assets
import LogoImg from '../img/logo.png';
import PokebolaImg from '../img/pokebola.png';

// --- UTILIDADES ---
const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

// --- ANIMACIONES CSS ---
const spin = keyframes`
  0% { --rotate: 0deg; }
  100% { --rotate: 360deg; }
`;

// --- STYLED COMPONENTS ---

const FullBleedWrapper = styled.div`
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  perspective: 2000px;
  min-height: 100vh;
  
  /* FONDO SEMITRANSPARENTE: Permite ver tu imagen 'fondo.png' del body */
  background: radial-gradient(
    circle at var(--mouse-x) var(--mouse-y), 
    rgba(94, 237, 185, 0.1) 0%, /* Luz muy sutil donde está el mouse */
    rgba(0, 0, 0, 0.4) 40%,    /* Oscurecimiento medio */
    rgba(0, 0, 0, 0.8) 100%    /* Bordes oscuros */
  );
`;

const ParticleContainer = styled.div`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 1; /* Aseguramos que estén encima del fondo pero bajo el contenido */
  pointer-events: none;
  overflow: hidden;
`;

const Particle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  /* Quitamos mix-blend-mode para asegurar visibilidad */
`;

// Hero Section
const HeroSection = styled.section`
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10; /* Contenido encima de partículas */
  padding: 20px;
`;

const HeroLogo = styled(motion.img)`
  width: clamp(280px, 60vw, 750px);
  object-fit: contain;
  filter: drop-shadow(0 0 40px rgba(94, 237, 185, 0.5));
  z-index: 10;
`;

const FloatingPokeball = styled(motion.img)`
  position: absolute;
  width: clamp(100px, 20vw, 300px);
  opacity: 0.8;
  z-index: 5;
  filter: drop-shadow(0 0 20px rgba(255,255,255,0.2));
`;

// Sección SALE
const SaleMarqueeSection = styled.div`
  position: relative;
  padding: 3rem 0;
  background: rgba(0, 0, 0, 0.3);
  transform: skewY(-4deg);
  margin: 2rem 0 6rem 0;
  border-top: 2px solid var(--color-accent);
  border-bottom: 2px solid var(--color-accent);
  overflow: hidden;
  backdrop-filter: blur(4px);
  z-index: 15;
`;

const SaleTrack = styled(motion.div)`
  display: flex;
  gap: 4rem;
  white-space: nowrap;
  
  span {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 900;
    font-style: italic;
    color: transparent; 
    -webkit-text-stroke: 2px var(--color-accent);
    text-transform: uppercase;
    transition: all 0.3s;
    
    &:hover {
      color: var(--color-accent);
      text-shadow: 0 0 30px var(--color-accent);
      cursor: default;
    }
  }
`;

// Grid
const GridSection = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px 150px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 60px;
  perspective: 2500px;
  z-index: 10;
`;

const HoloCardContainer = styled(motion.div)`
  position: relative;
  height: 500px;
  border-radius: 30px;
  cursor: pointer;
  z-index: 1;
  transform-style: preserve-3d;
  background: rgba(0,0,0,0.5); /* Fondo base para que se lea el texto */

  @property --rotate {
    syntax: "<angle>";
    initial-value: 0deg;
    inherits: false;
  }

  &::before {
    content: "";
    position: absolute;
    z-index: -1;
    inset: -3px;
    border-radius: 32px;
    background: conic-gradient(
      from var(--rotate),
      transparent 40%,
      var(--color-accent) 50%,
      transparent 60%
    );
    animation: ${spin} 3s linear infinite;
    filter: blur(10px);
    opacity: 0.8;
  }
`;

const CardInner = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(20, 20, 25, 0.85);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 40px;
  transform-style: preserve-3d;
  backdrop-filter: blur(10px);
`;

const Glare = styled(motion.div)`
  position: absolute;
  width: 180%;
  height: 180%;
  background: radial-gradient(
    circle,
    rgba(94, 237, 185, 0.3) 0%,
    transparent 65%
  );
  top: -40%;
  left: -40%;
  pointer-events: none;
  mix-blend-mode: screen;
  z-index: 2;
`;

const CardContent = styled(motion.div)`
  position: relative;
  z-index: 10;
  transform: translateZ(50px);
  pointer-events: none;
`;

const CardTitle = styled.h3`
  font-size: 3rem;
  line-height: 0.9;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow: 0 5px 15px rgba(0,0,0,0.8);
`;

const CardDesc = styled.p`
  color: #ccc;
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const CardArrow = styled(motion.div)`
  width: 60px;
  height: 60px;
  background: var(--color-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #000;
  font-weight: bold;
  box-shadow: 0 0 20px var(--color-accent);
  transform: translateZ(60px); 
`;

// --- COMPONENTES LÓGICOS ---

const BackgroundParticles = () => {
  const particles = useMemo(() => Array.from({ length: 100 }), []);

  return (
    <ParticleContainer>
      {particles.map((_, i) => {
        // Configuraciones para VISIBILIDAD GARANTIZADA
        const isBig = i % 5 === 0;
        const size = isBig ? random(8, 15) : random(4, 8); // Partículas más grandes
        const color = i % 2 === 0 ? '#ffffff' : 'var(--color-accent)';
        
        return (
          <Particle
            key={i}
            style={{
              width: size,
              height: size,
              left: `${random(-10, 110)}%`,
              top: `${random(-10, 110)}%`,
              backgroundColor: color,
              boxShadow: `0 0 ${size + 5}px ${color}`, // Brillo externo
              opacity: 0.8 // Opacidad base alta para que se vean
            }}
            animate={{
              y: [0, random(-400, 400), 0],
              x: [0, random(-100, 100), 0],
              scale: [1, random(1.2, 1.8), 1],
              opacity: [0.4, 1, 0.4], // Nunca bajan a 0
            }}
            transition={{
              duration: random(10, 25),
              repeat: Infinity,
              ease: "easeInOut",
              delay: random(0, 5),
            }}
          />
        );
      })}
    </ParticleContainer>
  );
};

const InteractiveCard = ({ title, desc, link, delay }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [20, -20]); 
  const rotateY = useTransform(x, [-0.5, 0.5], [-20, 20]);
  
  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <HoloCardContainer
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", bounce: 0.4, duration: 1, delay }}
      whileHover={{ scale: 1.05, zIndex: 100 }}
    >
      <Link to={link} style={{ position: 'absolute', inset: 0, zIndex: 20 }} />
      
      <CardInner>
        <Glare style={{ 
          background: useMotionTemplate`radial-gradient(circle at ${x.get() * 100 + 50}% ${y.get() * 100 + 50}%, rgba(94, 237, 185, 0.4), transparent 60%)`
        }} />

        <CardContent>
          <CardTitle>{title}</CardTitle>
          <CardDesc>{desc}</CardDesc>
          <CardArrow whileHover={{ scale: 1.2, rotate: -45 }}>→</CardArrow>
        </CardContent>
      </CardInner>
    </HoloCardContainer>
  );
};

// --- HOME PRINCIPAL ---
const Home = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  function handleGlobalMouseMove({ clientX, clientY }) {
    mouseX.set(clientX);
    mouseY.set(clientY);
  }

  // Parallax Values
  const logoY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const ballY = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const ballRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <FullBleedWrapper 
      ref={containerRef} 
      onMouseMove={handleGlobalMouseMove}
      style={{ 
        "--mouse-x": useMotionTemplate`${smoothMouseX}px`, 
        "--mouse-y": useMotionTemplate`${smoothMouseY}px` 
      }}
    >
      {/* FONDO DE PARTÍCULAS */}
      <BackgroundParticles />

      {/*  HERO SECTION */}
      <HeroSection>
        <FloatingPokeball 
          src={PokebolaImg} 
          style={{ y: ballY, rotate: ballRotate, top: '15%', right: '10%' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <HeroLogo 
          src={LogoImg} 
          style={{ y: logoY }}
          initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1.5 }}
        />

        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ 
            marginTop: '20px', 
            fontSize: 'clamp(1.2rem, 3vw, 2rem)', 
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            textShadow: '0 0 20px var(--color-accent)',
            zIndex: 20
          }}
        >
          TIENDA OFICIAL
        </motion.h2>
      </HeroSection>

      {/* 2. CINTA SALE */}
      <SaleMarqueeSection>
        <SaleTrack 
          animate={{ x: [0, -1000] }} 
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        >
          <span>SALE • SALE • SALE • SALE • SALE • SALE • </span>
          <span>SALE • SALE • SALE • SALE • SALE • SALE • </span>
          <span>SALE • SALE • SALE • SALE • SALE • SALE • </span>
          <span>SALE • SALE • SALE • SALE • SALE • SALE • </span>
        </SaleTrack>
      </SaleMarqueeSection>

      {/* 3. GRID 3D */}
      <GridSection>
        <InteractiveCard 
          title="TIENDA"
          desc="Explora el catálogo completo. Estadísticas, tipos y búsqueda avanzada."
          link="/tienda"
          delay={0}
        />
        <InteractiveCard 
          title="FAVORITOS"
          desc="Tu equipo personal. Gestiona tu colección de Pokémon preferidos."
          link="/favoritos"
          delay={0.2}
        />
        <InteractiveCard 
          title="CARRITO"
          desc="Finaliza tu compra. Precios calculados según el poder de combate."
          link="/carrito"
          delay={0.4}
        />
      </GridSection>

    </FullBleedWrapper>
  );
};

export default Home;