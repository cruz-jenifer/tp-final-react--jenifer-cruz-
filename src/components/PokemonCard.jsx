import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorito } from '../store/favoritosSlice'; 
import { addToCart, removeFromCart, calcularPrecioIntegrado } from '../store/carritoSlice';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

// --- ESTILOS DINÁMICOS Y RESPONSIVE ---

const CardContainer = styled(motion.div)`
  position: relative;
  background-color: rgba(30, 30, 35, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  overflow: hidden;
  backdrop-filter: blur(5px);
  transition: border-color 0.3s ease;

  /* Estructura Base */
  display: flex;
  flex-direction: ${props => props.isList ? 'row' : 'column'};
  align-items: center; /* Alineación */
  
  /* En modo lista */
  min-height: ${props => props.isList ? '100px' : 'auto'};

  &:hover {
    border-color: var(--color-accent);
    box-shadow: 0 0 20px rgba(94, 237, 185, 0.2);
    z-index: 10;
  }

  /* MEDIA QUERY: MÓVILES */
  @media (max-width: 600px) {
    /**/
    flex-direction: ${props => props.isList ? 'row' : 'column'}; 
    flex-wrap: ${props => props.isList ? 'wrap' : 'nowrap'}; 
    padding-bottom: 10px;
  }
`;

const HoverOverlay = styled(motion.div)`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  z-index: 5;
  backdrop-filter: blur(2px);
`;

const ViewText = styled.span`
  color: var(--color-accent);
  font-weight: 900;
  font-size: 0.9rem;
  text-transform: uppercase;
  border: 2px solid var(--color-accent);
  padding: 5px 10px;
  border-radius: 5px;
  background: rgba(0,0,0,0.5);
`;

const InfoSection = styled.div`
  padding: 10px;
  text-align: ${props => props.isList ? 'left' : 'center'};
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 100px; 
`;

const ActionSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: ${props => props.isList ? 'flex-end' : 'space-between'};
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: ${props => props.isList ? 'transparent' : 'rgba(0,0,0,0.2)'};
  border-top: ${props => props.isList ? 'none' : '1px solid rgba(255,255,255,0.05)'};
  
  /* En modo lista */
  @media (max-width: 600px) {
    width: ${props => props.isList ? '100%' : 'auto'};
    justify-content: ${props => props.isList ? 'space-between' : 'space-between'};
    padding-top: ${props => props.isList ? '0' : '15px'};
  }
`;

// --- COMPONENTE ---

function PokemonCard({ pokemonData, viewMode = 'grid' }) {
  const dispatch = useDispatch();
  const isList = viewMode === 'list'; 

  const isFavorite = useSelector(state => 
    state.favoritos.list.some(item => item.id === pokemonData.id)
  );

  const isInCart = useSelector(state => 
    state.carrito.list.some(item => item.pokemon.id === pokemonData.id)
  );

  const handleToggleFavorite = (e) => {
    e.preventDefault(); 
    dispatch(toggleFavorito(pokemonData));
  };
  
  const handleCartAction = (e) => {
    e.preventDefault();
    if (isInCart) {
      dispatch(removeFromCart(pokemonData.id));
    } else {
      dispatch(addToCart(pokemonData));
    }
  };

  const pokemonId = pokemonData.id;
  const idDisplay = String(pokemonId).padStart(3, '0');
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonId}.svg`;
  const price = calcularPrecioIntegrado(pokemonData);

  return (
    <CardContainer
      isList={isList}
      layout 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      whileHover="hover"
    >
      <Link 
        to={`/tienda/${pokemonId}`} 
        style={{ 
          textDecoration: 'none', 
          display: 'flex', 
          flexDirection: isList ? 'row' : 'column',
          flexGrow: 1,
          alignItems: 'center',
          width: '100%',
          overflow: 'hidden' // 
        }}
      >
        
        {/* IMAGEN */}
        <div style={{ 
          padding: '15px', 
          position: 'relative', 
          height: isList ? '100px' : '180px', 
          width: isList ? '100px' : '100%',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <motion.img 
            src={imageUrl} 
            alt={pokemonData.name} 
            style={{ 
              width: isList ? '70px' : '120px', 
              height: isList ? '70px' : '120px', 
              filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' 
            }}
            variants={{
              hover: { scale: 1.1, rotate: 5 }
            }}
          />
          {/* Overlay  */}
          {!isList && (
            <HoverOverlay variants={{ hover: { opacity: 1 } }}>
              <motion.div initial={{ y: 20 }} variants={{ hover: { y: 0 } }}>
                <ViewText>Ver</ViewText>
              </motion.div>
            </HoverOverlay>
          )}
        </div>

        {/* INFO */}
        <InfoSection isList={isList}>
             <span style={{ fontWeight: '900', fontSize: '1.2em', color: 'var(--color-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {pokemonData.name}
             </span>
             <span style={{ fontSize: '0.85em', color: '#888', marginTop: '4px' }}>
                #{idDisplay}
             </span>
             <span style={{ fontSize: '1.1em', color: 'var(--color-accent)', fontWeight: 'bold', marginTop: '8px' }}>
                $ {price}.00
             </span>
        </InfoSection>
      </Link>
      
      {/* BOTONES */}
      <ActionSection isList={isList}>
        <motion.button 
          onClick={handleToggleFavorite} 
          whileTap={{ scale: 0.9 }}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5em',
            padding: '5px'
          }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </motion.button>

        <motion.button 
          onClick={handleCartAction}
          whileTap={{ scale: 0.95 }}
          style={{ 
            padding: '8px 15px', 
            backgroundColor: isInCart ? '#e74c3c' : 'transparent', 
            border: isInCart ? 'none' : '1px solid var(--color-accent)',
            color: isInCart ? 'white' : 'var(--color-accent)', 
            cursor: 'pointer', 
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            whiteSpace: 'nowrap'
          }}
        >
          {isInCart ? 'Quitar' : (isList ? 'Añadir' : 'Añadir +')}
        </motion.button>
      </ActionSection>
    </CardContainer>
  );
}

export default PokemonCard;