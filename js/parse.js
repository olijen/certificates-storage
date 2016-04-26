function cl(t) {
    console.log(t);
}

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