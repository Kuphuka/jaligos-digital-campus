-- Update the advertised Black Friday prices for matching course titles.
-- Run in the Supabase SQL Editor after confirming the titles in public.courses.
update public.courses as course
set price = prices.price
from (
  values
    ('SHEMTRAC Level 5', 3500),
    ('SHEMTRAC', 3500),
    ('Home Based Care Level 3', 4500),
    ('Caregiver Level 3', 4500),
    ('Occupational Certificate ISO45001:2018 Level 5', 2400),
    ('Working at Height Level 1', 1350),
    ('SHE Representative Level 2', 900),
    ('SHE Representative', 900),
    ('Legal Liability for Workplace Level 3', 900),
    ('Hazard Identification & Risk Assessment Level 3', 900),
    ('Incident Investigation Level 3', 900),
    ('4-in-1 Compliance Combo', 2500),
    ('4-in-1 Safety Combo', 3600)
) as prices(title, price)
where lower(trim(course.title)) = lower(trim(prices.title));
