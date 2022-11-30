(function executeRule(current, previous /*null when async*/ ) {

    function getControl() {
        // Find me all m2m tables that reference the current table where file is attached...
        var m2mDictRecord = new GlideRecord('sys_dictionary');
        m2mDictRecord.addEncodedQuery('nameLIKEm2m^reference.name=' + current.table_name);
        m2mDictRecord.query();

        // If any m2m reference to current table where file is attached are found...
        if (m2mDictRecord.next()) {

            // Then for each m2m table that references current table where file is attached...
            while (m2mDictRecord.next()) {

                // Look back at the dictionay and find that m2m's control reference...
                var m2mControlRef = new GlideRecord('sys_dictionary');
                m2mControlRef.addEncodedQuery('name=' + m2mDictRecord.name + '^internal_type=reference^reference.name=sn_grc_item^ORreference.name=sn_compliance_control');
                m2mControlRef.query();

                // If control reference found for m2m table...
                if (m2mControlRef.next()) {

                    // Then for each m2m record that ref's the current record where file is attached...
                    var m2mRecord = new GlideRecord(m2mDictRecord.name);
                    m2mRecord.addEncodedQuery(m2mDictRecord.element + '=' + current.table_sys_id);
                    m2mRecord.query();

                    // Find the specific m2m record's control field value...
                    if (m2mRecord.next()) {
                        var controlRef = m2mControlRef.element;

                        // And pass into function to create control artifacts.
                        return m2mRecord.getValue(controlRef);
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
            // find me all refences on current table within grc application scope
            var parentRecordRef = new GlideRecord('sys_dictionary');
            parentRecordRef.addEncodedQuery('name=' + current.table_name + '^sys_scope.nameLIKEgrc^internal_type=reference^nameNOT LIKEm2m');
            parentRecordRef.query();

            // For each reference found
            // Look at dictionary again where name=reference.name of outside loop
            // and where type is reference and where reference.name of inner loop = control objective or grc_item
            while (parentRecordRef.next()) {
                var parentRecordControlRef = new GlideRecord('sys_dictionary');
                parentRecordControlRef.addEncodedQuery('name=' + parentRecordRef.getValue('reference') + '^sys_scope.nameLIKEgrc^internal_type=reference^nameNOT LIKEm2m^reference=sn_grc_item^ORreference=sn_compliance_control');
                parentRecordControlRef.query();

                while (parentRecordControlRef.next()) {

                    var control = parentRecordControlRef.element;
                    var childRecord = new GlideRecord(current.table_name);
                    if (childRecord.get(current.table_sys_id)) {

                        var parentRecord = new GlideRecord(parentRecordRef.getValue('reference'));
                        parentRecord.addEncodedQuery('sys_id=' + childRecord.getValue(parentRecordRef.element));
                        parentRecord.query();

                        if (parentRecord.next()) {
                            return (parentRecord.getValue(control));
                        }
                    }
                }
            }
        } else {
            // WHERE no m2m is found
            var controlReference = new GlideRecord('sys_dictionary');
            controlReference.addEncodedQuery('name=' + current.table_name + '^internal_type=reference^reference.name=sn_grc_item^ORreference.name=sn_compliance_control');
            controlReference.query();

            if (controlReference.next()) {
                var control = controlReference.element;
                var currentRecord = new GlideRecord(current.table_name);
                currentRecord.addEncodedQuery('sys_id=' + current.table_sys_id + '^' + control + '.sys_class_name=sn_compliance_control');
                currentRecord.query();

                if (currentRecord.next()) {
                    return currentRecord.getValue(control);
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
        // find me all refences on current table within grc application scope
        var parentRecordRef = new GlideRecord('sys_dictionary');
        parentRecordRef.addEncodedQuery('name=' + current.table_name + '^sys_scope.nameLIKEgrc^internal_type=reference^nameNOT LIKEm2m');
        parentRecordRef.query();

        // For each reference found
        // Look at dictionary again where name=reference.name of outside loop
        // and where type is reference and where reference.name of inner loop = control objective or grc_item
        while (parentRecordRef.next()) {
            var parentRecordControlRef = new GlideRecord('sys_dictionary');
            parentRecordControlRef.addEncodedQuery('name=' + parentRecordRef.getValue('reference') + '^sys_scope.nameLIKEgrc^internal_type=reference^nameNOT LIKEm2m^reference=sn_grc_item^ORreference=sn_compliance_control');
            parentRecordControlRef.query();

            while (parentRecordControlRef.next()) {

                var control = parentRecordControlRef.element;
                var childRecord = new GlideRecord(current.table_name);
                if (childRecord.get(current.table_sys_id)) {

                    var parentRecord = new GlideRecord(parentRecordRef.getValue('reference'));
                    parentRecord.addEncodedQuery('sys_id=' + childRecord.getValue(parentRecordRef.element));
                    parentRecord.query();

                    if (parentRecord.next()) {
                        return (parentRecord.getValue(control));
                    }
                }
            }
        }
    }

    function getParent() {
        // WHERE no m2m is found
        var controlReference = new GlideRecord('sys_dictionary');
        controlReference.addEncodedQuery('name=' + current.table_name + '^internal_type=reference^reference.name=sn_grc_item^ORreference.name=sn_compliance_control');
        controlReference.query();

        if (controlReference.next()) {
            var control = controlReference.element;
            var currentRecord = new GlideRecord(current.table_name);
            currentRecord.addEncodedQuery('sys_id=' + current.table_sys_id + '^' + control + '.sys_class_name=sn_compliance_control');
            currentRecord.query();

            if (currentRecord.next()) {
                return currentRecord.getValue(control);
            }
        }
    }


    function createControlArtifact(controlRecId) {
        var controlArtifactRec = new GlideRecord('sn_compliance_control_artifact');
        controlArtifactRec.addQuery('u_control', controlRecId);
        controlArtifactRec.addQuery('u_table_name', current.table_name);
        controlArtifactRec.addQuery('u_file', current.getUniqueValue());
        controlArtifactRec.addQuery('u_table_sys_id', current.table_sys_id);
        controlArtifactRec.query();

        if (!controlArtifactRec.next()) {
            controlArtifactRec.initialize();
            controlArtifactRec.u_control = controlRecId;
            controlArtifactRec.u_table_name = current.table_name;
            controlArtifactRec.u_file_name = current.file_name;
            controlArtifactRec.u_file = current.getUniqueValue();
            controlArtifactRec.u_table_sys_id = current.table_sys_id;
            controlArtifactRec.u_name = getRecordDisplay(current.table_name, current.table_sys_id);
            controlArtifactRec.u_metric_record = current.table_sys_id;
            controlArtifactRec.u_record_type = getTableDisplay(current.table_name, current.table_sys_id);
            controlArtifactRec.u_attachment = gs.getProperty('glide.servlet.uri') + 'sys_attachment.do?sys_id=' + current.sys_id;
            //controlArtifactRec.u_related_record_link = gs.getProperty('glide.servlet.uri') + current.table_name+ '.do?sys_id=' + current.table_sys_id;
            controlArtifactRec.insert();
        }
    }

    createControlArtifact(getControl());

})(current, previous);