export function handleNavigation(version) {
  function handleContent() {
    const path = window.location.hash.substring(2);
    if (path && path !== '') {
      loadContent(path, version);
    } else {
      loadDefaultContent(version);
    }
  }

  window.addEventListener('load', handleContent);
  window.addEventListener('hashchange', handleContent);
  window.addEventListener('popstate', handleContent);
};

async function loadContent(path, version) {
  const isHosted = window.location.hostname === 'bescka.github.io';
  const basePath = isHosted ? '/blog' : '';
  const fetchPath = `${basePath}/content/${path}.html?v=${version}`;

  try {
    const response = await fetch(fetchPath);
    if (!response.ok) {
      throw new Error('Network response error');
    }
    const html = await response.text();
    document.getElementById('main-content').innerHTML = html;
    MathJax.typeset();

    const bottomDivider = document.getElementById('bottom-divider');
    const githubLogo = document.getElementById('github-logo');
    if (path === 'home') {
      triggerHomePageAnimations();
      setupIntersectionObserver();
      if (bottomDivider) bottomDivider.style.display = 'block';
      if (githubLogo) githubLogo.style.display = 'block';
    } else {
      if (bottomDivider) bottomDivider.style.display = 'none';
      if (githubLogo) githubLogo.style.display = 'none';
    }

    const newHash = `#/${path}`;
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', `${basePath}${newHash}`);
    }
  } catch (error) {
    console.error('Error loading content:', error);
    document.getElementById('main-content').innerHTML = 'Error loading content.';
  }
}

function loadDefaultContent(version) {
  loadContent('home', version);
  const isHosted = window.location.hostname === 'bescka.github.io';
  const basePath = isHosted ? '/blog' : '';
  history.replaceState(null, '', `${basePath}/#/home`); 
}

function triggerHomePageAnimations() {
  const asciiArt = document.getElementById('ascii-art');
  const homeTitle = document.getElementById('home-title');
  // const rectangleAnimation = document.getElementById('rectangle-animation');

  // if (asciiArt && homeTitle && rectangleAnimation) {
  if (asciiArt && homeTitle) {
    asciiArt.style.opacity = '0';
    homeTitle.style.opacity = '0';
    // rectangleAnimation.style.opacity = '0';

    asciiArt.classList.add('fadeInAscii');
    homeTitle.classList.add('fadeInTitle');
    // rectangleAnimation.classList.add('drawRectangle');
  }
}

function setupIntersectionObserver() {
  const options = {
    root: null,
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('box-visible');
        drawLines(entry.target);
      }
    });
  }, options);

  const boxes = document.querySelectorAll('.box');
  boxes.forEach(element => observer.observe(element));
}

function getBoxMidpoints(box) {
  const rect = box.getBoundingClientRect();
  const containerRect = document.querySelector('.box-container').getBoundingClientRect();
  return {
    topMiddle: {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top
    },
    bottomMiddle: {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.bottom - containerRect.top
    }
  };
}

function drawLines(visibleBox) {
  const svg = document.getElementById('connector-lines');
  const connectedBoxes = {
    box1: ['box2', 'box3'],
    box2: ['box4'],
    box3: ['box5'],
    box4: ['box6'],
    box5: ['box6']
  };

  const boxId = Array.from(visibleBox.classList).find(cls => connectedBoxes.hasOwnProperty(cls));
  // const boxId = visibleBox.classList.contains('box1') ? 'box1' :
  //               visibleBox.classList.contains('box2') ? 'box2' :
  //               visibleBox.classList.contains('box3') ? 'box3' :
  //               visibleBox.classList.contains('box4') ? 'box4' :
  //               visibleBox.classList.contains('box5') ? 'box5' : '';

  if (boxId && connectedBoxes[boxId]) {
    if (!visibleBox.dataset.linesDrawn) {
      const startPoints = getBoxMidpoints(visibleBox).bottomMiddle;
      connectedBoxes[boxId].forEach(targetClass => {
        const targetBox = document.querySelector(`.${targetClass}`);
        if (targetBox && !targetBox.dataset.linesDrawn) {
          const endPoints = getBoxMidpoints(targetBox).topMiddle;
          drawSvgLine(svg, startPoints, endPoints);
        }
      });
      visibleBox.dataset.linesDrawn = 'true';
    }
  }
}

function drawSvgLine(svg, start, end) {
  const newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  newLine.setAttribute("x1", `${start.x}`);
  newLine.setAttribute("y1", `${start.y}`);
  newLine.setAttribute("x2", `${end.x}`);
  newLine.setAttribute("y2", `${end.y}`);
  newLine.setAttribute("stroke", "#eee");
  newLine.setAttribute("stroke-width", "2");
  newLine.classList.add('svg-line');
  svg.appendChild(newLine);
}
