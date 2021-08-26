
let lastTreeRequestTime = new Date().toGMTString();

let git = {
  
  // get file
  'getFile': async (treeLoc, fileName) => {
    
    // map tree location
    let query = 'https://api.github.com';
    const [user, repo, contents] = treeLoc;
    
    query += '/repos/'+ user +'/'+ repo +'/contents/'+ contents +'/'+ fileName;
    
    // get the query
    var resp = await axios.get(query, githubToken);
    
    return resp;
    
  },
  
  // get items
  // get items in tree
  'getItems': async (treeLoc) => {
    
    // map tree location
    let query = 'https://api.github.com';
    const [user, repo, contents] = treeLoc;

    // if navigating in repository
    if (repo != '') {

      query += '/repos/'+ user +'/'+ repo +'/contents'+ contents;

    } else { // else, show all repositories

      query += '/user/repos?visibility=all&sort=updated&page=1';

    }

    // get the query
    const resp = await axios.get(query, githubToken);
    
    // update last request time
    lastTreeRequestTime = new Date().toGMTString();
    
    return resp;
    
  },
  
  // push file
  // function pushes file to git
  'push': async (commit) => {
    
    const treeLoc = commit.file.dir.split(',');
    
    let query = 'https://api.github.com/repos/' +
                treeLoc[0] +
                '/' + treeLoc[1] +
                '/contents' + treeLoc[2] +
                '/' + commit.file.name;

    let commitData = {
      message: commit.message,
      content: commit.file.content,
      sha: commit.file.sha
    };

    // commit file
    var resp = await axios.put(query, githubToken, commitData);
    
    // if updating an existing file
    if (commit.file.sha) {
      
      // force-update cache
      await axios.get(query, githubToken, lastTreeRequestTime);
      await axios.get('https://api.github.com/repos/' +
                      treeLoc[0] +
                      '/' + treeLoc[1] +
                      '/contents' + treeLoc[2],
                      githubToken, lastTreeRequestTime);
      
    }

    return resp.content.sha;

  },

  // create repo (indev)
  // function creates a new repository
  createRepo: async (repo) => {

  }

};
