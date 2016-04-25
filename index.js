angular.module('cert', [])
  .controller('MainController', function() {

    var main = this; 

    main.items = localStorage;

    main.currentParsedItem = {
      commonName: null,
      countryName: null,
      localityName: null,
      organizationName: null,
      serialNumber: null,
    };
 
    main.addCertificate = function() 
    {
      
    };

    main.show = function(key)
    {
      //Parse item
      var asn1 = ASN1.decode(main.items[key]);
      var oidsValues = getOIDValues(asn1);
      console.log(oidsValues);
      angular.forEach(main.currentParsedItem, function(value, key) {
        console.log(key);
        if (oidsValues[key] !== undefined)
          main.currentParsedItem[key] = oidsValues[key];
        else main.currentParsedItem[key] = null;
      });
    }

    main.dragOptions = {
      start: function(e) {
        event.preventDefault();
        console.log("STARTING");
      },
      drag: function(e) {
        event.preventDefault();
        console.log("DRAGGING");
      },
      stop: function(e) {
        event.preventDefault();
        console.log("STOPPING");
      },
      container: 'dd'
    }
  });
