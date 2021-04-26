/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('./../ledger-api/state.js');

// Enumerate commercial paper state values
const cpState = {
    ISSUED: 1,
    TRADING: 2,
    SOLD: 3,
    REDEEMED: 4,
    SERVICE: 5,
    ACCIDENT: 6    
};

/**
 * CommercialPaper class extends State class
 * Class will be used by application and smart contract to define a paper
 */
class Car extends State {

    constructor(obj) {
        super(Car.getClass(), [obj.issuer, obj.carNumber]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
    */
    getIssuer() {
        return this.issuer;
    }

    setIssuer(newIssuer) {
        this.issuer = newIssuer;
    }

    getOwner() {
        return this.owner;
    }

    setOwner(newOwner) {
        this.owner = newOwner;
    }

   


    /**
     * Useful methods to encapsulate commercial paper states
     */
    setIssued() {
        this.currentState = cpState.ISSUED;
    }

    setTrading() {
        this.currentState = cpState.TRADING;
    }

    setSold() {
        this.currentState = cpState.SOLD;
    }
    setInsurance() {
        this.currentState = cpState.INSURANCE;
    }
    setService() {
        this.currentState = cpState.SERVICE;
    }
    setAccident() {
        this.currentState = cpState.ACCIDENT;
    }
    isIssued() {
        return this.currentState === cpState.ISSUED;
    }

    isTrading() {
        return this.currentState === cpState.TRADING;
    }

    isSold() {
        return this.currentState === cpState.SOLD;
    }
    isInsurance() {
        return this.currentState === cpState.INSURANCE;
    }
    isService() {
        return this.currentState === cpState.SERVICE;
    }
    isAccident() {
        return this.currentState === cpState.ACCIDENT;
    }
    static fromBuffer(buffer) {
        return Car.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to commercial paper
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Car);
    }

    /**
     * Factory method to create a commercial paper object
     */
    static createInstance(issuer, carNumber,  carModel, issueDateTime, maturityDateTime, faceValue,carType) {
        return new Car({ issuer, carNumber, carModel, issueDateTime, maturityDateTime, faceValue,carType });
    }

    static getClass() {
        return 'org.papernet.car';
    }
}

module.exports = Car;
