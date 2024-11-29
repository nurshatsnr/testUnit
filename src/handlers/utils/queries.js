export const QUERIES = {
  SPRING_LAB: {
    INCREMENTAL_DATA: {
      GET: `SELECT * FROM "reporting_schema.FL_applications_spring_labs_lien_registry"`,
    },
  },
  TKL_RF: {
    AVM_SCORE_UPSERT: (appguid, dataTree_HighAVMValue, dataTree_AVMLowValue, dataTree_AVMFsdPercent, dataTree_AVMConfidenceScore,
        dataTree_AVMEstimatedValue, dataTree_AVMRes, veroSelect_HighAVMValue, veroSelect_AVMLowValue, veroSelect_AVMFsdPercent,
        veroSelect_AVMConfidenceScore, veroSelect_AVMMarketValue, veroSelect_TrackingId, veroSelect_AVMRes) => `
        INSERT INTO public.tkl_avm_report
            (appguid, "dataTree_HighAVMValue", "dataTree_AVMLowValue", "dataTree_AVMFsdPercent", "dataTree_AVMConfidenceScore", 
            "dataTree_AVMEstimatedValue", "dataTree_AVMRes", "veroSelect_HighAVMValue", "veroSelect_AVMLowValue", "veroSelect_AVMFsdPercent", 
            "veroSelect_AVMConfidenceScore", "veroSelect_AVMMarketValue", "veroSelect_TrackingId", "veroSelect_AVMRes", created_at, updated_at)
            VALUES ('${appguid}', 
                ${dataTree_HighAVMValue}, 
                ${dataTree_AVMLowValue}, 
                ${dataTree_AVMFsdPercent}, 
                ${dataTree_AVMConfidenceScore},
                ${dataTree_AVMEstimatedValue}, 
                '${dataTree_AVMRes}', 
                ${veroSelect_HighAVMValue}, 
                ${veroSelect_AVMLowValue}, 
                ${veroSelect_AVMFsdPercent},
                ${veroSelect_AVMConfidenceScore}, 
                ${veroSelect_AVMMarketValue}, 
                '${veroSelect_TrackingId}', 
                '${veroSelect_AVMRes}', 
            NOW(), NOW())
        ON CONFLICT (appguid)
        DO UPDATE 
        SET "dataTree_HighAVMValue"=${dataTree_HighAVMValue}, 
        "dataTree_AVMLowValue"=${dataTree_AVMLowValue}, 
        "dataTree_AVMFsdPercent"=${dataTree_AVMFsdPercent}, 
        "dataTree_AVMConfidenceScore"=${dataTree_AVMConfidenceScore}, 
        "dataTree_AVMEstimatedValue"=${dataTree_AVMEstimatedValue},
        "dataTree_AVMRes"='${dataTree_AVMRes}',
        "veroSelect_HighAVMValue"=${veroSelect_HighAVMValue},
        "veroSelect_AVMLowValue"=${veroSelect_AVMLowValue},
        "veroSelect_AVMFsdPercent"=${veroSelect_AVMFsdPercent},
        "veroSelect_AVMConfidenceScore"=${veroSelect_AVMConfidenceScore},
        "veroSelect_AVMMarketValue"=${veroSelect_AVMMarketValue},
        "veroSelect_TrackingId"='${veroSelect_TrackingId}',
        "veroSelect_AVMRes"='${veroSelect_AVMRes}',
        updated_at=NOW();
`,
  },
};
