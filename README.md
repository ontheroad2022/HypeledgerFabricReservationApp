# HypeledgerFabricReservationApp

ハイパーレジャーで各ノードが、ドローンの離着陸地点を管理してるポイントだとして、ドローンの着陸離陸許可ができる簡単なアプリを作成する

このプロジェクトを実行する手順は以下の通り

---
まず最初に、以前から存在しているコンテナを削除します

```
$ docker rm -f $(docker ps -aq)
```

必要なライブラリをインストールします

```
$ cd chaincode/javascript/
$ npm install
```

次のコマンドを実行して Hyperledger Fabric ネットワークを開始します

```
$ cd asset-reserve/
$ ./startFabric.sh
```

ネットワークの管理コンポーネントを登録します

```
$ cd chaincode/javascript/
$ node enrollAdmin.js
```

ネットワークのユーザーコンポーネントを登録します

```
$ cd chaincode/javascript/
$ node registerUser.js
```

サーバを起動します。

```
$ cd chaincode/javascript/
$ node server.js
```
---

<pre>

.
├── README.md
├── asset-reserve
│   ├── networkDown.sh
│   ├── startFabric.sh
│   └── wallet
│       ├── admin.id
│       └── appUser.id
├── bin
│   ├── configtxgen
│   ├── configtxlator
│   ├── cryptogen
│   ├── discover
│   ├── fabric-ca-client
│   ├── fabric-ca-server
│   ├── ledgerutil
│   ├── orderer
│   ├── osnadmin
│   └── peer
├── chaincode
│   └── javascript
│       ├── client
│       │   ├── app.js
│       │   └── index.html
│       ├── composite.js
│       ├── controller.js
│       ├── enrollAdmin.js
│       ├── index.js
│       ├── invoke.js
│       ├── lib
│       │   └── assetTransfer.js
│       ├── package-lock.json
│       ├── package.json
│       ├── query.js
│       ├── registerUser.js
│       ├── reserve.js
│       ├── routes.js
│       └── server.js
├── config
│   ├── configtx.yaml
│   ├── core.yaml
│   └── orderer.yaml
└── test-network

</pre>

# HyperledgerFabricReservationApp
