/* eslint-disable max-len */

const functions = require("firebase-functions");
const axios = require("axios");
const admin = require("firebase-admin");
const express = require("express");
const app = express();
require("dotenv").config();
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

app.post("/updateClonexStats", (req, res) => {
  getCloneXCollection(res);
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

app.post("/updateSkinVialStats", (req, res) => {
  getSkinVialCollection(res);
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
  const clonesDnaStats = {"Human": 0, "Robot": 0, "Angel": 0, "Demon": 0, "Reptile": 0, "Undead": 0, "Murakami": 0, "Alien": 0};
  const clonesDripStats = {"Human": 0, "Robot": 0, "Angel": 0, "Demon": 0, "Reptile": 0, "Undead": 0, "Murakami": 0, "Alien": 0};

  const startTime = performance.now();
  const callOSCloneXData = () => {
    axios.get(newUrl, {headers: {"X-API-KEY": process.env.API_KEY}})
        .then((res) => {
          const _startTime = performance.now();

          const assets = res.data.assets;
          assets.forEach((clone) => {
            const dna = clone.traits.find((e) => e.trait_type==="DNA").value;
            const drip = clone.traits.find((e) => e.trait_type==="Type" && e.value === "MURAKAMI DRIP") ? true : false;

            clonesDnaStats[dna]++;
            if (drip) clonesDripStats[dna]++;
            if (clone.sell_orders===null && clone.seaport_sell_orders===null) return;
            if (clone.sell_orders!==null && clone.sell_orders[0].payment_token_contract.symbol == "WETH") return;
            const cloneOrder = clone.sell_orders === null ? clone.seaport_sell_orders : clone.sell_orders;

            if (cloneOrder[0].current_price===0) return; // bids

            if (drip && cloneOrder[0].current_price/Math.pow(10, 18) < clonesPrices[dna].drip.price) {
              clonesPrices[dna].drip.price = cloneOrder[0].current_price/Math.pow(10, 18);
              clonesPrices[dna].drip.tokenId = clone.token_id;
            }
            if (cloneOrder[0].current_price/Math.pow(10, 18) > clonesPrices[dna].floor.price) return;
            clonesPrices[dna].floor.price = cloneOrder[0].current_price/Math.pow(10, 18);
            clonesPrices[dna].floor.tokenId = clone.token_id;
            console.log(dna + clone.token_id + " : " + JSON.stringify(clonesPrices[dna].floor));
          });
          const next = res.data.next;
          if (next === null) {
            database.ref("clonex/priceStats").set(clonesPrices);
            clonesDnaStats["Total"] = clonesDnaStats["Human"] + clonesDnaStats["Robot"] + clonesDnaStats["Angel"] + clonesDnaStats["Demon"] + clonesDnaStats["Reptile"] + clonesDnaStats["Undead"] + clonesDnaStats["Murakami"] + clonesDnaStats["Alien"];
            database.ref("clonex/dnaStats").set(clonesDnaStats);
            clonesDripStats["Total"] = clonesDripStats["Human"] + clonesDripStats["Robot"] + clonesDripStats["Angel"] + clonesDripStats["Demon"] + clonesDripStats["Reptile"] + clonesDripStats["Undead"] + clonesDripStats["Murakami"] + clonesDripStats["Alien"];
            database.ref("clonex/dripStats").set(clonesDripStats);
            const lastUpdate = new Date().toUTCString();
            database.ref("clonex/lastUpdated").set(lastUpdate);
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
