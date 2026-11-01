// Adds a data-status attribute to table cells that contain a status or level word,
// so styles.css can colour them. It never changes the text, so React is not affected.
const KNOWN = new Set([
  'Submitted', 'Approved', 'Rejected', 'Info Requested', 'Scheduled',
  'In Progress', 'Completed', 'Failed', 'Low', 'Medium', 'High',
]);

function mark() {
  document.querySelectorAll('td').forEach((td) => {
    const t = td.textContent.trim();
    if (KNOWN.has(t)) {
      if (td.dataset.status !== t) td.dataset.status = t;
    } else if (td.dataset.status) {
      delete td.dataset.status;
    }
  });
}

new MutationObserver(mark).observe(document.body, { childList: true, subtree: true, characterData: true });
