//Add storage access
import { FavoriteProvider } from './../../providers/favorite/favorite';

import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
// Add popups
import { ToastController } from 'ionic-angular';

// Add BarcodeScanner
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

//Post
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { Observable } from 'rxjs/Observable';

const apiUrl = 'https://cc-tagscanner-functionapp20181003103414.azurewebsites.net/api/InsertBatchScans?code=Qnp0QwUQjb927rtYQ7DN23b7ArSjYIHKCg5rwUyi5bt8xEIdcptmJg==';
const apiUrlSingle = "https://cc-tagscanner-functionapp20181003103414.azurewebsites.net/api/UpdateSingleItem?code=Focr4Hc1Z3yWcfU7J/7IUQl5ktomNFFQgQqt2HIzJAiNjTJSs8P5Fw==";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

    // store the scanned result
    public num: string;
    public location: string;
    public user: string;
    public count:string ;
    public scannedItems: Array<string> = new Array<string>();
    public phoneId:string;
    //public apiUrl = 'https://cc-tagscanner-functionapp20181003103414.azurewebsites.net/api/InsertBatchScans?code=Qnp0QwUQjb927rtYQ7DN23b7ArSjYIHKCg5rwUyi5bt8xEIdcptmJg==';

    //options for scanner
    public options:{};
    public logs: string;
    
    
    public Users : Array<string> = ["Will not Smith", "Princess Buttercup", "Kath Leans Left", "Canu Hear Mike now" ];

    //Contraol back button
    public unregisterBackButtonAction: any;

  // DI barcodeScanner
  constructor(
    public navCtrl: NavController, 
    public barcodeScanner: BarcodeScanner, 
    private toaster : ToastController,
    public platform : Platform,
    public navController : NavController,
    public navParams : NavParams,
    public http : HttpClient,
    public favoriteProvider : FavoriteProvider){
      this.options ={};
      
    }


  ionViewDidLoad() {
    if(!this.logs){
      this.logs = "";
    }
    this.logs += '\nionViewDidLoad()\n';          
    this.initializeBackButtonCustomHandler();
    try{
      this.logs += '\n'+this.user+ '\n';  
      if(this.user == null || this.user == ""){
        this.favoriteProvider.getUser().then(
          name => {
            this.user = name;
          }
        )
        this.logs += '\nAfter: '+this.user+ '\n';  
      }
      if(this.scannedItems.length == 0){
        this.favoriteProvider.getAllScans().then(
          value => {
        //    this.logs += 'value from new fav: ' + JSON.stringify(value)+'\n';          
       //     this.logs += 'value count: ' +value.length +'\n';
            value.forEach(element => {
       //       this.logs += "\n SI.length = : "+ this.scannedItems.length + "\n";
       //       this.logs += "\n Element: "+ JSON.stringify(element)+"\n";
              this.scannedItems.push(JSON.stringify(element));
       //     this.logs += "\n SI.length after = : "+ this.scannedItems.length + "\n";
            });
              
        });          
      }
      else{
   //     this.logs += 'this.scannedItems found in ionViewDidLoad():  ' + JSON.stringify(this.scannedItems);
      }
    }
    catch(err){
      this.logs += "Error in ionViewDidLoad(): " + err + "\n";
    }
     this.count = 'Scanned: ' +this.scannedItems.length.toString();
}


ionViewWillLeave() {
    // Unregister the custom back button action for this page
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
}

initializeBackButtonCustomHandler(): void {
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(function(event){
        console.log('Prevent Back Button Page Change');
        try{
          this.barcodeScanner.pop();
        }
        catch(err){
          console.log(err);
        }
    }, 101); // Priority 101 will override back button handling (we set in app.component.ts) as it is bigger then priority 100 configured in app.component.ts file */
}  
  // new scan method
  scan() {
    if(this.user == null || this.user  == ""){
      alert("Select a user first");
      return false;
    }
    this.options = {
      prompt : "Scan the Barcode, back to cancel.",
      preferFrontCamera : false, // iOS and Android
      showFlipCameraButton : false, // iOS and Android
      showTorchButton : true, // iOS and Android
      orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
    }

    //Comment Section A105"
 //   this.logs += "Scan start items:\n"+ JSON.stringify(this.scannedItems)+":::::::\n";

    //Get result of scan
        this.barcodeScanner.scan(this.options).then(data => {
          if(!data.cancelled){  // NOT CANCELLED
            
            // this is called when a barcode is found
            this.num = data.text;
            var thisItem = '{"TagNo":"'+this.num+'", "Location":"'+this.location+'","EditBy":"'+this.user+'","Status":"2"}';
        //    this.logs += '\n'+thisItem+'\n';
       
            this.favoriteProvider.insertScan(JSON.parse(thisItem))
            this.scannedItems.push(JSON.parse(thisItem));
            if(this.scannedItems.length == 0){
              this.scannedItems.push(JSON.parse(thisItem));
              this.favoriteProvider.insertScan(JSON.parse(thisItem))
            }
            
            this.SendSingleData(JSON.parse(thisItem));

            this.cookToast('Scan Completed for tag: '+ this.num);
            this.count = 'Scanned: ' +this.scannedItems.length;
            this.scan();
        }
        
        this.count = 'Scanned: ' +this.scannedItems.length;
    });
    
  }

  //End Scan Method
  endscan() {
   
    try{



    this.logs += "\n\nScanned Items list before Sending: " + JSON.stringify(this.scannedItems) +":::::::\n";

    if(JSON.stringify(this.scannedItems) == '[]' || !this.scannedItems){
      var tester = '{"TagNo":"XDDX74999","Location":"AAAICS","Status":"2","EditBy":"JOJO"}';
      this.favoriteProvider.insertScan(JSON.parse(tester));
      
      this.favoriteProvider.getAllScans().then(
        value => {
          this.logs += 'value from new fav: ' + JSON.stringify(value)+'\n';          
          this.scannedItems = value;
        }
      )

//      this.logs += "\n\ntester: " + tester +":::::::\n";
  //    var test2 = JSON.parse(tester);
   //   this.scannedItems = test2;
      this.logs += "\n\nScanned Items after manual change: " + JSON.stringify(this.scannedItems) +":::::::\n";  
    }
   //   this.SendData(this.scannedItems);
      this.cookToast('Scanning Completed, Sending List');
    }
    catch(err){
      console.log(err);
      this.logs +='Error: ' + err +" ::::::\n";
      this.burnToast('Error: ' + err);
    }
    return this;
  };      
  





  //Clear the memory
  clearscan() {
    if(confirm("Are you sure")){
      try{
        this.favoriteProvider.clearMemory().then(
          value => {
            if(!this.scannedItems){
              this.scannedItems.length = 0;
            }
            else{
              this.scannedItems = [];
            }
            this.logs ='Cleared\n';
            this.logs =this.scannedItems+"\n";
          }
        )
      }
      catch(err){ //ERROR Section 123
            this.logs +='Error section 123: ' + err;
      }

      this.cookToast('Scanning Cleared');
      this.count = 'Scanned: ' +this.scannedItems.length;
   
    };
    return this;
  }      


  onChangeUser(){
    this.logs += '\nSelect changed\n';  
    this.logs += '\nSelected: '+this.user+ '\n';  
    this.favoriteProvider.insertUser(this.user);
  }


  cookToast(code){
    let toast = this.toaster.create({
    message  : code,
      duration: 1500,
      position: 'top'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  burnToast(code){
    let toast = this.toaster.create({
      message: code,
      duration: 7500,
      position: 'top'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }


 SendData(data){
   this.logs +='sending data::::::\n';
   //this.cookToast('data: ' + JSON.stringify(data));
   //this.logs +='data: ' + data + '::::::';
  return new Promise((resolve, reject) => {
    this.logs +='\npost result: '+ JSON.stringify(data);

    this.http.post(apiUrl, JSON.stringify(data),{
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
      .subscribe(res => {
        resolve(res);
        this.logs +='\npost result: '+ JSON.stringify(res);
      }, (err) => {
        reject(err);
//        this.burnToast('Error: ' + JSON.stringify(err));
        this.logs +='\nError: ' + JSON.stringify(err);
      });
  });
 }


 
 SendSingleData(data){
 // this.logs +='sending data::::::\n';
 return new Promise((resolve, reject) => {
 //  this.logs +='\npost result: '+ JSON.stringify(data);

   this.http.post(apiUrlSingle, JSON.stringify(data),{
     headers: new HttpHeaders().set('Content-Type', 'application/json')
   })
     .subscribe(res => {
       resolve(res);
       this.logs +='\nUploaded: '+ JSON.stringify(res);
     }, (err) => {
       reject(err);
//        this.burnToast('Error: ' + JSON.stringify(err));
       this.logs +='\nError: ' + JSON.stringify(err);
     });
 });
}






}
