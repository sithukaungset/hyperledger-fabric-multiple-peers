/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PaperNet network
 * 4. Construct request to buy commercial paper
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
const Car = require('../../manufacturer/contract/lib/car.js');


// Main program function
async function main () {

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('../identity/user/users/wallet');


    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        const prompt = require('prompt');
	    prompt.start();
        prompt.get(['name','carNo','seller'],
            async function(err,result){
                if(err){return onErr(err);}
                
                console.log('Name: '+ result.name);
                console.log('carNo: '+ result.carNo);
                console.log('Car Seller: '+ result.seller);
        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org1.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: result.name,
            wallet: wallet,
            discovery: { enabled: true, asLocalhost: true }

        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access PaperNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to commercial paper contract
        console.log('Use org.net.carlifecycle smart contract.');

        const contract = await network.getContract('papercontract', 'org.papernet.car');

        // buy commercial paper
        console.log('Submit car buying transaction.');
        
        const buyResponse = await contract.submitTransaction('buy',result.seller, result.carNo, 'S-class', result.seller, result.name , '550000', '2020-05-31', 'Luxury Sedan');

        // process response
        console.log('Process buy transaction response.');

        let car = Car.fromBuffer(buyResponse);

        console.log(`${car.issuer} car : ${car.carType} of ${car.carModel} successfully purchased by ${car.owner}`);
        console.log('Transaction complete.');

	console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();

        console.log('Buy program complete.');
  });
    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    }
}
main().then(() => {

    

}).catch((e) => {

    console.log('Buy program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
