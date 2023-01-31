// import { Wallets, X509Identity } from 'fabric-network';
const { Wallets, X509Identity } = require('fabric-network');

const { FileSystemWallet, Gateway, DefaultEventHandlerStrategies} = require('fabric-network');
const path = require('path');
const fs   = require('fs');

// const ccpPath = path.resolve(__dirname, '..', 'network', 'connection-org1.json');

const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');

const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function connectToNetwork(callback) {
    // Create a new file system based wallet for managing identities
    const walletPath = path.join(process.cwd(), 'wallet');
    // const wallet = new FileSystemWallet(walletPath);

    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check to see if we've already enrolled user
    // const userExists = await wallet.exists('user1');

    // const userExists = await wallet.exists('appUser');
    const userExists = await wallet.get('appUser');


    if(!userExists){
        console.log('And identity for the user "appUser" does not exist in the wallet');
        console.log('Run registerUser.js application before trying');
        return;
    }

    // Create a new gateway for connecting to our peer node. 
    const gateway = new Gateway();
    await gateway.connect(
        ccp, 
        {
            wallet: wallet, 
            identity:'appUser', 
            discovery:{enabled:true, asLocalhost:true}
        }
    );

    // Get the network(channel) our contract is deployed to
    const network = await gateway.getNetwork('mychannel');

    // Get the contract from the network
    const contract = network.getContract('asset-reserve');
    
    callback(contract);
}

module.exports = (function() {
    return{
        get_all_data: async function(req, res) {
            console.log('getting all data from database.');
            connectToNetwork(async contract => {
                try {
                    const result = await contract.evaluateTransaction('GetAllAssets');
                    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

		    res.json(JSON.parse(result.toString()));
                } catch (error) {
                    console.error('Failed to submit transaction: - '+error);
                    process.exit(1);
                }
            }); 
        },
        add_data: async function(req, res) {
            connectToNetwork(async contract => {
                try {
                    var array       = req.params.data.split('_');
                    var id          = array[0];
                    var location    = array[1];
                    var timestamp   = array[2];
                    var owner       = array[3];
                    var vessel      = array[4];
                    var appraisedvalue = array[5];
    
                    await contract.submitTransaction('CreateWaypoint', vessel, location, timestamp, owner, appraisedvalue);
                    
                    console.log('Transaction has been submitted');
                    res.json({message:"Transaction has been submitted"});
                } catch (error) {
                    console.error(error);
		    return res.status(500).json({error: "Error in CreateWayPoint."});		
                }
            });
        },
        change_holder: async function(req,res){
            connectToNetwork(async contract =>{
                try {
                    var array       = req.params.holder.split('_');
                    var id          = array[0];
                    var location    = array[1];
                    var timestamp   = array[2];
                    var owner       = array[3];
                    var vessel      = array[4];
                    var appraisedvalue = array[5];
   
		    // debug
                    console.log('debug: id        ' + id);
	            console.log('debug: location  ' + location);
	            console.log('debug: timestamp ' + timestamp);
	            console.log('debug: owner     ' + owner);
	            console.log('debug: vessel    ' + vessel);		    		    

                    // await contract.submitTransaction('TransferAsset', key, holder);

                    await contract.submitTransaction('DeleteWaypoint', vessel, location, timestamp, owner);
		    
                    console.log('Transaction has been submitted.');
                    res.json({message:"Transaction has been submitted"});    
                } catch (error) {
                    console.error(error); 
                } 
            });
        },
        double_booking: async function(req,res){
            connectToNetwork(async contract =>{
                try {
                    // await contract.submitTransaction('TransferAsset', key, holder);
                    // console.log('Transaction has been submitted.');
                    res.json({message:"Transaction has been submitted"});    
                } catch (error) {
                    console.error(error); 
                } 
            });
        }	
    }
})();
