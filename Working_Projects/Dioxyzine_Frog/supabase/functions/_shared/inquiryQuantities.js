export const INQUIRY_COUNT_MAX = 2147483647;

export function getInquiryQuantities({ quantity, accessoryQty } = {}) {
  const read = (value, minimum, label) => {
    const count = Number(value);
    if (!['string', 'number'].includes(typeof value) || !Number.isInteger(count) || count < minimum) {
      throw new Error(`${label} must be a whole number of at least ${minimum}.`);
    }
    if (count > INQUIRY_COUNT_MAX) throw new Error(`${label} is too large.`);
    return count;
  };
  return {
    quantity: read(quantity, 1, 'Quantity'),
    accessoryQty: read(accessoryQty ?? 0, 0, 'Accessories per unit'),
  };
}
