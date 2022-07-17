/* eslint-disable max-len */

const functions = require("firebase-functions");
const axios = require("axios");
const admin = require("firebase-admin");
const express = require("express");
const app = express();
require("dotenv").config();
console.log(process.env.API_KEY);
admin.initializeApp(functions.config().firebase);
const database = admin.database();

app.get("/getClonexStats", (req, res) => {
  const ref = database.ref("clonex/");
  ref.on("value", (snapshot)=> {
    res.status(200).send(JSON.stringify(snapshot.val()));
  }, (errorObject) => {
    console.log("The read failed: " + errorObject.name);
  });
});

app.post("/updateClonexStats", (request, response) => {
  getCloneXCollection(response);
  // response.status(202).send("Update started. Please query stats in 10min.");
});

app.get("/getSkinVialStats", (req, res) => {
  const ref = database.ref("mnlth/");
  ref.on("value", (snapshot)=> {
    res.status(200).send(JSON.stringify(snapshot.val()));
  }, (errorObject) => {
    console.log("The read failed: " + errorObject.name);
  });
});

app.post("/updateSkinVialStats", (request, response) => {
  getSkinVialCollection(response);
  // response.status(202).send("Update started. Please query stats in 10min.");
});

exports.nlytx = functions.https.onRequest(app);

const getCloneXCollection = (response) => {
  console.log("started");
  let pointer = "";
  let newUrl = "https://api.opensea.io/api/v1/assets?collection_slug=clonex&order_direction=desc&limit=50" + pointer + "&include_orders=true";
  const clonesPrices = {
    "Human": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Robot": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Angel": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Demon": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Reptile": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Undead": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Murakami": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Alien": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}}};
  const clonesDrip = {"Human": 0, "Robot": 0, "Angel": 0, "Demon": 0, "Reptile": 0, "Undead": 0, "Murakami": 0, "Alien": 0};

  const startTime = performance.now();
  const callOSCloneXData = () => {
    axios.get(newUrl, {headers: {"X-API-KEY": process.env.API_KEY}})
        .then((res) => {
          const _startTime = performance.now();

          const assets = res.data.assets;
          assets.forEach((clone) => {
            const dna = clone.traits.find((e) => e.trait_type==="DNA").value;
            const drip = clone.traits.find((e) => e.trait_type==="Type" && e.value === "MURAKAMI DRIP") ? true : false;

            if (drip) clonesDrip[dna]++;

            if (clone.sell_orders===null || clone.sell_orders[0].payment_token_contract.symbol == "WETH") return;

            if (drip && clone.sell_orders[0].current_price/Math.pow(10, 18) < clonesPrices[dna].drip.price) {
              clonesPrices[dna].drip.price = clone.sell_orders[0].current_price/Math.pow(10, 18);
              clonesPrices[dna].drip.tokenId = clone.token_id;
              // console.log(dna + clone.token_id + " (DRIP) : " + JSON.stringify(clonesPrices[dna].drip));
            }
            if (clone.sell_orders[0].current_price/Math.pow(10, 18) > clonesPrices[dna].floor.price) return;
            clonesPrices[dna].floor.price = clone.sell_orders[0].current_price/Math.pow(10, 18);
            clonesPrices[dna].floor.tokenId = clone.token_id;
            console.log(dna + clone.token_id + " : " + JSON.stringify(clonesPrices[dna].floor));
          });
          const next = res.data.next;
          if (next === null) {
            database.ref("clonex/priceStats").set(clonesPrices);
            clonesDrip["Total"] = clonesDrip["Human"] + clonesDrip["Robot"] + clonesDrip["Angel"] + clonesDrip["Demon"] + clonesDrip["Reptile"] + clonesDrip["Undead"] + clonesDrip["Murakami"] + clonesDrip["Alien"];
            database.ref("clonex/dripStats").set(clonesDrip);
            const lastUpdate = new Date().toUTCString();
            database.ref("clonex/lastUpdated").set(lastUpdate);
            getCloneXDnaStats();
            // res.status(200).send(clonesPrices);
            // res.status(200).send(JSON.stringify(clonesPrices));
            const endTime = performance.now();
            const totalTime = (endTime - startTime)/1000;
            const output = "\n Function took " + totalTime + " seconds / " + totalTime/60 + "minutes to run.";
            console.log(output);
            response.end();
            return;
          }
          pointer = "&cursor=" + next.replaceAll("=", "%3D");
          newUrl = "https://api.opensea.io/api/v1/assets?collection_slug=clonex&order_direction=desc&limit=50" + pointer + "&include_orders=true";
          const _diffTime = performance.now() - _startTime;
          if (_diffTime > 0 && _diffTime < 250 ) {
            setTimeout(() => {
              callOSCloneXData();
            }, 250-_diffTime);
          } else {
            callOSCloneXData();
          }
        })
        .catch((err) => {
          console.log(err);
        });
  };
  callOSCloneXData();
};

const getCloneXDnaStats = () => {
  axios.get("https://api.opensea.io/api/v1/collection/clonex")
      .then((res) => {
        const dnaStats = res.data.collection.traits.DNA;
        let total = 0;
        dnaStats.forEach((dna) => total += dna);
        dnaStats["total"] = total;
        database.ref("clonex/dnaStats").set(dnaStats);
      });
};

const getSkinVialCollection = (response) => {
  console.log("started");
  let pointer = "";
  let newUrl = "https://api.opensea.io/api/v1/assets?collection_slug=skinvial-evox&order_direction=desc&limit=50&" + pointer + "include_orders=true";
  const skinvialCollection = {
    "Human": {"count": 0, "floor": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Robot": {"count": 0, "floor": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Angel": {"count": 0, "floor": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Demon": {"count": 0, "floor": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Reptile": {"count": 0, "floor": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Undead": {"count": 0, "floor": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Murakami": {"count": 0, "floor": {"tokenId": 0, "price": Math.pow(10, 9)}},
    "Alien": {"count": 0, "floor": {"tokenId": 0, "price": Math.pow(10, 9)}},
  };
  const skinvialDnaStats = {"Human": 0, "Robot": 0, "Angel": 0, "Demon": 0, "Reptile": 0, "Undead": 0, "Murakami": 0, "Alien": 0};

  const startTime = performance.now();
  const callOSSkinVialData = () => {
    axios.get(newUrl, {headers: {"X-API-KEY": process.env.API_KEY}})
        .then((res) => {
          const _startTime = performance.now();

          const assets = res.data.assets;
          assets.forEach((skin) => {
            let dna = skin.traits.find((e) => e.trait_type==="DNA").value.toLowerCase();
            dna = dna[0].toUpperCase() + dna.slice(1);
            skinvialCollection[dna].count++;
            skinvialDnaStats[dna]++;
            if (skin.sell_orders===null && skin.seaport_sell_orders===null) return;
            if (skin.sell_orders!==null && skin.sell_orders[0].payment_token_contract.symbol == "WETH") return;
            const skinOrder = skin.sell_orders === null ? skin.seaport_sell_orders : skin.sell_orders;
            if (skinOrder[0].current_price/Math.pow(10, 18) > skinvialCollection[dna].floor.price) return;
            skinvialCollection[dna].floor.price = skinOrder[0].current_price/Math.pow(10, 18);
            skinvialCollection[dna].floor.tokenId = skin.token_id;
            console.log(dna + skin.token_id + " : " + JSON.stringify(skinvialCollection[dna].floor));
          });
          const next = res.data.next;
          if (next === null) {
            database.ref("mnlth/priceStats").set(skinvialCollection);
            skinvialDnaStats["Total"] = skinvialDnaStats["Human"] + skinvialDnaStats["Robot"] + skinvialDnaStats["Angel"] + skinvialDnaStats["Demon"] + skinvialDnaStats["Reptile"] + skinvialDnaStats["Undead"] + skinvialDnaStats["Murakami"] + skinvialDnaStats["Alien"];
            database.ref("mnlth/dnaStats").set(skinvialDnaStats);
            const lastUpdate = new Date().toUTCString();
            database.ref("mnlth/lastUpdated").set(lastUpdate);
            // res.status(200).send(clonesPrices);
            // res.status(200).send(JSON.stringify(clonesPrices));
            const endTime = performance.now();
            const totalTime = (endTime - startTime)/1000;
            const output = "\n Function took " + totalTime + " seconds / " + totalTime/60 + "minutes to run.";
            console.log(output);
            response.end();
            return;
          }
          pointer = "&cursor=" + next.replaceAll("=", "%3D");
          newUrl = "https://api.opensea.io/api/v1/assets?collection_slug=skinvial-evox&order_direction=desc&limit=50" + pointer + "&include_orders=true";
          const _diffTime = performance.now() - _startTime;
          if (_diffTime > 0 && _diffTime < 250 ) {
            setTimeout(() => {
              callOSSkinVialData();
            }, 250-_diffTime);
          } else {
            callOSSkinVialData();
          }
        })
        .catch((err) => {
          console.log(err);
        });
  };
  callOSSkinVialData();
};


// exports.callDnaStats = functions.https.onRequest((req, response) => {
//   // for (let i = 0; i<20000; i++) {
//   //   if (i%100==0) console.log(i);
//   // }
//   getCloneXDnaStats();
// });


// exports.callApi = functions.https.onRequest((req, response) => {
//   console.log(process.env.API_KEY);
//   // response.send(console.log(process.env.API_KEY));
//   // for (let i = 1; i< 20001; i++) {
//   //   // const ref = "users/user/" + i + "/status/";
//   //   if (i%10==0) {
//   //     console.log(i);
//   //   }
//   //   // database.ref(ref).set("0");
//   // }
//   axios.get("https://api.opensea.io/api/v1/collection/clonex/stats")
//       .then((res) => {
//         // const stats = res.data["stats"];
//         // const floorPrice = String(stats);
//         // response.send(res.data);
//         // // response.send(floorPrice);
//         // console.log(floorPrice);
//         // const stats = res.data;
//         console.log(JSON.parse(JSON.stringify(res.data)));
//         response.send(res.data);
//       })
//       .catch((err) => {
//         response.send("Error : " + String(err));
//       });
// });

// exports.textToLength = functions.https.onRequest((request, response) => {
//   const text = request.query.text;
//   const textLength = text.length;
//   response.send(String(textLength));
// });

// exports.test = functions.https.onRequest(app);

// HELLO WORLD
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   // functions.logger.info("Hello logs!", {structuredData: true});
//   // response.send("Hello from Firebase (from vscode deployment)!");
//   response.send(process.env.API_KEY);
// });

// ON NEW UPDATE TO DATABASE
// exports.newNodesDetected = functions.database.ref("users/{userId}/Name")
//     .onWrite((change, context) => {
//       const oldName = change.before.val();
//       const newName = change.after.val();
//       const userId = context.params.userId;
//       database.ref("metadata/lastChangedName/").set(userId + " changed his name from " + oldName + " to " + newName);
//       console.log(userId + " changed his name from " + oldName + " to " + newName);
//     });

// exports.helloClonex = functions.https.onRequest((request, response) => {
//   let pointer = "";
//   let newUrl = "https://api.opensea.io/api/v1/assets?collection_slug=clonex&order_direction=desc&limit=50" + pointer + "&include_orders=true";
//   const clonesObject = {};
//   const clonesPrices = {
//     "Human": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
//     "Robot": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
//     "Angel": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
//     "Demon": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
//     "Reptile": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
//     "Undead": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
//     "Murakami": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}},
//     "Alien": {"floor": {"tokenId": 0, "price": Math.pow(10, 9)}, "drip": {"tokenId": 0, "price": Math.pow(10, 9)}}};

//   const startTime = performance.now();
//   const getCloneXCollection = () => {
//     axios.get(newUrl, {headers: {"X-API-KEY": process.env.API_KEY}})
//         .then((res) => {
//           const _startTime = performance.now();

//           const assets = res.data.assets;
//           assets.forEach((clone) => {
//             clonesObject[clone.token_id] = clone;
//             const dna = clone.traits.find((e) => e.trait_type==="DNA").value;
//             const drip = clone.traits.find((e) => e.trait_type==="Type" && e.value === "MURAKAMI DRIP") ? true : false;
//             if (clone.sell_orders===null) return;
//             if (clone.sell_orders[0].payment_token_contract.symbol == "WETH") return;
//             if (drip && clone.sell_orders[0].current_price/Math.pow(10, 18) < clonesPrices[dna].drip.price) {
//               clonesPrices[dna].drip.price = clone.sell_orders[0].current_price/Math.pow(10, 18);
//               clonesPrices[dna].drip.tokenId = clone.token_id;
//               console.log(dna + clone.token_id + " (DRIP) : " + JSON.stringify(clonesPrices[dna].drip));
//             }
//             if (clone.sell_orders[0].current_price/Math.pow(10, 18) > clonesPrices[dna].floor.price) return;
//             clonesPrices[dna].floor.price = clone.sell_orders[0].current_price/Math.pow(10, 18);
//             clonesPrices[dna].floor.tokenId = clone.token_id;
//             console.log(dna + clone.token_id + " : " + JSON.stringify(clonesPrices[dna].floor));
//           });
//           const next = res.data.next;
//           if (next==null) {
//             const endTime = performance.now();
//             const totalTime = (endTime - startTime)/1000;
//             const output = "\n Function took " + totalTime + " seconds / " + totalTime/60 + "minutes to run.";
//             console.log(output);
//             const webOutput = `CLONEX FLOOR PRICES
//                         \n\n
//                         \t ======== HUMAN ======== \n
//                         Floor : ${clonesPrices["Human"].floor.tokenId} - ${clonesPrices["Human"].floor.price}ETH ; Murakami Drip : ${clonesPrices["Human"].drip.tokenId} - ${clonesPrices["Human"].drip.price}ETH ; \n
//                         \t ======== ROBOT ======== \n
//                         Floor : ${clonesPrices["Robot"].floor.tokenId} - ${clonesPrices["Robot"].floor.price}ETH ; Murakami Drip : ${clonesPrices["Robot"].drip.tokenId} - ${clonesPrices["Robot"].drip.price}ETH ; \n
//                         \t ======== DEMON ======== \n
//                         Floor : ${clonesPrices["Demon"].floor.tokenId} - ${clonesPrices["Demon"].floor.price}ETH ; Murakami Drip : ${clonesPrices["Demon"].drip.tokenId} - ${clonesPrices["Demon"].drip.price}ETH ; \n
//                         \t ======== ANGEL ======== \n
//                         Floor : ${clonesPrices["Angel"].floor.tokenId} - ${clonesPrices["Angel"].floor.price}ETH ; Murakami Drip : ${clonesPrices["Angel"].drip.tokenId} - ${clonesPrices["Angel"].drip.price}ETH ; \n
//                         \t ======== REPTILE ======== \n
//                         Floor : ${clonesPrices["Reptile"].floor.tokenId} - ${clonesPrices["Reptile"].floor.price}ETH ; Murakami Drip : ${clonesPrices["Reptile"].drip.tokenId} - ${clonesPrices["Reptile"].drip.price}ETH ; \n
//                         \t ======== UNDEAD ======== \n
//                         Floor : ${clonesPrices["Undead"].floor.tokenId} - ${clonesPrices["Undead"].floor.price}ETH ; Murakami Drip : ${clonesPrices["Undead"].drip.tokenId} - ${clonesPrices["Undead"].drip.price}ETH ; \n
//                         \t ======== MURAKAMI ======== \n
//                         Floor : ${clonesPrices["Murakami"].floor.tokenId} - ${clonesPrices["Murakami"].floor.price}ETH \n
//                         \t ======== ALIEN ======== \n
//                         Floor : ${clonesPrices["Alien"].floor.tokenId} - ${clonesPrices["Alien"].floor.price}ETH ; Murakami Drip : ${clonesPrices["Alien"].drip.tokenId} - ${clonesPrices["Alien"].drip.price}ETH ; \n
//                         \n\n Job began at ${new Date(startTime)} and ended at ${new Date()}
//                         \n Full update took ${totalTime.toFixed(2)} seconds / ${(totalTime/60).toFixed(2)} minutes to run.
//                         `;
//             response.send(webOutput);
//             database.ref("clonex/priceStats").set(clonesPrices);
//             // database.ref("clonex/clonez").set(assets);
//             database.ref("clonex/lastUpdated").set(new Date());
//             getCloneXDnaStats();
//             return;
//           }
//           pointer = "&cursor=" + next.replaceAll("=", "%3D");
//           newUrl = "https://api.opensea.io/api/v1/assets?collection_slug=clonex&order_direction=desc&limit=50" + pointer + "&include_orders=true";

//           const _diffTime = performance.now() - _startTime;
//           getCloneXCollection();
//           if (_diffTime > 0 && _diffTime < 250 ) {
//             setTimeout(() => {
//               //
//             }, 250-_diffTime);
//           } else {
//             getCloneXCollection();
//           }
//         })
//         .catch((err) => {
//           console.log(err);
//           // console.log(clonesObject);
//           // console.log(clonesPrices);
//           // console.log(startTime);
//           // response.send("Error : " + String(err));
//         });
//   };
//   getCloneXCollection();
// });

// exports.pushDataEveryMinute = functions.pubsub.schedule("every 1 hours").onRun((context)=>{
//   const date = new Date();
//   database.ref("metadata/lastUpdate/").set(date.getTime());
//   console.log("ran");
// });
