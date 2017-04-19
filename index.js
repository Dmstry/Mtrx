const {
  create,
  clone,
  transpose,
  isNumbers,
  isMtrxLike,
  isSingular,
  resetMtrx,
  mapMtrxItem,
  multiply,
  rowEchelon,
  LUP,
  inverse,
  det,
  cof,
  compan,
} = require('./func');
const {
  abs,
  random,
} = Math;

const addition = (A, B) => mapMtrxItem((i, j, n) => n + B[i][j], A),
      subtract = (A, B) =>  mapMtrxItem((i, j, n) => n - B[i][j], A),
      mulNumber = (A, n) => mapMtrxItem((i, j, m) => m * n, A),
      divNumber = (A, n) => mapMtrxItem((i, j, m) => m / n, A);

class Mtrx extends Array{
  constructor(rows=1, cols=rows, nums='R') {
    let matrix;
    if (isMtrxLike(rows)) {
      matrix = clone(rows);
    } else if (isNumbers(rows)){
      matrix = create((i, j) => (i === j) ? rows[i] : 0)(rows.length);
    } else if (typeof rows === 'number' && typeof cols === 'number') {
      if (nums === 'R') {
        matrix = create(() => random())(rows, cols);
      } else if (nums === 'E') {
        matrix = create((i, j) => (i === j) ? 1 : 0)(rows, cols);
      } else if (typeof nums === 'number') {
        matrix = create(() => nums)(rows, cols);
      } else if (typeof nums === 'function'){
        matrix = create(nums)(rows, cols);
      } else {
        matrix = create(() => 0)(rows, cols);
      }
    } else {
      throw TypeError(rows + ' is not a Matrix or Number Array or Number.');
    }

    super(...matrix);
  }

  static zeros(rows=1, cols=rows) {
    return new this(rows, cols, 0);
  }
  static ones(rows=1, cols=rows) {
    return new this(rows, cols, 1);
  }
  static eye(rows=1, cols=rows) {
    return new this(rows, cols, 'E');
  }
  static rand(rows=1, cols=rows) {
    return new this(rows, cols);
  }
  static like(secondOrder) {
    return new this(secondOrder);
  }
  static diag(array) {
    return new this(array);
  };

  get rows() {
    return this.length;
  }
  get cols() {
    return this[0].length;
  }
  get T() {
    return new Mtrx(transpose(this));
  }
  get rank() {
    return rowEchelon(this).length;
  }
  get LUP() {
    let {L, U, P} = LUP(this);
    return {L: new Mtrx(L), U: new Mtrx(U), P: new Mtrx(P)};
  }
  get inv() {
    return new Mtrx(inverse(this));
  }
  get det() {
    return det(this);
  }
  get compan() {
    return new Mtrx(compan(this));
  }
  get rowEchelon() {
    const echelon = rowEchelon(this);
    var newMatrix = new Mtrx(echelon);
    newMatrix.changeRows(this.rows - echelon.length);
    return newMatrix;
  }

  static clone(matrix) {
    if (!isMtrxLike(matrix)) throw TypeError(matrix + ' is not a MtrxLike.');
    return new this(matrix);
  }

  static isMtrx(obj) {
    return obj instanceof Mtrx;
  }
  static isMtrxLike(obj) {
    return isMtrxLike(obj);
  }
  static isSameShape(obj, another) {
    return isMtrxLike(obj) &&
      isMtrxLike(another) &&
      obj.length === another.length &&
      obj[0].length === another[0].length;
  }

  changeRows(rows=0, nums=0) {
    const cols = this.cols;
    if (rows > 0) {
      let r;
      for (let i = 0; i < rows; i++) {
        r = Array(cols).fill(nums);
        this.push(r);
      }
    } else {
      for (let i = 0; i < abs(rows); i++) {
        this.pop();
      }
    }
  }
  changeCols(cols=0, nums=0) {
    if (cols > 0) {
      for (let i = 0; i < cols; i++) {
        for (let row of this) {
          row.push(nums);
        }
      }
    } else {
      for (let i = 0; i < abs(cols); i++) {
        for (let row of this) {
          row.pop();
        }
      }
    }
  }
  resetLike(matrix) {
    if (isMtrxLike(matrix)) {
      resetMtrx(this, matrix);
    } else if (isNumbers(matrix)){
      resetMtrx(this, create((i, j) => (i === j) ? matrix[i] : 0)(matrix.length));
    }  else {
      throw TypeError(rows + ' is not a Matrix or Number Array.');
    }
  }

  add(matrix) {
    if (!Mtrx.isMtrxLike(matrix)) throw TypeError(matrix + ' is not a MtrxLike.');
    if (Mtrx.isSameShape(this, matrix)) {
      resetMtrx(this, addition(this, matrix));
    } else {
      throw TypeError(matrix + ' \'s shape is no like ' + this);
    }
  }
  sub(matrix) {
    if (!Mtrx.isMtrxLike(matrix)) throw TypeError(matrix + ' is not a MtrxLike.');
    if (Mtrx.isSameShape(this, matrix)) {
      resetMtrx(this, subtract(this, matrix));
    } else {
      throw TypeError(matrix + ' \'s shape is no like ' + this);
    }
  }
  mul(obj) {
    if (typeof obj === 'number') {
      resetMtrx(this,  mulNumber(this, obj));
    } else if (Mtrx.isMtrxLike(obj)) {
      if (this.cols === obj.length) {
        resetMtrx(this, multiply(this, obj));
      } else {
        throw TypeError(this + ' can\'t right multiply ' + obj);
      }
    } else {
      throw TypeError(obj + ' is not a Number or a MtrxLike');
    }
  }
  rightMul(obj) {
    this.mul(obj);
  }
  leftMul(obj) {
    if (typeof obj === 'number') {
      resetMtrx(this,  mulNumber(this, obj));
    } else if (Mtrx.isMtrxLike(obj)) {
      if (this.rows === obj[0].length) {
        resetMtrx(this, multiply(obj, this));
      } else {
        throw TypeError(this + ' can\'t multiply ' + obj);
      }
    } else {
      throw TypeError(obj + ' is not a Number or a MtrxLike');
    }
  }
  div(obj) {
    if (typeof obj === 'number') {
      resetMtrx(this,  divNumber(this, obj));
    } else if (Mtrx.isMtrxLike(obj)) {
      if (this.rows === obj[0].length && !isSingular(obj)) {
        resetMtrx(this, multiply(this, inverse(obj)));
      } else {
        throw TypeError(this + ' can\'t divide ' + obj);
      }
    } else {
      throw TypeError(obj + ' is not a Number or a MtrxLike');
    }
  }
  rightDiv(obj) {
    this.div(obj);
  }
  leftDiv(obj) {
    if (typeof obj === 'number') {
      resetMtrx(this,  divNumber(this, obj));
    } else if (Mtrx.isMtrxLike(obj)) {
      if (this.rows === obj[0].length && !isSingular(obj)) {
        resetMtrx(this, multiply(inverse(obj), this));
      } else {
        throw TypeError(this + ' can\'t divide ' + obj);
      }
    } else {
      throw TypeError(obj + ' is not a Number or a MtrxLike');
    }
  }

  static add(matrix, another) {
    if (!isMtrxLike(matrix)) throw TypeError(matrix + ' is not a MtrxLike.');
    if (!isMtrxLike(another)) throw TypeError(another + ' is not a MtrxLike.');
    if (this.isSameShape(matrix, another)) {
      return new Mtrx(addition(matrix, another));
    } else {
      throw TypeError(matrix + ' \'s shape is no like ' + another);
    }
  }
  static sub(matrix, another) {
    if (!isMtrxLike(matrix)) throw TypeError(matrix + ' is not a MtrxLike.');
    if (!isMtrxLike(another)) throw TypeError(another + ' is not a MtrxLike.');
    if (this.isSameShape(matrix, another)) {
      return new Mtrx(subtract(matrix, another));
    } else {
      throw TypeError(matrix + ' \'s shape is no like ' + another);
    }
  }
  static mul(obj, another) {
    var matrix;
    if (typeof obj === 'number' && isMtrxLike(another)) {
      matrix =  mulNumber(another, obj);
    } else if (isMtrxLike(obj) && typeof another === 'number') {
      matrix = mulNumber(obj, another);
    } else if (isMtrxLike(obj) && isMtrxLike(another)) {
      if (obj[0].length === another.length) {
        matrix =  multiply(obj, another);
      } else {
        throw TypeError(obj + ' can\'t right multiply ' + another);
      }
    } else {
      throw TypeError(obj + ' is not a Number or a MtrxLike, \n Or ' +
                      another + ' is not a Number or a MtrxLike.');
    }
    return new Mtrx(matrix);
  }
  static div(obj, another) {
    var matrix;
    if (typeof obj === 'number' && isMtrxLike(another)) {
      matrix = divNumber(another, obj);
    } else if (isMtrxLike(obj) && typeof another === 'number') {
      matrix = divNumber(obj, another);
    } else if (isMtrxLike(obj) && isMtrxLike(another)) {
      if (obj[0].length === another.length && !isSingular(another)) {
        matrix = multiply(matrix, inverse(another));
      } else {
        throw TypeError(obj + ' can\'t right divide ' + another);
      }
    } else {
      throw TypeError(obj + ' is not a Number or a MtrxLike, \n Or ' +
                      another + ' is not a Number or a MtrxLike.');
    }
    return new Mtrx(matrix);
  }

  static cof(matrix, i, j) {
    if (!isMtrxLike(matrix)) throw TypeError(matrix + ' is not a MtrxLike.');
    return new Mtrx(cof(matrix, i, j));
  };

  toString() {
    let matrix = [...this];
    const rows = this.rows;
    for (let i = 0; i < rows; i++) {
      matrix[i] = '  [ ' + matrix[i].join(' ') +' ],\n';
    }
    return '[\n' + matrix.join('') + ']';
  }
}

module.exports = Mtrx;