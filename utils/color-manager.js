import DEFAULT_PALETTE from './colors';
import _ from 'lodash';

// Version of the schema. The schema defines the shape of the data stored when persistency is enabled.
// If the shape changes some day in the future, we can change the schema version to avoid conflicts with
// data previously persisted.
const SCHEMA_VERSION = 1;

export default class ColorManager {
  static SCHEMA_VERSION = SCHEMA_VERSION;

  static DEFAULT_OPTIONS = {
    persist: false,
    persistKey: null,
    consistentBy: {
      facetName: true,
      facetValue: true,
      eventName: false,
    },
    palette: DEFAULT_PALETTE,
    useCDSColors: false,
  };

  constructor(options = {}) {
    this._colorMap = {};

    this._setOptions(options);

    if (this._persist) {
      this._loadFromStorage();
    }
  }

  /**
   * Merge user options with default options and expose them in the instance.
   *
   * @param {Object} options
   */
  _setOptions(options) {
    const missingPersitKey = options.persist && !options.persistKey;

    if (missingPersitKey) {
      throw new Error("You must set 'persistKey' when persistency is enabled.");
    }

    this._persistKey = options.persistKey;
    this._persist = options.persist || ColorManager.DEFAULT_OPTIONS.persist;
    this._useCDSColors =
      options.useCDSColors || ColorManager.DEFAULT_OPTIONS.useCDSColors;

    this._consistentBy = {
      ...ColorManager.DEFAULT_OPTIONS.consistentBy,
      ...options.consistentBy,
    };

    this._palette = new Palette(
      options.palette || ColorManager.DEFAULT_OPTIONS.palette
    );

    this._colorConsistencyEnabled = Object.values(this._consistentBy).some(
      val => val === true
    );
  }

  /**
   * Write current state to localStorage. This function is debounced to avoid calling `this.export()` repeatedly,
   * since it uses `JSON.stringify` and is expensive operation.
   */
  _saveToStorage = _.debounce(() => {
    if (window) {
      window.localStorage.setItem(this._persistKey, this.export());
    }
  }, 1 * 1000);

  /**
   * If persistency is enabled, load the data from local storage and store it in the color manager instance.
   * It also restores the color palette index from local storage, meaning that the next color delivered will
   * be done from that index.
   *
   * @returns {Object} data
   */
  _loadFromStorage() {
    if (!window) {
      return;
    }

    const result = window.localStorage.getItem(this._persistKey);

    if (!result) {
      return;
    }

    try {
      const data = JSON.parse(result);
      const colorPaletteChanged =
        data.palette.colors.toString() !== this._palette.colors.toString();
      const schemaVersionChanged =
        data.schemaVersion !== ColorManager.SCHEMA_VERSION;

      if (colorPaletteChanged || schemaVersionChanged) {
        window.localStorage.removeItem(this._persistKey);

        return;
      }

      if (data.palette.currentIndex) {
        this._palette.currentIndex = data.palette.currentIndex;
      }

      this._colorMap = data.colorMap;
    } catch (error) {
      console.error('Unexpected Color Consistency data');
      console.error(error.message);
    }
  }

  /**
   * Export a snapshot Color Manager current state.
   */
  export() {
    return JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      colorMap: this._colorMap,
      palette: this._palette.export(),
    });
  }

  /**
   * Generates a hash for the given series and queryMetadata.
   *
   * @param {Object} series
   * @param {Objec} queryMetadata
   *
   * @returns {String} hash
   */
  _generateSeriesHash(series, queryMetadata) {
    // Example query to ilustrate the following comments
    // > SELECT count(*) from PageView FACET countryCode
    const hash = [];
    const facetValue = series.name;
    const facetName = queryMetadata && queryMetadata.facet;
    const eventName = series.metadata && series.metadata.type;

    // E.x: PageView
    if (this._consistentBy.eventName && eventName) {
      hash.push(eventName);
    }

    // E.x: countryCode
    if (this._consistentBy.facetName && facetName) {
      hash.push(facetName);
    }

    // E.x: US
    if (this._consistentBy.facetValue && facetValue) {
      hash.push(facetValue);
    }

    return hash.join('-');
  }

  /**
   * Returns a consistent color. If there is a color which was already provided
   * for the given serie, return that color. If not, return a new color from the palette.
   *
   * @param {Object} series
   * @param {Object} queryMetadata
   * @returns {String} color
   */
  _getConsistentColor(series = {}, queryMetadata = {}) {
    const seriesHash = this._generateSeriesHash(series, queryMetadata);
    const persistedColor = this._colorMap[seriesHash];

    if (persistedColor) {
      return persistedColor;
    }

    const newPersistedColor = this._palette.getNextColor();
    this._colorMap[seriesHash] = newPersistedColor;

    if (this._persist) {
      this._saveToStorage();
    }

    return newPersistedColor;
  }

  _isSeriesColorConsistencyValid(series, queryMetadata) {
    if (!series || !series.presentation) {
      return false;
    }

    // Avoid events series
    if (series.presentation.display === 'event') {
      return false;
    }

    // Avoid compare with series
    if (series.presentation.display === 'previous') {
      return false;
    }

    if (queryMetadata.mts) {
      return false;
    }

    return true;
  }

  /**
   * Returns a color for the given series and queryMetadata.
   *
   * @param {Object} series
   * @param {Object} queryMetadata
   */
  getColor(series = {}, queryMetadata = {}) {
    if (
      this._useCDSColors ||
      !this._isSeriesColorConsistencyValid(series, queryMetadata)
    ) {
      const cdsPresentationColor =
        series.presentation && series.presentation.color;

      return cdsPresentationColor || this._palette.getNextColor();
    }

    if (this._colorConsistencyEnabled) {
      return this._getConsistentColor(series, queryMetadata);
    }

    return this._palette.getNextColor();
  }
}

/**
 * Color palette in charge of storing the colors and tracking the last one dispatched.
 */
export class Palette {
  constructor(palette = DEFAULT_PALETTE, index = -1) {
    this.currentIndex = index;
    this.colors = palette;
  }

  /**
   * Returns the next color in the Palette.
   *
   * @param {Number} colorId
   * @returns {String} color
   */
  getNextColor() {
    this.currentIndex++;

    if (this.currentIndex > this.colors.length - 1) {
      this.currentIndex = 0;
    }

    return this.colors[this.currentIndex];
  }

  /**
   * Exports the palette data
   *
   * @returns {Object} data
   */
  export() {
    return {
      colors: this.colors,
      currentIndex: this.currentIndex,
    };
  }
}
