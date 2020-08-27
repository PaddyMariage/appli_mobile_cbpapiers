# appli_mobile_cbpapiers
Application mobile de gestion de commandes

deploying on iOS device  : 

prequis : 
- on XCode, you need a provisioning profile, appleId Account

Steps : 
- in your project : npm update to install project dependencies
- Run a production build of your app : ionic cordova build ios --buildFlag='-UseModernBuildSystem=0' on Mac device
- Open the .xcodeproj file in platforms/ios/ in Xcode
- Connect your phone via USB and select it as the run target
- Click the play button in Xcode to try to run your app
