//Main controller
function MainController() {
    var main = this;

    main.items = localStorage;

    main.currentParsedItem = {
        commonName: null,
        countryName: null,
        localityName: null,
        organizationName: null,
        serialNumber: null,
    };

    main.addCertificate = function () {

    };

    main.show = function (key) {
        //Parse item
        var asn1 = ASN1.decode(main.items[key]),
            oidsValues = getOIDValues(asn1);
        //Reload model
        angular.forEach(main.currentParsedItem, function (value, key) {
            if (oidsValues[key] !== undefined)
                main.currentParsedItem[key] = oidsValues[key];
            else main.currentParsedItem[key] = null;
        });
    }
}

//---INIT

angular
    .module('cert', [])
    .controller('MainController', MainController);
