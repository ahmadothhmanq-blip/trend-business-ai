/**
 * Column projections for list endpoints — omit heavy JSONB blobs.
 * Detail routes continue to use select("*").
 */

export const WEBSITE_LIST_COLUMNS =
  "id,user_id,project_name,website_type,business_description,target_audience,language,color_style,design_style,page_count,features,is_favorite,created_at,updated_at,project_id,product_id,status,mode,parent_generation_id,provider,token_usage,generation_time_ms,error_message,prompt_versions,attachments";

export const WORKSPACE_LIST_COLUMNS =
  "id,user_id,workspace_type,title,brief,template,language,theme,features,is_favorite,created_at,updated_at,project_id,product_id,status,mode,parent_generation_id,provider,token_usage,generation_time_ms,error_message,prompt_versions,attachments,draft_prompt";

export const AGENT_EXECUTION_LIST_COLUMNS =
  "id,user_id,agent_id,workflow_id,task_name,status,error_message,provider,model,token_usage,execution_time_ms,parent_execution_id,metadata,created_at,completed_at";
