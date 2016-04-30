//---INIT

angular
    .module('cert', [])
    .controller('MainController', MainController)
    .directive('onReadFile', onReadFile)
    .service('asnBranches', asnBranches)
;

//---Main controller

function MainController(asnBranches) {
    var main = this;

    //Model - binary data
    main.items = JSON.parse(window.localStorage.getItem('cerf')) || {};

    //You can add any OID attribute and clarify the label
    main.currentParsedItem = {
        commonName:         {label: 'Common name'},
        countryName:        {label: 'Country name'},
        localityName:       {label: 'Locality name'},
        organizationName:   {label: 'Organization name'},
        serialNumber:       {label: 'Serial number'},
        dateStart:          {label: 'Date start'},
        dateEnd:            {label: 'Date end'},
    };

    main.showCurrentItem = false;

    //Method to show attributes of certificate
    main.show = function (key, e) {
        //Parse item
        var asn1       = ASN1.decode(main.items[key]),
            oidsValues = asnBranches.getOIDValues(asn1);
        //Reload model
        angular.forEach(main.currentParsedItem, function (value, key) {
            main.currentParsedItem[key]['value'] = (oidsValues[key] !== undefined) ? oidsValues[key] : null;
        });
        //Render logic
        main.showCurrentItem = true;
        var oldChecked = document
            .getElementById('certificate-list')
            .getElementsByClassName('disabled');
        if (oldChecked.length !== 0)
            oldChecked[0].classList.remove('disabled');
        e.target.classList.add("disabled");
    };

    main.uploadEnd = function($cert) {
        main.items[$cert.name] = $cert.result;
    };
}

//---DIRECTIVE

function onReadFile($parse, asnBranches) {
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
                    //Check type 
                    //TODO: test in all browsers
                    /*if (file.type !== 'application/x-x509-ca-cert') {
                        alert('Only .cer files! (application/x-x509-ca-cert)');
                        return false;
                    }*/
                    console.log('Type of file - ' + file.type);
                    //Use file reader
                    var reader = new FileReader();

                    reader.onload = (function (f) {
                        return function (e) {
                            var result     = e.target.result,
                                asn1       = ASN1.decode(result),
                                oidsValues = asnBranches.getOIDValues(asn1),
                                name       = prompt('Uploaded with success. Enter certificate name', oidsValues.commonName),
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

function asnBranches() {
    this.getOIDValues = function(asn) {
        var oidsValues = {};
        //---owner
        oidValues = getResults(oidsValues, asn.sub[0].sub[5].sub);
        //---cert
        oidValues = getResults(oidsValues, asn.sub[0].sub[3].sub, '_cert');
        //---time
        oidValues = getDate(oidsValues, asn.sub[0].sub[4].sub);

        return oidsValues;
    };

    var getResults = function(result, arr, postfix) {
        postfix = postfix || '';
        for (var i = 0, key; i < arr.length; i++) {
            key = (window.oids[arr[i].sub[0].sub[0].content()] !== undefined)
                ? window.oids[arr[i].sub[0].sub[0].content()]['d']
                : arr[i].sub[0].sub[0].content();

            result[key + postfix] = arr[i].sub[0].sub[1].content();
        }
        return result;
    };

    var getDate = function(result, arr) {
        result['dateStart'] = arr[0].content();
        result['dateEnd']   = arr[1].content();
        return result;
    };
}

window.onerror = function(message, url, lineNumber) {
    alert(message);
};
