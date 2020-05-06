import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

import CATEGORIES from 'src/data/categories.json';

const spring = {
  type: 'spring',
  damping: 20,
  stiffness: 300,
};

export default function Filters({ filters, onFilterClick }) {
  const [showFilters, setShowFilters] = React.useState(false);

  // when showFilters is false, only show active filters
  return (
    <Container>
      <ShowToggle onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </ShowToggle>

      <ActiveFilters>
        {Object.values(CATEGORIES).map((categories, i) => {
          return categories.map((category, j) => {
            const active = filters.has(category);

            if (!showFilters && !active) return null;

            return (
              <React.Fragment key={`${category}-filter`}>
                <Gap active={showFilters && j === 0} />
                <FilterButton
                  layoutTransition={spring}
                  key={category}
                  active={active}
                  onClick={onFilterClick(category)}
                >
                  {category}
                </FilterButton>
              </React.Fragment>
            );
          });
        })}
      </ActiveFilters>
    </Container>
  );
}

const Container = styled.div`
  margin: 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FilterButton = styled(motion.button)`
  margin: 0 4px 4px 0;
  font-size: 16px;
  padding: 4px 2px;
  height: auto;
  background-color: var(--button-color);
  color: var(--font-color);
  opacity: ${(props) => props.active || 0.4};
  color: ${(props) => (props.active ? 'var(--button-color)' : 'var(--font-color)')};
  background-color: ${(props) => (props.active ? 'var(--font-color)' : 'var(--button-color)')};
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

const ShowToggle = styled.a`
  margin: 0 0 4px 0;
  color: var(--blue-color);
  text-decoration: none;
`;

const Gap = styled.div`
  margin: 4px 0;
  width: ${(props) => (props.active ? '100%' : 'auto')};
`;
