const chai = require('chai');
const sinon = require('sinon');
const getCartQuantities = require('../../middleware/getCartQuantities');
const { expect } = chai;

describe('Middleware: getCartQuantities', () => {
  it('should calculate cart quantities and attach them to req', () => {
    const req = {
      items: [
        { id: 1, quantity: 2 },
        { id: 2, quantity: 3 },
      ],
    };
    const res = {};
    const next = sinon.spy();

    const middleware = getCartQuantities();
    middleware(req, res, next);

    expect(req.cartQuantities).to.deep.equal({ 1: 2, 2: 3 });
    expect(next.calledOnce).to.be.true;
  });

  it('should set cartQuantities to an empty object if req.items is missing', () => {
    const req = {};
    const res = {};
    const next = sinon.spy();

    const middleware = getCartQuantities();
    middleware(req, res, next);

    expect(req.cartQuantities).to.deep.equal({});
    expect(next.calledOnce).to.be.true;
  });

  it('should set cartQuantities to an empty object if req.items is empty', () => {
    const req = { items: [] };
    const res = {};
    const next = sinon.spy();

    const middleware = getCartQuantities();
    middleware(req, res, next);

    expect(req.cartQuantities).to.deep.equal({});
    expect(next.calledOnce).to.be.true;
  });
});