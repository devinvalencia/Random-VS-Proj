(function executeRule(current, previous /*null when async*/ ) {

    function getEngagement() {
        // Find me all m2m tables that reference the current table where file is attached...
        var m2mDictRecord = new GlideRecord('sys_dictionary');
        m2mDictRecord.addEncodedQuery('nameLIKEm2m^reference.name=' + current.table_name + '^internal_type=reference');
        m2mDictRecord.query();

        // If any m2m reference to current table where file is attached are found...
        if (m2mDictRecord.next()) {

            // Then for each m2m table that references current table where file is attached...
            while (m2mDictRecord.next()) {

                // Look back at the dictionary and find that m2m's audit engagement reference...
                var m2mAuditRef = new GlideRecord('sys_dictionary');
                m2mAuditRef.addEncodedQuery('name=' + m2mDictRecord.name + '^internal_type=reference^reference.name=sn_audit_engagement');
                m2mAuditRef.query();

                // If audit engagement reference found for m2m table...
                if (m2mAuditRef.next()) {

                    // Then for each m2m record that references the current record where file is attached...
                    var m2mRecord = new GlideRecord(m2mDictRecord.name);
                    m2mRecord.addEncodedQuery(m2mDictRecord.element + '=' + current.table_sys_id);
                    m2mRecord.query();

                    // Find the specific m2m record's control field value...
                    if (m2mRecord.next()) {
                        var auditRef = m2mAuditRef.element;

                        // And pass into function to create control artifacts.
                        return m2mRecord.getValue(auditRef);
                    }
                }
            }

            var x = getManyToOne();

            if (!x) {
                return getParent();
            } else {
                return x;
            }

        } else if (!m2mDictRecord.next()) {
            // find me all references on current table within grc application scope...
            var parentRecordRef = new GlideRecord('sys_dictionary');
            parentRecordRef.addEncodedQuery('name=' + current.table_name + '^sys_scope.nameLIKEgrc^internal_type=reference^nameNOT LIKEm2m');
            parentRecordRef.query();

            // For each reference found...
            // See if that table that is referenced by the record where the current file is attached has a reference to audit engagement

            while (parentRecordRef.next()) {
                var parentRecordAuditRef = new GlideRecord('sys_dictionary');
                parentRecordAuditRef.addEncodedQuery('name=' + parentRecordRef.getValue('reference') + '^sys_scope.nameLIKEgrc^internal_type=reference^nameNOT LIKEm2m^reference=sn_audit_engagement');
                parentRecordAuditRef.query();

                // If a reference field on the current table references an audit engagement

                while (parentRecordAuditRef.next()) {

                    var auditRef = parentRecordAuditRef.element;
                    var childRecord = new GlideRecord(current.table_name);

                    if (childRecord.get(current.table_sys_id)) {

                        var parentRecord = new GlideRecord(parentRecordRef.getValue('reference'));
                        parentRecord.addEncodedQuery('sys_id=' + childRecord.getValue(parentRecordRef.element));
                        parentRecord.query();

                        if (parentRecord.next()) {
                            return (parentRecord.getValue(auditRef));
                        }
                    }
                }
            }
        } else {
            // WHERE no m2m is found (m:m) AND where no parent reference around found (1:m)
            // Check if direct reference to audit engagement exsist on current table
            var auditReference = new GlideRecord('sys_dictionary');
            auditReference.addEncodedQuery('name=' + current.table_name + '^internal_type=reference^reference.name=sn_audit_engagement');
            auditReference.query();

            // This is good because there should never be 2 reference fields pointing to the same table
            if (auditReference.next()) {
                var auditRef = auditReference.element;
                var currentRecord = new GlideRecord(current.table_name);
                currentRecord.addEncodedQuery('sys_id=' + current.table_sys_id + '^' + auditRef + '.sys_class_name=sn_audit_engagement');
                currentRecord.query();

                if (currentRecord.next()) {
                    return currentRecord.getValue(auditRef);
                }
            }

            // Check Dictionary overrides for reference on current record
            var auditDictionaryOverrideReference = new GlideRecord('sys_dictionary_override');
            auditDictionaryOverrideReference.addEncodedQuery('name=' + current.table_name + '^reference_qualLIKEsn_audit_engagement');
            auditDictionaryOverrideReference.query();

            if (auditDictionaryOverrideReference.next()) {
                var auditRef = auditDictionaryOverrideReference.element;
                var currentRecord = new GlideRecord(current.table_name);
                currentRecord.addEncodedQuery('sys_id=' + current.table_sys_id + '^' + auditRef + '.sys_class_name=sn_audit_engagement');
                currentRecord.query();

                if (currentRecord.next()) {
                    return currentRecord.getValue(auditRef);
                }
            }
        }
    }

    function getRecordDisplay(tableName, recordSysId) {

        var myRecordInfo = new GlideRecord(tableName);
        if (myRecordInfo.get(recordSysId)) {
            return myRecordInfo.getDisplayValue();
        }
    }

    function getTableDisplay(tableName, recordSysId) {
        var myRecordInfo = new GlideRecord(tableName);
        if (myRecordInfo.get(recordSysId)) {
            return myRecordInfo.getLabel();
        }
    }

    function getManyToOne() {
        // find me all references on current table within grc application scope...
        var parentRecordRef = new GlideRecord('sys_dictionary');
        parentRecordRef.addEncodedQuery('name=' + current.table_name + '^sys_scope.nameLIKEgrc^internal_type=reference^nameNOT LIKEm2m');
        parentRecordRef.query();

        // For each reference found...
        // See if that table that is referenced by the record where the current file is attached has a reference to audit engagement

        while (parentRecordRef.next()) {
            var parentRecordAuditRef = new GlideRecord('sys_dictionary');
            parentRecordAuditRef.addEncodedQuery('name=' + parentRecordRef.getValue('reference') + '^sys_scope.nameLIKEgrc^internal_type=reference^nameNOT LIKEm2m^reference=sn_audit_engagement');
            parentRecordAuditRef.query();

            // If a reference field on the current table references an audit engagement

            while (parentRecordAuditRef.next()) {

                var auditRef = parentRecordAuditRef.element;
                var childRecord = new GlideRecord(current.table_name);

                if (childRecord.get(current.table_sys_id)) {

                    var parentRecord = new GlideRecord(parentRecordRef.getValue('reference'));
                    parentRecord.addEncodedQuery('sys_id=' + childRecord.getValue(parentRecordRef.element));
                    parentRecord.query();

                    if (parentRecord.next()) {
                        return (parentRecord.getValue(auditRef));
                    }
                }
            }
        }
    }

    function getParent() {
        // WHERE no m2m is found (m:m) AND where no parent reference around found (1:m)
        // Check if direct reference to audit engagement exsist on current table
        var auditReference = new GlideRecord('sys_dictionary');
        auditReference.addEncodedQuery('name=' + current.table_name + '^internal_type=reference^reference.name=sn_audit_engagement');
        auditReference.query();

        // This is good because there should never be 2 reference fields pointing to the same table
        if (auditReference.next()) {
            var auditRef = auditReference.element;
            var currentRecord = new GlideRecord(current.table_name);
            currentRecord.addEncodedQuery('sys_id=' + current.table_sys_id + '^' + auditRef + '.sys_class_name=sn_audit_engagement');
            currentRecord.query();

            if (currentRecord.next()) {
                return currentRecord.getValue(auditRef);
            }
        }

        // Check Dictionary overrides for reference on current record
        var auditDictionaryOverrideReference = new GlideRecord('sys_dictionary_override');
        auditDictionaryOverrideReference.addEncodedQuery('name=' + current.table_name + '^reference_qualLIKEsn_audit_engagement');
        auditDictionaryOverrideReference.query();

        if (auditDictionaryOverrideReference.next()) {
            var auditRef = auditDictionaryOverrideReference.element;
            var currentRecord = new GlideRecord(current.table_name);
            currentRecord.addEncodedQuery('sys_id=' + current.table_sys_id + '^' + auditRef + '.sys_class_name=sn_audit_engagement');
            currentRecord.query();

            if (currentRecord.next()) {
                return currentRecord.getValue(auditRef);
            }
        }
    }

    function deleteAuditArtifact(auditRecId) {
        var controlArtifactRec = new GlideRecord('sn_audit_audit_artifact');
        controlArtifactRec.addQuery('u_engagement', auditRecId);
        controlArtifactRec.addQuery('u_table_name', current.table_name);
        controlArtifactRec.addQuery('u_file', current.getUniqueValue());
        controlArtifactRec.addQuery('u_table_sys_id', current.table_sys_id);
        controlArtifactRec.query();

        if (controlArtifactRec.next()) {
            controlArtifactRec.deleteRecord();
        }
    }

    deleteAuditArtifact(getEngagement());

})(current, previous);