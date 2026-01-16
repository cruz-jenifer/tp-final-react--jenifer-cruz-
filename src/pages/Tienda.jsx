import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPokemons } from '../store/pokemonSlice';
import { calcularPrecioIntegrado } from '../store/carritoSlice'; 
import PokemonCard from '../components/PokemonCard';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';

// --- ESTILOS RESPONSIVE ---

const PageContainer = styled.div`
  padding: 20px 40px;
  background-color: rgba(0, 23, 15, 0.6);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 15px 15px; 
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap; 
  gap: 10px;

  h2 {
    font-size: clamp(1.8rem, 5vw, 2.5rem);
    text-shadow: 0 0 10px rgba(94, 237, 185, 0.5);
    margin: 0;
  }
`;

const ToolbarContainer = styled.div`
  background: rgba(30, 30, 35, 0.8);
  backdrop-filter: blur(10px);
  padding: 20px 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);

  @media (max-width: 600px) {
    flex-direction: column; 
    align-items: stretch; 
    padding: 15px;
    gap: 15px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  
  @media (max-width: 600px) {
    justify-content: space-between; 
    width: 100%;
  }

  label {
    font-weight: bold;
    color: #aaa;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 1px;
  }
`;

const SelectStyled = styled.select`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-accent);
  color: var(--color-light);
  padding: 10px 15px;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s;
  flex-grow: 1; 

  &:hover {
    background: rgba(94, 237, 185, 0.1);
  }
  
  option {
    background: #2c2c31;
    color: var(--color-light);
  }
`;

const ViewToggleButton = styled(motion.button)`
  background: ${props => props.active ? 'var(--color-accent)' : 'transparent'};
  color: ${props => props.active ? 'var(--color-dark)' : 'var(--color-light)'};
  border: 1px solid var(--color-accent);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
  flex: 1; 
  justify-content: center;
  
  &:hover {
    background: ${props => props.active ? 'var(--color-accent)' : 'rgba(94, 237, 185, 0.1)'};
  }
`;

// --- COMPONENTE PRINCIPAL ---

function Tienda() {
  const dispatch = useDispatch();
  const { list, isLoading, error, nextUrl } = useSelector((state) => state.pokemons);
  
  const [orden, setOrden] = useState('relevante'); 
  const [vista, setVista] = useState('grid'); 

  useEffect(() => {
    
    if (list.length === 0) {
      dispatch(fetchPokemons(nextUrl));
    }
  }, [dispatch, list.length, nextUrl]); 

  // ---DEDUPLICACIÓN Y ORDENAMIENTO ---
  const pokemonsProcesados = useMemo(() => {
    if (!list) return [];

    //  DEDUPLICACIÓN Usamos un Map 
    const unicos = new Map();
    list.forEach(item => {
      if (!unicos.has(item.id)) {
        unicos.set(item.id, item);
      }
    });
    const listaSinDuplicados = Array.from(unicos.values());

    // 2. ORDENAMIENTO
    switch (orden) {
      case 'menor':
        return listaSinDuplicados.sort((a, b) => calcularPrecioIntegrado(a) - calcularPrecioIntegrado(b));
      case 'mayor':
        return listaSinDuplicados.sort((a, b) => calcularPrecioIntegrado(b) - calcularPrecioIntegrado(a));
      case 'relevante':
      default:
        return listaSinDuplicados.sort((a, b) => a.id - b.id);
    }
  }, [list, orden]);

  const handleLoadMore = () => {
    if (nextUrl && !isLoading) {
      dispatch(fetchPokemons(nextUrl));
    }
  };

  if (error) return <h2 style={{ color: 'red', padding: '20px' }}>Error: {error}</h2>;

  return (
    <PageContainer>
      
      <HeaderContainer>
        <h2>Catálogo Pokémon</h2>
        <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
          {pokemonsProcesados.length} Disponibles
        </span>
      </HeaderContainer>

      {/* BARRA DE HERRAMIENTAS */}
      <ToolbarContainer>
        <FilterGroup>
          <label>Ordenar:</label>
          <SelectStyled value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="relevante">Relevancia (ID)</option>
            <option value="menor">Menor Precio</option>
            <option value="mayor">Mayor Precio</option>
          </SelectStyled>
        </FilterGroup>

        <FilterGroup>
          <label>Vista:</label>
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <ViewToggleButton 
              active={vista === 'grid'} 
              onClick={() => setVista('grid')}
              whileTap={{ scale: 0.95 }}
            >
              ⊞ Cuadros
            </ViewToggleButton>
            <ViewToggleButton 
              active={vista === 'list'} 
              onClick={() => setVista('list')}
              whileTap={{ scale: 0.95 }}
            >
              ☰ Lista
            </ViewToggleButton>
          </div>
        </FilterGroup>
      </ToolbarContainer>
      
      {/* GRID / LISTA */}
      <motion.div 
        layout 
        style={{ 
          display: 'grid', 
          
          gridTemplateColumns: vista === 'list' ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px' 
        }}
      >
        <AnimatePresence>
          {pokemonsProcesados.map((pokemon) => (
            <PokemonCard 
              key={pokemon.id} 
              pokemonData={pokemon} 
              viewMode={vista} 
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* BOTÓN CARGAR MÁS */}
      <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '40px' }}>
        {isLoading ? (
          <h3 style={{ color: 'var(--color-accent)' }}>Buscando Pokémons...</h3>
        ) : (
          <motion.button 
            onClick={handleLoadMore}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px var(--color-accent)" }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              padding: '15px 40px', 
              fontSize: '1rem', 
              backgroundColor: 'transparent', 
              color: 'var(--color-accent)', 
              border: '2px solid var(--color-accent)', 
              borderRadius: '50px', 
              cursor: 'pointer',
              fontWeight: '900',
              textTransform: 'uppercase',
              width: '100%',
              maxWidth: '300px' 
            }}
          >
            + Cargar Más
          </motion.button>
        )}
      </div>
    </PageContainer>
  );
}

export default Tienda;