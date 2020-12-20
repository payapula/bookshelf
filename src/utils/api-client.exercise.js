function client(endpoint, customConfig = {}) {
  const fullURL = `${process.env.REACT_APP_API_URL}/${endpoint}`

  const config = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    ...customConfig,
  }

  return window.fetch(fullURL, config).then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  })

  // 🐨 create the config you'll pass to window.fetch
  //    make the method default to "GET"
  // 💰 if you're confused by this, that's fine. Scroll down to the bottom
  // and I've got some code there you can copy/paste.
  // 🐨 call window.fetch(fullURL, config) then handle the json response
  // 📜 https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  // 💰 here's how to get the full URL: `${process.env.REACT_APP_API_URL}/${endpoint}`
}

export {client}

/*






























💰 spoiler alert below...



























































const config = {
    method: 'GET',
    ...customConfig,
  }
*/
