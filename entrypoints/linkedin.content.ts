import { insertTrackedIcon } from '@/utils/insertTrackedIcon';
import { observeUrlChanges } from '@/utils/observeUrlChanges';
import { getLinkedInJobId } from '@/utils/popup/popup-utils';

// Finds and returns the selected job posting url in users active (https://asu.joinhandshake.com/stu/postings) window.
export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  main() {
    browser.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if (request.message === 'Linkedin-getDom') {
          sendResponse(document);
        }
      }
    );

    observeUrlChanges(async () => {
      const jobId = getLinkedInJobId(location.href);
      if (!jobId) return;

      console.log('Found job ID:', jobId);

      const res = await browser.runtime.sendMessage({
        type: 'check_job_exists',
        jobId,
        site: 'linkedin',
      });

      if (res?.tracked) {
        insertTrackedIcon(jobId);
      } else {
        removeTrackedIcon();
      }
    });
  },
});
