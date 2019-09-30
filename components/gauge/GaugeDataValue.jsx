import React from 'react';
import PropTypes from 'prop-types';
import { generateClassName, getDisplayValue } from './display-helpers';

const GaugeDataValue = ({ value, label, color, height }, index, data) => {
  // Arbitrary proportion to ensure large gauges have the correct overlap
  const overlapProportion = height / 3;
  const arrayLength = data.length;
  const labelClass = generateClassName(label) || `${value}`;
  const displayValue = getDisplayValue(value);

  if (!displayValue) return;

  return (
    <div
      key={index + ' - ' + labelClass}
      className={`Gauge-series-${labelClass}`}
      style={{
        width: `${displayValue}%`,
        backgroundColor: color,
        zIndex: arrayLength - index,
        marginRight: -overlapProportion,
      }}
    />
  );
};

GaugeDataValue.propTypes = {
  value: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  label: PropTypes.string,
  color: PropTypes.string,
};

export default GaugeDataValue;
