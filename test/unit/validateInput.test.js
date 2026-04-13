const chai = require('chai');
const sinon = require('sinon');
const validateInput = require('../../middleware/validateInput');
const { expect } = chai;

describe('Middleware: validateInput', () => {
  it('should call next if input is valid', () => {
    const req = { body: { itemId: 1, quantity: 3 } };
    const res = {};
    const next = sinon.spy();

    validateInput(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.args[0][0]).to.be.undefined; // No error passed to next
  });

  it('should return 400 if itemId is invalid', () => {
    const req = { body: { itemId: 'invalid', quantity: 3 } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    const next = sinon.spy();

    validateInput(req, res, next);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ error: 'Invalid or missing itemId' })).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it('should return 400 if quantity is out of range', () => {
    const req = { body: { itemId: 1, quantity: 6 } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    const next = sinon.spy();

    validateInput(req, res, next);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ error: 'Quantity must be between 0 and 5' })).to.be.true;
    expect(next.notCalled).to.be.true;
  });
});