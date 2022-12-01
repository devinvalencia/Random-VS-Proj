// Run After Sys_Attachment record is inserted

(function executeRule(current, previous /*null when async*/ ) {

    var source = new GlideSysAttachment();
    var source_content = source.getContentStream(current.sys_id);

    var metricResult = new GlideRecord('asmt_metric_result');
    metricResult.addEncodedQuery('sys_id=' + current.table_sys_id + '^metric=ff18dd12df101200dca6a5f59bf263d3');
    metricResult.query();

    if (metricResult.next()) {
        gs.info('DV - Do we get here:' + metricResult.metric.name);

        var targetGlideRecord = new GlideRecord('asmt_assessment_instance');
        targetGlideRecord.addEncodedQuery('sys_id=' + metricResult.instance);
        targetGlideRecord.query();

        if (targetGlideRecord.next()) {
            var fileName = current.file_name;
            var contentType = current.content_type;
            var sourceAttachmentSysId = current.getValue('sys_id');
            var targetId = targetGlideRecord.sys_id;
            var targetTable = targetGlideRecord.getTableName();

            var attachment = new GlideSysAttachment();
            attachment.writeContentStream(targetGlideRecord, fileName, contentType, source_content);
        }
    }

})(current, previous);