function getOIDValues(asn) {
    var oidsValues = [],
        lastOID = null;

    (function recursive(asn) {
        //console.log(asn.typeName() + " >>> " + asn.content());
        if ((asn.tag.tagNumber === 0x17 || asn.tag.tagNumber === 0x18))
            if (oidsValues['dateStart'] !== undefined) oidsValues['dateEnd'] = asn.content();
            else oidsValues['dateStart'] = asn.content();
        else if (lastOID !== null && asn.getValue() !== false)
            oidsValues[lastOID] = asn.content();
        else if (asn.typeName() === 'OBJECT_IDENTIFIER') {
            lastOID = (window.oids[asn.content()] !== undefined) ? window.oids[asn.content()]['d'] : asn.content();
            if (oidsValues[lastOID] !== undefined) lastOID += '_cerf';
        }
        if (asn.sub === null) return;
        for (var i = 0; i < asn.sub.length; i++)
            recursive(asn.sub[i]);
    })(asn);
    return oidsValues;
}