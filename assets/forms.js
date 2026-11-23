/* Native form POST keeps résumé uploads intact and lets the delivery service verify submissions. */
(() => {
  const form = document.querySelector('.submission-form');
  if (!form) return;
  const status = form.querySelector('.form-status');
  const submit = form.querySelector('[type="submit"]');
  const initialLabel = submit.textContent;
  const resume = form.querySelector('[name="attachment"]');
  const error = document.getElementById('resume-error');
  const topic = form.querySelector('[name="topic"]');
  const desiredTopic = new URLSearchParams(location.search).get('topic');
  if (topic && desiredTopic && [...topic.options].some(o => o.value === desiredTopic)) topic.value = desiredTopic;
  function validateResume() {
    if (!resume) return true;
    const file = resume.files[0];
    let message = '';
    if (file && !/\.(pdf|doc|docx)$/i.test(file.name)) message = 'Please choose a PDF, DOC or DOCX résumé.';
    else if (file && file.size > 5 * 1024 * 1024) message = 'Please choose a résumé smaller than 5 MB.';
    else if (file && file.size === 0) message = 'This file is empty. Please choose your résumé again.';
    resume.setCustomValidity(message);
    resume.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) error.textContent = message;
    return !message;
  }
  resume?.addEventListener('change', validateResume);
  function setHidden(name, value) {
    let input = form.querySelector(`[name="${name}"]`);
    if (!input) { input = document.createElement('input'); input.type = 'hidden'; input.name = name; form.append(input); }
    input.value = value;
  }
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    setHidden('_url', location.href.split('?')[0]);
    // Keep the form service's default confirmation page on local previews.
    if (location.protocol === 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) setHidden('_next', new URL('thank-you.html', location.href).href);
  }
  form.addEventListener('submit', event => {
    if (!validateResume() || !form.reportValidity()) { event.preventDefault(); return; }
    if (location.protocol === 'file:') {
      event.preventDefault();
      status.textContent = 'This local file can preview the form, but cannot send it. Open the website through its web address, or email rimon@travellabs.systems.';
      status.classList.add('has-error');
      return;
    }
    status.classList.remove('has-error');
    status.textContent = 'Continuing to the secure submission check…';
    submit.disabled = true; submit.textContent = 'Continuing…';
    // Do not report success here. FormSubmit handles delivery and confirmation.
  });
  window.addEventListener('pageshow', () => { submit.disabled = false; submit.textContent = initialLabel; status.textContent = ''; });
})();
