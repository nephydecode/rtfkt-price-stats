function getTimeNow() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CLONEX")
    let lastUpdated = (sheet.getRange(3,6).getValue()).slice(18);
    var sheetArray = [SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CLONEX"), SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CLONEXDARK")];
    sheetArray.forEach( sheet => sheet.getRange(3,8).setValue((((new Date().getTime()) - new Date(lastUpdated).getTime())/1000/60).toFixed() + " min ago"));  
  }
  
  function getClonexStats() {
      var data = JSON.parse(UrlFetchApp.fetch('https://us-central1-nlytx-2a93b.cloudfunctions.net/nlytx/getClonexStats', {'method' : 'get'}).getContentText());
      console.log(data.priceStats);
      return data;
  }
  
  // var clonexStats = { dnaStats: { alien: 30, angel: 1689, demon: 1690, human: 9653, murakami: 96, reptile: 242, robot: 5788, total: 19302, undead: 114 },
  //                     dripStats: { Alien: 4, Angel: 252, Demon: 258, Human: 1467, Murakami: 96, Reptile: 37, Robot: 842, Total: 2974, Undead: 18 },
  //                     lastUpdated: 'Tue, 07 Jun 2022 21:04:35 GMT', lastUpdatedSGT: 'Tue Jun 07 2022 21:04:35 GMT+0000 (Coordinated Universal Time)', 
  //                     priceStats: { Alien: { drip: { price: 800, tokenId: '16294' }, floor: { price: 140, tokenId: '11073' } },
  //                                   Angel: { drip: { price: 22.9, tokenId: '18859' }, floor: { price: 15.5, tokenId: '11036' } },
  //                                   Demon: { drip: { price: 18.88, tokenId: '12363' }, floor: { price: 14, tokenId: '17121' } },
  //                                   Human: { drip: { price: 17.5, tokenId: '11091' }, floor: { price: 11.39, tokenId: '13755' } },
  //                                   Murakami: { drip: { price: 130, tokenId: '16318' }, floor: { price: 130, tokenId: '16318' } },
  //                                   Reptile: { drip: { price: 78.88, tokenId: '8071' }, floor: { price: 26.95, tokenId: '7516' } },
  //                                   Robot:  { drip: { price: 17.5, tokenId: '3898' }, floor: { price: 11.45, tokenId: '17853' } },
  //                                   Undead: { drip: { price: 77, tokenId: '7907' }, floor: { price: 45, tokenId: '7177' } } } }
  
  function updateSheet() {
    //TEMP - TO PASS IN FROM GETCLONEXSTATS
    var clonexStats = getClonexStats();
  
    // console.log(clonexStats);
    var mintVialFloorPrice = JSON.parse(UrlFetchApp.fetch('https://api.opensea.io/api/v1/collection/clonex-mintvial/stats', {'method' : 'get'}).getContentText()).stats.floor_price;
    var clonexData = JSON.parse(UrlFetchApp.fetch('https://api.opensea.io/api/v1/collection/clonex/stats', {'method' : 'get'}).getContentText())
  
    var dripFloorPrice = clonexStats.priceStats.Human.drip.price < clonexStats.priceStats.Robot.drip.price ? clonexStats.priceStats.Human.drip.price : clonexStats.priceStats.Robot.drip.price;
  
    // CloneX Overall Prices
    const humanFloorPrice = clonexStats.priceStats.Human.floor.price;
    const robotFloorPrice = clonexStats.priceStats.Robot.floor.price;
    const angelFloorPrice = clonexStats.priceStats.Angel.floor.price;
    const demonFloorPrice = clonexStats.priceStats.Demon.floor.price;
    const reptileFloorPrice = clonexStats.priceStats.Reptile.floor.price;
    const undeadFloorPrice = clonexStats.priceStats.Undead.floor.price;
    const murakamiFloorPrice = clonexStats.priceStats.Murakami.floor.price;
    const alienFloorPrice = clonexStats.priceStats.Alien.floor.price;
    const humanDripPrice = clonexStats.priceStats.Human.drip.price;
    const robotDripPrice = clonexStats.priceStats.Robot.drip.price;
    const angelDripPrice = clonexStats.priceStats.Angel.drip.price;
    const demonDripPrice = clonexStats.priceStats.Demon.drip.price;
    const reptileDripPrice = clonexStats.priceStats.Reptile.drip.price;
    const undeadDripPrice = clonexStats.priceStats.Undead.drip.price;
    const murakamDripPrice = clonexStats.priceStats.Murakami.drip.price;
    const alienDripPrice = clonexStats.priceStats.Alien.drip.price;
  
    var sheetArray = [SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CLONEX"), SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CLONEXDARK")];
  
    sheetArray.forEach( sheet => {
  
      // CloneX Collection Stats
      sheet.getRange(3,3).setValue(clonexData.stats.floor_price);
      sheet.getRange(3,5).setValue(mintVialFloorPrice);
      sheet.getRange(4,5).setValue(clonexData.stats.num_owners);
      sheet.getRange(3,6).setValue("Last Updated On : " + clonexStats.lastUpdated);
  
      // CloneX Overall Stats
      sheet.getRange(4,3).setValue(dripFloorPrice);
      sheet.getRange(8,5).setValue(clonexStats.dnaStats.human);
      sheet.getRange(9,5).setValue(clonexStats.dnaStats.robot);
      sheet.getRange(10,5).setValue(clonexStats.dnaStats.angel);
      sheet.getRange(11,5).setValue(clonexStats.dnaStats.demon);
      sheet.getRange(12,5).setValue(clonexStats.dnaStats.reptile);
      sheet.getRange(13,5).setValue(clonexStats.dnaStats.undead);
      sheet.getRange(14,5).setValue(clonexStats.dnaStats.murakami);
      sheet.getRange(15,5).setValue(clonexStats.dnaStats.alien);
      sheet.getRange(17,5).setValue(clonexStats.dnaStats.total);
  
      // Murakami Drip Stats
      sheet.getRange(21,5).setValue(clonexStats.dripStats.Human);
      sheet.getRange(22,5).setValue(clonexStats.dripStats.Robot);
      sheet.getRange(23,5).setValue(clonexStats.dripStats.Angel);
      sheet.getRange(24,5).setValue(clonexStats.dripStats.Demon);
      sheet.getRange(25,5).setValue(clonexStats.dripStats.Reptile);
      sheet.getRange(26,5).setValue(clonexStats.dripStats.Undead);
      sheet.getRange(27,5).setValue(clonexStats.dripStats.Murakami);
      sheet.getRange(28,5).setValue(clonexStats.dripStats.Alien);
      sheet.getRange(30,5).setValue(clonexStats.dripStats.Total);
  
      // Get Probability
      const humanChance = sheet.getRange(8,7).getValue();
      const robotChance = sheet.getRange(9,7).getValue();
      const angelChance = sheet.getRange(10,7).getValue();
      const demonChance = sheet.getRange(11,7).getValue();
      const reptileChance = sheet.getRange(12,7).getValue();
      const undeadChance = sheet.getRange(13,7).getValue();
      const murakamiChance = sheet.getRange(14,7).getValue();
      const alienChance = sheet.getRange(15,7).getValue();
      const humanDripChance = sheet.getRange(21,7).getValue();
      const robotDripChance = sheet.getRange(22,7).getValue();
      const angelDripChance = sheet.getRange(23,7).getValue();
      const demonDripChance = sheet.getRange(24,7).getValue();
      const reptileDripChance = sheet.getRange(25,7).getValue();
      const undeadDripChance = sheet.getRange(26,7).getValue();
      const murakamiDripChance = sheet.getRange(27,7).getValue();
      const alienDripChance = sheet.getRange(28,7).getValue();
      const ev = (humanChance-humanDripChance)*humanFloorPrice + (humanDripChance*humanDripPrice)
              + (robotChance-robotDripChance)*robotFloorPrice + (robotDripChance*robotDripPrice)
              + (angelChance-angelDripChance)*angelFloorPrice + (angelDripChance*angelDripPrice)
              + (demonChance-demonDripChance)*demonFloorPrice + (demonDripChance*demonDripPrice)
              + (reptileChance-reptileDripChance)*reptileFloorPrice + (reptileDripChance*reptileDripPrice)
              + (undeadChance-undeadDripChance)*undeadFloorPrice + (undeadDripChance*undeadDripPrice)
              + murakamiChance*murakamiFloorPrice
              + (alienChance-alienDripChance)*alienFloorPrice + (alienDripChance*alienDripPrice)
  
      // CloneX Overall Prices
      sheet.getRange(8,8).setValue(humanFloorPrice + " ETH");
      sheet.getRange(9,8).setValue(robotFloorPrice + " ETH");
      sheet.getRange(10,8).setValue(angelFloorPrice + " ETH");
      sheet.getRange(11,8).setValue(demonFloorPrice + " ETH");
      sheet.getRange(12,8).setValue(reptileFloorPrice + " ETH");
      sheet.getRange(13,8).setValue(undeadFloorPrice + " ETH");
      sheet.getRange(14,8).setValue(murakamiFloorPrice + " ETH");
      sheet.getRange(15,8).setValue(alienFloorPrice + " ETH");
  
      // Murakami Drip Prices
      sheet.getRange(21,8).setValue(humanDripPrice + " ETH");
      sheet.getRange(22,8).setValue(robotDripPrice + " ETH");
      sheet.getRange(23,8).setValue(angelDripPrice + " ETH");
      sheet.getRange(24,8).setValue(demonDripPrice + " ETH");
      sheet.getRange(25,8).setValue(reptileDripPrice + " ETH");
      sheet.getRange(26,8).setValue(undeadDripPrice + " ETH");
      sheet.getRange(27,8).setValue(murakamiFloorPrice + " ETH");
      sheet.getRange(28,8).setValue(alienDripPrice + " ETH");
  
      // EV
      sheet.getRange(32,8).setValue(ev);
      sheet.getRange(33,8).setValue(ev*.925);
      if(ev*.925 > clonexData.stats.floor_price) sheet.getRange(34,6).setValue("Nett EV higher than CloneX Floor Price (After royalty fees)!");
      else if (ev*.925 < clonexData.stats.floor_price && ev > clonexData.stats.floor_price) sheet.getRange(34,6).setValue("Gross EV is higher than CloneX Floor price! (Before minusing royalty fees)");
      else sheet.getRange(34,6).setValue("EV is lower than CloneX Floor price :(");
    })
  
  }
  
  
  function hourlyClonexUpdate() {
    var response = UrlFetchApp.fetch('https://us-central1-nlytx-2a93b.cloudfunctions.net/nlytx/updateClonexStats', {'method' : 'post', 'muteHttpExceptions': true});
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
  
  