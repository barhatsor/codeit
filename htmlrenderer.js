/*
  github
*/

// toggle sidebar on click of bookmark
github.addEventListener('click', () => {

  toggleSidebar(!body.classList.contains('expanded'));

  saveSidebarStateLS();

})


// render sidebar
// call this function when signed in to github
// to render sidebar
async function renderSidebarHTML() {

  // if not already loading, start loading
  if (loader.style.opacity != '1') {
    startLoading();
  }

  // map tree location
  const [user, repo, contents] = treeLoc;

  // get items in current tree from git
  const resp = await git.getItems(treeLoc);

  // save rendered HTML
  let out = '';

  // if response
  if (resp) {

    // show title

    sidebarLogo.classList.remove('overflow');

    if (contents != '') {

      // show path
      sidebarLogo.innerText = repo + contents;

      // if path is too long, overflow
      if (sidebarLogo.innerText.length > 25) {

        sidebarLogo.classList.add('overflow');

      }

    } else if (repo != '') {

      // show repo name
      sidebarLogo.innerText = repo;

    } else {

      // show title
      sidebarLogo.innerText = 'Repositories';

    }


    // if navigating in repository
    if (repo != '') {

      // render files
      resp.forEach(item => {

        // if item is a file
        if (item.type == 'file') {

          // add modified flag to file
          let modified = '';
          if (modifiedFiles[item.sha]) modified = 'modified';

          out += `
          <div class="item file `+ modified +`" sha="`+ item.sha +`">
            <div class="label">
              `+ fileIcon +`
              <a class="name">`+ item.name +`</a>
            </div>
            <div class="push-wrapper">
              `+ pushIcon +`
            </div>
          </div>
          `;


        } else { // if item is a folder

          out += `
          <div class="item folder">
            <div class="label">
              `+ folderIcon +`
              <a class="name">`+ item.name +`</a>
            </div>
            `+ arrowIcon +`
          </div>
          `;

        }

      });

    } else { // else, show all repositories

      // render repositories
      resp.forEach(item => {

        // if user does not have admin permissions in repo,
        // show admin name in title ([admin]/[repo])
        let fullName = item.permissions.admin ? item.name : item.full_name;

        out += `
        <div class="item repo" fullname="`+ item.full_name +`">
          <div class="label">
            `+ repoIcon +`
            <a class="name">`+ fullName +`</a>
          </div>
          `+ arrowIcon +`
        </div>
        `;

      });

    }

  }

  // add rendered HTML to dom
  fileWrapper.innerHTML = out;
  sidebar.scrollTo(0, 0);

  // stop loading
  stopLoading();

  // add item event listeners
  addHTMLItemListeners();

  // hide search screen
  header.classList.remove('searching');

  // if selected file is in directory
  if (selectedFile.dir == treeLoc.join()) {

    let selectedItem = fileWrapper.querySelector('.item[sha="'+ selectedFile.sha +'"]');

    if (selectedItem) {

      // select file
      selectedItem.classList.add('selected');
      selectedItem.scrollIntoViewIfNeeded();

    }

  }

  // protect unsaved code
  protectUnsavedCode();

}


// adds item event listeners
function addHTMLItemListeners() {

  let items = fileWrapper.querySelectorAll('.item');

  // run on all items
  items.forEach(item => {

    // navigate on click
    item.addEventListener('click', async (e) => {

      // if item is a repository
      if (item.classList.contains('repo')) {

        // change location
        let itemLoc = getAttr(item, 'fullname').split('/');

        treeLoc[0] = itemLoc[0],
        treeLoc[1] = itemLoc[1];
        saveTreeLocLS(treeLoc);

        // render sidebar
        renderSidebarHTML();

      } else if (item.classList.contains('folder')) {

        // if item is a folder

        // change location
        treeLoc[2] += '/' + item.innerText;
        saveTreeLocLS(treeLoc);

        // render sidebar
        renderSidebarHTML();

      } else { // if item is a file

        // if not clicked on push button
        let pushWrapper = item.querySelector('.push-wrapper');
        let clickedOnPush = (e.target == pushWrapper);

        if (!clickedOnPush) {

          // if file not already selected
          if (!item.classList.contains('selected')) {

            // load file
            loadFileInHTML(item, getAttr(item, 'sha'));

          } else if (isMobile) { // if on mobile device

            // update bottom float
            updateFloat();

          }

        } else {

          // push file

          // play push animation
          playPushAnimation(pushWrapper);

          // file cannot be modified
          // if its SHA was updated
          item.classList.remove('modified');
          bottomFloat.classList.remove('modified');


          // create commit
          let commitMessage = 'Update ' + item.innerText;

          let commit = {
            message: commitMessage,
            file: {
              dir: treeLoc.join(),
              sha: getAttr(item, 'sha'),
              name: item.innerText,
              selected: true
            }
          };

          // if currently editing file
          if (item.classList.contains('selected')) {

            // get current value of file
            commit.file.content = encodeUnicode(cd.textContent);

          } else { // else, load from storage

            commit.file.content = modifiedFiles[commit.file.sha][0];

          }


          // push file asynchronously
          const newSha = await git.push(commit);


          // create a new modified file and delete the old one to fix
          // Github API requests not refreshing browser private cache 1 minute after commit
          // (https://github.com/barhatsor/codeit/issues/36)

          // create a new modified file

          let newModifiedFile = modifiedFiles[commit.file.sha];

          newModifiedFile.sha = newSha;
          newModifiedFile.nonexistent = true;
          newModifiedFile.content = commit.file.content;

          // save new modified file to local storage
          saveModifiedFileLS(newModifiedFile);

          // delete old modified file from local storage
          deleteModifiedFileLS(commit.file.sha);


          // update file in HTML
          updateFileShaHTML(item, newSha);

        }

      }

    })

  })

}


async function loadFileInHTML(file, sha) {

  // if previous selection exists
  if (selectedFile.sha != '') {

    // get selection in modifiedFiles array
    let selectedItem = modifiedFiles[selectedFile.sha];

    // if previous selection was modified
    if (selectedItem) {

      // save previous selection in localStorage

      const previousFile = {
        dir: treeLoc.join(),
        sha: selectedFile.sha,
        name: selectedFile.name,
        nonexistent: selectedFile.nonexistent,
        content: encodeUnicode(cd.textContent)
      };

      saveModifiedFileLS(previousFile);

    }

  }

  // clear existing selections
  if (fileWrapper.querySelector('.selected')) {
    fileWrapper.querySelector('.selected').classList.remove('selected');
  }

  const selectedFileName = file.querySelector('.name').innerText;

  // change selected file

  file.classList.add('selected');

  const fileNonexistent = (getAttr(file, 'nonexistent') == 'true') ? true : false;

  const newSelectedFile = {
    dir: treeLoc.join(),
    sha: getAttr(file, 'sha'),
    name: selectedFileName,
    nonexistent: fileNonexistent
  };

  changeSelectedFileLS(newSelectedFile);

  // if file is not modified; fetch from Git
  if (!file.classList.contains('modified')) {

    // start loading
    startLoading();

    // get file from git
    const resp = await git.getFile(treeLoc, selectedFileName);

    // show file content in codeit
    cd.textContent = decodeUnicode(resp.content);

    // stop loading
    stopLoading();

  } else { // else, load file from local storage

    const content = modifiedFiles[sha].content;

    // show file content in codeit
    cd.textContent = decodeUnicode(content);

  }

  // change codeit lang
  cd.lang = getFileLang(selectedFileName);

  // set caret pos in code
  cd.setSelection(0, 0);
  cd.scrollTo(0, 0);

  // clear codeit history
  cd.history = [];

  // save code in local storage
  saveCodeLS();
  saveCodeCaretPosLS();
  saveCodeScrollPosLS();
  saveCodeLangLS();

  // update line numbers
  updateLineNumbersHTML();

  // if on mobile device
  if (isMobile) {

    // update bottom float
    updateFloat();

  }

}


function updateFileShaHTML(file, newSha) {

  // update SHA of file
  setAttr(file, 'sha', newSha);

  // fix file caching
  setAttr(file, 'nonexistent', 'true');

  // if file is selected
  if (file.classList.contains('selected')) {

    // update selection SHA

    const newSelectedFile = {
      dir: treeLoc.join(),
      sha: newSha,
      name: file.innerText,
      nonexistent: true
    };

    changeSelectedFileLS(newSelectedFile);

  }

}


// traverse backwards in tree when clicked on button
sidebarTitle.addEventListener('click', () => {

  // map tree location
  const [user, repo, contents] = treeLoc;

  // if navigating in folders
  if (contents != '') {

    // pop last folder
    let splitContents = contents.split('/');
    splitContents.pop();

    // change location
    treeLoc[2] = splitContents.join('/');
    saveTreeLocLS(treeLoc);

    // render sidebar
    renderSidebarHTML();

  } else if (repo != '') { // if navigating in repository

    // change location
    treeLoc[1] = '';
    saveTreeLocLS(treeLoc);

    // render sidebar
    renderSidebarHTML();

  } else { // show learn screen

    sidebar.classList.add('learn');

  }

})


// toggle the sidebar
function toggleSidebar(open) {

  if (open) {

    body.classList.add('expanded');

    if (isMobile) {
      document.querySelector('meta[name="theme-color"]').content = '#1a1c24';
    }

  } else {

    body.classList.remove('expanded');

    if (isMobile) {
      document.querySelector('meta[name="theme-color"]').content = '#313744';
    }

  }

}


// check for key to see if code
// or caret position have changed
function onEditorKeyup(event) {

  // if code has changed
  if (hasKeyChangedCode(event)) {

    // save code to local storage
    codeChange();

  }

  // if caret position has changed
  if (hasKeyChangedCaretPos(event)) {

    // save caret pos to local storage
    saveCodeCaretPosLS();

  }

}

// when clicked on editor, save new caret position
function onEditorClick(event) {

  // save caret pos to local storage
  saveCodeCaretPosLS();

}

// when scrolled editor, save new scroll position

let editorScrollTimeout;

function onEditorScroll(event) {

  if (editorScrollTimeout) window.clearTimeout(editorScrollTimeout);

  // when stopped scrolling, save scroll pos
  editorScrollTimeout = window.setTimeout(saveCodeScrollPosLS, 300);

}

// check for key to see if code has changed
function hasKeyChangedCode(event) {

  return event.key !== 'Meta'
      && event.key !== 'Control'
      && event.key !== 'Alt'
      && !event.key.startsWith('Arrow');

}

// check for key to see
// if caret position has changed
function hasKeyChangedCaretPos(event) {

  return event.key.startsWith('Arrow');

}

// check for meta key (Ctrl/Command)
function isKeyEventMeta(event) {
  return event.metaKey || event.ctrlKey;
}

// called on code change event
function codeChange() {

  // if modified file is not in localStorage
  if (!modifiedFiles[selectedFile.sha]) {

    // save modified file in localStorage

    const modifiedFile = {
      dir: treeLoc.join(),
      sha: selectedFile.sha,
      name: selectedFile.name,
      nonexistent: selectedFile.nonexistent,
      content: encodeUnicode(cd.textContent)
    };

    saveModifiedFileLS(modifiedFile);


    // enable pushing file in HTML

    const selectedEl = fileWrapper.querySelector('.item[sha="'+ selectedFile.sha +'"]');

    // if selected file exists
    if (selectedEl) {

      // enable pushing file
      selectedEl.classList.add('modified');

      // enable pushing from bottom float
      bottomFloat.classList.add('modified');

    }

  }

  // update line numbers
  updateLineNumbersHTML();

  // save code in async thread
  asyncThread(saveCodeLS, 30);

}

// protect unsaved code
// if logged into github but
// cache didn't change yet
function protectUnsavedCode() {

  const selectedItem = fileWrapper.querySelector('.item[sha="'+ selectedFile.sha +'"]');

  const loggedIntoGit = (githubToken != null),
        cacheFileNotExist = (selectedFile.dir == treeLoc.join() && selectedItem == null);

  const protectUnsavedCode = (loggedIntoGit ? cacheFileNotExist : false);

  if (protectUnsavedCode == true) {

    // clear codeit
    cd.lang = 'plain';
    cd.textContent = '';

    saveCodeLS();

  }

}

function setupEditor() {

  // add editor event listeners

  cd.addEventListener('keyup', onEditorKeyup);
  cd.addEventListener('click', onEditorClick);
  cd.addEventListener('scroll', onEditorScroll);

  // if code in storage
  if (selectedFile.content) {

    // set codeit to code
    cd.lang = selectedFile.lang || 'plain';
    cd.textContent = decodeUnicode(selectedFile.content);

    // set caret pos in code
    cd.setSelection(selectedFile.caretPos[0], selectedFile.caretPos[1]);

    // scroll to pos in code
    cd.scrollTo(selectedFile.scrollPos[0], selectedFile.scrollPos[1]);

    // update line numbers
    updateLineNumbersHTML();

    // save code history
    cd.recordHistory();

  }


  // update line numbers on screen resize
  window.addEventListener('resize', () => {

    // update line numbers
    updateLineNumbersHTML();

  });


  // update line numbers when finished highlighting
  Prism.hooks.add('complete', function (env) {

    if (!env.code) {
      return;
    }

    // update line numbers
    updateLineNumbersHTML();

  });


  // disable context menu
  window.addEventListener('contextmenu', (e) => {

    e.preventDefault();

  });

}

function updateLineNumbersHTML() {

  // if mobile but not in landscape,
  // or if editor isn't in view, return
  if (isMobile && (!isLandscape || body.classList.contains('expanded'))) {

    if (cd.querySelector('.line-numbers-rows')) {

      cd.querySelector('.line-numbers-rows').remove();

    }

    cd.classList.remove('line-numbers');
    cd.style.paddingLeft = '';

    return;

  }

  cd.classList.add('line-numbers');

  // update line numbers
  Prism.plugins.lineNumbers.resize(cd);

}

function setupSidebar() {

  // if sidebar is open
  if (getStorage('sidebar') == 'true') {

    // do a silent transition
    body.classList.add('transitioning');

    toggleSidebar(true);

    window.setTimeout(() => {

      body.classList.remove('transitioning');

    }, 0);

  } else {

    // update bottom floater
    updateFloat();

  }

}

function setupCodeitApp() {

  setupEditor();
  setupSidebar();

}
