//Main controller
function MainController() {
    var main = this;

    main.items = JSON.parse(window.localStorage.getItem('cerf')) || {};

    main.currentParsedItem = {
        commonName:         null,
        countryName:        null,
        localityName:       null,
        organizationName:   null,
        serialNumber:       null,
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
    };

    main.uploadEnd = function($cert) {
        main.items[$cert.name] = $cert.result;
    };
}

//---DIRECTIVE

function onReadFile($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);

            element.on('drop', function(event) {
                event.preventDefault();
                var i = 0,
                    files = event.dataTransfer.files,
                    len = files.length;

                for (; i < len; i++) {
                    var file = files[i];

                    /*cl("Filename: " + file.name); cl("Type: " + file.type);  cl("Size: " + file.size + " bytes");*/

                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                        return function (e) {
                            var result     = e.target.result,
                                asn1       = ASN1.decode(result),
                                oidsValues = getOIDValues(asn1),
                                name       = prompt('Upload with success. Enter certificate name', oidsValues.commonName),
                                cerf       = JSON.parse(window.localStorage.getItem('cerf')) || {};
                            cerf[name] = result;
                            window.localStorage.setItem('cerf',
                                JSON.stringify(cerf)
                            );
                            scope.$apply(function() {
                                fn(scope, {$cert: {name:name, result:result} });
                            });
                            //TODO:
                            //var view  = new Uint8Array(result);
                            //console.log(view);
                        };
                    })(file);

                    reader.onerror = function (event) {
                        console.error("Cant read file! code: " + event.target.error.code);
                    };
                    //TODO:
                    //reader.readAsArrayBuffer(file);
                    reader.readAsBinaryString(file);
                }
            });

            element.on('dragover', function(event) {
                event.preventDefault();
            });
        }
    };
}

//---INIT

angular
    .module('cert', [])
    .controller('MainController', MainController)
    .directive('onReadFile', onReadFile)
;
