import React from 'react';
import PropTypes from 'prop-types';
import { generateClassName, capitalize } from './display-helpers';

const GaugeDataLegendItem = ({ label, color }) => {
  const labelClass = generateClassName(label);
  const capitalizedLabel = capitalize(label);

  return (
    <div
      key={labelClass}
      className={`Gauge-legend-item Gauge-legend-item--${labelClass}`}
    >
      <div
        className="Gauge-legend-item-dot"
        style={{ backgroundColor: color }}
      />
      {capitalizedLabel}
    </div>
  );
};

GaugeDataLegendItem.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.string,
};

export default GaugeDataLegendItem;
