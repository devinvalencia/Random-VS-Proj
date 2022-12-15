// 1) Update OOB BR: Calculate RPO, to exclude BIAs where primary element is business apps, save, then create copy where it ONLY applies when primary element is business apps
// 2) Change how category score is calculated for sn_bia_category_result (not highest, but instead will be rounded average of all sn_bia_impact_analysis_response record.repsonse.value)
// 3) Update OOB BR: Calculate Impact Analysis RPO, to exclude BIAs where primary element is business apps, save, then create copy where it ONLY applies when primary element is business apps
// 4) Create function in extended SI that uses the category scores of the two result records to traverse multi-dim array grid and return tier value (based on grid)
// 5) Use returned tier to look up sn_bia_score_timeframe_mapping and update BIA RPO based on the mapping record's timeframe reference
// 6) update OOB BR: Calculate RTO, to exclude BIAs where primary element is business apps, save, then create copy where it ONLY applies when primary element is business apps
// 7) Prevent RTO from updating until all RPO questions answered, similar to previous, use category results from the 2 categories to traverse grid return tier value
// 8) query recovery tier table, update BIA RTO with tier's timeframe value


// --------------------TEST RUN------------------------------ ///

(function executeRule(current, previous /*null when async*/ ) {
    var biaGR = new GlideRecord('sn_bia_analysis');
    biaGR.get(current.impact_analysis);

    var result = new GlideRecord('sn_bia_category_result');
    // Set Scope of Use to show first, then Impact of Failure
    result.addEncodedQuery('result_type=question_base^state=complete^impact_analysis=' + biaGR.sys_id + '^ORDERBYDESCimpact_category.name');
    result.query();

    var count = 0;
    var scopeOfUse = 0,
        impactOfFailure = 0;

    while (result.next()) {
        var responseRecord = new GlideRecord('sn_bia_impact_analysis_response');
        responseRecord.addQuery('category_result', '=', result.sys_id);
        responseRecord.query();

        var name = result.getDisplayValue('impact_category');

        var scopeCount = 0,
            failCount = 0;

        while (responseRecord.next()) {
            if (name == 'Scope of Use') {
                scopeOfUse += responseRecord.response.value;

                if (responseRecord.response.value > 0) {
                    scopeCount++;
                }


            } else if (name == 'Impact of Failure') {
                impactOfFailure += responseRecord.response.value;
                if (responseRecord.response.value > 0) {
                    failCount++;
                }
            }
        }

        if (name == 'Scope of Use') {
            if (scopeCount == 0) {
                scopeCount = 1;
            }
            scopeOfUse = Math.floor(scopeOfUse / scopeCount);
            result.setValue('category_score', scopeOfUse);
            result.update();
        }
        if (name == 'Impact of Failure') {
            if (failCount == 0) {
                failCount = 1;
            }
            impactOfFailure = Math.floor(impactOfFailure / failCount);
            result.setValue('category_score', impactOfFailure);
            result.update();
        }

        count++;
    }

    if (count >= 2) {
        var tier = [
            [0, 0, 0, 0, 0],
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [0, 2, 2, 3, 4],
            [0, 3, 3, 4, 4]
        ];

        var categoryScore = tier[scopeOfUse][impactOfFailure];

        var scoreMappingTimeframeGR = new GlideRecord('sn_bia_score_timeframe_mapping');
        var scoreQuery = 'template=' + biaGR.template + '^lower_threshold_score<=' + categoryScore + '^upper_threshold_score>=' + categoryScore;

        scoreMappingTimeframeGR.addEncodedQuery(scoreQuery);
        scoreMappingTimeframeGR.setLimit(1);
        scoreMappingTimeframeGR.query();

        if (scoreMappingTimeframeGR.next()) {
            var timeFrame = scoreMappingTimeframeGR.timeframe;

            // if (biaGR && biaGR.recovery_point_objective != timeFrame)
            if (biaGR) {
                biaGR.setValue('recovery_point_objective', timeFrame);

                var rto = new GlideRecord('sn_bcm_recovery_tier');
                rto.addEncodedQuery('nameLIKE' + categoryScore);
                rto.query();

                if (rto.next()) {
                    biaGR.setValue('recovery_tier', rto.sys_id);
                    biaGR.setValue('recovery_time_objective', rto.recovery_time_objectives);
                }

                biaGR.update();
            }
        }
    } else {
        gs.info('DV - Count too low');
    }

})(current, previous);