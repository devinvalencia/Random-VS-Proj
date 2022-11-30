(function executeRule(current, previous /*null when async*/ ) {

    var controlArtifact = new GlideRecord('sn_compliance_control_artifact');
    controlArtifact.addEncodedQuery('u_control.sys_id=' + current.getValue('sn_compliance_control'));
    controlArtifact.query();

    while (controlArtifact.next()) {

        // For each control artifact found, find if it has already been copied to audit artifacts
        var auditArtifact = new GlideRecord('sn_audit_audit_artifact');
        auditArtifact.addEncodedQuery('u_attachment_image=' + controlArtifact.getValue('u_attachment'));
        auditArtifact.query();

        // If it has, do not make copy of the current control artifact to audit artifact
        if (!auditArtifact.next()) {

            // It it doesn't already exsist in audit artifact, then create copy of it to audit artifact
            auditArtifact.initialize();
            auditArtifact.u_attachment_image = controlArtifact.getValue('u_attachment');
            auditArtifact.u_display_name = controlArtifact.getValue('u_name');
            auditArtifact.u_engagement = current.sn_audit_engagement;
            auditArtifact.u_engagement_type = controlArtifact.u_control.number;
            auditArtifact.u_file = controlArtifact.u_file;
            auditArtifact.u_file_name = controlArtifact.u_file_name;
            auditArtifact.u_metric_record = controlArtifact.u_metric_record;
            // auditArtifact.u_related_record_link = controlArtifact.
            auditArtifact.u_table_name = controlArtifact.u_table_name;
            auditArtifact.u_table_sys_id = controlArtifact.u_table_sys_id;
            auditArtifact.insert();
        }
    }
})(current, previous);