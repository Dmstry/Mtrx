const Mtrx = require('..');
const assert = require('assert');

describe('Matrix Library', () => {
  it('should identify if a matrix is square', () => {
    const m = new Mtrx(3, 3); // ініціалізація квадратної матриці 3x3
    assert.strictEqual(m.isSquare(), true, 'Matrix m should be square');

    const n = new Mtrx(3, 2); // ініціалізація не квадратної матриці 3x2
    assert.strictEqual(n.isSquare(), false, 'Matrix n should not be square');
  });
});
