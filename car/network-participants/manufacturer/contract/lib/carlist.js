/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('./../ledger-api/statelist.js');

const Car = require('./car.js');

class CarList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.papernet.carlist');
        this.use(Car);
    }

    async addCar(car) {
        return this.addState(car);
    }

    async getCar(carKey) {
        return this.getState(carKey);
    }

    async updateCar(car) {
        return this.updateState(car);
    }
}


module.exports = CarList;
