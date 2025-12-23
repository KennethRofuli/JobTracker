// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobData') {
    const jobData = extractJobInfo();
    sendResponse(jobData);
  }
  return true; // Keep channel open for async response
});

// Extract job info from current page
function extractJobInfo() {
  const url = window.location.href;
  let company = '';
  let title = '';
  let location = '';
  
  // LinkedIn
  if (url.includes('linkedin.com/jobs')) {
    company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.innerText.trim() ||
              document.querySelector('.topcard__org-name-link')?.innerText.trim() ||
              document.querySelector('[data-anonymize="company-name"]')?.innerText.trim() ||
              '';
    
    title = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.innerText.trim() ||
            document.querySelector('.topcard__title')?.innerText.trim() ||
            document.querySelector('h1.t-24')?.innerText.trim() ||
            '';
    
    location = document.querySelector('.job-details-jobs-unified-top-card__bullet')?.innerText.trim() ||
               document.querySelector('.topcard__flavor--bullet')?.innerText.trim() ||
               '';
  }
  
  // Indeed
  else if (url.includes('indeed.com')) {
    // Try multiple selectors for company name
    company = document.querySelector('[data-company-name="true"]')?.innerText.trim() ||
              document.querySelector('[data-testid="inlineHeader-companyName"]')?.innerText.trim() ||
              document.querySelector('.jobsearch-CompanyInfoWithoutHeaderImage')?.innerText.trim() ||
              document.querySelector('.icl-u-lg-mr--sm.icl-u-xs-mr--xs')?.innerText.trim() ||
              document.querySelector('div[data-company-name]')?.innerText.trim() ||
              // Look for any element with company info near job title
              Array.from(document.querySelectorAll('a, span, div')).find(el => 
                el.innerText && el.innerText.length < 100 && el.innerText.length > 2 &&
                el.className && (el.className.includes('company') || el.className.includes('employer'))
              )?.innerText.trim() ||
              '';
    
    // Try multiple selectors for job title
    title = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.innerText.trim() ||
            document.querySelector('[class*="jobsearch-JobInfoHeader-title"]')?.innerText.trim() ||
            document.querySelector('h1.jobTitle')?.innerText.trim() ||
            document.querySelector('h1[class*="jobTitle"]')?.innerText.trim() ||
            document.querySelector('.jobsearch-JobInfoHeader-title')?.innerText.trim() ||
            // Fallback: look for h1 or h2 that looks like a job title
            Array.from(document.querySelectorAll('h1, h2')).find(el => 
              el.innerText && el.innerText.length < 150 && el.innerText.length > 5
            )?.innerText.trim() ||
            '';
    
    // Location - try multiple approaches
    location = document.querySelector('[data-testid="job-location"]')?.innerText.trim() ||
               document.querySelector('[data-testid="inlineHeader-companyLocation"]')?.innerText.trim() ||
               document.querySelector('.jobsearch-JobInfoHeader-subtitle')?.innerText.split('•')[0]?.trim() ||
               // Look for div that has location text pattern
               Array.from(document.querySelectorAll('div')).find(el => {
                 const text = el.innerText?.trim();
                 return text && text.length < 50 && text.length > 4 && 
                        (text.includes(',') || text.includes('Remote')) &&
                        !text.includes('$') && !text.includes('year') &&
                        el.children.length === 0; // No child elements
               })?.innerText.trim() ||
               '';
    
    // Debug: log what we found
    console.log('Indeed Capture:', { company, title, location });
  }
  
  // Glassdoor
  else if (url.includes('glassdoor.com')) {
    company = document.querySelector('[data-test="employerName"]')?.innerText.trim() || 
              document.querySelector('.EmployerProfile_employerName__Xemli')?.innerText.trim() ||
              '';
    title = document.querySelector('[data-test="job-title"]')?.innerText.trim() || 
            document.querySelector('.JobDetails_jobTitle__Rw_gn')?.innerText.trim() ||
            '';
    
    location = document.querySelector('[data-test="location"]')?.innerText.trim() ||
               document.querySelector('.JobDetails_location__mSg5h')?.innerText.trim() ||
               '';
  }
  
  // OnlineJobs.ph
  else if (url.includes('onlinejobs.ph')) {
    // Try to find employer name
    company = document.querySelector('.employer-name')?.innerText.trim() ||
              document.querySelector('.job-employer')?.innerText.trim() ||
              document.querySelector('[class*="employer"]')?.innerText.trim() ||
              // Look for "by [Company Name]" pattern
              Array.from(document.querySelectorAll('div, span, p')).find(el => 
                el.innerText?.includes('by ') && el.innerText.length < 100
              )?.innerText.replace(/.*by\s+/i, '').trim() ||
              // Fallback: if can't find company, use placeholder
              'OnlineJobs.ph Employer';
    
    // Get job title
    title = document.querySelector('.post-title')?.innerText.trim() ||
            document.querySelector('h1.title')?.innerText.trim() ||
            document.querySelector('[class*="job-title"]')?.innerText.trim() ||
            document.querySelector('h1')?.innerText.trim() ||
            '';
    
    // Location might not be available
    location = document.querySelector('.location')?.innerText.trim() ||
               document.querySelector('[class*="location"]')?.innerText.trim() ||
               'Remote/Philippines';
    
    // Filter out login messages
    if (company.toLowerCase().includes('login') || 
        company.toLowerCase().includes('register') ||
        company.length > 100) {
      company = 'OnlineJobs.ph Employer';
    }
  }
  
  return { company, title, location };
}

// Auto-save when clicking "Apply" button
document.addEventListener('click', (e) => {
  const target = e.target;
  const buttonText = target.innerText?.toLowerCase() || '';
  const ariaLabel = target.getAttribute('aria-label')?.toLowerCase() || '';
  const className = target.className?.toLowerCase() || '';
  
  // Only trigger on actual Apply buttons, not just any button with "apply" text
  const isApplyButton = (
    (buttonText === 'apply now' || 
     buttonText === 'easy apply' ||
     buttonText === 'apply' ||
     ariaLabel.includes('apply to job') ||
     ariaLabel.includes('easy apply')) &&
    (target.tagName === 'BUTTON' || 
     target.tagName === 'A' ||
     target.getAttribute('role') === 'button')
  );
  
  // Don't auto-save if clicking buttons in extension popup or navigation
  const isNavigationOrPopup = 
    className.includes('nav') || 
    className.includes('menu') ||
    className.includes('tab') ||
    target.closest('[role="dialog"]') ||
    target.closest('.extension-popup');
  
  if (isApplyButton && !isNavigationOrPopup) {
    console.log('Apply button detected, auto-saving job...');
    
    // Delay to ensure we're on the right page
    setTimeout(() => {
      const jobData = extractJobInfo();
      
      if (jobData.company && jobData.title) {
        // Additional validation: make sure we got reasonable data
        if (jobData.company.length > 3 && 
            jobData.title.length > 3 &&
            !jobData.company.toLowerCase().includes('login')) {
          
          console.log('Auto-saving:', jobData);
          
          // Send to background script to save
          chrome.runtime.sendMessage({
            action: 'saveApplication',
            data: {
              company_name: jobData.company,
              job_title: jobData.title,
              location: jobData.location || '',
              url: window.location.href,
              source: getSource(),
              status: 'Applied',
              date_applied: new Date()
            }
          });
        }
      }
    }, 1000); // Wait 1 second to ensure page is stable
  }
}, true);

function getSource() {
  const url = window.location.href;
  if (url.includes('linkedin.com')) return 'LinkedIn';
  if (url.includes('indeed.com')) return 'Indeed';
  if (url.includes('glassdoor.com')) return 'Glassdoor';
  if (url.includes('onlinejobs.ph')) return 'OnlineJobs.ph';
  return 'Manual';
}
