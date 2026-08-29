-- Add invitation email customization fields to shows table
ALTER TABLE shows ADD COLUMN IF NOT EXISTS invitation_email_subject text;
ALTER TABLE shows ADD COLUMN IF NOT EXISTS invitation_email_body text;

-- Add comment for documentation
COMMENT ON COLUMN shows.invitation_email_subject IS 'Custom subject line for invitation emails. Supports template variables: {{show_title}}, {{show_date}}';
COMMENT ON COLUMN shows.invitation_email_body IS 'Custom body text for invitation emails. Supports template variables: {{show_title}}, {{show_date}}, {{recipient_name}}';
