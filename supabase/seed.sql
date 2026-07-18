-- Starter taxonomy and watchlist for the Release 1 beachhead: 50-100 priority
-- B2B SaaS companies. This seeds a representative subset of ~25.

insert into technology_sectors (name) values
('SaaS'),('Artificial Intelligence'),('CRM'),('ITSM'),('Work Management'),
('Cybersecurity'),('Developer Tools'),('Cloud Infrastructure'),('Data and Analytics'),
('ERP'),('HR Technology'),('Marketing Technology'),('Customer Experience'),
('Industrial Software'),('Automation')
on conflict (name) do nothing;

insert into industry_verticals (name) values
('Manufacturing'),('Automotive'),('Aerospace'),('Pharmaceutical'),('Life Sciences'),
('Healthcare'),('Financial Services'),('Banking'),('Insurance'),('Public Sector'),
('Retail'),('Energy'),('Utilities'),('Telecommunications'),('Logistics'),
('Construction'),('Education'),('Professional Services')
on conflict (name) do nothing;

insert into organizations (id, name) values
('00000000-0000-0000-0000-000000000001', 'Default Organization')
on conflict (id) do nothing;

insert into companies (name, website, description, hq_country, is_public, gtm_model, ai_maturity_level, lifecycle_classification) values
('Salesforce','salesforce.com','CRM and enterprise cloud platform','United States',true,'enterprise_direct',4,'optimising'),
('HubSpot','hubspot.com','Inbound marketing, sales and CRM platform','United States',true,'product_led',3,'expanding'),
('ServiceNow','servicenow.com','Enterprise ITSM and workflow platform','United States',true,'enterprise_direct',4,'accelerating'),
('Atlassian','atlassian.com','Work and dev collaboration tools','Australia',true,'product_led',3,'expanding'),
('Monday.com','monday.com','Work management platform','Israel',true,'product_led',3,'expanding'),
('Asana','asana.com','Work management platform','United States',true,'product_led',2,'stabilising'),
('Workday','workday.com','HR and finance enterprise cloud','United States',true,'enterprise_direct',3,'optimising'),
('Zendesk','zendesk.com','Customer experience and support platform','United States',false,'hybrid',3,'stabilising'),
('Snowflake','snowflake.com','Cloud data platform','United States',true,'usage_led',4,'accelerating'),
('Datadog','datadoghq.com','Cloud monitoring and observability','United States',true,'usage_led',3,'expanding'),
('CrowdStrike','crowdstrike.com','Cloud-native endpoint security','United States',true,'enterprise_direct',4,'accelerating'),
('Okta','okta.com','Identity and access management','United States',true,'enterprise_direct',3,'stabilising'),
('GitLab','gitlab.com','DevSecOps platform','United States',true,'hybrid',3,'expanding'),
('MongoDB','mongodb.com','Developer data platform','United States',true,'usage_led',3,'expanding'),
('Twilio','twilio.com','Customer engagement and communications platform','United States',true,'usage_led',3,'stabilising'),
('Shopify','shopify.com','Commerce platform','Canada',true,'product_led',4,'accelerating'),
('Zoom','zoom.us','Video communications platform','United States',true,'product_led',3,'stabilising'),
('DocuSign','docusign.com','Agreement and e-signature platform','United States',true,'hybrid',2,'stabilising'),
('UiPath','uipath.com','Enterprise automation and agentic AI platform','United States',true,'enterprise_direct',4,'transforming'),
('Palantir','palantir.com','Data and AI decision platform','United States',true,'enterprise_direct',5,'accelerating'),
('SAP','sap.com','Enterprise resource planning platform','Germany',true,'enterprise_direct',3,'optimising'),
('Oracle','oracle.com','Enterprise applications and cloud infrastructure','United States',true,'enterprise_direct',4,'transforming'),
('Microsoft','microsoft.com','Cloud, productivity and AI platform','United States',true,'hybrid',5,'accelerating'),
('Adobe','adobe.com','Creative, marketing and document cloud','United States',true,'hybrid',4,'expanding'),
('Intercom','intercom.com','AI-first customer service platform','United States',false,'product_led',4,'transforming')
on conflict do nothing;

insert into company_sectors (company_id, sector_id)
select c.id, s.id from companies c join technology_sectors s on
  (c.name='Salesforce' and s.name='CRM') or
  (c.name='HubSpot' and s.name='CRM') or
  (c.name='HubSpot' and s.name='Marketing Technology') or
  (c.name='ServiceNow' and s.name='ITSM') or
  (c.name='Atlassian' and s.name='Work Management') or
  (c.name='Atlassian' and s.name='Developer Tools') or
  (c.name='Monday.com' and s.name='Work Management') or
  (c.name='Asana' and s.name='Work Management') or
  (c.name='Workday' and s.name='HR Technology') or
  (c.name='Workday' and s.name='ERP') or
  (c.name='Zendesk' and s.name='Customer Experience') or
  (c.name='Snowflake' and s.name='Data and Analytics') or
  (c.name='Snowflake' and s.name='Cloud Infrastructure') or
  (c.name='Datadog' and s.name='Cloud Infrastructure') or
  (c.name='CrowdStrike' and s.name='Cybersecurity') or
  (c.name='Okta' and s.name='Cybersecurity') or
  (c.name='GitLab' and s.name='Developer Tools') or
  (c.name='MongoDB' and s.name='Data and Analytics') or
  (c.name='Twilio' and s.name='Developer Tools') or
  (c.name='Shopify' and s.name='SaaS') or
  (c.name='Zoom' and s.name='SaaS') or
  (c.name='DocuSign' and s.name='SaaS') or
  (c.name='UiPath' and s.name='Automation') or
  (c.name='UiPath' and s.name='Artificial Intelligence') or
  (c.name='Palantir' and s.name='Artificial Intelligence') or
  (c.name='Palantir' and s.name='Data and Analytics') or
  (c.name='SAP' and s.name='ERP') or
  (c.name='Oracle' and s.name='ERP') or
  (c.name='Oracle' and s.name='Cloud Infrastructure') or
  (c.name='Microsoft' and s.name='Cloud Infrastructure') or
  (c.name='Microsoft' and s.name='Artificial Intelligence') or
  (c.name='Adobe' and s.name='Marketing Technology') or
  (c.name='Intercom' and s.name='Customer Experience') or
  (c.name='Intercom' and s.name='Artificial Intelligence')
on conflict do nothing;

insert into watchlists (id, organization_id, name, monitoring_frequency) values
('00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001','Core SaaS Watchlist','daily')
on conflict (id) do nothing;

insert into watchlist_companies (watchlist_id, company_id)
select '00000000-0000-0000-0000-000000000010', id from companies
on conflict do nothing;
