function getTimeNow() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MNLTH")
    let lastUpdated = (sheet.getRange(3,6).getValue()).slice(18);
    var sheetArray = [SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MNLTH"), SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MNLTHDARK")];
    sheetArray.forEach( sheet => sheet.getRange(3,8).setValue((((new Date().getTime()) - new Date(lastUpdated).getTime())/1000/60).toFixed() + " min ago"));  
  }
  
  function getSkinVialStats() {
      var data = JSON.parse(UrlFetchApp.fetch('https://us-central1-nlytx-2a93b.cloudfunctions.net/nlytx/getSkinVialStats', {'method' : 'get'}).getContentText());
      console.log(data.priceStats);
      return data;
  }
  
  function updateSheet() {
    //TEMP - TO PASS IN FROM GETCLONEXSTATS
    var skinStats = getSkinVialStats();
  
    var mnlthFloor = JSON.parse(UrlFetchApp.fetch('https://api.opensea.io/api/v1/collection/rtfkt-mnlth/stats', {'method' : 'get'}).getContentText()).stats.floor_price;
    var mnlth2Floor = JSON.parse(UrlFetchApp.fetch('https://api.opensea.io/api/v1/collection/rtfktmonolith/stats', {'method' : 'get'}).getContentText()).stats.floor_price;
    var cryptokicksFloor = JSON.parse(UrlFetchApp.fetch('https://api.opensea.io/api/v1/collection/rtfkt-nike-cryptokicks/stats', {'method' : 'get'}).getContentText()).stats.floor_price;
  
    // Skin Vial Overall Prices
    const humanFloorPrice = skinStats.priceStats.Human.floor.price;
    const robotFloorPrice = skinStats.priceStats.Robot.floor.price;
    const angelFloorPrice = skinStats.priceStats.Angel.floor.price;
    const demonFloorPrice = skinStats.priceStats.Demon.floor.price;
    const reptileFloorPrice = skinStats.priceStats.Reptile.floor.price;
    const undeadFloorPrice = skinStats.priceStats.Undead.floor.price;
    const murakamiFloorPrice = skinStats.priceStats.Murakami.floor.price;
    const alienFloorPrice = skinStats.priceStats.Alien.floor.price;
  
    var sheetArray = [SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MNLTH"), SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MNLTHDARK")];
  
    sheetArray.forEach( sheet => {
  
      // MNLTH Collection Stats
      sheet.getRange(3,3).setValue(humanFloorPrice);
      sheet.getRange(3,5).setValue(mnlthFloor);
      sheet.getRange(4,3).setValue(cryptokicksFloor);
      sheet.getRange(4,5).setValue(mnlth2Floor);
      sheet.getRange(3,6).setValue("Last Updated On : " + skinStats.lastUpdated);
  
      // Skin Vial Overall Stats
      sheet.getRange(8,5).setValue(skinStats.dnaStats.Human);
      sheet.getRange(9,5).setValue(skinStats.dnaStats.Robot);
      sheet.getRange(10,5).setValue(skinStats.dnaStats.Angel);
      sheet.getRange(11,5).setValue(skinStats.dnaStats.Demon);
      sheet.getRange(12,5).setValue(skinStats.dnaStats.Reptile);
      sheet.getRange(13,5).setValue(skinStats.dnaStats.Undead);
      sheet.getRange(14,5).setValue(skinStats.dnaStats.Murakami);
      sheet.getRange(15,5).setValue(skinStats.dnaStats.Alien);
      sheet.getRange(17,5).setValue(skinStats.dnaStats.Total);
  
      // Get Probability
      const humanChance = sheet.getRange(8,7).getValue();
      const robotChance = sheet.getRange(9,7).getValue();
      const angelChance = sheet.getRange(10,7).getValue();
      const demonChance = sheet.getRange(11,7).getValue();
      const reptileChance = sheet.getRange(12,7).getValue();
      const undeadChance = sheet.getRange(13,7).getValue();
      const murakamiChance = sheet.getRange(14,7).getValue();
      const alienChance = sheet.getRange(15,7).getValue();
      const ev = (humanChance*humanFloorPrice)
              + (robotChance*robotFloorPrice)
              + (angelChance*angelFloorPrice)
              + (demonChance*demonFloorPrice)
              + (reptileChance*reptileFloorPrice)
              + (undeadChance*undeadFloorPrice)
              + (murakamiChance*murakamiFloorPrice)
              + (alienChance*alienFloorPrice)
              + mnlth2Floor + cryptokicksFloor
  
      // Skin Vial Overall Prices
      sheet.getRange(8,8).setValue(humanFloorPrice + " ETH");
      sheet.getRange(9,8).setValue(robotFloorPrice + " ETH");
      sheet.getRange(10,8).setValue(angelFloorPrice + " ETH");
      sheet.getRange(11,8).setValue(demonFloorPrice + " ETH");
      sheet.getRange(12,8).setValue(reptileFloorPrice + " ETH");
      sheet.getRange(13,8).setValue(undeadFloorPrice + " ETH");
      sheet.getRange(14,8).setValue(murakamiFloorPrice + " ETH");
      sheet.getRange(15,8).setValue(alienFloorPrice + " ETH");
  
  
      // EV
      sheet.getRange(32,8).setValue(ev);
      sheet.getRange(33,8).setValue(ev*.875);
      if(ev*.875 > (humanFloorPrice + cryptokicksFloor + mnlth2Floor)) sheet.getRange(34,6).setValue("Nett EV higher than MNLTH Floor Price (After royalty fees)!");
      else if (ev*.875 < (humanFloorPrice + cryptokicksFloor + mnlth2Floor) && ev > (humanFloorPrice + cryptokicksFloor + mnlth2Floor)) sheet.getRange(34,6).setValue("Gross EV is higher than MNLTH Floor price! (Before minusing royalty fees)");
      else sheet.getRange(34,6).setValue("EV is lower than MNLTH Floor price :(");
    })
  
  }
  
  
  function hourlySkinVialUpdate() {
    var response = UrlFetchApp.fetch('https://us-central1-nlytx-2a93b.cloudfunctions.net/nlytx/updateSkinVialStats', {'method' : 'post', 'muteHttpExceptions': true});
    console.log(response.getResponseCode());
  }
  
  // function callFirebase() {
  //   console.log('calling firebase');
  //   var response = UrlFetchApp.fetch('https://us-central1-nlytx-2a93b.cloudfunctions.net/callClonesStats');
  
    
    // const options = {
    // method: 'GET',
    // };
    //     saleurl = 'https://api.opensea.io/api/v1/asset/0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B/' + i + '/listings?limit=20';
    //   var response = UrlFetchApp.fetch(
    //     saleurl,
    //     {
    //       "headers":{
    //         "TRN-Api-Key":apiKey
    //       }
    //     }
    //   );
  
  // }
  
  // function myFunction() {
  //   const eth = 1000000000000000000;
  //   var ss = SpreadsheetApp.getActiveSpreadsheet();
  //   var mainSheet = ss.getSheetByName("MAIN");
  
  //   mainSheet.getRange('A1:A3').clear();
  
  //   // var URL_STRING = "https://api.jokes.one/jod";
  
  //   // var response = UrlFetchApp.fetch(URL_STRING);
  //   // var json = response.getContentText();
  //   // var data = JSON.parse(json);
  
  //   // var joke = data.contents.jokes[0].joke.text;
  //   // var copyright = data.contents.copyright;
  
  //   // mainSheet.getRange(1,1).setValue([joke]);
  //   // mainSheet.getRange(3,1).setValue([copyright]);
  
  //   var apiKey = '4a25c51ad3d54dcd927d2663ac266366';
  
  //   const options = {
  //   method: 'GET',
  //   headers: {Accept: 'application/json', 'X-API-KEY': '4a25c51ad3d54dcd927d2663ac266366'}
  //   };
    
  //   cell = 2;
  //   counter = 0;
  //   for(var i=1;i<200001;i++){
  //     wait(1.5);
  //     saleurl = 'https://api.opensea.io/api/v1/asset/0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B/' + i + '/listings?limit=20';
  //     var response = UrlFetchApp.fetch(
  //       saleurl,
  //       {
  //         "headers":{
  //           "TRN-Api-Key":apiKey
  //         }
  //       }
  //     );
  //     parsedData = JSON.parse(response.getContentText()).listings[0];
  //     if(!parsedData){
  //       Logger.log("passed");
  //       continue
  //     }
  //     metadataurl = 'https://api.opensea.io/api/v1/asset/0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b/' + i + '/?include_orders=false';
  //     var response2 = UrlFetchApp.fetch(
  //       metadataurl,
  //       {
  //         "headers":{
  //           "TRN-Api-Key":apiKey
  //         }
  //       }
  //     )
  //     parsedMetadata = JSON.parse(response2.getContentText());
  //     dna = parsedMetadata.traits[0].value;
  //     link = "https://opensea.io/assets/ethereum/0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b/" + i;
  
  //     price = parsedData.current_price/eth;
  //     Logger.log(i + " : " + price);
  //     mainSheet.getRange(cell, 2).setValue([i]);
  //     mainSheet.getRange(cell, 3).setValue([dna]);
  //     mainSheet.getRange(cell, 4).setValue([price]);
  //     mainSheet.getRange(cell, 5).setValue([link]);
  //     cell++;
  //     counter++;
  //     Logger.log(counter);
  //     if(counter >= 4){
  //       counter = 0
  //       wait(1);
  //     }
  //   }
  //   // url = 'https://api.opensea.io/api/v1/asset/0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B/17969/listings?limit=20';
  //   // var response = UrlFetchApp.fetch(
  //   //     url,
  //   //     {
  //   //         "headers":{
  //   //             "TRN-Api-Key":apiKey
  //   //         }
  //   //     }
  //   // );
  //   // price = JSON.parse(response.getContentText()).listings[0].current_price/eth;
  //   // Logger.log(price);
  //   // mainSheet.getRange(2,2).setValue([price]);
  
  //   // UrlFetchApp.fetch('https://api.opensea.io/api/v1/asset/0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B/17969/listings?limit=20', options)
  //   // .then(response => response.json())
  //   // .then(response => {
  //   //   console.log(response);
  //   //   mainSheet.getRange(2,2).setValue(res);
  //   //   })
  //   // .catch(err => console.error(err));
  
  // }
  
  // function wait (sec)
  // {
  //   SpreadsheetApp.flush();
  //   Utilities.sleep(sec*1000);
  //   SpreadsheetApp.flush();
  // }
  
  