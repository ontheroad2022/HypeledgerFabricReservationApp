/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');


const shim = require('fabric-shim');
var logger = shim.newLogger('fabric-boilerplate');

const compositePrefix = 'composite';

class AssetTransfer extends Contract {

    async initLedger(ctx) {
        const assets = [
            {
                Owner: '登録番号０１',
                ID: 'ウェイポイント０１',
                Location: "67.0006, -70.4576",
                Timestamp: "1664054225",
                AppraisedValue: 300,
            },
            {
                Owner: '登録番号０２',
                ID: 'ウェイポイント０２',
                Location: "91.2345, -49.4576",
                Timestamp: "1664057825",
                AppraisedValue: 400,
            },
            {
                Owner: '登録番号０３',		
                ID: 'ウェイポイント０３',
                Location: "89.0306, -60.1234",
                Timestamp: "1664064233",
                AppraisedValue: 500,
            },
            {
                Owner: '登録番号０４',
                ID: 'ウェイポイント０４',
                Location: "67.0006, -74.6573",
                Timestamp: "1664074225",
                AppraisedValue: 600,
            },
            {
                Owner: '登録番号０５',
                ID: 'ウェイポイント０５',
                Location: "47.0406, -55.4474",
                Timestamp: "1664084225",
                AppraisedValue: 700,
            },
            {
                Owner: '登録番号０６',
                ID: 'ウェイポイント０６',
                Location: "62.0106, -46.8943",
                Timestamp: "1664094225",
                AppraisedValue: 800,
            },
        ];


        for (const asset of assets) {
            asset.docType = 'asset';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            // await ctx.stub.putState(asset.ID, Buffer.from(stringify(sortKeysRecursive(asset))));

            const compositeIndexKey = ctx.stub.createCompositeKey(compositePrefix, [ asset.Owner, asset.ID, asset.Location, asset.Timestamp ]);

            await ctx.stub.putState(compositeIndexKey, Buffer.from(stringify(sortKeysRecursive(asset))));
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, id, location, timestamp, owner, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset = {
            ID: id,
            Location: location,
            Timestamp: timestamp,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        //we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset);
    }

    // CreateWaypoint issues a new airport with timestamp to the world state with given details.
    async CreateWaypoint(ctx, id, location, timestamp, owner, appraisedValue) {
        // const exists = await this.AssetExists(ctx, id, timestamp);
        // if (exists) {
        //     throw new Error(`The asset ${id} with ${timestamp} already exists`);
        // }

	// const compositeIndexKey = ctx.stub.createCompositeKey(compositePrefix, [id, location, timestamp]);

        const compositeIndexKey = ctx.stub.createCompositeKey(compositePrefix, [ owner, id, location, timestamp ]);

	// if err != nil {
        //     throw new Error(`The error in creating a composite key: ${err.Error()}`);
	// }        

        const assetJSON = await ctx.stub.getState(compositeIndexKey);
        const exists = assetJSON && assetJSON.length > 0;

        logger.info(`The asset: ` + assetJSON);

        if (exists) {
            throw new Error(`The asset ${id} with the timestamp ${timestamp} already exists`);
            // logger.info(`The asset ${id} with ${timestamp} already exists`);
	}

        const asset = {
            ID: id,
            Location: location,
            Timestamp: timestamp,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        //we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        //await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));

        await ctx.stub.putState(compositeIndexKey, Buffer.from(stringify(sortKeysRecursive(asset))));

        // await ctx.stub.putState(compositeIndexKey, Buffer.from(owner));
        logger.info(`The record is adeed or updated to ${owner}`);


        return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, location, timestamp, owner, appraisedvalue) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Location: location,
            Timestamp: timestamp,
            Owner: owner,
            AppraisedValue: appraisedvalue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    async DeleteWaypoint(ctx, id, location, timestamp, owner) {
        const exists = await this.WaypointExists(ctx, id, location, timestamp, owner);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        const compositeIndexKey = ctx.stub.createCompositeKey(compositePrefix, [ owner, id, location, timestamp ]);

        return ctx.stub.deleteState(compositeIndexKey);
    }
    
    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async WaypointExists(ctx, id, location, timestamp, owner) {

        const compositeIndexKey = ctx.stub.createCompositeKey(compositePrefix, [ owner, id, location, timestamp ]);
	
        const assetJSON = await ctx.stub.getState(compositeIndexKey);
        return assetJSON && assetJSON.length > 0;
    }    

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, id, newOwner) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.Owner;
        asset.Owner = newOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];

        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        // const iterator = await ctx.stub.getStateByRange('', '');

        const iterator = await ctx.stub.getStateByPartialCompositeKey(compositePrefix, []);

        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');

            // 複合キーをパースし、データIDを返却する配列に含める
            const parseCompositeKey = ctx.stub.splitCompositeKey(result.value.key);

            let record;
            try {
                record = JSON.parse(strValue);
		// record.ID = parseCompositeKey.attributes[0];
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
    
}

module.exports = AssetTransfer;
