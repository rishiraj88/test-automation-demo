const chai = require('chai');
const sinon = require('sinon');
const calculateTotalPrice = require('../../middleware/calculateTotalPrice');
const { expect } = chai;

describe('Middleware: calculateTotalPrice', () => {
  it('should calculate the total price', () => {
    const req = {
      items: [
        { id: 1, price: 10 },
        { id: 2, price: 20 },
      ],
      cartQuantities: {
        1: 2, // 2 items with ID 1
        2: 1, // 1 item with ID 2
      },
    };
    const res = {};
    const next = sinon.spy();

    const middleware = calculateTotalPrice();
    middleware(req, res, next);

    // Total price = (10 * 2) + (20 * 1) = 40
    expect(req.totalPrice).to.equal(40);
    expect(next.calledOnce).to.be.true;
  });

  it('should set total price to 0 if req.items is empty', () => {
    const req = {
      items: [],
      cartQuantities: {},
    };
    const res = {};
    const next = sinon.spy();

    const middleware = calculateTotalPrice();
    middleware(req, res, next);

    expect(req.totalPrice).to.equal(0);
    expect(next.calledOnce).to.be.true;
  });

  it('should set total price to 0 if req.cartQuantities is missing', () => {
    const req = {
      items: [
        { id: 1, price: 10 },
        { id: 2, price: 20 },
      ],
    };
    const res = {};
    const next = sinon.spy();

    const middleware = calculateTotalPrice();
    middleware(req, res, next);

    expect(req.totalPrice).to.equal(0);
    expect(next.calledOnce).to.be.true;
  });
});