export const pricingMatrix = {
  '2-piece-margin': {
    name: '2-Piece Plushie (With Margin)',
    sizes: [
      { key: '5', label: '5cm' }, { key: '10', label: '10cm' }, { key: '15', label: '15cm' },
      { key: '20', label: '20cm' }, { key: '25', label: '25cm' }, { key: '30', label: '30cm' }
    ],
    priceBrackets: [
      { min: 1, max: 10, prices: [2.30, 4.53, 6.23, 7.92, 11.04, 14.15] },
      { min: 11, max: 50, prices: [1.43, 2.80, 5.90, 6.57, 7.81, 9.06] },
      { min: 51, max: 100, prices: [1.36, 2.64, 5.51, 6.11, 7.40, 8.70] },
      { min: 101, max: 500, prices: [1.28, 2.50, 5.13, 5.74, 7.02, 8.30] },
      { min: 501, max: 1000, prices: [1.21, 2.42, 4.91, 5.43, 6.49, 7.55] },
      { min: 1001, max: Infinity, prices: [1.13, 2.26, 4.53, 4.91, 5.85, 6.80] }
    ],
    addons: { phuKien: [0, 0, 0, 0, 0, 0] }
  },
  '2-piece-edge': {
    name: '2-Piece Plushie (Edge-to-Edge)',
    sizes: [
      { key: '5', label: '5cm' }, { key: '10', label: '10cm' }, { key: '15', label: '15cm' },
      { key: '20', label: '20cm' }, { key: '25', label: '25cm' }, { key: '30', label: '30cm' }
    ],
    priceBrackets: [
      { min: 1, max: 10, prices: [2.83, 5.1, 6.80, 8.50, 11.60, 14.72] },
      { min: 11, max: 50, prices: [1.81, 3.17, 6.26, 6.87, 7.43, 9.43] },
      { min: 51, max: 100, prices: [1.74, 3.02, 5.89, 6.50, 7.17, 9.06] },
      { min: 101, max: 500, prices: [1.66, 2.87, 5.51, 6.11, 6.79, 8.68] },
      { min: 501, max: 1000, prices: [1.58, 2.80, 5.28, 5.74, 6.23, 7.92] },
      { min: 1001, max: Infinity, prices: [1.51, 2.64, 4.91, 5.30, 5.66, 7.17] }
    ],
    addons: { phuKien: [0, 0.75, 1.13, 1.51, 1.90, 2.26] }
  },
  '2-piece-embroidered': {
    name: '2-Piece Plushie (Embroidered)',
    sizes: [
      { key: '5', label: '5cm' }, { key: '10', label: '10cm' }, { key: '15', label: '15cm' },
      { key: '20', label: '20cm' }, { key: '25', label: '25cm' }, { key: '30', label: '30cm' }
    ],
    priceBrackets: [
      { min: 1, max: 10, prices: [5.66, 7.92, 9.62, 11.32, 14.43, 17.55] },
      { min: 11, max: 50, prices: [2.94, 4.30, 7.40, 7.85, 8.57, 10.57] },
      { min: 51, max: 100, prices: [2.49, 3.77, 6.64, 7.32, 7.92, 9.81] },
      { min: 101, max: 500, prices: [2.42, 3.62, 6.26, 6.87, 7.55, 9.43] },
      { min: 501, max: 1000, prices: [2.34, 3.55, 6.04, 6.57, 6.98, 8.68] },
      { min: 1001, max: Infinity, prices: [2.26, 3.40, 5.66, 6.04, 6.42, 7.92] }
    ],
    addons: { phuKien: 'contact' }
  },
  '3-piece-printed': {
    name: '3-Piece Plushie (Printed)',
    sizes: [
      { key: '10', label: '10cm' }, { key: '15', label: '15cm' }, { key: '20', label: '20cm' },
      { key: '25', label: '25cm' }, { key: '30', label: '30cm' }
    ],
    priceBrackets: [
      { min: 1, max: 10, prices: [7.36, 9.40, 11.32, 13.87, 16.42] },
      { min: 11, max: 50, prices: [4.68, 5.90, 7.02, 8.60, 10.20] },
      { min: 51, max: 100, prices: [4.45, 5.51, 6.57, 8.11, 9.66] },
      { min: 101, max: 500, prices: [4.15, 5.13, 6.04, 7.55, 9.06] },
      { min: 501, max: 1000, prices: [4.00, 4.91, 5.66, 7.17, 8.68] },
      { min: 1001, max: Infinity, prices: [3.77, 4.53, 5.28, 6.80, 8.30] }
    ],
    addons: { phuKien: [0.4, 0.4, 0.5, 0.8, 0.8] }
  },
  '3-piece-embroidered': {
    name: '3-Piece Plushie (Embroidered)',
    sizes: [
      { key: '10', label: '10cm' }, { key: '15', label: '15cm' }, { key: '20', label: '20cm' },
      { key: '25', label: '25cm' }, { key: '30', label: '30cm' }
    ],
    priceBrackets: [
      { min: 1, max: 10, prices: [28.3, 29.43, 30.57, 33.4, 36.23] },
      { min: 11, max: 50, prices: [11.32, 13.21, 15.1, 17.0, 18.87] },
      { min: 51, max: 100, prices: [8.3, 9.81, 11.32, 12.08, 12.83] },
      { min: 101, max: 500, prices: [5.28, 6.42, 7.55, 8.3, 9.06] },
      { min: 501, max: 1000, prices: [4.53, 5.28, 6.04, 6.8, 7.55] },
      { min: 1001, max: Infinity, prices: [3.77, 4.53, 5.28, 6.04, 6.8] }
    ],
    addons: { phuKien: 'contact' }
  },
  'doll-printed': {
    name: '2D Doll (Printed)',
    sizes: [
      { key: '10', label: '10cm' }, { key: '15', label: '15cm' }, { key: '20', label: '20cm' },
      { key: '25', label: '25cm' }, { key: '30', label: '30cm' }
    ],
    priceBrackets: [
      { min: 1, max: 10, prices: [7.36, 9.4, 11.32, 13.87, 16.42] },
      { min: 11, max: 50, prices: [4.68, 5.9, 7.02, 8.6, 10.2] },
      { min: 51, max: 100, prices: [4.45, 5.51, 6.57, 8.11, 9.66] },
      { min: 101, max: 500, prices: [4.15, 5.13, 6.04, 7.55, 9.06] },
      { min: 501, max: 1000, prices: [4.0, 4.91, 5.66, 7.17, 8.68] },
      { min: 1001, max: Infinity, prices: [3.77, 4.53, 5.28, 6.8, 8.3] }
    ],
    addons: { phuKien: [0.4, 0.4, 0.5, 0.8, 0.8] }
  },
  'doll-embroidered': {
    name: '2D Doll (Embroidered)',
    sizes: [
      { key: '10', label: '10cm' }, { key: '15', label: '15cm' }, { key: '20', label: '20cm' },
      { key: '25', label: '25cm' }, { key: '30', label: '30cm' }
    ],
    priceBrackets: [
      { min: 1, max: 10, prices: [28.3, 29.43, 30.57, 33.4, 36.23] },
      { min: 11, max: 50, prices: [11.32, 13.21, 15.1, 16.98, 18.87] },
      { min: 51, max: 100, prices: [8.3, 9.81, 11.32, 12.08, 12.83] },
      { min: 101, max: 500, prices: [5.28, 6.42, 7.55, 8.3, 9.06] },
      { min: 501, max: 1000, prices: [4.53, 5.28, 6.04, 6.8, 7.55] },
      { min: 1001, max: Infinity, prices: [3.77, 4.53, 5.28, 6.04, 6.8] }
    ],
    addons: { phuKien: 'contact' }
  },
  'contact': {
    name: 'Custom Requirements',
    sizes: [], priceBrackets: [], addons: {}
  }
};