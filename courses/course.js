const pathParts = window.location.pathname.split('/').filter(Boolean);
const courseId = pathParts.at(-2);
const year = Number(pathParts.at(-1)?.replace(/\.html$/, ''));

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || 'TBA';
}

function showLoadError() {
  const main = document.querySelector('.course-main');
  if (!main) return;

  const message = document.createElement('p');
  message.className = 'course-load-error';
  message.setAttribute('role', 'alert');
  message.textContent = 'Course information could not be loaded.';
  main.prepend(message);
}

async function loadCoursePage() {
  try {
    const response = await fetch('/_data/teaching.json');
    if (!response.ok) throw new Error(`Course data request failed: ${response.status}`);

    const data = await response.json();
    const course = data.courses.find(item => item.id === courseId);
    const version = course?.versions?.find(item => Number(item.year) === year);
    if (!course || !version) throw new Error(`Course version not found: ${courseId}/${year}`);

    const details = { ...course, ...version };
    const [courseCode, ...nameParts] = course.title.split(':');
    const courseName = nameParts.join(':').trim() || course.title;

    document.title = `${course.title} | Jing Ren`;
    document.querySelector('#courseDescription')?.setAttribute(
      'content',
      `${course.title}, ${details.term} ${details.year}`
    );
    setText('[data-course-code]', courseCode.trim());
    setText('[data-course-term]', details.term);
    setText('[data-course-year]', details.year);
    setText('[data-course-name]', courseName);
    setText('[data-course-time]', details.time);
    setText('[data-course-location]', details.location);

    setPerson('[data-course-instructor]', details.instructor, details.instructor_url);
    setPerson('[data-course-ta]', details.ta, details.ta_url);

    const image = document.querySelector('[data-course-image]');
    if (image && course.image) {
      image.src = course.image;
      image.alt = course.image_alt || `${course.title} image`;
    }
  } catch (error) {
    console.error('Unable to load course page:', error);
    showLoadError();
  }
}

function setPerson(selector, name, url) {
  const element = document.querySelector(selector);
  if (!element) return;

  if (name && url) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = name;
    element.replaceChildren(link);
  } else {
    element.textContent = name || 'TBA';
  }
}

loadCoursePage();