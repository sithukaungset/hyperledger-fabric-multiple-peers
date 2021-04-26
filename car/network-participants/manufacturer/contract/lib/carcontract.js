/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// PaperNet specifc classes
const Car = require('./car.js');
const CarList = require('./carlist.js');
const QueryUtils = require('./queries.js');

/**
 * A custom context provides easy access to list of all commercial papers
 */
class CarContext extends Context {

    constructor() {
        super();
        // All papers are held in a list of papers
        this.carList = new CarList(this);
    }

}

/**
 * Define commercial paper smart contract by extending Fabric Contract class
 *
 */
class CarContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.papernet.car');
    }

    /**
     * Define a custom context for commercial paper
    */
    createContext() {
        return new CarContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Issue commercial paper
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer car issuer
     * @param {Integer} carNumber car number for this issuer
     
     * @param {String} carModel the model of the car
     * @param {String} issueDateTime car issue date
     * @param {String} maturityDateTime car maturity date
     * @param {Integer} faceValue face value of car
     * @param {String} carType type of car
    */
    async issue(ctx, issuer, carNumber, carModel, issueDateTime, maturityDateTime, faceValue,carType) {
       
        // create an instance of the paper
        let car = Car.createInstance(issuer, carNumber, carModel, issueDateTime, maturityDateTime, faceValue,carType);

        
     
        // Smart contract, rather than paper, moves paper into ISSUED state
        car.setIssued();

        // Newly issued paper is owned by the issuer
        car.setOwner(issuer);
        

        

        // Add the paper to the list of all similar commercial papers in the ledger world state
        await ctx.carList.addCar(car);

        // Must return a serialized paper to caller of smart contract
        return car;
    }

    /**
     * Buy commercial paper
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer car issuer
     * @param {Integer} carNumber car number for this issuer
     * @param {String} carModel the model of the car
     * @param {String} currentOwner current owner of the car
     * @param {String} newOwner new owner of car
     * @param {Integer} price price paid for this car
     * @param {String} purchaseDateTime time car was purchased (i.e. traded)
     * @param {String} carType type of car
    */
    async buy(ctx, issuer, carNumber, carModel, currentOwner, newOwner, price, purchaseDateTime, carType) {

        // Retrieve the current car using key fields provided
        let carKey = Car.makeKey([issuer, carNumber]);
        let car = await ctx.carList.getCar(carKey);

        // Validate current owner
        if (car.getOwner() !== currentOwner) {
            throw new Error('Car ' + issuer + carNumber + ' is not owned by ' + currentOwner);
        }

        // First buy moves state from ISSUED to TRADING
        if (car.isIssued()) {
            car.setTrading();
        }

        // Check paper is not already REDEEMED
        if (car.isTrading()) {
            car.setOwner(newOwner);
        } else {
            throw new Error('Car ' + issuer + carNumber + ' is not trading. Current state = ' +car.getCurrentState());
        }

        // Update the paper
        await ctx.carList.updateCar(car);
        return car;
    }

    /**
     * Redeem commercial paper
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer commercial paper issuer
     * @param {String} carModel the model of the car
     * @param {Integer} paperNumber paper number for this issuer
     * @param {String} redeemingOwner redeeming owner of paper
     * @param {String} redeemDateTime time paper was redeemed
    */
    async sold(ctx, issuer, carNumber, carModel,  soldOwner, redeemDateTime) {

        let carKey = Car.makeKey([issuer, carNumber]);

        let car = await ctx.carList.getCar(carKey);

        // Check paper is not REDEEMED
        if (car.isSold()) {
            throw new Error('Car ' + issuer + carNumber + ' already sold out');
        }

        // Verify that the redeemer owns the commercial paper before redeeming it
        if (car.getOwner() === soldOwner) {
            car.setOwner(car.getIssuer());
            car.setSold();
        } else {
            throw new Error('The person who is selling the car does not own the car' + issuer + carNumber);
        }

        await ctx.carList.updateCar(car);
        return car;
    }

     // Query transactions

    /**
     * Query history of a commercial paper
     * @param {Context} ctx the transaction context
     * @param {String} issuer commercial paper issuer
     * @param {Integer} carNumber paper number for this issuer
    */
    async queryHistory(ctx, issuer, carNumber) {

        // Get a key to be used for History query

        let query = new QueryUtils(ctx, 'org.papernet.paper');
        let results = await query.getAssetHistory(issuer, carNumber); // (cpKey);
        return results;

}

/**
* queryOwner commercial paper: supply name of owning org, to find list of papers based on owner field
* @param {Context} ctx the transaction context
* @param {String} owner commercial paper owner
*/
async queryOwner(ctx, owner) {

    let query = new QueryUtils(ctx, 'org.papernet.car');
    let owner_results = await query.queryKeyByOwner(owner);

    return owner_results;
}

/**
* queryPartial commercial paper - provide a prefix eg. "DigiBank" will list all papers _issued_ by DigiBank etc etc
* @param {Context} ctx the transaction context
* @param {String} prefix asset class prefix (added to paperlist namespace) eg. org.papernet.paperMagnetoCorp asset listing: papers issued by MagnetoCorp.
*/
async queryPartial(ctx, prefix) {

    let query = new QueryUtils(ctx, 'org.papernet.car');
    let partial_results = await query.queryKeyByPartial(prefix);

    return partial_results;
}

/**
* queryAdHoc commercial paper - supply a custom mango query
* eg - as supplied as a param:     
* ex1:  ["{\"selector\":{\"faceValue\":{\"$lt\":8000000}}}"]
* ex2:  ["{\"selector\":{\"faceValue\":{\"$gt\":4999999}}}"]
* 
* @param {Context} ctx the transaction context
* @param {String} queryString querystring
*/
async queryAdhoc(ctx, queryString) {

    let query = new QueryUtils(ctx, 'org.papernet.car');
    let querySelector = JSON.parse(queryString);
    let adhoc_results = await query.queryByAdhoc(querySelector);

    return adhoc_results;
}


/**
 * queryNamed - supply named query - 'case' statement chooses selector to build (pre-canned for demo purposes)
 * @param {Context} ctx the transaction context
 * @param {String} queryname the 'named' query (built here) - or - the adHoc query string, provided as a parameter
 */
async queryNamed(ctx, queryname) {
    let querySelector = {};
    switch (queryname) {
        case "redeemed":
            querySelector = { "selector": { "currentState": 4 } };  // 4 = redeemd state
            break;
        case "trading":
            querySelector = { "selector": { "currentState": 3 } };  // 3 = trading state
            break;
        case "value":
            // may change to provide as a param - fixed value for now in this sample
            querySelector = { "selector": { "faceValue": { "$gt": 4000000 } } };  // to test, issue CommPapers with faceValue <= or => this figure.
            break;
        default: // else, unknown named query
            throw new Error('invalid named query supplied: ' + queryname + '- please try again ');
    }

    let query = new QueryUtils(ctx, 'org.papernet.car');
    let adhoc_results = await query.queryByAdhoc(querySelector);

    return adhoc_results;
}

}



module.exports = CarContract;
