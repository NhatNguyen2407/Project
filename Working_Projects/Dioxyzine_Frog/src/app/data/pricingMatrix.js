export const pricingMatrix = {
  '2-manh': {
    sizes: [
      { key: '5', label: '5cm' }, { key: '10', label: '10cm' }, { key: '15', label: '15cm' },
      { key: '20', label: '20cm' }, { key: '25', label: '25cm' }, { key: '30', label: '30cm' },
      { key: '40', label: '40cm' }, { key: '50', label: '50cm' }, { key: '60', label: '60cm' }
    ],
    priceBrackets: [
      { min: 11, max: 50, prices: [1.4, 2.8, 5.9, 5.1, 7.1, 9.1, 10.9, 18.5, 25.7] },
      { min: 51, max: 100, prices: [1.4, 2.6, 5.5, 4.9, 6.8, 8.7, 10.6, 18.1, 24.9] },
      { min: 101, max: 500, prices: [1.3, 2.5, 5.1, 4.5, 6.4, 8.3, 9.8, 17.4, 23.4] },
      { min: 501, max: 1000, prices: [1.2, 2.4, 4.9, 4.2, 5.8, 7.5, 9.1, 16.6, 21.9] },
      { min: 1001, max: Infinity, prices: [1.1, 2.3, 4.5, 3.8, 5.3, 6.8, 8.3, 15.1, 20.4] }
    ],
    addons: { phuKien: [0, 0.4, 0.4, 0.5, 0.8, 0.8, 1.1, 1.9, 2.6] }
  },
  '3-manh-in': {
    sizes: [
      { key: '10', label: '10cm' }, { key: '15', label: '15cm' }, { key: '20', label: '20cm' },
      { key: '25', label: '25cm' }, { key: '30', label: '30cm' }, { key: '40', label: '40cm' }
    ],
    priceBrackets: [
      { min: 11, max: 50, prices: [4.7, 5.9, 7.0, 8.6, 10.2, 13.3] },
      { min: 51, max: 100, prices: [4.5, 5.5, 6.6, 8.1, 9.7, 12.7] },
      { min: 101, max: 500, prices: [4.2, 5.1, 6.0, 7.5, 9.1, 12.1] },
      { min: 501, max: 1000, prices: [4.0, 4.9, 5.7, 7.2, 8.7, 11.7] },
      { min: 1001, max: Infinity, prices: [3.8, 4.5, 5.3, 6.8, 8.3, 11.3] }
    ],
    addons: { phuKien: [0.4, 0.4, 0.5, 0.8, 0.8, 1.1] }
  },
  'doll-in': {
    sizes: [
      { key: '10', label: '10cm' }, { key: '15', label: '15cm' }, { key: '20', label: '20cm' },
      { key: '25', label: '25cm' }, { key: '30', label: '30cm' }, { key: '40', label: '40cm' },
      { key: '50', label: '50cm' }, { key: '60', label: '60cm' }
    ],
    priceBrackets: [
      { min: 11, max: 50, prices: [4.7, 5.9, 7.0, 8.6, 10.2, 13.3, 20.4, 28.7] },
      { min: 51, max: 100, prices: [4.5, 5.5, 6.6, 8.1, 9.7, 12.7, 19.6, 27.2] },
      { min: 101, max: 500, prices: [4.2, 5.1, 6.0, 7.5, 9.1, 12.1, 18.9, 25.7] },
      { min: 501, max: 1000, prices: [4.0, 4.9, 5.7, 7.2, 8.7, 11.7, 18.1, 24.2] },
      { min: 1001, max: Infinity, prices: [3.8, 4.5, 5.3, 6.8, 8.3, 11.3, 17.4, 22.6] }
    ],
    addons: { phuKien: [0.4, 0.4, 0.5, 0.8, 0.8, 1.1, 1.9, 2.6] }
  },
  'doll-theu': {
    sizes: [
      { key: '10', label: '10cm' }, { key: '15', label: '15cm' }, { key: '20', label: '20cm' },
      { key: '25', label: '25cm' }, { key: '30', label: '30cm' }
    ],
    priceBrackets: [
      { min: 11, max: 50, prices: [11.3, 13.2, 15.1, 17.0, 18.9] },
      { min: 51, max: 100, prices: [8.3, 9.8, 11.3, 12.1, 12.8] },
      { min: 101, max: 500, prices: [5.3, 6.4, 7.5, 8.3, 9.1] },
      { min: 501, max: 1000, prices: [4.5, 5.3, 6.0, 6.8, 7.5] },
      { min: 1001, max: Infinity, prices: [3.8, 4.5, 5.3, 6.0, 6.8] }
    ],
    addons: { phuKien: [0.4, 0.8, 1.1, 1.5, 1.9] }
  },
  'contact': {
    sizes: [], priceBrackets: [], addons: {}
  }
};