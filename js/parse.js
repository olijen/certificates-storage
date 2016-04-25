function cl(t) {
    console.log(t);
}
var target = document.getElementById("file-upload");

target.addEventListener("dragover", function (event) {
    event.preventDefault();
}, false);

target.addEventListener("drop", function (event) {
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
                var result = e.target.result,
                    asn1 = ASN1.decode(result),
                    oidsValues = getOIDValues(asn1);

                name = prompt('Upload with success. Enter certificate name', oidsValues.commonName);
                window.localStorage.setItem(name, result);
                //Angular-way =)
                var el = document.getElementById('main');
                var scope = angular.element(el).scope();
                scope.$apply(function () {
                    scope.items[name] = result;
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
}, false);

function getOIDValues(asn) {
    var oidsValues = [],
        lastOID = null;

    (function recursive(asn) {
        //cl(asn.typeName() + " >>> " + asn.content());

        if (lastOID !== null && asn.getValue() !== false) {
            oidsValues[lastOID] = asn.content();
        }
        if (asn.typeName() === 'OBJECT_IDENTIFIER') {
            if (window.oids[asn.content()] !== undefined) {
                //cl(111);
                lastOID = window.oids[asn.content()]['d'];
            }
            else
                lastOID = asn.content();
            if (oidsValues[lastOID] !== undefined)
                lastOID += '_cerf';
        }

        if (asn.sub === null) return;
        for (var i = 0; i < asn.sub.length; i++)
            recursive(asn.sub[i]);
    })(asn);
    return oidsValues;
}