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
 * 4. Construct request to issue commercial paper
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
const Car = require('../contract/lib/car.js');

// Main program function
async function main() {

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('/home/inlab/fabric-application/car/network-participants/identity/user/users/wallet');

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();
	
    // Main try/catch block
    try {
        
        // Specify userName for network access
        // const userName = 'isabella.issuer@magnetocorp.com';
        const prompt = require('prompt');
	    prompt.start();
        prompt.get(['name','number'],
            async function(err,result){
                if(err){return onErr(err);}
                console.log('Car Number'+ result.number)
                console.log('Name: '+ result.name);
            
        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org2.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: result.name,
            wallet: wallet,
            discovery: { enabled:true, asLocalhost: true }
        };
    
        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access car network
        console.log('Use network channel: Car channel.');
        
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to car contract
        console.log('Use org.papernet.car smart contract.');

        const contract = await network.getContract('papercontract');
         
        // issue car
        
        const issueResponse = await contract.submitTransaction('issue', result.name, result.number, 'S-class', '2020-05-31', '2020-11-30', '500000', 'Luxury Sedan');
       

        // process response
        console.log('Process issue transaction response.'+issueResponse);

        let car = Car.fromBuffer(issueResponse);
   
        console.log(`${car.issuer} car : ${car.carType} of ${car.carNumber} successfully issued for value ${car.faceValue}`);
        console.log('Transaction complete.');

        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();

        console.log('Issue program complete.');
    });
    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        

    } 
} 
main().then(() => {
   
    

}).catch((e) => {

    
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
